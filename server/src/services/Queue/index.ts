import type { UID } from '@strapi/strapi'
import CONSTANTS from "../../constants";
import { IEnumerationEntity, IEnumerationInfo } from '~/types';
import ProviderService from '../Provider';

interface IQueueEvent {
  function: (entity: IEnumerationEntity) => Promise<IEnumerationEntity> | IEnumerationEntity;
  resolve: () => void;
  reject: (error: Error) => void;
}

interface IQueue {
  running: boolean;
  entity: IEnumerationEntity | IEnumerationInfo;
  events: IQueueEvent[];
}

class QueueService {
  private queueMap: Map<string, IQueue>;

  constructor () {
    this.queueMap = new Map();
  }

  private get provider() {
    return ProviderService.getInstance();
  }

  private getEnumerationKey({name, uid, locale}: IEnumerationInfo): string {
    return `${uid}::${name}${locale ? `::${locale}` : ''}`;
  }

  private getQueue(entity: IEnumerationInfo): IQueue {
    const queueKey = this.getEnumerationKey(entity);
    
    let queue = this.queueMap.get(queueKey);

    if (!queue) {
      queue = {
        running: false,
        entity,
        events: [],
      }

      this.queueMap.set(queueKey, queue);
    }

    return queue
  }

  private async runQueue(queue: IQueue) {
    queue.running = true;

    if (!Object.prototype.hasOwnProperty.call(queue.entity, 'id')) {
      queue.entity = await this.provider.getEnumeration(queue.entity);
    }

    while (queue.events.length > 0) {
      const event = queue.events.shift();

      if (!event) {
        continue;
      }

      try {
        queue.entity = await Promise.resolve(event.function(queue.entity as IEnumerationEntity));
        event.resolve();
      } catch (error) {
        console.error(error);
        event.reject(error);
      }
      
    }

    const enumerationKey = this.getEnumerationKey(queue.entity as IEnumerationInfo);
    queue.running = false;
    this.queueMap.set(enumerationKey, queue);
    
    const { id, values } = queue.entity as IEnumerationEntity;
    await this.provider.updateValues(id, values);
  }

  public async execute(entity: IEnumerationInfo, eventFunction: IQueueEvent['function']): Promise<void> {
    const queue = this.getQueue(entity);
    
    return new Promise((resolve, reject) => {
      queue.events.push({
        function: eventFunction,
        resolve,
        reject,
      });

      if (!queue.running) {
        this.runQueue(queue);
      }
    });
  }

  public static getInstance(): QueueService {
    return strapi.service(CONSTANTS.QUEUE_SERVICE) as QueueService; 
  }
}

export default QueueService;
