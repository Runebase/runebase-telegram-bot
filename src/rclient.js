const { Rweb3 } = require('rweb3');

const config = require('./config');
const RClient = (() => {
  let instance;

  function createInstance() {
    return new Rweb3(config.rpc);
  }

  return {
    getInstance: () => {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },
  };
})();

module.exports = RClient;
