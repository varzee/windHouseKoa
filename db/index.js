const mongoose = require('mongoose');
const connection = require('./db-connect')

const WindHouseSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  sub_area: Array,
  last_send_area: Array,
});
const WindHouseModel = connection.model('windhouse',WindHouseSchema,'windhouse');

module.exports = WindHouseModel
