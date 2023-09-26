const Section = require('../models/section')

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

    const formattedStartDate = formatDate(fromDate)
    const formattedEndDate = formatDate(toDate)

    updatedSectionData.startDate = formattedStartDate
    updatedSectionData.endDate = formattedEndDate

    const groupByArr = updatedSectionData.groupBy.split(',')

    if (Array.isArray(groupByArr) && groupByArr.length > 2) {
      updatedSectionData.groupBy = groupByArr
    } else {
      updatedSectionData.groupBy = [updatedSectionData.groupBy]
    }

    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      updatedSectionData,
      { new: true } // Опция { new: true } возвращает обновленную версию секции
    )

    if (!updatedSection) {
      return res.status(404).json({ message: 'Секция не найдена' })
    }

    res.status(200).json({ section: updatedSection })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
}

module.exports = updateSection
