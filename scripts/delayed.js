import { loadScript } from './aem.js';
import { getEnvType, addBazaarVoiceReviewsScript, addBazaarVoiceFormSubmissionScript } from './blocks-utils.js';

const BV_SCRIPT = 'https://display.ugc.bazaarvoice.com/bvstaging/static/terrischeer/en_AU/bvapi.js';

async function loadBazaarVoiceScript() {
  let scriptSrc = BV_SCRIPT;
  const envType = getEnvType();
  if (envType === 'prod' || envType === 'live') scriptSrc = scriptSrc.replace('/bvstaging', '');
  await loadScript(scriptSrc);

  const main = document.querySelector('body > main');
  const bvReviewsBlocks = Array.from(main.querySelectorAll('.block.bv-reviews'));
  addBazaarVoiceReviewsScript(bvReviewsBlocks);

  const bvSubmissionFormBlocks = Array.from(main.querySelectorAll('.bv-submission-form'));
  // do not show form in authoring, otherwise it skips authoring flow and tries creating form
  if (!window.hlx.codeBasePath) addBazaarVoiceFormSubmissionScript(bvSubmissionFormBlocks);
}

loadBazaarVoiceScript();
