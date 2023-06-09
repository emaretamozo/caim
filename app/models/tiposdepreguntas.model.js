const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const TiposdePreguntasSchema = mongoose.Schema(
  {
    Nombre: {
      type: String,
    },

    Cursos: [mongoose.Schema.Types.ObjectId],

    Descripcion: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

TiposdePreguntasSchema.plugin(mongoosePaginate)
TiposdePreguntasSchema.index({
  Nombre: 'text',

  Cursos: 'text',

  Descripcion: 'text',
})

const myModel = (module.exports = mongoose.model('TiposdePreguntas', TiposdePreguntasSchema, 'tiposdepreguntas'))
myModel.schema = TiposdePreguntasSchema
