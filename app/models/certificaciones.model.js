const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const CertificacionesSchema = mongoose.Schema(
  {
    Nombre: {
      type: String,
    },

    DNI: {
      type: String,
    },

    Curso: [mongoose.Schema.Types.ObjectId],

    Centro: [mongoose.Schema.Types.ObjectId],

    CUV: Number,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

CertificacionesSchema.plugin(mongoosePaginate)
CertificacionesSchema.index({
  Nombre: 'text',

  DNI: 'text',

  Curso: 'text',

  Centro: 'text',

  CUV: 'text',
})

const myModel = (module.exports = mongoose.model('Certificaciones', CertificacionesSchema, 'certificaciones'))
myModel.schema = CertificacionesSchema
