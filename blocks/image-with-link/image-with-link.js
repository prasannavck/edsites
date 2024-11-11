import { createOptimizedPicture } from '../../scripts/aem.js';
import { createElement } from '../../scripts/blocks-utils.js';

export default async function decorate(block) {
  const img = block.querySelector('picture > img');
  const link = block.querySelector('a');
  block.textContent = '';
  const optimizedPic = createOptimizedPicture(img.src, 'image alt', false, [{ width: '768' }]);
  if (link) {
    const aHref = createElement('a', '');
    aHref.href = link.href;
    aHref.append(optimizedPic);
    block.append(aHref);
  } else {
    block.append(optimizedPic);
  }
}
