const mongoose = require('mongoose')

const FilterSchema = new mongoose.Schema({
  filterName: String,
  filterOperator: String,
  filterValue: String,
})

module.exports = mongoose.model('Filter', FilterSchema)
