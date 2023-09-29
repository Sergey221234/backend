const Section = require('../models/section')
const dataCf = require('./dataCf')

// Создать новый раздел
const createSection = async (req, res) => {
  try {
    const {
      title,
      startDate,
      endDate,
      metrics,
      telegramId,
      groupByOptions,
      sortBy,
      metricsFilters,
    } = req.body

    console.log('req.body ', req.body)

    // const metricsFiltersArray = metricsFilters.map((filter) => {
    //   const { name, operator, value } = filter
    //   return { name, operator, value }
    // })

    // console.log('metricsFiltersArray ', metricsFiltersArray)

    const userId = req.session.userId

    const fromDate = new Date(startDate)
    const toDate = new Date(endDate)

    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const seconds = date.getSeconds().toString().padStart(2, '0')

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }

    const formattedStartDate = formatDate(fromDate)
    const formattedEndDate = formatDate(toDate)

    // const groupByArray = groupByOptions.split(',')

    // const metricsArray = metrics.split(',')

    const newSection = new Section({
      title,
      metrics,
      telegramId,
      userId,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      sortBy,
      groupByOptions,
      // metricsFilters: metricsFiltersArray,
    })

    await newSection.save()

    await dataCf(
      metrics,
      telegramId,
      formattedStartDate,
      formattedEndDate,
      // groupByArray,
      sortBy
    )

    res.status(201).json({ section: newSection })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
}

module.exports = createSection
