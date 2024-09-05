export default function decorate(block) {
  const pictureElement = block.querySelector('picture');
  if (!pictureElement) {
    return;
  }
  const pictureImgElement = pictureElement.querySelector('img');
  if (!pictureImgElement) {
    return;
  }
  const imgElement = document.createElement('img');
  imgElement.src = pictureImgElement.src;
  imgElement.alt = pictureImgElement.alt;
  imgElement.className = 'img-banner';
  pictureElement.remove();
  const aElement = block.querySelector('a.button');
  if (!aElement) {
    return;
  }
  aElement.className = 'button';
  const pElements = Array.from(block.querySelectorAll('p:not(.button-container)'));
  const textElement = document.createElement('h2');
  pElements.forEach((pElement, index) => {
    if (!pElement.innerHTML.trim()) {
      return;
    }
    if (index === 1) {
      textElement.innerHTML = `${pElement.innerHTML}<br>`;
    } else if (index === 2) {
      const spanElement = document.createElement('span');
      spanElement.innerHTML = pElement.innerHTML;
      textElement.appendChild(spanElement);
    } else {
      textElement.innerHTML = pElement.innerHTML;
    }
    pElement.remove();
  });
  const textContainer = document.createElement('div');
  textContainer.className = 'text';
  textContainer.appendChild(textElement);
  textContainer.appendChild(aElement);
  const imageElement = document.createElement('div');
  imageElement.className = 'image';
  imageElement.appendChild(imgElement);
  const bannerElement = document.createElement('div');
  bannerElement.className = 'banner-chinese';
  bannerElement.appendChild(textContainer);
  bannerElement.appendChild(imageElement);
  const containerElement = document.createElement('div');
  containerElement.className = block.className;
  containerElement.appendChild(bannerElement);
  block.replaceWith(containerElement);
}
