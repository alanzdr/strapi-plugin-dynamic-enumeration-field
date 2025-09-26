import CONSTANTS from "../../constants";
import { IEnumerationEntity, IEnumerationInfo } from '~/types';
import ProviderService from '../Provider';

type IQueueEventCallback = (entity: IEnumerationEntity) => IEnumerationEntity;

interface IQueue {
  key: string
  running: boolean;
  mutated: boolean;
  entity: IEnumerationEntity | IEnumerationInfo;
  events: IQueueEventCallback[];
}

class QueueService {
  private queueMap: Map<string, IQueue>;
  private defaultLocale: string | null = null;


  constructor () {
    this.queueMap = new Map();
  }

  private get provider() {
    return ProviderService.getInstance();
  }

  private getEnumerationKey({name, uid, locale}: IEnumerationInfo): string {
    return `${uid}::${name}::${locale}`;
  }

  private getQueue(entity: IEnumerationInfo): IQueue {
    const queueKey = this.getEnumerationKey(entity);
    
    let queue = this.queueMap.get(queueKey);

    if (!queue) {
      queue = {
        key: queueKey,
        running: false,
        mutated: false,
        entity,
        events: [],
      }

      this.queueMap.set(queueKey, queue);
    }

    return queue
  }

  private async getEntityData(info: IEnumerationInfo): Promise<IEnumerationEntity> {
    let entity = await this.provider.getEnumeration(info);

    if (!entity) {
      entity = await this.provider.createEnumeration(info);
    }

    return entity;
  }

  private async executeQueue(queue: IQueue) {
    if (queue.running || queue.events.length === 0) {
      return;
    }

    queue.running = true;

    if (!Object.prototype.hasOwnProperty.call(queue.entity, 'id')) {
      queue.entity = await this.getEntityData(queue.entity);
    }

    while (queue.events.length > 0) {
      const mutateEvent = queue.events.shift();

      if (!mutateEvent) {
        continue;
      }

      try {
        queue.entity = mutateEvent(queue.entity as IEnumerationEntity);
        queue.mutated = true;
      } catch (error) {
        console.error(error);
      }
    }

    
    queue.running = false;
  }

  public add(entity: IEnumerationInfo, eventCallback: IQueueEventCallback) {
    const queue = this.getQueue(entity);
    queue.events.push(eventCallback);
  }

  public async execute() {
    const queues = Array.from(this.queueMap.values());

    for (const queue of queues) {
      await this.executeQueue(queue);
      if (queue.mutated && Object.prototype.hasOwnProperty.call(queue.entity, 'id')) {
      
        const { id, values } = queue.entity as IEnumerationEntity;
        await this.provider.updateValues(id, values);
        queue.mutated = false;
      }
    }
  }

  public static getInstance(): QueueService {
    return strapi.service(CONSTANTS.QUEUE_SERVICE) as QueueService; 
  }

  private cleanQueueEntity(id: number) {
    for (const [key, queue] of this.queueMap.entries()) {
      if (queue.entity && (queue.entity as IEnumerationEntity).id === id) {
        this.queueMap.delete(key);
      }
    }
  }

  public register() {
    const clearQueue = this.cleanQueueEntity.bind(this);

    strapi.db.lifecycles.subscribe({
      models: [CONSTANTS.ENUMERATION_CONTENT_TYPE],
      async afterDelete(event) {
        const { result } = event;

        if (!result || !result.id) {
          return
        }

        clearQueue(result.id);
      },
    })
  }

  private async getDefaultLocale() {
    if (this.defaultLocale) {
      return this.defaultLocale;
    }

    const localeService = strapi.plugins.i18n.services.locales
    this.defaultLocale = await localeService.getDefaultLocale()

    return this.defaultLocale;
  }

  public async getLocale(dataLocale?: string) {
    if (dataLocale) {
      return dataLocale;
    }

    return this.getDefaultLocale();
  }
}

export default QueueService;
