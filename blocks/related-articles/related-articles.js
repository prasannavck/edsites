import { getEDSLink, moveInstrumentation } from '../../scripts/scripts.js';

/**
 * @param {Element} block
 */
export default async function decorate(block) {
  const [title, ...items] = block.querySelectorAll(':scope > div');
  title?.classList.add('related-articles-title');
  const links = items.map((x) => x.textContent.trim());
  const queryIndex = await (await fetch(`${window.hlx.codeBasePath}/query-index.json`)).json();
  const articles = links.map((link) => ({
    data: queryIndex.data.find((x) => x.path === getEDSLink(link)),
    originalPath: link,
  }));
  articles.forEach((article, index) => {
    try {
      const item = document.createElement('div');
      item.className = 'related-article';
      item.innerHTML = `
 
             <div>
                <h3>
                    <a href="${article.originalPath}" class="article-title">
                                <img src="${article?.data?.imageThumbnail}" alt="article thumbnail">
                    ${article.data.title}
                    </a>
                </h3>
                <p class="article-descr">
                ${article.data.description}
                </p> 
             </div>
      `;
      moveInstrumentation(items[index], item);
      items[index].remove();
      block.append(item);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('article may not indexed');
    }
  });
}
