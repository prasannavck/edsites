const BLOCK_VARIANTS = {
	default: 'default',
	products: 'products',
}

function getBlockVariant(block) {
	if (block.classList.contains(BLOCK_VARIANTS.products)) {
		return BLOCK_VARIANTS.products;
	}
	return BLOCK_VARIANTS.default;
}

function isProductsBlockVariant(block) {
	return BLOCK_VARIANTS.products === getBlockVariant(block);
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

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);
	const isProductsVariant = isProductsBlockVariant(block);
	const activeProduct = getActiveProductColumn(block);
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

			if (isProductsVariant) {
				const productNameDiv = document.createElement('div');
				productNameDiv.classList.add('product-name');
				const firstPara = col.querySelector('p:first-of-type');
				const iconSpan = col.querySelector('span.icon');
        const h3 = col.querySelector('h3');
				if (firstPara) {
					if (iconSpan) productNameDiv.appendChild(iconSpan);
					if (h3) productNameDiv.appendChild(h3);
				}
				const productDescriptionDiv = document.createElement('div');
				const secondPara = firstPara.nextElementSibling;
				const pricePara = secondPara?.nextElementSibling;
				if (secondPara && secondPara.tagName.toLowerCase() === 'p') {
					productDescriptionDiv.appendChild(secondPara);
          productDescriptionDiv.classList.add('product-description');
        }
				const lastPara = col.querySelector('p:last-of-type');
				const linksCount = lastPara?.querySelectorAll('a').length;
				if (lastPara && lastPara.classList.length === 0 && linksCount > 0) {
					lastPara.classList.add('btn-group');
				}
				if (pricePara !== lastPara) pricePara.classList.add('product-price');
				const price = col.querySelector('.product-price');
				if (price) productDescriptionDiv.append(price);
				const btnGroup = col.querySelector('.btn-group');
				if (btnGroup) productDescriptionDiv.append(btnGroup);
				col.appendChild(productNameDiv);
				col.appendChild(productDescriptionDiv);
				firstPara.remove();
			}
    });
		if (isProductsVariant && activeProduct > 0) {
			if (activeProduct === index + 2) {  // previous product w.r.t active product
				row.classList.add('no-separator');
			} else if (activeProduct === index + 1) { // active product
				row.classList.add('active');
        row.classList.add('no-separator');
			}
    }
  });
}
