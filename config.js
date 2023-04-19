// bot settings
const ms_email = process.env.EMAIL;
const ms_password = process.env.PASSWORD;
const bot_token = process.env.TOKEN;
const channel_id = `1082122512357404732`;

// game settings
const mc_server = "play.fennet.rentals";
const mc_version = "1.19.3";

// in-game settings
const whitelist = ["Vixy", "cat_yawn", "Egirl39", "AK50"];
const RANGE_GOAL = 1;

// not constants
let do_look = true;
let do_farm = false;

module.exports = {
  ms_email,
  ms_password,
  bot_token,
  channel_id,
  mc_server,
  mc_version,
  whitelist,
  RANGE_GOAL,
  do_look,
  do_farm,
};
