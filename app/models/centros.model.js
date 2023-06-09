const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const CentrosSchema = mongoose.Schema(
  {
    Nombre: {
      type: String,
    },

    Direccion: {
      type: String,
    },

    Localidad: {
      type: String,
    },

    Telefonos: {
      type: String,
    },

    Contacto: {
      type: String,
    },

    Sitio: String,

    Logo: String,

    Provincia: [mongoose.Schema.Types.ObjectId],

    Profesional: [mongoose.Schema.Types.ObjectId],

    Zonas: [mongoose.Schema.Types.ObjectId],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

CentrosSchema.plugin(mongoosePaginate)
CentrosSchema.index({
  Nombre: 'text',

  Direccion: 'text',

  Localidad: 'text',

  Telefonos: 'text',

  Contacto: 'text',

  Sitio: 'text',

  Logo: 'text',

  Provincia: 'text',

  Profesional: 'text',

  Zonas: 'text',
})

const myModel = (module.exports = mongoose.model('Centros', CentrosSchema, 'centros'))
myModel.schema = CentrosSchema
