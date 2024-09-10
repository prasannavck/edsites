export default function decorate(block) {
  const li = block.querySelectorAll('li');
  li.forEach((item) => {
    const link = item.querySelector('a');
    link.classList.add('button', 'dark');
    const icon = item.querySelector('span.icon');
    link.prepend(icon);
  });
}
