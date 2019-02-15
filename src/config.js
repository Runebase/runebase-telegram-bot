var config = {};

config.bot = {};
config.bot.token = 'xxx';

config.db = {};
config.db.host = 'mongodb://localhost/';

config.wallet = {};
config.wallet.passphrase  = "xxx";

config.airdrop = {};

//config.airdrop.runes = {};
//config.airdrop.runes.amount  = 1 * 1e+8;
//config.airdrop.runes.contract  = "";
//config.airdrop.runes.fromAddress  = "";

config.airdrop.pred = {};
config.airdrop.pred.amount  = 3000 * 1e+8;
config.airdrop.pred.contract  = "RunebasePredictionToken.sol";
config.airdrop.pred.fromAddress  = "RJMRmWMdPxPgDM3zj1RHVrTiXZCUcQdZJE";


config.rpc = "http://xxx:xxx@localhost:9432"



module.exports = config;
