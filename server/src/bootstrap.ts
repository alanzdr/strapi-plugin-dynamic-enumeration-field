import subscribeLifecycle from "./modules/Lifecycle";
import executeRevalidate from "./modules/Revalidate";
import type { Core } from "@strapi/strapi";

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  await executeRevalidate(strapi);
  subscribeLifecycle(strapi);
};

export default bootstrap;
