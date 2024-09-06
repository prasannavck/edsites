export default function decorate(block) {
  if (block.classList.contains('buttons-stack')) {
    [...block.children].forEach((row) => {
      [...row.children].forEach((col) => {
        const h1 = col.querySelector('h1');
        const h2 = col.querySelector('h2');
        const allPTags = col.querySelectorAll('p');
        const pTagsWithoutPicture = Array.from(allPTags).filter((p) => !p.querySelector('picture'));
        const pTagsWithIcon = Array.from(allPTags).filter((p) => p.querySelector('.icon'));
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
        const ul = col.querySelector('ul');
        const li = col.querySelectorAll('li');
        li.forEach((item, index) => {
          const link = item.querySelector('a');
          link.classList.add('button');
          if (index === 0) {
            link.classList.add('orange');
          } else {
            link.classList.add('dark');
          }
          const icon = item.querySelector('span.icon');
          link.prepend(icon);
        });
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
        for (let i = 0; i < pTagsWithoutPicture.length; i += 1) {
          heroContent.appendChild(pTagsWithoutPicture[i]);
        }
        heroMenu.appendChild(heroContent);
        heroMenu.appendChild(ul);
        col.appendChild(heroMenu);
      });
    });
  }
}
