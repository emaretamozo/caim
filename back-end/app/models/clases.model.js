const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const ClasesSchema = mongoose.Schema(
  {
    Nombre: {
      type: String,
    },

    Duracion: {
      type: String,
    },

    Enlace: String,

    Descripcion: String,

    Ejercicio: String,

    Modulos: [mongoose.Schema.Types.ObjectId],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

ClasesSchema.plugin(mongoosePaginate)
ClasesSchema.index({
  Nombre: 'text',

  Duracion: 'text',

  Enlace: 'text',

  Descripcion: 'text',

  Ejercicio: 'text',

  Modulos: 'text',
})

const myModel = (module.exports = mongoose.model('Clases', ClasesSchema, 'clases'))
myModel.schema = ClasesSchema
