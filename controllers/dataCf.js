const axios = require('axios')
const { Telegraf } = require('telegraf')

const bot = new Telegraf('6415825467:AAH0zQVL2qkukflpysYTHgq4ixW8IUv2k68') // Замените YOUR_BOT_TOKEN на свой токен бота

const dataCf = async (
  metrics,
  telegramId,
  formattedStartDate,
  formattedEndDate,
  groupByOptions,
  sortBy,
  metricsFiltersArray
) => {
  console.log('metricsFiltersArray + DATACF', metricsFiltersArray)
  try {
    // const filtersForRequest = metricsFiltersArray.map((filter) => ({
    //   name: filter.name,
    //   operator: filter.operator,
    //   value: filter.value,
    // }))
    // console.log('filtersForRequest', filtersForRequest)
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

    // Проверяем условие (например, visits > 0)
    if (data.totals.visits > 0) {
      console.log(data.totals.visits)
      // Отправляем уведомление в Telegram
      bot.telegram.sendMessage(telegramId, 'Условие выполнено: visits > 0')
    }
  } catch (error) {
    console.error('Some error from the CF', error)
  }
}

module.exports = dataCf
