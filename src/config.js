var config = {};

config.bot = {};
config.bot.token = 'YOUR_TELEGRAM_BOT_TOKEN';

config.db = {};
config.db.host = 'mongodb://localhost/';

config.wallet = {};
config.wallet.passphrase  = "YOU_WALLET_PASSPHRASE";

config.airdrop = {};

//config.airdrop.runes = {};
//config.airdrop.runes.amount  = 1 * 1e+8;
//config.airdrop.runes.contract  = "";
//config.airdrop.runes.fromAddress  = "";

config.airdrop.pred = {};
config.airdrop.pred.amount  = 1 * 1e+8;
config.airdrop.pred.contract  = "RunebasePredictionToken.sol";
config.airdrop.pred.fromAddress  = "5kzfH7ccsxCwGoBYmrxrNcF1spsTWYwXJ6";


config.rpc = "http://user:pass@localhost:19432"



module.exports = config;
