const puppeteer = require('puppeteer')
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config')
const utils = require('./utils')

let currentValue = null
let browser = null
let bot = new TelegramBot(config.token, { polling: true })

async function getPrice(flatId) {
  const page = await browser.newPage();
  const result = await page.goto(`https://etalongroup.ru/spb/choose/${flatId}/`);
  const status = result.status()
  if (status === 200) {
    const searchResultSelector = '.b-flat__price';

    // Locate the full title with a unique string
    const textSelector = await page.waitForSelector(
      searchResultSelector
    );
    const elementValue = await textSelector.evaluate(el => el.textContent);
    bot.sendMessage(config.adminId,`${elementValue}`)
  }
  page.close();
}

// 272169
function initApp() {
  puppeteer.launch()
    .then(browserApi => {
      browser = browserApi
      getPrice('')
      setInterval(() => getPrice(''), 120000)
    })
  bot.sendMessage(config.adminId,'App started [test](https://etalongroup.ru/spb/choose/272169/)', { parse_mode: 'Markdown' })
}

initApp()
