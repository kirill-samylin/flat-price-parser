require('dotenv').config()

module.exports = {
  adminId: process.env.ADMIN_ID,
  token: process.env.TOKEN,
  url: process.env.FLAT_URL,
  maxFailCount: 10,
  timeInterval: 60000 * 60000,
}
