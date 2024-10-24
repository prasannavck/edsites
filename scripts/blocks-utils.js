let searchCb = {};

/**
 * Create new DOM element with tag name and class name.
 * @param tagName tag name
 * @param className class name
 * @returns created element
 */
function createElement(tagName, className) {
  const element = document.createElement(tagName);
  if (className) {
    element.classList.add(className);
  }
  return element;
}

/**
 * Open Search Bar
 * @param cb callback function to be called when search bar is closed
 * @returns {Promise<void>}
 */
function openSearchBar(cb, arg) {
  const searchBlock = document.querySelector('.search.block');
  if (searchBlock) {
    const searchSection = searchBlock.closest('.section');
    document.querySelector('main').prepend(searchSection);
    searchBlock.style.display = 'block';
    searchBlock.querySelector('input')?.focus();
    searchCb = { cb, arg };
  }
}

function closeSearchBar() {
  const search = document.querySelector('.search.block');
  search.style.display = 'none';
  searchCb.cb(searchCb.arg);
}

/**
 * Add click listener to open external link in a new window
 * @param link
 */
function addGenericLinkClickListener(link) {
  link.addEventListener('click', (event) => {
    const url = link.href;
    const isExternal = url.startsWith('http') && !url.includes(window.location.hostname);
    if (isExternal) {
      event.preventDefault();
      window.open(`${url}`, '_blank');
    }
  });
}

export {
  // eslint-disable-next-line import/prefer-default-export
  createElement,
  openSearchBar,
  closeSearchBar,
  addGenericLinkClickListener,
};
