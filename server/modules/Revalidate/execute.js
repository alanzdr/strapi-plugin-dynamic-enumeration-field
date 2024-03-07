const getContentTypes = require("./content-types")
const getCollectionsData = require("./collections-data")
const updateDynamicEntities = require("./dynamic-entities")

async function executeRevalidate (strapi) {
  if (strapi.config.environment === 'development') {
    return
  }
  const contentTypes = getContentTypes(strapi)
  const collectionsData = await getCollectionsData(strapi, contentTypes)
  await updateDynamicEntities(strapi, collectionsData)
}

module.exports = executeRevalidate