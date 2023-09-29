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

    console.log('metricsFilters create', metricsFilters)
    const newSection = new Section({
      title,
      metrics,
      telegramId,
      userId,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      sortBy,
      groupByOptions,
      metricsFilters,
    })

    await newSection.save()

    const metricFilter = newSection.metricsFilters

    console.log('metricFilter!!!! create', metricFilter)

    const metricsFiltersArray = arrMetricsFilters.map((filter) => {
      const { filterName, filterOperator, filterValue } = filter
      return { name: filterName, operator: filterOperator, value: filterValue }
    })

    console.log('metricsFiltersArray create', metricsFiltersArray)

    await dataCf(
      metrics,
      telegramId,
      formattedStartDate,
      formattedEndDate,
      groupByOptions,
      sortBy,
      metricsFiltersArray
    )

    res.status(201).json({ section: newSection })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
}

module.exports = createSection
