/* eslint-disable indent */
const fs = require('fs');
const path = require('path');

/**
 * Parse the `component-defintion.json` , `component-filters.json` and `component-models.json` files
 * Files are located in the root of the project
 */
const componentDef = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../component-definition.json'), 'utf8'),
);
const componentFilters = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../component-filters.json'), 'utf8'),
);
const componentModel = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../component-models.json'), 'utf8'),
);

/**
 * @param {*} block
 * @param {*} allBlocks
 * @returns the the parent block of the given component
 * This method uses a heuristic to determine the parent block of a given block
 * If the block ID contains a `-`, it splits the ID and returns the first part
 *      e.g `accordion` and `accordion-item`
 * If you find a prent block with the plural of the block ID, return the parent block ID
 *      e.g `card` and `cards`
 * Each project has a different naming convention, so this method should be adjusted
 */
const getParentBlock = (block, allBlocks) => {
  if (block.id.includes('-')) return allBlocks.find((x) => x.id === block.id.split('-')[0]);
  const possibleParent = allBlocks.find((x) => x.id === `${block.id}s`);
  return possibleParent || block;
};

// eslint-disable-next-line no-confusing-arrow
const toClassName = (name) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  typeof name === 'string'
    ? name
        .toLowerCase()
        .replace(/[^0-9a-z]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    : '';

// we can ignore the default components and section groups
const blockGroup = componentDef.groups.find((x) => x.id === 'blocks');

// select only containers / blocks
const blocksDef = blockGroup.components.filter(
  (x) => x.plugins.xwalk.page.resourceType === 'core/franklin/components/block/v1/block',
);

/**
 * Create a map of the new format
 * Key = Block Name
 * Value = { definitions: [...], filters: [...], models: [...] }
 */
const newMap = {};
// eslint-disable-next-line no-restricted-syntax
for (const block of blockGroup.components) {
  // if block is already a container, use the block ID as the parent
  const parentBlock = blocksDef.find((x) => x.id === block.id)
    ? block
    : getParentBlock(block, blocksDef);
  const parent = toClassName(
    parentBlock?.plugins?.xwalk?.page?.template?.name || parentBlock?.id || block?.id,
  );
  if (!newMap[parent]) {
    newMap[parent] = {
      definitions: [],
      filters: [],
      models: [],
    };
  }
  // add the filter , definiton and model for the current block
  newMap[parent].filters.push(
    componentFilters.find((x) => x.id === block.plugins.xwalk.page.template.filter),
  );
  newMap[parent].definitions.push(block);
  newMap[parent].models.push(
    componentModel.find((x) => x.id === block.plugins.xwalk.page.template.model),
  );
}

/* Write files to disk and filter undefined or null references
   caused by missing filters or models
*/
// eslint-disable-next-line no-restricted-syntax
for (const [key, val] of Object.entries(newMap)) {
  val.definitions = val.definitions.filter((x) => x);
  val.models = val.models.filter((x) => x);
  val.filters = val.filters.filter((x) => x);
  try {
    fs.writeFileSync(
      path.resolve(__dirname, `../blocks/${key}/_${key}.json`),
      JSON.stringify(val, null, 2),
    );
  } catch (e) {
    console.log(e);
  }
}
