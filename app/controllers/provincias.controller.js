const Provincias = require('../models/provincias.model.js')
const fs = require('fs')
const paginate = require('../paginate')
const errors = require('../services/errors.service')

// Create and Save a new Provincia
exports.create = async (options) => {
  const data = options.req ? options.req.body : options.data
  const updatedData = {}

  if (typeof data.Name !== 'undefined') updatedData['Name'] = data.Name

  // Create a Provincia
  const Provincia = new Provincias(updatedData)

  // Save Provincia in the database
  Provincia.save()
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

    if (typeof data.Name !== 'undefined') updatedData['Name'] = data.Name

    // Create a Provincia
    const Provincia = new Provincias(updatedData)

    // Save Provincia in the database
    Provincia.save()
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

// Retrieve and return all Provincias from the database.
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

  Provincias.find(findString)
    .sort(query.sort && { [query.sort.field]: query.sort.method === 'desc' ? -1 : 1 })
    .collation({ locale: query.sortLanguage, strength: 1 })

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Centros') > -1) && {
        strictPopulate: false,
        path: 'Centros',

        populate: [
          { model: 'Certificaciones', path: 'Certificaciones', strictPopulate: false },

          { model: 'Users', path: 'Users', strictPopulate: false },

          { model: 'Users', path: 'Profesional', strictPopulate: false },

          { model: 'Zonas', path: 'Zonas', strictPopulate: false },
        ],
      }
    )

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Users') > -1) && {
        strictPopulate: false,
        path: 'Users',

        populate: [
          { model: 'Centros', path: 'Centros', strictPopulate: false },

          { model: 'Likes', path: 'Likes', strictPopulate: false },

          { model: 'Likes', path: 'Likes', strictPopulate: false },

          { model: 'Centros', path: 'Centro', strictPopulate: false },

          { model: 'Cursos', path: 'Curso', strictPopulate: false },
        ],
      }
    )

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Zonas') > -1) && {
        strictPopulate: false,
        path: 'Zonas',

        populate: [{ model: 'Centros', path: 'Centros', strictPopulate: false }],
      }
    )

    .then((provincias) => {
      options.res.json(paginate.paginate(provincias, { page: query.page, limit: query.limit || 10 }))
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
      if (Provincias.schema.path(query.searchField).instance === 'Boolean') {
        findString = { [query.searchField]: JSON.parse(query.searchString) }
      } else if (Provincias.schema.path(query.searchField).instance === 'Date') {
        findString = { $expr: { $eq: [query.searchString, { $dateToString: { date: `$${query.searchField}`, format: '%Y-%m-%d' } }] } }
      } else {
        if (query.exactMatch) {
          findString = { [query.searchField]: query.searchString }
        } else {
          findString = { [query.searchField]: { $regex: new RegExp(query.searchString, 'i') } }
        }
      }

      if (Provincias.schema.path(query.searchField).instance === 'ObjectID' || Provincias.schema.path(query.searchField).instance === 'Array') {
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

    Provincias.find(findString)
      .sort(query.sort && { [query.sort.field]: query.sort.method === 'desc' ? -1 : 1 })
      .collation({ locale: query.sortLanguage, strength: 1 })

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Centros') > -1) && {
          strictPopulate: false,
          path: 'Centros',

          populate: [
            { model: 'Certificaciones', path: 'Certificaciones', strictPopulate: false },

            { model: 'Users', path: 'Users', strictPopulate: false },

            { model: 'Users', path: 'Profesional', strictPopulate: false },

            { model: 'Zonas', path: 'Zonas', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Users') > -1) && {
          strictPopulate: false,
          path: 'Users',

          populate: [
            { model: 'Centros', path: 'Centros', strictPopulate: false },

            { model: 'Likes', path: 'Likes', strictPopulate: false },

            { model: 'Likes', path: 'Likes', strictPopulate: false },

            { model: 'Centros', path: 'Centro', strictPopulate: false },

            { model: 'Cursos', path: 'Curso', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Zonas') > -1) && {
          strictPopulate: false,
          path: 'Zonas',

          populate: [{ model: 'Centros', path: 'Centros', strictPopulate: false }],
        }
      )

      .then((provincia) => {
        resolve(paginate.paginate(provincia, { page: query.page, limit: query.limit || 10 }))
      })
      .catch((err) => {
        options.res.status(500).send({
          message: err.message || 'Some error occurred while retrieving records.',
        })
      })
  })
}

// Find a single Provincia with a ID
exports.findOne = (options) => {
  return new Promise((resolve, reject) => {
    const query = { populate: 'true' }
    const id = options.req ? options.req.params.ID : options.ID
    Provincias.findById(id)

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Centros') > -1) && {
          strictPopulate: false,
          path: 'Centros',

          populate: [
            { model: 'Certificaciones', path: 'Certificaciones', strictPopulate: false },

            { model: 'Users', path: 'Users', strictPopulate: false },

            { model: 'Users', path: 'Profesional', strictPopulate: false },

            { model: 'Zonas', path: 'Zonas', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Users') > -1) && {
          strictPopulate: false,
          path: 'Users',

          populate: [
            { model: 'Centros', path: 'Centros', strictPopulate: false },

            { model: 'Likes', path: 'Likes', strictPopulate: false },

            { model: 'Likes', path: 'Likes', strictPopulate: false },

            { model: 'Centros', path: 'Centro', strictPopulate: false },

            { model: 'Cursos', path: 'Curso', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Zonas') > -1) && {
          strictPopulate: false,
          path: 'Zonas',

          populate: [{ model: 'Centros', path: 'Centros', strictPopulate: false }],
        }
      )

      .then((provincia) => {
        if (!provincia) {
          return options.res.status(404).send({
            message: 'Provincia not found with id ' + id,
          })
        }
        resolve(paginate.paginate([provincia]))
      })
      .catch((err) => {
        if (err.kind === 'ObjectId') {
          return options.res.status(404).send({
            message: 'Provincia not found with id ' + id,
          })
        }
        return options.res.status(500).send({
          message: 'Error retrieving Provincia with id ' + id,
        })
      })
  })
}

// Update a provincia identified by the ID in the request
exports.update = (options) => {
  return new Promise(async (resolve, reject) => {
    const id = options.req ? options.req.params.ID : options.ID
    const data = options.req ? options.req.body : options.data
    const updatedData = {}

    if (typeof data.Name !== 'undefined') updatedData['Name'] = data.Name

    // Find Provincia and update it with the request body
    const query = { populate: 'true' }
    Provincias.findByIdAndUpdate(id, updatedData, { new: true })

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Centros') > -1) && {
          strictPopulate: false,
          path: 'Centros',

          populate: [
            { model: 'Certificaciones', path: 'Certificaciones', strictPopulate: false },

            { model: 'Users', path: 'Users', strictPopulate: false },

            { model: 'Users', path: 'Profesional', strictPopulate: false },

            { model: 'Zonas', path: 'Zonas', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Users') > -1) && {
          strictPopulate: false,
          path: 'Users',

          populate: [
            { model: 'Centros', path: 'Centros', strictPopulate: false },

            { model: 'Likes', path: 'Likes', strictPopulate: false },

            { model: 'Likes', path: 'Likes', strictPopulate: false },

            { model: 'Centros', path: 'Centro', strictPopulate: false },

            { model: 'Cursos', path: 'Curso', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Zonas') > -1) && {
          strictPopulate: false,
          path: 'Zonas',

          populate: [{ model: 'Centros', path: 'Centros', strictPopulate: false }],
        }
      )

      .then((result) => {
        resolve(result)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

// Delete a provincia with the specified ID in the request
exports.delete = (options) => {
  return new Promise((resolve, reject) => {
    const params = options.req ? options.req.params : options
    let theFilter = { _id: params.ID }

    if (options.queryString && options.queryField) {
      theFilter = { [options.queryField]: options.queryString }
    }
    Provincias.deleteMany(theFilter)
      .then((result) => {
        resolve(result)
      })
      .catch((e) => {
        reject(e)
      })
  })
}
