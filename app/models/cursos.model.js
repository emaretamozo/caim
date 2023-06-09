const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const CursosSchema = mongoose.Schema(
  {
    Nombre: {
      type: String,
    },

    Duracion: {
      type: String,
    },

    Imagen: String,

    Modulo: [mongoose.Schema.Types.ObjectId],

    PreguntasdelCurso: [mongoose.Schema.Types.ObjectId],

    Descripcion: String,

    Icono: String,

    Temario: String,

    NombreTecnico: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

CursosSchema.plugin(mongoosePaginate)
CursosSchema.index({
  Nombre: 'text',

  Duracion: 'text',

  Imagen: 'text',

  Modulo: 'text',

  PreguntasdelCurso: 'text',

  Descripcion: 'text',

  Icono: 'text',

  Temario: 'text',

  NombreTecnico: 'text',
})

const myModel = (module.exports = mongoose.model('Cursos', CursosSchema, 'cursos'))
myModel.schema = CursosSchema
