import { Struct, UID } from "@strapi/strapi";
import LifeCycleMutation from "./mutation";
import LifecycleProvider from "./provider";

import { populateSchema } from '../../utils/populate'
import { inspect } from "util";

interface IQueueElements {
  data: any;
  model: Struct.Schema
  locale?: string;
}

class Lifecycle {
  private async executeQueue({ data, model, locale }: IQueueElements, remove?: boolean) {
    const provider = new LifecycleProvider(model)
    
    if (!provider.fieldNames || provider.fieldNames.length === 0) {
      return;
    }

    const mutationHandler = new LifeCycleMutation(provider);

    await mutationHandler.mutate(data, locale, remove);
  }


  public prepareQueue(uid: UID.Schema, data: any, locale?: string) {
    const queue: IQueueElements[] = []
    const model = strapi.getModel(uid);
    const attributes = model.attributes;
    const attributesKeys = Object.keys(attributes);

    queue.push({
      data,
      model,
      locale
    })

    for (const key of attributesKeys) {
      const attribute = attributes[key];
      const value = data[key];

      if (!attribute || !value) {
        continue;
      }

      if (attribute.type === 'component') {
        const target = attribute.component as UID.ContentType;
        if (!target) {
          continue;
        }

        if (attribute.repeatable) {
          for (const valueData of value) {
            const relationQueue = this.prepareQueue(target, valueData, locale)
            queue.push(...relationQueue);
          }
        } else {
          const relationQueue = this.prepareQueue(target, value, locale)
          queue.push(...relationQueue);
        }
      }

      if (attribute.type === 'dynamiczone') {
        for (const component of value) {
          const target = component.__component as UID.ContentType;
          if (!target) {
            continue;
          }

          const relationQueue = this.prepareQueue(target, component, locale)
          queue.push(...relationQueue);
        }
      }
    }

    return queue
  }

  public async afterCreate(uid: UID.ContentType, data: any) {
    
    const model = strapi.getModel(uid);

    if (model.options.draftAndPublish && !data.publishedAt) {
      return
    }

    const queue = this.prepareQueue(uid, data, data.locale);

    const promises = queue.map(async (element) => {
      await this.executeQueue(element);
    });

    await Promise.all(promises);    
  }

  public async update(uid: UID.ContentType, documentId: string, data: any, locale?: string) {
    const model = strapi.getModel(uid);
    
    if (model.options.draftAndPublish) {
      return
    }

    const { populate } = populateSchema(uid);

    const current = await strapi.documents(uid).findOne({
      documentId,
      locale,
      populate: populate as any,
      status: 'published'
    })

    const deleteQueue = this.prepareQueue(uid, current, locale);

    const deletePromises = deleteQueue.map(async (element) => {
      await this.executeQueue(element, true);
    });

    await Promise.all(deletePromises); 

    await this.afterCreate(uid, data); 
  }

  public async beforeDelete(uid: UID.ContentType, id: number) {
    const { populate } = populateSchema(uid);

    const data = await strapi.db.query(uid).findOne({
      where: { id },
      populate,
    });
    
    const model = strapi.getModel(uid);
    if (model.options.draftAndPublish && !data.publishedAt) {
      return
    }

    const queue = this.prepareQueue(uid, data, data.locale);
    
    const promises = queue.map(async (element) => {
      await this.executeQueue(element, true);
    });

    await Promise.all(promises); 
  }
}

export default Lifecycle;
