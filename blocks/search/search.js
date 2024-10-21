import {
  decorateIcons,
  fetchPlaceholders,
} from '../../scripts/aem.js';
import { closeSearchBar } from '../../scripts/blocks-utils.js';

const PAGE_SIZE = 10;
const DEFAULT_LOCAL_STORAGE_TTL = 60 * 1000;
const MAX_CACHED_SEARCH_QUERIES = 5;
const SEARCH_QUERY_PREFIX = 'search_query_';
const SEARCH_ICON_PATH = `${window.hlx.codeBasePath}/images/icon-search-grey.png`;
const CLOSE_ICON_PATH = `${window.hlx.codeBasePath}/icons/remove-light.svg`;
const searchParams = new URLSearchParams(window.location.search);

function searchUrlWithParam(key, value) {
  const url = window.hlx.codeBasePath ? new URL(window.location.href)
    : new URL(`${window.location.protocol}//${window.location.host}`);
  if (searchParams) {
    searchParams.forEach((v, k) => url.searchParams.set(k, v));
  }
  url.searchParams.set(key, value);
  return url.toString();
}

function getKeyFromStore(key) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key); // Remove expired item
    return null;
  }

  return item.value;
}

function evictOldestSearchQueryInStore() {
  const keys = Object.keys(localStorage).filter((key) => key.startsWith(SEARCH_QUERY_PREFIX));

  if (keys.length > MAX_CACHED_SEARCH_QUERIES) {
    // Sort keys by the time they were stored (oldest first)
    const sortedKeys = keys.sort((a, b) => {
      const itemA = JSON.parse(localStorage.getItem(a));
      const itemB = JSON.parse(localStorage.getItem(b));
      return itemA.expiry - itemB.expiry;
    });

    // Remove the oldest query
    localStorage.removeItem(sortedKeys[0]);
  }
}

function setKeyInStore(key, value, ttl) {
  const now = new Date();
  const item = {
    value,
    expiry: now.getTime() + ttl || DEFAULT_LOCAL_STORAGE_TTL,
  };
  localStorage.setItem(key, JSON.stringify(item));
  if (key.startsWith(SEARCH_QUERY_PREFIX)) evictOldestSearchQueryInStore();
}

function highlightTextElements(terms, elements) {
  elements.forEach((element) => {
    if (!element || !element.textContent) return;

    const matches = [];
    const { textContent } = element;
    terms.forEach((term) => {
      let start = 0;
      let offset = textContent.toLowerCase().indexOf(term.toLowerCase(), start);
      while (offset >= 0) {
        matches.push({ offset, term: textContent.substring(offset, offset + term.length) });
        start = offset + term.length;
        offset = textContent.toLowerCase().indexOf(term.toLowerCase(), start);
      }
    });

    if (!matches.length) {
      return;
    }

    matches.sort((a, b) => a.offset - b.offset);
    let currentIndex = 0;
    const fragment = matches.reduce((acc, { offset, term }) => {
      if (offset < currentIndex) return acc;
      const textBefore = textContent.substring(currentIndex, offset);
      if (textBefore) {
        acc.appendChild(document.createTextNode(textBefore));
      }
      const markedTerm = document.createElement('strong');
      markedTerm.textContent = term;
      acc.appendChild(markedTerm);
      currentIndex = offset + term.length;
      return acc;
    }, document.createDocumentFragment());
    const textAfter = textContent.substring(currentIndex);
    if (textAfter) {
      fragment.appendChild(document.createTextNode(textAfter));
    }
    element.innerHTML = '';
    element.appendChild(fragment);
  });
}

export async function fetchData(source) {
  const storedData = getKeyFromStore('search_index_data');
  if (storedData) return Promise.resolve(storedData);
  const response = await fetch(window.hlx.codeBasePath + source);
  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.error('error loading API response', response);
    return null;
  }

  const json = await response.json();
  if (!json) {
    // eslint-disable-next-line no-console
    console.error('empty API response', source);
    return null;
  }
  setKeyInStore('search_index_data', json.data);
  return json.data;
}

function renderResult(result, searchTerms, titleTag) {
  const li = document.createElement('li');
  if (result.title) {
    const title = document.createElement(titleTag);
    title.className = 'search-result-title';
    const link = document.createElement('a');
    link.href = result.path;
    link.textContent = result.title;
    highlightTextElements(searchTerms, [link]);
    title.append(link);
    li.append(title);
  }
  if (result.description) {
    const description = document.createElement('p');
    description.textContent = result.description;
    highlightTextElements(searchTerms, [description]);
    li.append(description);
  }
  return li;
}

function clearSearchResults(resultsContainer) {
  const searchResults = resultsContainer.querySelector('.search-results');
  searchResults.innerHTML = '';
}

function clearSearch(block) {
  clearSearchResults(block);
  if (window.history.replaceState) {
    const url = new URL(window.location.href);
    url.search = '';
    searchParams.delete('s');
    window.history.replaceState({}, '', url.toString());
  }
}

async function renderResults(resultsContainer, config, filteredData, searchTerms, page) {
  clearSearchResults(resultsContainer);
  const resultsList = resultsContainer.querySelector('.search-results');
  const headingTag = resultsList.dataset.h;
  const pageData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  if (pageData.length) {
    resultsList.classList.remove('no-results');
    pageData.forEach((result) => {
      const li = renderResult(result, searchTerms, headingTag);
      resultsList.append(li);
    });
  } else {
    const noResultsMessage = document.createElement('li');
    resultsList.classList.add('no-results');
    noResultsMessage.innerHTML = `<p>${config.placeholders.searchTryAgain || 'No results found'}</p>`;
    resultsList.append(noResultsMessage);
    const noResultSearch = resultsContainer.querySelector('input');
    noResultSearch.focus();
    noResultSearch.value = searchParams.get('s');
  }
  requestAnimationFrame(() => {
    resultsContainer.style.display = 'block';
    resultsContainer.style.minHeight = '0';
  });
}

function compareFound(hit1, hit2) {
  return hit2.publishDate - hit1.publishDate;
}

function filterData(searchTerms, data) {
  const foundInHeader = [];
  const foundInMeta = [];

  data.forEach((result) => {
    let minIdx = -1;

    searchTerms.forEach((term) => {
      const idx = (result.header || result.title).toLowerCase().indexOf(term);
      if (idx < 0) return;
      if (minIdx < idx) minIdx = idx;
    });

    if (minIdx >= 0) {
      foundInHeader.push(result);
      return;
    }

    const metaContents = `${result.title} ${result.description} ${result.path.split('/').pop()}`.toLowerCase();
    searchTerms.forEach((term) => {
      const idx = metaContents.indexOf(term);
      if (idx < 0) return;
      if (minIdx < idx) minIdx = idx;
    });

    if (minIdx >= 0) {
      foundInMeta.push(result);
    }
  });

  return [
    ...foundInHeader.sort(compareFound),
    ...foundInMeta.sort(compareFound),
  ];
}

function navigateToSearchPage(searchValue) {
  window.location.href = searchUrlWithParam('s', searchValue);
}

function searchResultsList() {
  const results = document.createElement('ul');
  results.className = 'search-results';
  results.dataset.h = 'H3';
  return results;
}

function searchInput(block, config) {
  const input = document.createElement('input');
  input.setAttribute('type', 'search');
  input.className = 'search-input';

  const searchPlaceholder = config.placeholders.search || 'Search...';
  input.placeholder = searchPlaceholder;
  input.setAttribute('aria-label', searchPlaceholder);

  input.addEventListener('keyup', (e) => {
    if (e.code === 'Escape') clearSearch(block);
    if (e.code === 'Enter') navigateToSearchPage(e.target.value);
  });

  return input;
}

function noResultSearchBox() {
  const divNoResultSearchBox = document.createElement('div');
  divNoResultSearchBox.classList.add('no-result-search');
  const input = document.createElement('input');
  input.setAttribute('type', 'search');
  input.className = 'search-input';

  const searchButton = document.createElement('button');
  searchButton.classList.add('orange');
  searchButton.innerText = 'Search';
  searchButton.addEventListener('click', () => navigateToSearchPage(input.value));
  divNoResultSearchBox.append(input, searchButton);
  return divNoResultSearchBox;
}

function searchIcon() {
  const icon = document.createElement('span');
  icon.classList.add('icon', 'search');
  const img = document.createElement('img');
  img.src = SEARCH_ICON_PATH;
  img.alt = 'search';
  icon.append(img);
  return icon;
}

function closeIcon() {
  const span = document.createElement('span');
  const pathTokens = CLOSE_ICON_PATH.split('/');
  const iconName = pathTokens[pathTokens.length - 1];
  span.classList.add('icon', `icon-${iconName}`);
  const img = document.createElement('img');
  img.src = CLOSE_ICON_PATH;
  img.alt = iconName;
  span.append(img);
  span.addEventListener('click', () => closeSearchBar());
  return span;
}

function searchBox(block, config) {
  const box = document.createElement('div');
  box.classList.add('search-box');
  const srchIcon = searchIcon();
  box.append(
    srchIcon,
    searchInput(block, config),
    closeIcon(),
  );

  const input = box.querySelector('input');
  srchIcon.addEventListener('click', () => {
    input?.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter' }));
  });
  return box;
}

function createButton(href, classList, innerText) {
  const a = document.createElement('a');
  a.href = href;
  a.innerText = innerText;
  a.classList.add(...classList);
  return a;
}

function decoratePaginationControls(resultsContainer, resultCount, currentPage) {
  const totalPages = Math.ceil(resultCount / PAGE_SIZE);
  if (totalPages < 2) return;
  const paginationDiv = document.createElement('div');
  paginationDiv.classList.add('pagination-ctrl');
  const previousPage = Math.max(1, currentPage - 1);
  const buttons = [];
  const prevButton = createButton(searchUrlWithParam('page', previousPage), ['page-prev'], 'Previous');
  buttons.push(prevButton);
  for (let pageNum = 1; pageNum <= totalPages; pageNum += 1) {
    const distance = pageNum - currentPage;
    if ((distance > 2 && pageNum !== totalPages) || (distance < -2 && pageNum !== 1)) {
      if ((distance === -3) || (distance === 3)) {
        buttons.push(createButton('', ['page-num'], '...'));
      }
    } else {
      const a = createButton(searchUrlWithParam('page', pageNum), ['page-num'], `${pageNum}`);
      if (pageNum === currentPage) a.classList.add('current');
      buttons.push(a);
    }
  }
  const nextPage = Math.min(totalPages, currentPage + 1);
  const nextButton = createButton(searchUrlWithParam('page', nextPage), ['page-next'], 'Next');
  buttons.push(nextButton);
  paginationDiv.append(...buttons);
  if (currentPage === 1) prevButton.style.display = 'none';
  if (currentPage === totalPages) nextButton.style.display = 'none';
  resultsContainer.append(paginationDiv);
}

function decorateSearchPageTitle(block, placeholders, dataExists, searchQuery) {
  const main = block.closest('main');
  const pageTitle = main.querySelector('h1');
  const searchResultTitle = placeholders.searchResults || 'Search results for';
  const noSearchResultTitle = placeholders.noSearchResults || 'No search results found for';
  if (dataExists) {
    pageTitle.innerHTML = `${searchResultTitle} <span class="search-query">${searchQuery}</span>`;
  } else {
    pageTitle.innerHTML = `${noSearchResultTitle} <span class="search-query">${searchQuery}</span>`;
  }
}

export default async function decorate(block) {
  const placeholders = await fetchPlaceholders();
  const section = block.closest('.section');
  const searchQuery = searchParams.get('s');
  let nextSection = section.nextElementSibling;
  const source = '/query-index.json';
  block.innerHTML = '';
  block.append(searchBox(block, { source, placeholders }));
  // If search page
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    const page = parseInt(searchParams.get('page'), 10) || 1;
    if (!nextSection?.classList.contains('search-results-container')) {
      nextSection = document.createElement('div');
      nextSection.classList.add('section', 'search-results-container');
      nextSection.append(searchResultsList(block), noResultSearchBox(nextSection));
      section.after(nextSection);
    }
    const searchTerms = query.split(/\s+/).filter((term) => !!term);
    let filteredData = getKeyFromStore(`${SEARCH_QUERY_PREFIX}${query}`);
    if (!filteredData) {
      const data = await fetchData(source);
      filteredData = filterData(searchTerms, data);
      setKeyInStore(`${SEARCH_QUERY_PREFIX}${query}`, filteredData);
    }
    await renderResults(nextSection, { source, placeholders }, filteredData, searchTerms, page);
    decorateSearchPageTitle(block, placeholders, (filteredData.length > 0), searchQuery);
    decoratePaginationControls(nextSection, filteredData.length, page, searchQuery);
  }
  decorateIcons(block);
}
