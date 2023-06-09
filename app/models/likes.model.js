const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const LikesSchema = mongoose.Schema(
  {
    User: mongoose.Schema.Types.ObjectId,

    Liked: mongoose.Schema.Types.ObjectId,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

LikesSchema.plugin(mongoosePaginate)
LikesSchema.index({
  User: 'text',

  Liked: 'text',
})

const myModel = (module.exports = mongoose.model('Likes', LikesSchema, 'likes'))
myModel.schema = LikesSchema
