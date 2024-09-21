export default {
  "admin-api": {
    type: "admin",
    routes: [
      {
        method: "GET",
        path: "/get-field-options",
        handler: "dynamic-enumeration.getAdminFieldValues",
        config: {
          policies: [],
        },
      },
      {
        method: "GET",
        path: "/get-config",
        handler: "dynamic-enumeration.getConfig",
        config: {
          policies: [],
          auth: false,
        },
      },
    ],
  },
  "content-api": {
    type: "content-api",
    routes: [
      {
        method: "GET",
        path: "/",
        handler: "dynamic-enumeration.getFieldValues",
        config: {
          policies: [],
        },
      },
      {
        method: "GET",
        path: "/globals",
        handler: "dynamic-enumeration.getGlobalValues",
        config: {
          policies: [],
        },
      },
    ],
  },
};
