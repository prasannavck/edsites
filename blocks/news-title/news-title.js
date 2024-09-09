import { readBlockConfig } from '../../scripts/aem.js';
import { createElement } from '../../scripts/blocks-utils.js';

function createNewsTitle(block) {
  const titleDiv = createElement('div', 'left-title');
  const title = block.querySelector('h1');
  titleDiv.appendChild(title);
  return titleDiv;
}

function getDropdownTitle(block) {
  const blockCfg = readBlockConfig(block);
  const buttonTitle = blockCfg['dropdown-title'];
  return buttonTitle;
}

function clickEvent(button, ul) {
  button.addEventListener('click', () => {
    ul.classList.toggle('visible');
    button.classList.toggle('visible');
  });
  // close dropdown list when click outside
  window.addEventListener('click', (e) => {
    if (!button.contains(e.target) && !ul.contains(e.target)) {
      ul.classList.remove('visible');
      button.classList.remove('visible');
    }
  });
}

function createCategoryMenu(block) {
  const categoryDropdown = createElement('div', 'right-dropdown');
  const categoryButton = createElement('button', 'category-button');
  const buttonTitle = createElement('span', 'button-title');
  buttonTitle.textContent = getDropdownTitle(block);
  categoryButton.appendChild(buttonTitle);
  const dropdownList = block.querySelector('ul');
  clickEvent(categoryButton, dropdownList);
  categoryDropdown.appendChild(categoryButton);
  categoryDropdown.appendChild(dropdownList);
  return categoryDropdown;
}

export default async function decorate(block) {
  const newsTitle = createNewsTitle(block);
  const categoryMenu = createCategoryMenu(block);
  const container = createElement('div', 'news-title-container');
  container.append(newsTitle);
  container.append(categoryMenu);
  block.replaceChildren(container);
}
