const axios = require('axios')
const { Telegraf } = require('telegraf')
require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN)

const sendTelegramMessage = async (telegramId, metricsDataFilters) => {
  try {
    await bot.telegram.sendMessage(telegramId, metricsDataFilters)
    console.log('Сообщение успешно отправлено в телеграм.')
  } catch (error) {
    console.error('Ошибка при отправке сообщения в телеграм:', error)
  }
}

let intervalId // Переменная для хранения идентификатора интервала

const dataCf = (
  metrics,
  telegramId,
  formattedStartDate,
  formattedEndDate,
  groupByOptions,
  sortBy,
  metricsFiltersArray,
  notificationInterval
) => {
  const intervalCallback = async () => {
    try {
      const options = {
        method: 'POST',
        url: 'https://public-api.clickflare.io/api/report',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'api-key': process.env.API_KEY,
        },
        data: {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          groupBy: groupByOptions,
          metrics: metrics,
          timezone: 'CET',
          orderType: 'asc',
          currency: 'USD',
          sortBy: sortBy,
          page: 1,
          pageSize: 1,
          includeAll: true,
          metricsFilters: metricsFiltersArray,
          conversionTimestamp: 'visit',
        },
      }

      const { data } = await axios.request(options)
      console.log(data)

      if (data.items.length !== 0 && Object.keys(data.totals).length !== 0) {
        const convertMetricsFilters = JSON.stringify(metricsFiltersArray)
        const metricsDataFilters = `Метрики по фильтру ${convertMetricsFilters}`
        await sendTelegramMessage(telegramId, metricsDataFilters)
      }
    } catch (error) {
      console.error(
        'Ошибка при получении данных из API или отправке сообщения:',
        error
      )
    }
  }

  if (notificationInterval !== 9999) {
    intervalId = setInterval(intervalCallback, notificationInterval * 60 * 1000)
  }
}

const stopInterval = () => {
  clearInterval(intervalId)
}

module.exports = {
  dataCf,
  stopInterval,
}
