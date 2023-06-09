const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const FotosPublicitariasSchema = mongoose.Schema(
  {
    Foto: String,

    URL: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
)

FotosPublicitariasSchema.plugin(mongoosePaginate)
FotosPublicitariasSchema.index({
  Foto: 'text',

  URL: 'text',
})

const myModel = (module.exports = mongoose.model('FotosPublicitarias', FotosPublicitariasSchema, 'fotospublicitarias'))
myModel.schema = FotosPublicitariasSchema
