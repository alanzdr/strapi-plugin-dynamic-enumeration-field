/**
 * Application methods
 */
import bootstrap from "./bootstrap";

/**
 * Plugin server methods
 */
import config from "./config";
import contentTypes from "./content-types";
import controllers from "./controllers";
import routes from "./routes";
import services from "./services";
import register from "./register";

export default {
  bootstrap,
  config,
  controllers,
  routes,
  services,
  contentTypes,
  register,
} as any;
