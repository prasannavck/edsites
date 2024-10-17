const SHOW_MORE_ICON = `${window.hlx.codeBasePath}/icons/arrow-circle-teal.svg`;

function handleShowMoreFunctionality(list, showMoreThreshold) {
  const listItems = list.querySelectorAll('li');
  listItems.forEach((li) => {
    if (Array.prototype.indexOf.call(listItems, li) >= showMoreThreshold) {
      li.classList.add('hidden');
    }
  });

  const showMoreBtn = document.createElement('button');
  showMoreBtn.classList.add('show-more-btn');
  showMoreBtn.textContent = 'Show more';
  list.after(showMoreBtn);

  const showMoreIcon = document.createElement('img');
  showMoreIcon.setAttribute('src', SHOW_MORE_ICON);
  showMoreIcon.setAttribute('alt', 'Down arrow icon');
  showMoreBtn.prepend(showMoreIcon);

  showMoreBtn.addEventListener('click', () => {
    showMoreBtn.classList.add('hidden');
    listItems.forEach((li) => {
      li.classList.remove('hidden');
    });
  });
}

export default function decorate(block) {
  // handle custom bullet icon
  const bulletIcon = block.querySelector('.styled-lists > div:first-child span.icon > img');
  const iconSrc = bulletIcon.src;
  const listItems = block.querySelectorAll('ul > li');
  listItems.forEach((listItem) => {
    listItem.style.background = `url(${iconSrc}) left center no-repeat`;
    listItem.style.backgroundSize = '1.25rem';
    listItem.style.paddingInlineStart = '1.8rem';
  });
  block.querySelector('.styled-lists > div:first-child')?.remove(); // remove bullet icon div

  // handle 'Show more' functionality
  const showMoreThreshold = block.querySelector('.styled-lists > div:first-child p')?.textContent;
  if (showMoreThreshold > 0) {
    const lists = block.querySelectorAll('ul');
    lists.forEach((list) => {
      if (list.children.length > showMoreThreshold) {
        handleShowMoreFunctionality(list, showMoreThreshold);
      }
    });
  }
  block.querySelector('.styled-lists > div:first-child')?.remove(); // remove showMoreThreshold div
}
