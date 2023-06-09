const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const UsersSchema = mongoose.Schema(
  {
    Nombre: {
      type: String,

      required: true,
    },

    DNI: Number,

    Email: {
      type: String,
    },

    Password: {
      type: String,
      required: true,
    },

    ProfilePic: String,

    Role: String,

    Telefono: {
      type: String,
    },

    Direccion: {
      type: String,
    },

    Localidad: {
      type: String,
    },

    Provincia: [mongoose.Schema.Types.ObjectId],

    Publicado: Boolean,

    Centro: [mongoose.Schema.Types.ObjectId],

    Curso: [mongoose.Schema.Types.ObjectId],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

UsersSchema.virtual('Likes', {
  ref: 'Likes',
  localField: '_id',
  foreignField: 'User',
  justOne: true,
  type: '',
})

UsersSchema.virtual('Likes', {
  ref: 'Likes',
  localField: '_id',
  foreignField: 'Liked',
  justOne: true,
  type: '',
})

UsersSchema.methods.toJSON = function () {
  const { __v, Password, ...data } = this.toObject()
  return data
}

UsersSchema.plugin(mongoosePaginate)
UsersSchema.index({
  Nombre: 'text',

  DNI: 'text',

  Email: 'text',

  Password: 'text',

  ProfilePic: 'text',

  Role: 'text',

  Telefono: 'text',

  Direccion: 'text',

  Localidad: 'text',

  Provincia: 'text',

  Publicado: 'text',

  Centro: 'text',

  Curso: 'text',
})

const myModel = (module.exports = mongoose.model('Users', UsersSchema, 'users'))
myModel.schema = UsersSchema
