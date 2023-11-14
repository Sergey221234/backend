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
  notificationInterval,
  timezone
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
          timezone: timezone,
          orderType: 'asc',
          currency: 'EUR',
          sortBy: sortBy,
          page: 1,
          pageSize: 30,
          includeAll: false,
          metricsFilters: metricsFiltersArray,
          conversionTimestamp: 'postback',
        },
      }

      const { data } = await axios.request(options)
      // console.log('data response', data)

      const dateformattedStartDate = formattedStartDate.split(' ')[0]

      const dateformattedEndDate = formattedEndDate.split(' ')[0]

      // const filteData = data.items
      //   .filter((item) => item.date === dateformattedStartDate)
      //   .map((item) => ({
      //     date: item.date,
      //     param1: item.param1,
      //     dynamicPayout: item.dynamicPayout,
      //     conversations: item.conversions,
      //   }))
      // const filteData2 = data.items
      //   .filter((item) => item.date === dateformattedEndDate)
      //   .map((item) => ({
      //     date: item.date,
      //     param1: item.param1,
      //     dynamicPayout: item.dynamicPayout,
      //     conversations: item.conversions,
      //   }))

      // console.log('filteData1', filteData)
      // console.log('filteData2', filteData2)

      const conversionsData = data.items.map(
        (conversionItem) => conversionItem.conversions
      )
      // console.log('conversionsData', conversionsData)
      if (conversionsData) {
        const getDataForDate = (data, date) => {
          return data.items
            .filter((item) => item.date === date)
            .map((item) => ({
              param1: item.param1,
              dynamicPayout: item.dynamicPayout,
              campaignName: item.campaignName,
              offerName: item.offerName,
            }))
        }

        const dataForStartDate = getDataForDate(data, dateformattedStartDate)
        const dataForEndDate = getDataForDate(data, dateformattedEndDate)

        const messages = []

        dataForStartDate.forEach((startItem) => {
          const matchingEndItem = dataForEndDate.find(
            (endItem) => endItem.param1 === startItem.param1
          )

          if (matchingEndItem) {
            const payoutStart = startItem.dynamicPayout
            const roundPayoutStart = payoutStart.toFixed(2)

            const payoutEnd = matchingEndItem.dynamicPayout
            const roundPayoutEnd = payoutEnd.toFixed(2)

            let message = ''

            if (matchingEndItem.dynamicPayout > startItem.dynamicPayout) {
              message += `Выплата по ключу <b>${matchingEndItem.param1}</b> в офере <b>${matchingEndItem.offerName}</b> поднялась с <b>${roundPayoutStart}</b> до <b>${roundPayoutEnd}</b> в кампании <b>${matchingEndItem.campaignName}</b>`
              // { parse_mode: 'HTML' }
              // bot.telegram.sendMessage(
              //   telegramId,

              // )
              // stopInterval()
            }
            if (matchingEndItem.dynamicPayout < startItem.dynamicPayout) {
              message += `Выплата по ключу <b>${matchingEndItem.param1}</b> в офере <b>${matchingEndItem.offerName}</b> упала с <b>${roundPayoutStart}</b> до <b>${roundPayoutEnd}</b> в кампании <b>${matchingEndItem.campaignName}</b>`
              // bot.telegram.sendMessage(
              //   telegramId,
              //   ,
              //   { parse_mode: 'HTML' }
              // )
              // stopInterval()
            }
            messages.push(message)
            // console.log('messages', messages)
          }
        })

        if (messages.length > 0) {
          const numbersMessages = messages
            .map((messageItem, i) => `${i + 1}. ${messageItem}`)
            .join('\n')
          bot.telegram.sendMessage(telegramId, numbersMessages, {
            parse_mode: 'HTML',
          })
          stopInterval()
        }
      }
      if (!conversionsData) {
        function formatObjectToString(metricsFiltersArray) {
          let result = ''
          metricsFiltersArray.forEach((obj, index) => {
            const keys = Object.keys(obj)
            // console.log('keys', keys)
            const values = Object.values(obj)
            // console.log('values', values)
            const conditionString = `${values[0]} ${values[1]} ${values[2]}`
            // console.log('conditionString', conditionString)
            // console.log('index', `${index}`)
            result += `${index + 1}. ${conditionString}\n`
            // console.log('result', result)
          })
          return result
        }

        if (data.items.length !== 0 && Object.keys(data.totals).length !== 0) {
          const convertMetricsFilters =
            formatObjectToString(metricsFiltersArray)
          const metricsDataFilters = `Правило сработало по следующим условиям: \n${convertMetricsFilters}`
          await sendTelegramMessage(telegramId, metricsDataFilters)
          stopInterval()
        }
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
