'use strict';

const subscribeLifecycle = require('./modules/Lifecycle')
const revalidateData = require('./modules/Revalidate')

module.exports = async ({ strapi }) => {
  revalidateData(strapi)
  subscribeLifecycle(strapi)
};
