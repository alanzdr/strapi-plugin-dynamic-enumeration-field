import Icon from "./components/Icon";
import reducers from "./reducers";
import { getGlobalOptions } from "./service/globals";

import CONSTANTS from "./constants";

export default {
  async register(app: any) {
    app.addReducers(reducers);
    app.registerPlugin({
      id: CONSTANTS.ID,
      isReady: true,
      name: "Dynamic Enumeration",
    });

    const globalOptions = await getGlobalOptions();

    app.customFields.register({
      name: CONSTANTS.FIELD_NAME,
      type: "string",
      pluginId: CONSTANTS.ID,
      icon: Icon,
      intlLabel: {
        id: CONSTANTS.ID + ".label",
        defaultMessage: "Dynamic Enumeration",
      },
      intlDescription: {
        id: CONSTANTS.ID + ".description",
        defaultMessage:
          "Text input with dynamic enumeration values, which can be added according to use",
      },
      components: {
        Input: async () => import("./components/Input"),
      },
      options: {
        base: [],
        advanced: [
          {
            sectionTitle: null,
            items: [
              {
                name: "options.global",
                type: "select",
                intlLabel: {
                  id: CONSTANTS.ID + ".global.label",
                  defaultMessage: "Global Options",
                },
                description: {
                  id: CONSTANTS.ID + ".global.description",
                  defaultMessage:
                    "Global options have values available for all content types. Global options are added in the plugin settings file.",
                },
                value: "",
                options: globalOptions,
              },
            ],
          },
        ],
        validator: () => ({}),
      },
      // …
    });
  },
  bootstrap(app: any) {},
};
