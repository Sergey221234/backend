const axios = require('axios')
const { Telegraf } = require('telegraf')
require('dotenv').config()

const bot = new Telegraf('6415825467:AAH0zQVL2qkukflpysYTHgq4ixW8IUv2k68')

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
          'api-key':
            '9a061e70d01b517d631a2c400d222ec83515d9106c59ad7f7ebe22c3f72e80ae.0a5f392f4dcaf9bd29e5f9bf9dd9b2a321da43b7',
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

      function formatObjectToString(metricsFiltersArray) {
        let result = ''
        metricsFiltersArray.forEach((obj, index) => {
          const keys = Object.keys(obj)
          console.log('keys', keys)
          const values = Object.values(obj)
          console.log('values', values)
          const conditionString = `${values[0]} ${values[1]} ${values[2]}`
          console.log('conditionString', conditionString)
          console.log('index', `${index}`)
          result += `${index + 1}. ${conditionString}\n`
          console.log('result', result)
        })
        return result
      }

      if (data.items.length !== 0 && Object.keys(data.totals).length !== 0) {
        const convertMetricsFilters = formatObjectToString(metricsFiltersArray)
        const metricsDataFilters = `Правило сработало по следующим условиям: \n${convertMetricsFilters}`
        await sendTelegramMessage(telegramId, metricsDataFilters)
        stopInterval()
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
    console.log(intervalId)
  }
}

const stopInterval = () => {
  clearInterval(intervalId)
}

module.exports = {
  dataCf,
  stopInterval,
}
