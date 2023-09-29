const Section = require('../models/section')
const dataCf = require('./dataCf')

const updateSection = async (req, res) => {
  const sectionId = req.params.sectionId
  const updatedSectionData = req.body

  try {
    const fromDate = new Date(updatedSectionData.startDate)
    const toDate = new Date(updatedSectionData.endDate)

    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const seconds = date.getSeconds().toString().padStart(2, '0')

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }

    const formattedStartDate1 = formatDate(fromDate)
    const formattedEndDate2 = formatDate(toDate)

    updatedSectionData.startDate = formattedStartDate1
    updatedSectionData.endDate = formattedEndDate2

    let groupByArr = updatedSectionData.groupBy
    if (typeof groupByArr === 'string') {
      groupByArr = groupByArr.split(',')
    }
    updatedSectionData.groupBy = groupByArr

    let metricsArr = updatedSectionData.metrics
    if (typeof metricsArr === 'string') {
      metricsArr = metricsArr.split(',')
    }
    updatedSectionData.metrics = metricsArr

    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      updatedSectionData,
      { new: true } // Опция { new: true } возвращает обновленную версию секции
    )

    if (!updatedSection) {
      return res.status(404).json({ message: 'Секция не найдена' })
    }

    const metrics = updatedSection.metrics
    const telegramId = updatedSection.telegramId
    const formattedStartDate = updatedSection.startDate
    const formattedEndDate = updatedSection.endDate
    const groupByOptions = updatedSection.groupByOptions
    const sortBy = updatedSection.sortBy
    const arrMetricsFilters = updatedSection.metricsFilters
    console.log('arrMetricsFilters UPD!!!!', arrMetricsFilters)

    const metricsFiltersArray = arrMetricsFilters.map((filter) => {
      const { filterName, filterOperator, filterValue } = filter
      return { name: filterName, operator: filterOperator, value: filterValue }
    })

    console.log('metricsFiltersArray UPD', metricsFiltersArray)

    await dataCf(
      metrics,
      telegramId,
      formattedStartDate,
      formattedEndDate,
      groupByOptions,
      sortBy,
      metricsFiltersArray
    )

    res.status(200).json({ section: updatedSection })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
}

module.exports = updateSection
