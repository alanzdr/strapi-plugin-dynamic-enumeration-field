'use strict';

const register = require('./register');
const bootstrap = require('./bootstrap');
const config = require('./config');
const contentTypes = require('./content-types');
const controllers = require('./controllers');
const routes = require('./routes');
const services = require('./services');

module.exports = {
  register,
  bootstrap,
  config,
  controllers,
  routes,
  services,
  contentTypes,
};
