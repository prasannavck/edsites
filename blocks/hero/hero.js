export default function decorate(block) {
  if (block.classList.contains('buttons-stack')) {
    [...block.children].forEach((row) => {
      [...row.children].forEach((col) => {
        const h2 = col.querySelector('h2');
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
        heroMenu.appendChild(h2);
        heroMenu.appendChild(ul);
        col.appendChild(heroMenu);
      });
    });
  }
}
