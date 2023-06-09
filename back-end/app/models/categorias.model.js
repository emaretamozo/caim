const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const CategoriasSchema = mongoose.Schema(
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

CategoriasSchema.plugin(mongoosePaginate)
CategoriasSchema.index({
  Name: 'text',
})

const myModel = (module.exports = mongoose.model('Categorias', CategoriasSchema, 'categorias'))
myModel.schema = CategoriasSchema
