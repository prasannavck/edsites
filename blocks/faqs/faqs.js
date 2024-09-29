import { moveInstrumentation } from '../../scripts/scripts.js';
import { createElement } from '../../scripts/blocks-utils.js';
import { fetchPlaceholders } from '../../scripts/aem.js';

function addEvent(faqTitle, placeholders) {
  faqTitle.addEventListener('click', () => {
    faqTitle.classList.toggle('visible');
    const faqToggle = faqTitle.querySelector('.faq-title-right');
    if (faqToggle) {
      faqToggle.classList.toggle('visible');
      faqToggle.textContent = faqToggle.classList.contains('visible')
        ? `${placeholders.hidedetail}` : `${placeholders.showdetail}`;
    }
    const faqContent = faqTitle.nextElementSibling;
    if (faqContent) {
      faqContent.classList.toggle('visible');
    }
  });
}

export default async function decorate(block) {
  const placeholders = await fetchPlaceholders();
  const faqPanel = createElement('div', 'faq-panel');
  [...block.children].forEach((row, index) => {
    // decorate faq item label
    const label = row.children[0];
    const faqTitle = createElement('div', 'faq-title');
    const faqTitleLeft = createElement('div', 'faq-title-left');
    const toggle = createElement('div', 'faq-title-right');
    toggle.textContent = `${placeholders.showdetail}`;
    faqTitleLeft.append(...label.childNodes);
    faqTitle.append(faqTitleLeft);
    faqTitle.append(toggle);
    addEvent(faqTitle, placeholders);
    // decorate faq item body
    const contentWrapper = row.children[1];
    contentWrapper.className = 'faq-content-wrapper';
    const contentPanel = createElement('div', 'faq-content-panel');
    const content = createElement('div', 'faq-content');
    contentPanel.append(contentWrapper);
    content.append(contentPanel);
    // open first faq item by default
    if (index === 0) {
      faqTitle.classList.add('visible');
      toggle.textContent = `${placeholders.hidedetail}`;
      toggle.classList.add('visible');
      content.classList.add('visible');
    }
    const faqItem = createElement('div', 'faq-item');
    moveInstrumentation(row, faqItem);
    faqItem.append(faqTitle, content);
    faqPanel.append(faqItem);
  });
  block.replaceChildren(faqPanel);
}
