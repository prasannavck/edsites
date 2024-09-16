export default function decorate(block) {
  const pictureElements = block.querySelectorAll('picture');
  const aElement = block.querySelector('a.button');
  const h2Element = block.querySelector('h2');
  const pElement = block.querySelector('p:not(.button-container):not(:has(picture))');

  if (!pictureElements.length || !aElement) {
    return;
  }

  aElement.className = 'button';

  const containerElement = document.createElement('div');
  containerElement.className = block.className;

  if (h2Element && pElement) {
    const spanElement = document.createElement('span');
    spanElement.innerHTML = pElement.innerHTML;
    h2Element.appendChild(document.createElement('br'));
    h2Element.appendChild(spanElement);
    containerElement.appendChild(h2Element);
  }

  containerElement.appendChild(aElement);

  pictureElements.forEach((pictureElement) => {
    containerElement.appendChild(pictureElement);
  });

  block.replaceWith(containerElement);
}
