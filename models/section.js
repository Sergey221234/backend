const mongoose = require('mongoose')

const SectionSchema = new mongoose.Schema({
  title: String,
  startDate: String,
  endDate: String,
  groupBy: [String],
  campaignId: String,
  telegramId: String,
  // userId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  // },
})

const Section = mongoose.model('Section', SectionSchema)

module.exports = Section
