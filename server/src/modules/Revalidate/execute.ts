import getContentTypes from "./content-types";
import getCollectionsData from "./collections-data";
import updateDynamicEntities from "./dynamic-entities";

async function executeRevalidate(strapi) {
  if (strapi.config.environment === "development") {
    return;
  }
  const contentTypes = getContentTypes(strapi);
  const collectionsData = await getCollectionsData(strapi, contentTypes);
  await updateDynamicEntities(strapi, collectionsData);
}

export default executeRevalidate;
