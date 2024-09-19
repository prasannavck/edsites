import { createElement } from '../../scripts/blocks-utils.js';

const DROPDOWN_ICON_GREEN = `${window.hlx.codeBasePath}/icons/chevron-down-green.svg`;
const DROPDOWN_ICON_WHITE = `${window.hlx.codeBasePath}/icons/chevron-down-white.svg`;

function createNewsTitle(content) {
  const titleDiv = createElement('div', 'left-title');
  titleDiv.appendChild(content[0]?.firstElementChild);
  return titleDiv;
}

function clickEvent(button, ul, chevronIcon) {
  button.addEventListener('click', () => {
    ul.classList.toggle('visible');
    button.classList.toggle('visible');
    chevronIcon.src = `${DROPDOWN_ICON_WHITE}`;
  });
  // close dropdown list when click outside
  window.addEventListener('click', (e) => {
    if (!button.contains(e.target) && !ul.contains(e.target)) {
      ul.classList.remove('visible');
      button.classList.remove('visible');
      chevronIcon.src = `${DROPDOWN_ICON_GREEN}`;
    }
  });
  // change icon by mouseover event
  button.addEventListener('mouseover', () => {
    chevronIcon.src = `${DROPDOWN_ICON_WHITE}`;
  });
  button.addEventListener('mouseleave', () => {
    if (!button.classList.contains('visible')) {
      chevronIcon.src = `${DROPDOWN_ICON_GREEN}`;
    }
  });
}

function createCategoryMenu(block, content) {
  const categoryDropdown = createElement('div', 'right-dropdown');
  const categoryButton = createElement('button', 'category-button');
  const buttonTitle = createElement('span', 'button-title');
  buttonTitle.textContent = content[1]?.textContent;
  const chevronIcon = createElement('img', 'dropdown-icon');
  chevronIcon.src = `${DROPDOWN_ICON_GREEN}`;
  chevronIcon.alt = 'Dropdown chevron icon';
  categoryButton.appendChild(buttonTitle);
  categoryButton.appendChild(chevronIcon);
  const dropdownList = block.querySelector('ul');
  clickEvent(categoryButton, dropdownList, chevronIcon);
  categoryDropdown.appendChild(categoryButton);
  if (dropdownList) categoryDropdown.appendChild(dropdownList);
  return categoryDropdown;
}

export default async function decorate(block) {
  const subContent = block.querySelectorAll(':scope > div > div');
  const newsTitle = createNewsTitle(subContent);
  const categoryMenu = createCategoryMenu(block, subContent);
  const container = createElement('div', 'news-title-container');
  container.append(newsTitle);
  container.append(categoryMenu);
  block.replaceChildren(container);
}
