const mongoose = require('mongoose')
const Filter = require('./filter')

const SectionSchema = new mongoose.Schema({
  title: String,
  startDate: String,
  endDate: String,
  groupByOptions: [String],
  metrics: [String],
  sortBy: String,
  metricsFilters: [Filter.schema],
  telegramId: String,
  notificationInterval: Number,
  userId: String,
  timezone: String,
})

const Section = mongoose.model('Section', SectionSchema)

module.exports = Section
