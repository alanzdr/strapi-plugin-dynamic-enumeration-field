import  CONSTANTS from '~/constants';
import { inspect } from "util";
import LifecycleModule from "./lifecycle";
import { populateSchema } from "~/utils/populate";
import { Core, UID } from '@strapi/strapi';

const EVENTS = [
  "afterCreate",
  "beforeDelete",
  "beforeUpdate",
  "afterUpdate",
];

const lifecycle = new LifecycleModule();

function subscribe(strapi: Core.Strapi) {

  strapi.documents.use(async (ctx, next) => {
    if (ctx.action === 'update') {
      const { data, documentId, locale } = ctx.params
      await lifecycle.update(ctx.uid, documentId, data, locale);
    }
    return await next()
  })

  strapi.db.lifecycles.subscribe(async (event) => {
    if (!EVENTS.includes(event.action)) {
      return;
    }

    const uid = event.model.uid as UID.ContentType;
    if (!uid || !(uid.startsWith("api") || uid.startsWith("plugin"))) {
      
      
      return
    } 

    if (uid === CONSTANTS.ENUMERATION_CONTENT_TYPE) {
      return
    }


    switch (event.action) {
      case "afterCreate": {
        await lifecycle.afterCreate(uid, event.result)
        return;
      }
      case "beforeDelete": {
        const id = Number(event.params?.where?.id);
        await lifecycle.beforeDelete(uid, id)
        return;
      }
      default: {
        break;
      }
    }

  });
}

export default subscribe;
