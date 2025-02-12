import { build } from "@strapi/pack-up";
import type { Config, ConfigBundle } from "@strapi/pack-up";
import tsconfigPaths from "vite-tsconfig-paths";
import depsExternal from "rollup-plugin-node-externals";

import pkg from "./package.json";

const viteConfig: Config = {
  externals: Object.keys((pkg as any).dependencies || {}),
  dist: "./dist",
  exports: {},
};

const execute = async () => {
  const serverFiles = pkg.exports["./strapi-server"];
  const adminFiles = pkg.exports["./strapi-admin"];

  const adminBundle: ConfigBundle = {
    source: adminFiles.source,
    import: adminFiles.import,
    require: adminFiles.require,
    types: adminFiles.types,
    tsconfig: "./admin/tsconfig.build.json",
    runtime: "web",
  };

  const serverBundle: ConfigBundle = {
    source: serverFiles.source,
    import: serverFiles.import,
    require: serverFiles.require,
    types: serverFiles.types,
    tsconfig: "./server/tsconfig.build.json",
    runtime: "node",
  };

  await build({
    cwd: process.cwd(),
    configFile: false,
    config: {
      ...viteConfig,
      bundles: [adminBundle, serverBundle],
      plugins: [tsconfigPaths() as any, depsExternal()],
    },
  });
};

void execute();
