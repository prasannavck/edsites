/*
 * Table Block
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 */

const BLOCK_VARIANTS = {
  default: 'default',
  list: 'list',
  headingBg: 'heading-bg',
  alternateRowBg: 'alternate-row-bg',
  description: 'description',
};

const BREAKPOINTS = {
  mobile: '(max-width: 767px)',
};

function isMobileView() {
  return window.matchMedia(BREAKPOINTS.mobile).matches;
}

function isListBlockVariant(block) {
  return block.classList.contains(BLOCK_VARIANTS.list);
}

function isHeadingBgBlockVariant(block) {
  return Array.from(block.classList)
    .find((className) => className.startsWith(BLOCK_VARIANTS.headingBg));
}

function isAlternateRowBgBlockVariant(block) {
  return Array.from(block.classList)
    .find((className) => className.startsWith(BLOCK_VARIANTS.alternateRowBg));
}

function isDescriptionBlockVariant(block) {
  return block.classList.contains(BLOCK_VARIANTS.description);
}

function isFirstTableInListVariant(block) {
  const tableWrapper = block.parentElement;
  const prevTableBlock = tableWrapper.previousElementSibling?.firstElementChild;
  return !prevTableBlock || !prevTableBlock.classList.contains('table') || !prevTableBlock.classList.contains('list');
}

function getColorFromBlockClassName(block, variant) {
  const colorClass = Array.from(block.classList)
    .find((className) => className.startsWith(variant));
  const tokens = colorClass.split('-');
  return tokens?.length > 0 ? tokens[tokens.length - 1] : '';
}

function decorateIcons(td, block) {
  if (!isListBlockVariant(block)) return;
  const icons = td.querySelectorAll('.icon');
  icons?.forEach((icon) => {
    const iconName = Array.from(icon.classList)
      .find((c) => c.startsWith('icon-'))
      .substring(5);

    if (iconName.toLowerCase().endsWith('-large')) {
      icon.classList.add('large');
      td.classList.add('icon-large');
      const nextSibling = icon.nextElementSibling;
      const nextPara = icon.parentElement.nextElementSibling;
      if (nextPara && nextSibling) nextPara.prepend(nextSibling);
    }

    const nextSibling = icon.nextElementSibling;
    if (nextSibling && nextSibling.nodeName === 'EM') {
      const tooltipContent = document.createElement('div');
      tooltipContent.classList.add('tooltip-content');
      tooltipContent.innerHTML = nextSibling.innerHTML;
      icon.prepend(tooltipContent);
      nextSibling.remove();
      icon.classList.add('tooltip');
    }
  });
}

function decorateTableTitle(tableTitle, block) {
  if (!tableTitle) return;
  // Second child of tableTitle is the show/hide detail toggle
  const existShowDetail = tableTitle.querySelector('div').childElementCount > 1;
  const showDetail = existShowDetail ? tableTitle.querySelector('p:last-of-type') : undefined;
  const showText = showDetail?.childNodes[0]?.textContent.trim();
  const hideText = showDetail?.querySelector('em')?.innerText;
  if (!isFirstTableInListVariant(block)) showDetail.innerHTML = showText;
  tableTitle.addEventListener('click', () => {
    const tableContent = tableTitle.nextElementSibling;
    tableTitle.parentElement.classList.toggle('active');
    tableContent.classList.add('collapsable');
    tableContent?.classList.toggle('open');
    if (tableContent?.classList.contains('open')) {
      tableContent.style.height = `${tableContent.scrollHeight}px`;
    } else {
      tableContent.style.height = '0';
    }
    if (showDetail) showDetail.innerHTML = tableTitle.parentElement.classList.contains('active') ? hideText : showText;
  });
}

function decorateTableHeading(table, block) {
  const tr = table.querySelector('thead > tr');
  const isHeadingBgVariant = isHeadingBgBlockVariant(block);

  if (isHeadingBgVariant) {
    const color = getColorFromBlockClassName(block, BLOCK_VARIANTS.headingBg);
    tr.style.backgroundColor = `#${color}`;
  }

  [...tr.children].forEach((td) => {
    decorateIcons(td, block);
  });
}

function decorateTableBody(table, block) {
  const rows = table.querySelectorAll('tbody > tr');
  const isAlternateRowBgVariant = isAlternateRowBgBlockVariant(block);
  const isListVariant = isListBlockVariant(block);
  rows.forEach((row, i) => {
    if (isListVariant) {
      [...row.children].forEach((cell) => {
        decorateIcons(cell, block);
      });

      if (i === rows.length - 1) {
        const links = row.querySelectorAll('a');
        links.forEach((link) => {
          link.classList.add('button');
          if (link.parentElement.tagName === 'EM') {
            link.classList.add('orange');
          }
        });
      }
    }

    if (isAlternateRowBgVariant) {
      const color = getColorFromBlockClassName(block, BLOCK_VARIANTS.alternateRowBg);
      if (i % 2 === 0) {
        row.classList.add('custom-bg');
        row.style.backgroundColor = `#${color}`;
      }
    }
  });
}

function updateActiveHeadingTabInMobile(table, block) {
  const dataActiveTab = parseInt(table.getAttribute('data-active-tab-mob'), 10);
  const activeTab = dataActiveTab + 1;

  const headingTabs = block.querySelectorAll('.heading-tabs-mob button');
  headingTabs.forEach((tab, index) => {
    if (index + 1 === dataActiveTab) tab.classList.add('active');
    else tab.classList.remove('active');
  });

  // Remove the 'active' class from all columns
  table.querySelectorAll('td').forEach((cell) => cell.classList.remove('active'));

  // Add the 'active' class to the appropriate columns
  table.querySelectorAll('td:nth-child(1)').forEach((cell) => cell.classList.add('active'));
  table.querySelectorAll(`td:nth-child(${activeTab})`).forEach((cell) => cell.classList.add('active'));
}

function createHeadingTabSelectorInMobile(table, block) {
  if (!isListBlockVariant(block)) return;
  const div = document.createElement('div');
  div.classList.add('heading-tabs-mob');
  table.before(div);

  const headingCols = table.querySelectorAll('thead > tr > td');
  headingCols.forEach((col, index) => {
    if (index === 0) return;
    const tabButtonWrapper = document.createElement('div');
    tabButtonWrapper.classList.add('tab-button-wrapper');
    const arrow = document.createElement('div');
    arrow.classList.add('tab-arrow');
    const button = document.createElement('button');
    tabButtonWrapper.append(arrow, button);
    div.append(tabButtonWrapper);
    let buttonTitle = !col.classList.contains('icon-large')
      ? col.querySelector('p:nth-of-type(2)') : col.querySelector('p:nth-of-type(2) strong');
    if (!buttonTitle) buttonTitle = col.querySelector('p:nth-of-type(1) strong') || col.querySelector('p:nth-of-type(1)');
    button.innerHTML = buttonTitle?.innerText?.replace(/ policy/i, '');
    button.addEventListener('click', () => {
      table.setAttribute('data-active-tab-mob', index);
      updateActiveHeadingTabInMobile(table, block);
    });
  });
}

function decorateTableInMobileView(table, block) {
  if (!isMobileView()) return;
  if (!table) return;
  if (!isListBlockVariant(block)) return;
  if (table.hasAttribute('data-active-tab-mob')) return; // Already decorated
  const headingRow = table.querySelector('thead tr');
  headingRow.classList.add('column-reverse-mob');

  const columns = headingRow.querySelectorAll('td');
  columns.forEach((col) => {
    const paras = col.querySelectorAll('p:nth-child(2)');
    paras.forEach((para) => {
      const prevParaHasIcon = para.previousElementSibling?.querySelector('.icon');
      if (!prevParaHasIcon) para.classList.add('combine-hyphen-mob');
    });
  });

  table.setAttribute('data-active-tab-mob', 1);
  updateActiveHeadingTabInMobile(table, block);
}

function decorateTableContent(block) {
  if (!isListBlockVariant(block)) return;
  const tableTitle = block.querySelector('.table-title');
  const tableContent = document.createElement('div');
  tableContent.classList.add('table-content');
  let nextSibling = tableTitle.nextElementSibling;
  while (nextSibling) {
    tableContent.append(nextSibling);
    nextSibling = tableTitle.nextElementSibling;
  }
  tableTitle.after(tableContent);

  if (isFirstTableInListVariant(block)) {
    block.classList.add('active');
    tableContent.classList.add('open');
    const existShowDetail = tableTitle.querySelector('div').childElementCount > 1;
    const showDetail = existShowDetail ? tableTitle.querySelector('p:last-of-type') : '';
    if (showDetail) showDetail.innerHTML = showDetail.querySelector('em')?.innerText;
  } else {
    tableContent.classList.add('collapsable');
  }
}

function buildCell(rowIndex) {
  const cell = rowIndex ? document.createElement('td') : document.createElement('th');
  if (!rowIndex) cell.setAttribute('scope', 'col');
  return cell;
}

export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const isListVariant = isListBlockVariant(block);
  const isDescriptionVariant = isDescriptionBlockVariant(block);

  const header = !block.classList.contains('no-header');
  if (header) table.append(thead);
  table.append(tbody);

  let tableTitle;
  let tableDescription;
  let headerInd = 0;
  const newBlockChildren = [];
  [...block.children].forEach((child, i) => {
    // In list item variant, first child is the title unlike default variant
    if (isListVariant && i === 0) {
      child.classList.add('table-title');
      tableTitle = child;
      decorateTableTitle(tableTitle, block);
      newBlockChildren.push(tableTitle);
      headerInd = i + 1;
      return;
    }

    if (isDescriptionVariant && ((isListVariant && i === 1) || (i === 0))) {
      child.classList.add('table-description');
      tableDescription = child;
      newBlockChildren.push(tableDescription);
      headerInd = i + 1;
      return;
    }
    const row = document.createElement('tr');
    if (header && i === headerInd) thead.append(row);
    else tbody.append(row);
    [...child.children].forEach((col) => {
      const cell = buildCell(header ? i : i + 1);
      cell.innerHTML = col.innerHTML;
      row.append(cell);
    });
  });
  block.innerHTML = '';
  newBlockChildren.push(table);
  block.append(...newBlockChildren);
  decorateTableHeading(table, block);
  createHeadingTabSelectorInMobile(table, block);
  decorateTableBody(table, block);
  decorateTableContent(block);

  // events listeners to handle mobile view
  document.addEventListener('load', () => decorateTableInMobileView(table, block), true);
  window.addEventListener('resize', () => {
    if (!isListVariant) return; // remove later if required for other variants as well
    if (!isMobileView()) { // remove mobile specific styles
      if (!table.hasAttribute('data-active-tab-mob')) return; // indicates that already removed mobile attributes
      const headingRow = thead.querySelector('tr');
      headingRow.classList.remove('column-reverse-mob');
      const cols = table.querySelectorAll('td');
      cols?.forEach((col) => col.classList.remove('active'));
      table.removeAttribute('data-active-tab-mob');
    } else {
      decorateTableInMobileView(table, block);
    }
  });
}
