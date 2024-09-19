export default function decorate(block) {
  const col = block.querySelector(':scope > div > div');
  const h1 = col.querySelector('h1');
  const h2 = col.querySelector('h2');
  const h3 = col.querySelector('h3');
  const allPTags = col.querySelectorAll('p');
  const pTagsWithIcon = Array.from(allPTags).filter((p) => p.querySelector('.icon'));

  const backgroundImageContainer = block.querySelector(':scope > div > div > p');
  if (block.classList.contains('background-gradient')) {
    const gradientOverlay = document.createElement('div');
    gradientOverlay.classList.add('gradient-overlay');
    backgroundImageContainer.appendChild(gradientOverlay);
  }

  pTagsWithIcon.forEach((p) => {
    const textSpan = document.createElement('span');
    textSpan.classList.add('icon-text');
    Array.from(p.childNodes).forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('icon')) {
        // Skip the icon span
        return;
      }
      textSpan.appendChild(node);
    });
    p.appendChild(textSpan);
  });

  let activeTab = -1;
  const activeTabs = Array.from(block.classList).find((className) => className.startsWith('active-'));
  if (activeTabs) {
    const val = activeTabs.split('-')[1];
    activeTab = parseInt(val, 10) - 1;
  }

  const ul = col.querySelector('ul');
  const li = ul.querySelectorAll('li');
  li.forEach((item, index) => {
    const link = item.querySelector('a');
    if (link) {
      link.classList.add('button');
      if (block.classList.contains('buttons-stack')) {
        if (index === 0) {
          link.classList.add('orange');
        } else {
          link.classList.add('dark');
        }
        const icon = item.querySelector('span.icon');
        link.prepend(icon);
      }
      if (block.classList.contains('tabs') && index === activeTab) {
        item.classList.add('active');
      }
    }
  });

  if (block.classList.contains('tabs')) {
    const searchBar = document.createElement('li');
    searchBar.innerHTML = `
    <img src="/images/icon-search-grey.png" />
    <input type="text" id="search" placeholder="Search Articles">
    `;
    ul.appendChild(searchBar);
  }

  const heroMenu = document.createElement('div');
  heroMenu.classList.add('hero-menu');
  const heroContent = document.createElement('div');
  heroContent.classList.add('hero-content');
  if (h1) {
    heroContent.appendChild(h1);
  }
  if (h2) {
    heroContent.appendChild(h2);
  }
  if (h3) {
    heroContent.appendChild(h3);
  }

  const pTagsWithoutPicture = Array.from(allPTags).filter((p) => !p.querySelector('picture'));
  for (let i = 0; i < pTagsWithoutPicture.length; i += 1) {
    heroContent.appendChild(pTagsWithoutPicture[i]);
  }

  heroMenu.appendChild(heroContent);
  heroMenu.appendChild(ul);
  col.appendChild(heroMenu);
}
