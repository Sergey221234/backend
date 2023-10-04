const mongoose = require('mongoose')

const FilterSchema = new mongoose.Schema({
  filterName: String,
  filterOperator: String,
  filterValue: mongoose.Schema.Types.Mixed,
})

module.exports = mongoose.model('Filter', FilterSchema)
