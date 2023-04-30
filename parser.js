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

// function openPage(url) {
//   return new Promise(async (resolve) => {
//     const page = await browser.newPage();
//     await page.goto(url);
//     resolve(page)
//     // const statusPage = result.status()
//     // if (statusPage === 200) {
//     //   resolve(page)
//     // } else {
//     //   reject(page)
//     // }
//   })
// }
//
//
// async function parsingPageInterval() {
//   let fail = 0
//   const page = await openPage(config.url)
//   const statusPage = page.status()
//
//   let parsing = setInterval(() => {
//     const statusPage = page.status()
//     if (statusPage === 200) {
//
//     } else {
//
//     }
//     openPage(config.url)
//       .then((page) => {
//         fail = 0
//       })
//       .catch(async (page) => {
//         await page.reload(appUrl);
//         fail++
//         if (fail > config.timeInterval) {
//           sendMessage('limit fail is exceeded, off parsing')
//           clearInterval(parsing)
//         }
//       })
//   }, config.timeInterval)
// }

function initApp() {
  puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
    .then(browserApi => {
      browser = browserApi
      getPrice()
      setInterval(() => getPrice(), 120000)
    })
  bot.sendMessage(config.adminId,'App started', { parse_mode: 'Markdown', disable_notification: true })
}

initApp()
