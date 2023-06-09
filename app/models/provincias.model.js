const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const ProvinciasSchema = mongoose.Schema(
  {
    Name: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

ProvinciasSchema.plugin(mongoosePaginate)
ProvinciasSchema.index({
  Name: 'text',
})

const myModel = (module.exports = mongoose.model('Provincias', ProvinciasSchema, 'provincias'))
myModel.schema = ProvinciasSchema
