
import  CONSTANTS from '~/constants';
import LifecycleModule from "./lifecycle";
import { Core, UID } from '@strapi/strapi';

const EVENTS = [
  "afterCreate",
  "beforeDelete",
];

const lifecycle = new LifecycleModule();


function subscribe(strapi: Core.Strapi) {

  strapi.documents.use(async (ctx, next) => {
    const uid = ctx.uid as UID.ContentType;
    const action = ctx.action 
    
    if (action === 'update') {
      const { data, documentId, locale } = ctx.params
      await lifecycle.update(uid, documentId, data, locale);
    }

    if (action === 'delete' || action === 'unpublish') {     
      const documentId = ctx.params.documentId;
      const locale = ctx.params.locale;
      await lifecycle.beforeDelete(uid, documentId, locale);
    }

    // TODO: handle create and publish actions here too

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
      default: {
        break;
      }
    }

  });
}

export default subscribe;
