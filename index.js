const TelegramBot = require('node-telegram-bot-api')
const request = require('request')
const config = require('./config.json')

const TOKEN = config.token // telegram bot token
const options = {
  polling: true
}

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(TOKEN, options)

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Welcome. This Bot can show you photos from Unsplash site. You can get random photo or search by keyword.\nTo start using Bot send "random" or your keyword or use commands keyboard', {
    'reply_markup': {
      'keyboard': [
        ['Random'],
        ['Search by keyword']
      ]
    }
  })
})
bot.on('message', (msg) => {
  const recivedMsg = msg.text.toString().toLowerCase()

  let random = 'random'
  if (recivedMsg.indexOf(random) === 0) {
    request({
      url: config.unsplash.apiUrl + 'photos/random',
      qs: {
        client_id: config.unsplash.accessKey
      }
    }, function (err, res, body) {
      if (!err && res.statusCode === 200) {
        const data = JSON.parse(body)
        bot.sendPhoto(msg.chat.id, data.urls.small, { caption: `Description:\n${data.description}\nOriginal photo:\n${data.links.html}` })
      } else {
        bot.sendMessage(msg.chat.id, 'Oops, something went wrong.\nPlease try again')
      }
    })
  }
  let keyword = 'keyword'
  if (recivedMsg.includes(keyword)) {
    bot.sendMessage(msg.chat.id, 'Please, send me some keyword')
  }
  if (!recivedMsg.includes(keyword) && recivedMsg.indexOf(random) !== 0 && !recivedMsg.includes('/start')) {
    request({
      url: config.unsplash.apiUrl + 'search/photos',
      qs: {
        client_id: config.unsplash.accessKey,
        page: 1,
        per_page: 5,
        query: recivedMsg
      }
    }, function (err, res, body) {
      if (!err && res.statusCode === 200) {
        const data = JSON.parse(body)
        if (data.results.length > 0) {
          for (let i = 0; i < data.results.length; i++) {
            bot.sendPhoto(msg.chat.id, data.results[i].urls.small, { caption: `Description:\n${data.results[i].description}\nOriginal photo:\n${data.results[i].links.html}` })
          }
        } else {
          bot.sendMessage(msg.chat.id, 'No photos found, try another keyword')
        }
      } else {
        bot.sendMessage(msg.chat.id, 'Oops, something went wrong.\nPlease try again')
      }
    })
  }
})
