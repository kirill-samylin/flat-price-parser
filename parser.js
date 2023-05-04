const puppeteer = require('puppeteer')
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config')

let currentValue = null
let browser = null
let bot = new TelegramBot(config.token, { polling: true })

function sendMessage(message, isDisableNotification = true) {
  bot.sendMessage(config.adminId,message, { parse_mode: 'Markdown', disable_notification: isDisableNotification })
}

async function getPrice() {
  console.log(`open page ${config.url}`)
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  const result = await page.goto(config.url);
  const status = result.status()
  if (status === 200) {
    console.log('page opened')
    const searchResultSelector = '.b-flat__price';

    const textSelector = await page.waitForSelector(
      searchResultSelector
    );
    const elementValue = await textSelector.evaluate(el => el.textContent);
    console.log(`get value ${elementValue}`)
    const isNewValue = currentValue !== elementValue
    if (isNewValue) {
      currentValue = elementValue
    }

    sendMessage(`Price: ${elementValue}, [open site](${config.url})`, !isNewValue)
  } else {
    console.log('fail open page')
  }
  page.close();
}

function initApp() {
  puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
    .then(browserApi => {
      browser = browserApi
      getPrice()
      console.log(config.timeInterval)
      setInterval(() => getPrice(), config.timeInterval)
    })
  sendMessage('App started')
}

initApp()
