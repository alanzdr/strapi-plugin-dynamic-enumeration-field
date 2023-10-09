
import pluginId from './pluginId';

import Icon from './components/Icon'
import reducers from './reducers';
import { getPluginConfig } from './service/config';

export default {  
  async register(app) {
    app.addReducers(reducers);

    const pluginConfig = await getPluginConfig()

    app.registerPlugin({
      id: pluginId,
      isReady: true,
      name: "Dynamic Enumeration",
    });

    const getGlobalOptions = () => {
      try {
        const globalOptions = pluginConfig?.globals;

        if (!globalOptions) {
          return [];
        }

        const entries = Object.entries(globalOptions);

        if (!entries || !entries.length) {
          return [];
        }

        return entries.map(([key, value]) => ({
          key,
          value: key,
          metadatas: {
            intlLabel: {
              id: pluginId + ".globals." + key,
              defaultMessage: value.name || key,
            },
          }
        }));
      } catch (error) {
        console.error(error);
        return [];
      }
    }

    app.customFields.register({
      name: "dynamic-field",
      type: "string",
      pluginId,
      icon: Icon,
      intlLabel: {
        id: pluginId + ".label",
        defaultMessage: "Dynamic Enumeration",
      },
      intlDescription: {
        id: pluginId + ".description",
        defaultMessage: "User can add new values to the enumeration",
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
                  id: pluginId + ".global.label",
                  defaultMessage: "Global Options",
                },
                description: {
                  id: pluginId + ".global.description",
                  defaultMessage:
                    "Global options have values available for all content types. Global options are added in the plugin settings file",
                },
                value: "",
                options: getGlobalOptions(),
              },
            ],
          },
        ],
        validator: () => ({})
      }
      // …
    });
  },
  bootstrap(app) {}
};
