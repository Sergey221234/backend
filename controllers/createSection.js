const Section = require('../models/section')
const { dataCf } = require('./dataCf')

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
      notificationInterval,
      timezone,
    } = req.body
    const userId = req.session.userId

    console.log('create secion - userId', userId)

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

    console.log('metricsFilters create', metricsFilters)
    const newSection = new Section({
      title,
      metrics,
      telegramId,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      sortBy,
      groupByOptions,
      metricsFilters,
      notificationInterval,
      userId,
      timezone,
    })

    await newSection.save()

    const metricFilter = newSection.metricsFilters

    const metricsFiltersArray = metricFilter.map((filter) => {
      const { filterName, filterOperator, filterValue } = filter
      return { name: filterName, operator: filterOperator, value: filterValue }
    })

    await dataCf(
      metrics,
      telegramId,
      formattedStartDate,
      formattedEndDate,
      groupByOptions,
      sortBy,
      metricsFiltersArray,
      notificationInterval,
      timezone
    )

    res.status(201).json({ section: newSection })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
}

module.exports = createSection
