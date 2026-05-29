// Environment variables for Instagram integration

require("dotenv").config();

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID;
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const APP_NAME = "Hibearna Tech Instagram Agent";

module.exports = {
  VERIFY_TOKEN,
  INSTAGRAM_APP_ID,
  INSTAGRAM_APP_SECRET,
  REDIRECT_URI,
  APP_NAME,
};
