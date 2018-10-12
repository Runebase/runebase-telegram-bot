const _ = require('lodash');
const { getInstance } = require('./rclient');

const RunebaseUtils = {
  async validateAddress(args) {
  	console.log(args)
    const {
      address,
    } = args;

    if (_.isUndefined(address)) {
      throw new TypeError('address needs to be defined');
    }

    return getInstance().validateAddress(address);
  },
  async getHexAddress(args) {
  	console.log(args)
    const {
      address,
    } = args;

    if (_.isUndefined(address)) {
      throw new TypeError('address needs to be defined');
    }

    return getInstance().getHexAddress(address);
  },
  async walletPassphrase(args) {
  	console.log(args)
    const {
      passphrase,
      timeout,
    } = args;

    if (_.isUndefined(passphrase)) {
      throw new TypeError('passphrase needs to be defined');
    }

    return getInstance().walletPassphrase(passphrase, timeout, stakingOnly = false);
  },
};

module.exports = RunebaseUtils;
