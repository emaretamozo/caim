const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const PostsSchema = mongoose.Schema(
  {
    ImagenPortada: String,

    Destacado: Boolean,

    Category: [mongoose.Schema.Types.ObjectId],

    Title: {
      type: String,
    },

    Description: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

PostsSchema.plugin(mongoosePaginate)
PostsSchema.index({
  ImagenPortada: 'text',

  Destacado: 'text',

  Category: 'text',

  Title: 'text',

  Description: 'text',
})

const myModel = (module.exports = mongoose.model('Posts', PostsSchema, 'posts'))
myModel.schema = PostsSchema
