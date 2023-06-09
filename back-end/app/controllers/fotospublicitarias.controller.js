const FotosPublicitarias = require('../models/fotospublicitarias.model.js')
const fs = require('fs')
const paginate = require('../paginate')
const errors = require('../services/errors.service')

// Create and Save a new FotoPublicitaria
exports.create = async (options) => {
  const data = options.req ? options.req.body : options.data
  const updatedData = {}

  if (options.req.files && options.req.files.Foto && options.req.files.Foto.data) {
    if (!fs.existsSync(`${options.req.app.get('filesFolder')}`)) fs.mkdirSync(`${options.req.app.get('filesFolder')}`, { recursive: true })
    fs.writeFileSync(`${options.req.app.get('filesFolder')}/${options.req.files.Foto.name}`, options.req.files.Foto.data)
    updatedData['Foto'] = options.req.files.Foto.name
  }

  if (typeof data.URL !== 'undefined') updatedData['URL'] = data.URL

  // Create a FotoPublicitaria
  const FotoPublicitaria = new FotosPublicitarias(updatedData)

  // Save FotoPublicitaria in the database
  FotoPublicitaria.save()
    .then((data) => {
      exports.findOne({ ID: data._id, res: options.res })
    })
    .catch((err) => {
      options.res.status(500).send({
        message: err.message || 'Some error occurred while saving the record.',
      })
    })
}

exports.createAsPromise = (options) => {
  return new Promise(async (resolve, reject) => {
    const data = options.req ? options.req.body : options.data
    const updatedData = {}
    if (data._id) updatedData._id = data._id

    if (options.req.files && options.req.files.Foto && options.req.files.Foto.data) {
      if (!fs.existsSync(`${options.req.app.get('filesFolder')}`)) fs.mkdirSync(`${options.req.app.get('filesFolder')}`, { recursive: true })
      fs.writeFileSync(`${options.req.app.get('filesFolder')}/${options.req.files.Foto.name}`, options.req.files.Foto.data)
      updatedData['Foto'] = options.req.files.Foto.name
    }

    if (typeof data.URL !== 'undefined') updatedData['URL'] = data.URL

    // Create a FotoPublicitaria
    const FotoPublicitaria = new FotosPublicitarias(updatedData)

    // Save FotoPublicitaria in the database
    FotoPublicitaria.save()
      .then((result) => {
        if (options.skipfind) {
          resolve(result)
        } else {
          exports.findOne({ ID: result._id, res: options.res }).then((result) => {
            resolve(result)
          })
        }
      })
      .catch((err) => {
        reject(errors.prepareError(err))
      })
  })
}

// Retrieve and return all FotosPublicitarias from the database.
exports.findAll = (options) => {
  const query = options.query ? options.query : options.req.query
  if (typeof query.populate === 'undefined') query.populate = 'true'
  const data = options.req ? options.req.body : options.data
  if (typeof query.sort === 'string') query.sort = JSON.parse(query.sort)
  if (!query.sortLanguage) query.sortLanguage = 'en'

  const findString = {}
  if (query.fixedSearch) {
    query.fixedSearch = JSON.parse(query.fixedSearch)
    findString[query.fixedSearch.field] = { $regex: new RegExp(query.fixedSearch.value, 'i') }
  }

  FotosPublicitarias.find(findString)
    .sort(query.sort && { [query.sort.field]: query.sort.method === 'desc' ? -1 : 1 })
    .collation({ locale: query.sortLanguage, strength: 1 })

    .then((fotospublicitarias) => {
      options.res.json(paginate.paginate(fotospublicitarias, { page: query.page, limit: query.limit || 10 }))
    })
    .catch((err) => {
      options.res.status(500).send({
        message: err.message || 'Some error occurred while retrieving records.',
      })
    })
}

exports.find = (options) => {
  return new Promise((resolve, reject) => {
    const query = options.query ? options.query : options.req.query
    const data = options.req ? options.req.body : options.data
    let findString = query.searchString ? { $text: { $search: query.searchString } } : {}
    if (query.searchField) {
      if (FotosPublicitarias.schema.path(query.searchField).instance === 'Boolean') {
        findString = { [query.searchField]: JSON.parse(query.searchString) }
      } else if (FotosPublicitarias.schema.path(query.searchField).instance === 'Date') {
        findString = { $expr: { $eq: [query.searchString, { $dateToString: { date: `$${query.searchField}`, format: '%Y-%m-%d' } }] } }
      } else {
        if (query.exactMatch) {
          findString = { [query.searchField]: query.searchString }
        } else {
          findString = { [query.searchField]: { $regex: new RegExp(query.searchString, 'i') } }
        }
      }

      if (
        FotosPublicitarias.schema.path(query.searchField).instance === 'ObjectID' ||
        FotosPublicitarias.schema.path(query.searchField).instance === 'Array'
      ) {
        findString = { [query.searchField]: require('mongoose').Types.ObjectId(query.searchString) }
      }
    } else if (query.filters) {
      query.filters.forEach((filter) => {
        const parsed = typeof filter === 'string' ? JSON.parse(filter) : filter
        findString[parsed.field] = parsed.value
      })
    }
    if (typeof query.sort === 'string') query.sort = JSON.parse(query.sort)
    if (!query.sortLanguage) query.sortLanguage = 'en'
    if (query.fixedSearch) {
      query.fixedSearch = JSON.parse(query.fixedSearch)
      findString[query.fixedSearch.field] = { $regex: new RegExp(query.fixedSearch.value, 'i') }
    }

    FotosPublicitarias.find(findString)
      .sort(query.sort && { [query.sort.field]: query.sort.method === 'desc' ? -1 : 1 })
      .collation({ locale: query.sortLanguage, strength: 1 })

      .then((fotopublicitaria) => {
        resolve(paginate.paginate(fotopublicitaria, { page: query.page, limit: query.limit || 10 }))
      })
      .catch((err) => {
        options.res.status(500).send({
          message: err.message || 'Some error occurred while retrieving records.',
        })
      })
  })
}

// Find a single FotoPublicitaria with a ID
exports.findOne = (options) => {
  return new Promise((resolve, reject) => {
    const query = { populate: 'true' }
    const id = options.req ? options.req.params.ID : options.ID
    FotosPublicitarias.findById(id)

      .then((fotopublicitaria) => {
        if (!fotopublicitaria) {
          return options.res.status(404).send({
            message: 'FotoPublicitaria not found with id ' + id,
          })
        }
        resolve(paginate.paginate([fotopublicitaria]))
      })
      .catch((err) => {
        if (err.kind === 'ObjectId') {
          return options.res.status(404).send({
            message: 'FotoPublicitaria not found with id ' + id,
          })
        }
        return options.res.status(500).send({
          message: 'Error retrieving FotoPublicitaria with id ' + id,
        })
      })
  })
}

// Update a fotopublicitaria identified by the ID in the request
exports.update = (options) => {
  return new Promise(async (resolve, reject) => {
    const id = options.req ? options.req.params.ID : options.ID
    const data = options.req ? options.req.body : options.data
    const updatedData = {}

    if (options.req.files && options.req.files.Foto && options.req.files.Foto.data) {
      if (!fs.existsSync(`${options.req.app.get('filesFolder')}`)) fs.mkdirSync(`${options.req.app.get('filesFolder')}`, { recursive: true })
      fs.writeFileSync(`${options.req.app.get('filesFolder')}/${options.req.files.Foto.name}`, options.req.files.Foto.data)
      updatedData['Foto'] = options.req.files.Foto.name
    }

    if (typeof data.URL !== 'undefined') updatedData['URL'] = data.URL

    // Find FotoPublicitaria and update it with the request body
    const query = { populate: 'true' }
    FotosPublicitarias.findByIdAndUpdate(id, updatedData, { new: true })

      .then((result) => {
        resolve(result)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

// Delete a fotopublicitaria with the specified ID in the request
exports.delete = (options) => {
  return new Promise((resolve, reject) => {
    const params = options.req ? options.req.params : options
    let theFilter = { _id: params.ID }

    if (options.queryString && options.queryField) {
      theFilter = { [options.queryField]: options.queryString }
    }
    FotosPublicitarias.deleteMany(theFilter)
      .then((result) => {
        resolve(result)
      })
      .catch((e) => {
        reject(e)
      })
  })
}
