const BLOCK_VARIANTS = {
  default: 'default',
  products: 'products',
  benefits: 'benefits',
};

function getBlockVariant(block) {
  // eslint-disable-next-line max-len
  const blockVariant = Object.values(BLOCK_VARIANTS).find((variant) => block.classList.contains(variant));
  return blockVariant || BLOCK_VARIANTS.default;
}

function isProductsBlockVariant(block) {
  return BLOCK_VARIANTS.products === getBlockVariant(block);
}

function isBenefitsBlockVariant(block) {
  return BLOCK_VARIANTS.benefits === getBlockVariant(block);
}

// Valid response is a value > 0
function getActiveProductColumn(block) {
  if (!isProductsBlockVariant(block)) return 0;
  let activeCol = 0;
  const activeColumn = Array.from(block.classList).find((className) => className.startsWith('active-'));
  if (activeColumn) {
    const activeProduct = activeColumn.split('-')[1];
    activeCol = parseInt(activeProduct, 10);
  }
  return activeCol;
}

function decorateProductsVariantColumn(col) {
  const productNameDiv = document.createElement('div');
  productNameDiv.classList.add('product-name');
  const titleIcon = col.querySelector('span.icon');
  const h3 = col.querySelector('h3');
  if (titleIcon) productNameDiv.appendChild(titleIcon);
  if (h3) productNameDiv.appendChild(h3);

  const productDescriptionDiv = document.createElement('div');
  const descriptionPara = titleIcon
    ? col.querySelector('p:nth-of-type(2)')
    : col.querySelector('p:first-of-type');
  const pricePara = descriptionPara?.nextElementSibling;
  if (descriptionPara) {
    productDescriptionDiv.appendChild(descriptionPara);
    productDescriptionDiv.classList.add('product-description');
  }
  const lastPara = col.querySelector('p:last-of-type');
  const links = lastPara?.querySelectorAll('a');
  if (lastPara && lastPara.classList.length === 0 && links.length > 0) {
    lastPara.classList.add('btn-group');
    links.forEach((link) => {
      link.classList.add('button');
      if (link.parentElement.tagName === 'EM') {
        link.classList.add('orange');
      }
    });
  }
  if (pricePara !== lastPara) pricePara.classList.add('product-price');
  const price = col.querySelector('.product-price');
  if (price) productDescriptionDiv.append(price);
  const btnGroup = col.querySelector('.btn-group');
  if (btnGroup) productDescriptionDiv.append(btnGroup);
  col.appendChild(productNameDiv);
  col.appendChild(productDescriptionDiv);

  // remove empty <p> tags
  col.querySelectorAll('p')?.forEach((para) => {
    if (para.textContent.trim() === '') {
      para.remove();
    }
  });
}

function decorateProductsVariantRow(index, row, rowsCount, block) {
  const activeProduct = getActiveProductColumn(block);
  if (activeProduct === index + 2 || rowsCount === index + 1) {
    row.classList.add('no-separator');
  }
  if (activeProduct === index + 1) {
    // active product
    row.classList.add('active');
    row.classList.add('no-separator');
  }
}

function decorateBenefitsVariantColumn(col) {
  const titleDiv = document.createElement('div');
  titleDiv.classList.add('title');
  const iconSpan = col.querySelector('span.icon');
  const h3 = col.querySelector('h3');
  if (iconSpan) titleDiv.appendChild(iconSpan);
  if (h3) titleDiv.appendChild(h3);

  col.prepend(titleDiv);
  const description = col.querySelector('p:last-of-type');
  if (description) description.classList.add('description');

  // remove empty <p> tags
  col.querySelectorAll('p')?.forEach((para) => {
    if (para.textContent.trim() === '') {
      para.remove();
    }
  });
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);
  const isProductsVariant = isProductsBlockVariant(block);
  const isBenefitsVariant = isBenefitsBlockVariant(block);

  const rowsCount = block.children?.length;
  // setup image columns
  [...block.children].forEach((row, index) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }

      if (isProductsVariant) decorateProductsVariantColumn(col);
      if (isBenefitsVariant) decorateBenefitsVariantColumn(col);
    });
    if (isProductsVariant) decorateProductsVariantRow(index, row, rowsCount, block);
  });
}
