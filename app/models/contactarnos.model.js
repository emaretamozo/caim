const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const ContactarnosSchema = mongoose.Schema(
  {
    Nombre: {
      type: String,
    },

    Email: {
      type: String,
    },

    Telefono: {
      type: String,
    },

    Mensaje: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

ContactarnosSchema.plugin(mongoosePaginate)
ContactarnosSchema.index({
  Nombre: 'text',

  Email: 'text',

  Telefono: 'text',

  Mensaje: 'text',
})

const myModel = (module.exports = mongoose.model('Contactarnos', ContactarnosSchema, 'contactarnos'))
myModel.schema = ContactarnosSchema
