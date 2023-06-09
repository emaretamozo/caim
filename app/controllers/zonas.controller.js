const Zonas = require('../models/zonas.model.js')
const fs = require('fs')
const paginate = require('../paginate')
const errors = require('../services/errors.service')

// Create and Save a new Zona
exports.create = async (options) => {
  const data = options.req ? options.req.body : options.data
  const updatedData = {}

  if (typeof data.Nombre !== 'undefined') updatedData['Nombre'] = data.Nombre

  updatedData['Provincias'] = []
  try {
    const Provincias = require('../controllers/provincias.controller.js')
    let ReceivedProvincias = typeof data.Provincias === 'string' ? JSON.parse(data.Provincias) : data.Provincias
    ProvinciasRaw = Array.isArray(ReceivedProvincias) ? ReceivedProvincias : [ReceivedProvincias]
    for await (const Provinciasinfo of ProvinciasRaw) {
      const ProvinciasFiles = {}

      if (!Provinciasinfo._id) {
        const mongoose = require('mongoose')
        let ProvinciasID = new mongoose.Types.ObjectId()

        Object.keys(Provinciasinfo).forEach((info) => {
          if (
            Provinciasinfo[info] &&
            typeof Provinciasinfo[info] === 'object' &&
            (typeof Provinciasinfo[info].Name === 'string' || typeof Provinciasinfo.Name === 'string')
          ) {
            ProvinciasFiles[info] = Provinciasinfo[info]
          }
        })

        let req = options.req
        req.body = { ...Provinciasinfo, _id: ProvinciasID }
        req.files = { ...ProvinciasFiles }
        try {
          const result = await Provincias.createAsPromise({ req, res: options.res })
        } catch (e) {
          if (e.code === 422) {
            const duplicateError = await Provincias.find({ query: { searchField: e.field, searchString: Provinciasinfo[e.field] } })
            ContactsID = duplicateError.docs[0]._id
          }
        }

        updatedData['Provincias'].push(ProvinciasID)
      } else {
        updatedData['Provincias'].push(Provinciasinfo._id)
      }
    }
  } catch (e) {
    updatedData['Provincias'] = data.Provincias
  }

  // Create a Zona
  const Zona = new Zonas(updatedData)

  // Save Zona in the database
  Zona.save()
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

    if (typeof data.Nombre !== 'undefined') updatedData['Nombre'] = data.Nombre

    updatedData['Provincias'] = []
    try {
      const Provincias = require('../controllers/provincias.controller.js')
      let ReceivedProvincias = typeof data.Provincias === 'string' ? JSON.parse(data.Provincias) : data.Provincias
      ProvinciasRaw = Array.isArray(ReceivedProvincias) ? ReceivedProvincias : [ReceivedProvincias]
      for await (const Provinciasinfo of ProvinciasRaw) {
        const ProvinciasFiles = {}

        if (!Provinciasinfo._id) {
          const mongoose = require('mongoose')
          let ProvinciasID = new mongoose.Types.ObjectId()

          Object.keys(Provinciasinfo).forEach((info) => {
            if (
              Provinciasinfo[info] &&
              typeof Provinciasinfo[info] === 'object' &&
              (typeof Provinciasinfo[info].Name === 'string' || typeof Provinciasinfo.Name === 'string')
            ) {
              ProvinciasFiles[info] = Provinciasinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Provinciasinfo, _id: ProvinciasID }
          req.files = { ...ProvinciasFiles }
          try {
            const result = await Provincias.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Provincias.find({ query: { searchField: e.field, searchString: Provinciasinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Provincias'].push(ProvinciasID)
        } else {
          updatedData['Provincias'].push(Provinciasinfo._id)
        }
      }
    } catch (e) {
      updatedData['Provincias'] = data.Provincias
    }

    // Create a Zona
    const Zona = new Zonas(updatedData)

    // Save Zona in the database
    Zona.save()
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

// Retrieve and return all Zonas from the database.
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

  Zonas.find(findString)
    .sort(query.sort && { [query.sort.field]: query.sort.method === 'desc' ? -1 : 1 })
    .collation({ locale: query.sortLanguage, strength: 1 })

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Centros') > -1) && {
        strictPopulate: false,
        path: 'Centros',

        populate: [
          { model: 'Certificaciones', path: 'Certificaciones', strictPopulate: false },

          { model: 'Users', path: 'Users', strictPopulate: false },

          { model: 'Provincias', path: 'Provincia', strictPopulate: false },

          { model: 'Users', path: 'Profesional', strictPopulate: false },
        ],
      }
    )

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Provincias') > -1) && {
        strictPopulate: false,
        model: 'Provincias',
        path: 'Provincias',

        populate: [
          { strictPopulate: false, model: 'Centros', path: 'Centros' },

          { strictPopulate: false, model: 'Users', path: 'Users' },
        ],
      }
    )

    .then((zonas) => {
      options.res.json(paginate.paginate(zonas, { page: query.page, limit: query.limit || 10 }))
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
      if (Zonas.schema.path(query.searchField).instance === 'Boolean') {
        findString = { [query.searchField]: JSON.parse(query.searchString) }
      } else if (Zonas.schema.path(query.searchField).instance === 'Date') {
        findString = { $expr: { $eq: [query.searchString, { $dateToString: { date: `$${query.searchField}`, format: '%Y-%m-%d' } }] } }
      } else {
        if (query.exactMatch) {
          findString = { [query.searchField]: query.searchString }
        } else {
          findString = { [query.searchField]: { $regex: new RegExp(query.searchString, 'i') } }
        }
      }

      if (Zonas.schema.path(query.searchField).instance === 'ObjectID' || Zonas.schema.path(query.searchField).instance === 'Array') {
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

    Zonas.find(findString)
      .sort(query.sort && { [query.sort.field]: query.sort.method === 'desc' ? -1 : 1 })
      .collation({ locale: query.sortLanguage, strength: 1 })

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Centros') > -1) && {
          strictPopulate: false,
          path: 'Centros',

          populate: [
            { model: 'Certificaciones', path: 'Certificaciones', strictPopulate: false },

            { model: 'Users', path: 'Users', strictPopulate: false },

            { model: 'Provincias', path: 'Provincia', strictPopulate: false },

            { model: 'Users', path: 'Profesional', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Provincias') > -1) && {
          strictPopulate: false,
          model: 'Provincias',
          path: 'Provincias',

          populate: [
            { strictPopulate: false, model: 'Centros', path: 'Centros' },

            { strictPopulate: false, model: 'Users', path: 'Users' },
          ],
        }
      )

      .then((zona) => {
        resolve(paginate.paginate(zona, { page: query.page, limit: query.limit || 10 }))
      })
      .catch((err) => {
        options.res.status(500).send({
          message: err.message || 'Some error occurred while retrieving records.',
        })
      })
  })
}

// Find a single Zona with a ID
exports.findOne = (options) => {
  return new Promise((resolve, reject) => {
    const query = { populate: 'true' }
    const id = options.req ? options.req.params.ID : options.ID
    Zonas.findById(id)

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Centros') > -1) && {
          strictPopulate: false,
          path: 'Centros',

          populate: [
            { model: 'Certificaciones', path: 'Certificaciones', strictPopulate: false },

            { model: 'Users', path: 'Users', strictPopulate: false },

            { model: 'Provincias', path: 'Provincia', strictPopulate: false },

            { model: 'Users', path: 'Profesional', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Provincias') > -1) && {
          strictPopulate: false,
          model: 'Provincias',
          path: 'Provincias',

          populate: [
            { strictPopulate: false, model: 'Centros', path: 'Centros' },

            { strictPopulate: false, model: 'Users', path: 'Users' },
          ],
        }
      )

      .then((zona) => {
        if (!zona) {
          return options.res.status(404).send({
            message: 'Zona not found with id ' + id,
          })
        }
        resolve(paginate.paginate([zona]))
      })
      .catch((err) => {
        if (err.kind === 'ObjectId') {
          return options.res.status(404).send({
            message: 'Zona not found with id ' + id,
          })
        }
        return options.res.status(500).send({
          message: 'Error retrieving Zona with id ' + id,
        })
      })
  })
}

// Update a zona identified by the ID in the request
exports.update = (options) => {
  return new Promise(async (resolve, reject) => {
    const id = options.req ? options.req.params.ID : options.ID
    const data = options.req ? options.req.body : options.data
    const updatedData = {}

    if (typeof data.Nombre !== 'undefined') updatedData['Nombre'] = data.Nombre

    updatedData['Provincias'] = []
    try {
      const Provincias = require('../controllers/provincias.controller.js')
      let ReceivedProvincias = typeof data.Provincias === 'string' ? JSON.parse(data.Provincias) : data.Provincias
      ProvinciasRaw = Array.isArray(ReceivedProvincias) ? ReceivedProvincias : [ReceivedProvincias]
      for await (const Provinciasinfo of ProvinciasRaw) {
        const ProvinciasFiles = {}

        if (!Provinciasinfo._id) {
          const mongoose = require('mongoose')
          let ProvinciasID = new mongoose.Types.ObjectId()

          Object.keys(Provinciasinfo).forEach((info) => {
            if (
              Provinciasinfo[info] &&
              typeof Provinciasinfo[info] === 'object' &&
              (typeof Provinciasinfo[info].Name === 'string' || typeof Provinciasinfo.Name === 'string')
            ) {
              ProvinciasFiles[info] = Provinciasinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Provinciasinfo, _id: ProvinciasID }
          req.files = { ...ProvinciasFiles }
          try {
            const result = await Provincias.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Provincias.find({ query: { searchField: e.field, searchString: Provinciasinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Provincias'].push(ProvinciasID)
        } else {
          updatedData['Provincias'].push(Provinciasinfo._id)
        }
      }
    } catch (e) {
      updatedData['Provincias'] = data.Provincias
    }

    // Find Zona and update it with the request body
    const query = { populate: 'true' }
    Zonas.findByIdAndUpdate(id, updatedData, { new: true })

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Centros') > -1) && {
          strictPopulate: false,
          path: 'Centros',

          populate: [
            { model: 'Certificaciones', path: 'Certificaciones', strictPopulate: false },

            { model: 'Users', path: 'Users', strictPopulate: false },

            { model: 'Provincias', path: 'Provincia', strictPopulate: false },

            { model: 'Users', path: 'Profesional', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Provincias') > -1) && {
          strictPopulate: false,
          model: 'Provincias',
          path: 'Provincias',

          populate: [
            { strictPopulate: false, model: 'Centros', path: 'Centros' },

            { strictPopulate: false, model: 'Users', path: 'Users' },
          ],
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

// Delete a zona with the specified ID in the request
exports.delete = (options) => {
  return new Promise((resolve, reject) => {
    const params = options.req ? options.req.params : options
    let theFilter = { _id: params.ID }

    if (options.queryString && options.queryField) {
      theFilter = { [options.queryField]: options.queryString }
    }
    Zonas.deleteMany(theFilter)
      .then((result) => {
        resolve(result)
      })
      .catch((e) => {
        reject(e)
      })
  })
}
