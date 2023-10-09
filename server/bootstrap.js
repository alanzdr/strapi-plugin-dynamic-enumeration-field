'use strict';

const subscribeLifecycle = require('./modules/Lifecycle')

module.exports = async ({ strapi }) => {
  subscribeLifecycle(strapi)
};
