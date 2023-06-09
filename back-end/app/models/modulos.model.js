const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const ModulosSchema = mongoose.Schema(
  {
    NumerodeModulo: Number,

    NombreModulo: {
      type: String,
    },

    Clases: [mongoose.Schema.Types.ObjectId],

    Cursos: [mongoose.Schema.Types.ObjectId],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

ModulosSchema.plugin(mongoosePaginate)
ModulosSchema.index({
  NumerodeModulo: 'text',

  NombreModulo: 'text',

  Clases: 'text',

  Cursos: 'text',
})

const myModel = (module.exports = mongoose.model('Modulos', ModulosSchema, 'modulos'))
myModel.schema = ModulosSchema
