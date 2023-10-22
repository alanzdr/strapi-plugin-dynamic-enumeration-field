<p align="center">
  <img src=".github/logo.png" width="200" alt="Dynamic Enumeration logo">
</p>

<h1 align="center">Dynamic Enumeration</h1>

<p align="center">
  <a href="#tada-introduction">Introduction</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#page_facing_up-features">Features</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#cd-installation">Installation</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#wrench-configuration">Configuration
</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#book-api">Api
</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#memo-license">License</a>
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/static/v1?label=license&message=MIT&color=b40f20&labelColor=000000">
</p>

## :tada: Introduction

This plugin adds a new type of enumeration that works like a combobox, where you can get data already registered in the enumeration previously, or add a new item to select list.


## :page_facing_up: Features

- New field `Dynamic Enumeration` appears in admin `content-type-builder` page, in the `custom` tab.
- Save only registration options and remove options that is not being used.
- Works inside `Components` and `Dynamic Zones`.
- Separates each field options by its `API` or `Component`
- You can create `Globals` fields, which keep the same list between different `API` and `Components`
- You can load the options in plugin `API` or `Service`. For list the data in your frontend, for example.



## :cd: Installation

Install this plugin by adding it to the dependencies of your Strapi project.

```sh
# Yarn
yarn add strapi-plugin-dynamic-enumeration-field

# NPM
npm install strapi-plugin-dynamic-enumeration-field

# PNPM
pnpm install strapi-plugin-dynamic-enumeration-field
```

After that you must add it to your plugin configuration file.


## :wrench: Configuration

Add the code below to your `./config/plugins.js` file:

```js
module.exports = ({ env }) => ({
  // ...
  'dynamic-enumeration': {
    enabled: true,
  },
  // ...
});
```

After that, you'll need to build your admin panel:

```sh
npm run build
```

### Adding globals field

You can add several global field keys in the config part of the plugin settings.

```js
module.exports = ({ env }) => ({
  // ...
  'dynamic-enumeration': {
    enabled: true,
    config: {
      globals: {
        // Unique Key Name
        'my-global-enumeration': {
          // Frontend Name
          name: 'My Global Enumeration',
          // Fixed default values
          defaults: ['Strapi', 'Node.js', 'React.js'],
        },
        // ...Others globals fields
      },
    },
  },
  // ...
});
```


## :book: Api

The plugin adds two `Api` and `Service` to your application:

### Get Enumeration Values

You can get the options added to a field, sending the `uid` of the `API` or `Component`, and the `name` of the field.

The `uid` It is in the format `api::<api>.<api>` for api, and `<component-folder>.<component-file-name>` for components

See the example below:

#### EXAMPLE

```js
const uid = "api::my-api.my-api"
const name = "city"
const locale = 'en' // Optional, if you use i18b

// Using Fetch
await fetch(`${API_URL}/api/dynamic-enumeration?uid=${uid}&name=${name}&locale=${locale}`);
// GET /api/dynamic-enumeration?uid=your-api&name=your-attribute-name&locale=locale

// Using Service in Strapi
const SERVICE_UID = 'plugin::dynamic-enumeration.dynamic-enumeration-service'
const service = strapi.service(SERVICE_UID)
const data = await service.getValues({
        uid,
        name,
        locale // Optional
      })

```

### Get Globals Values

You can get the options added to all global field, sending the `key` of the `Globals Field` configured in your plugins file. ( See the settings part above )

See the example below:

#### EXAMPLE

```js

// In Your "./config/plugins.js" file
module.exports = ({ env }) => ({
  // ...
  'dynamic-enumeration': {
    enabled: true,
    config: {
      globals: {
        // The Global Key
        'my-field': {
          // Configurations
        },
      },
    },
  },
  // ...
});

// Using Fetch
await fetch(`${API_URL}/api/dynamic-enumeration/globals?key=my-field`);
// GET /api/dynamic-enumeration/globals?key=global-key&locale=locale

// Using Service in Strapi
const SERVICE_UID = 'plugin::dynamic-enumeration.dynamic-enumeration-service'
const service = strapi.service(SERVICE_UID)
const data = await service.getGlobalValues({
        key: 'my-field',
        locale // Optional
      })

```


## :memo: License

This project is under the MIT license. See the [LICENSE](LICENSE.md) file for more details.