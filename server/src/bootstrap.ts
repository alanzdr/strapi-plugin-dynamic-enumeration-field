import subscribeLifecycle from "./modules/Lifecycle";
import revalidateData from "./modules/Revalidate";
import type { Core } from "@strapi/strapi";

const bootstrap = ({ strapi }: { strapi: Core.Strapi }) => {
  revalidateData(strapi);
  subscribeLifecycle(strapi);
};

export default bootstrap;
