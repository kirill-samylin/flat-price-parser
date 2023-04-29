const puppeteer = require('puppeteer')
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config')
const utils = require('./utils')

let currentValue = null
let browser = null
let bot = new TelegramBot(config.token, { polling: true })

async function getPrice() {
  const page = await browser.newPage();
  const result = await page.goto(config.url);
  const status = result.status()
  if (status === 200) {
    const searchResultSelector = '.b-flat__price';

    // Locate the full title with a unique string
    const textSelector = await page.waitForSelector(
      searchResultSelector
    );
    const elementValue = await textSelector.evaluate(el => el.textContent);
    if (currentValue !== elementValue) {
      bot.sendMessage(config.adminId,`${elementValue}`)
      currentValue = elementValue
    }
  }
  page.close();
}

// 272169
function initApp() {
  puppeteer.launch()
    .then(browserApi => {
      browser = browserApi
      getPrice()
      setInterval(() => getPrice(), 120000)
    })
  bot.sendMessage(config.adminId,'App started', { parse_mode: 'Markdown', disable_notification: false })
}

initApp()
