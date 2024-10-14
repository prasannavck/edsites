export default async function decorate(block) {
  const info = block.children[1].querySelector('div');
  info.classList.add('info');
}
