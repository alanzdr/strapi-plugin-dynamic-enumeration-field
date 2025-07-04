import ProviderService from "./Provider";
import QueueService from "./Queue";
import dynamicEnumInterface from "./Interface";

export default {
  "dynamic-enumeration-provider": new ProviderService(),
  "dynamic-enumeration-queue": new QueueService(),
  "dynamic-enumeration-service": dynamicEnumInterface,
};
