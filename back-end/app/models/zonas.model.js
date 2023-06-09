const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const ZonasSchema = mongoose.Schema(
  {
    Nombre: {
      type: String,
    },

    Provincias: [mongoose.Schema.Types.ObjectId],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

ZonasSchema.plugin(mongoosePaginate)
ZonasSchema.index({
  Nombre: 'text',

  Provincias: 'text',
})

const myModel = (module.exports = mongoose.model('Zonas', ZonasSchema, 'zonas'))
myModel.schema = ZonasSchema
