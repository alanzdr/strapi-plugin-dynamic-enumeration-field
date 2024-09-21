import executeLifecycle from "./execute";

const EVENTS = [
  "beforeCreate",
  "beforeCreateMany",
  "afterCreate",
  "beforeUpdate",
  "beforeUpdateMany",
  "beforeDelete",
  "beforeDeleteMany",
];

function subscribe(strapi) {
  strapi.db.lifecycles.subscribe(async (event) => {
    if (!EVENTS.includes(event.action)) {
      return;
    }
    await executeLifecycle(event);
  });
}

export default subscribe;
