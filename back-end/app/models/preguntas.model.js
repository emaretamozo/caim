const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const PreguntasSchema = mongoose.Schema(
  {
    Titulo: {
      type: String,
    },

    Desarrollo: {
      type: String,
    },

    Tipos: [mongoose.Schema.Types.ObjectId],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

PreguntasSchema.plugin(mongoosePaginate)
PreguntasSchema.index({
  Titulo: 'text',

  Desarrollo: 'text',

  Tipos: 'text',
})

const myModel = (module.exports = mongoose.model('Preguntas', PreguntasSchema, 'preguntas'))
myModel.schema = PreguntasSchema
