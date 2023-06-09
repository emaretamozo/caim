const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const RespuestasSchema = mongoose.Schema(
  {
    Detalle: {
      type: String,
    },

    Preguntas: [mongoose.Schema.Types.ObjectId],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

RespuestasSchema.plugin(mongoosePaginate)
RespuestasSchema.index({
  Detalle: 'text',

  Preguntas: 'text',
})

const myModel = (module.exports = mongoose.model('Respuestas', RespuestasSchema, 'respuestas'))
myModel.schema = RespuestasSchema
