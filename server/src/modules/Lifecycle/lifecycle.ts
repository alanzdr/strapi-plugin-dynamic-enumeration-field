import { Struct, UID } from "@strapi/strapi";
import LifeCycleMutation from "./mutation";

import { populateSchema } from '../../utils/populate'

interface IQueueElements {
  data: any;
  model: Struct.Schema
  locale?: string;
}


class Lifecycle {
  private deletedEntriesKeys = new Set<string>();

  private async executeQueue({ data, model, locale }: IQueueElements, remove?: boolean) {
    const mutationHandler = new LifeCycleMutation(model);
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

  private async executeDeleteQueue(
    uid: UID.ContentType, 
    data: any,
    locale: string
  ) {
    const queue = this.prepareQueue(uid, data, locale);

    const promises = queue.map(async (element) => {
      await this.executeQueue(element, true);
    });

    await Promise.all(promises); 
  }

  public async beforeDelete(uid: UID.ContentType, documentId: string, locale: string) {
    const { populate } = populateSchema(uid);

    // Get data before verify multiples because strapi has a 
    // bug that get error if a published and draft event has 
    // different execution time
    const data = await strapi.documents(uid).findOne({
      documentId,
      locale,
      populate: populate as any,
      status: 'published'
    })

    if (!data) {
      return
    }

    const entryKey = `${uid}-${documentId}-${locale}`;

    if (this.deletedEntriesKeys.has(entryKey)) {
      return
    }
    
    this.deletedEntriesKeys.add(entryKey);
    void this.executeDeleteQueue(uid, data, locale);

    
    // keep the key for 60 seconds to avoid multiple deletions
    setTimeout(() => {
      this.deletedEntriesKeys.delete(entryKey);
    }, 60 * 1000);
    
  }
}

export default Lifecycle;
