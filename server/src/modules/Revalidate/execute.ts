import getContentTypes from "./content-types";
import getCollectionsData from "./collections-data";
import updateDynamicEntities from "./dynamic-entities";
import { loadConfigs } from "~/config";

import { Core } from "@strapi/strapi";

async function executeRevalidate(strapi: Core.Strapi) {
  const configs = await loadConfigs();

  if (!configs.revalidateOnStart) {
    return;
  }

  console.log(
    "[DYNAMIC-ENUMERATION-FIELD]",
    "Revalidating dynamic entities..."
  );

  const contentTypes = getContentTypes(strapi);
  const collectionsData = await getCollectionsData(strapi, contentTypes);
  await updateDynamicEntities(strapi, collectionsData);
}

export default executeRevalidate;
