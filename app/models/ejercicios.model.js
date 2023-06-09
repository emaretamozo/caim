const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const EjerciciosSchema = mongoose.Schema(
  {
    Nombre: {
      type: String,
    },

    URL: String,

    Ejercicio: [mongoose.Schema.Types.ObjectId],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

EjerciciosSchema.plugin(mongoosePaginate)
EjerciciosSchema.index({
  Nombre: 'text',

  URL: 'text',

  Ejercicio: 'text',
})

const myModel = (module.exports = mongoose.model('Ejercicios', EjerciciosSchema, 'ejercicios'))
myModel.schema = EjerciciosSchema
