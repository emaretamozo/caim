const Clases = require('../models/clases.model.js')
const fs = require('fs')
const paginate = require('../paginate')
const errors = require('../services/errors.service')

// Create and Save a new Clase
exports.create = async (options) => {
  const data = options.req ? options.req.body : options.data
  const updatedData = {}

  if (typeof data.Nombre !== 'undefined') updatedData['Nombre'] = data.Nombre

  if (typeof data.Duracion !== 'undefined') updatedData['Duracion'] = data.Duracion

  if (typeof data.Enlace !== 'undefined') updatedData['Enlace'] = data.Enlace

  if (typeof data.Descripcion !== 'undefined') updatedData['Descripcion'] = data.Descripcion

  if (typeof data.Ejercicio !== 'undefined') updatedData['Ejercicio'] = data.Ejercicio

  updatedData['Modulos'] = []
  try {
    const Modulos = require('../controllers/modulos.controller.js')
    let ReceivedModulos = typeof data.Modulos === 'string' ? JSON.parse(data.Modulos) : data.Modulos
    ModulosRaw = Array.isArray(ReceivedModulos) ? ReceivedModulos : [ReceivedModulos]
    for await (const Modulosinfo of ModulosRaw) {
      const ModulosFiles = {}

      if (!Modulosinfo._id) {
        const mongoose = require('mongoose')
        let ModulosID = new mongoose.Types.ObjectId()

        Object.keys(Modulosinfo).forEach((info) => {
          if (
            Modulosinfo[info] &&
            typeof Modulosinfo[info] === 'object' &&
            (typeof Modulosinfo[info].NombreModulo === 'string' || typeof Modulosinfo.NombreModulo === 'string')
          ) {
            ModulosFiles[info] = Modulosinfo[info]
          }
        })

        let req = options.req
        req.body = { ...Modulosinfo, _id: ModulosID }
        req.files = { ...ModulosFiles }
        try {
          const result = await Modulos.createAsPromise({ req, res: options.res })
        } catch (e) {
          if (e.code === 422) {
            const duplicateError = await Modulos.find({ query: { searchField: e.field, searchString: Modulosinfo[e.field] } })
            ContactsID = duplicateError.docs[0]._id
          }
        }

        updatedData['Modulos'].push(ModulosID)
      } else {
        updatedData['Modulos'].push(Modulosinfo._id)
      }
    }
  } catch (e) {
    updatedData['Modulos'] = data.Modulos
  }

  // Create a Clase
  const Clase = new Clases(updatedData)

  // Save Clase in the database
  Clase.save()
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

    if (typeof data.Duracion !== 'undefined') updatedData['Duracion'] = data.Duracion

    if (typeof data.Enlace !== 'undefined') updatedData['Enlace'] = data.Enlace

    if (typeof data.Descripcion !== 'undefined') updatedData['Descripcion'] = data.Descripcion

    if (typeof data.Ejercicio !== 'undefined') updatedData['Ejercicio'] = data.Ejercicio

    updatedData['Modulos'] = []
    try {
      const Modulos = require('../controllers/modulos.controller.js')
      let ReceivedModulos = typeof data.Modulos === 'string' ? JSON.parse(data.Modulos) : data.Modulos
      ModulosRaw = Array.isArray(ReceivedModulos) ? ReceivedModulos : [ReceivedModulos]
      for await (const Modulosinfo of ModulosRaw) {
        const ModulosFiles = {}

        if (!Modulosinfo._id) {
          const mongoose = require('mongoose')
          let ModulosID = new mongoose.Types.ObjectId()

          Object.keys(Modulosinfo).forEach((info) => {
            if (
              Modulosinfo[info] &&
              typeof Modulosinfo[info] === 'object' &&
              (typeof Modulosinfo[info].NombreModulo === 'string' || typeof Modulosinfo.NombreModulo === 'string')
            ) {
              ModulosFiles[info] = Modulosinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Modulosinfo, _id: ModulosID }
          req.files = { ...ModulosFiles }
          try {
            const result = await Modulos.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Modulos.find({ query: { searchField: e.field, searchString: Modulosinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Modulos'].push(ModulosID)
        } else {
          updatedData['Modulos'].push(Modulosinfo._id)
        }
      }
    } catch (e) {
      updatedData['Modulos'] = data.Modulos
    }

    // Create a Clase
    const Clase = new Clases(updatedData)

    // Save Clase in the database
    Clase.save()
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

// Retrieve and return all Clases from the database.
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

  Clases.find(findString)
    .sort(query.sort && { [query.sort.field]: query.sort.method === 'desc' ? -1 : 1 })
    .collation({ locale: query.sortLanguage, strength: 1 })

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Modulos') > -1) && {
        strictPopulate: false,
        path: 'Modulos',

        populate: [
          { model: 'Cursos', path: 'Cursos', strictPopulate: false },

          { model: 'Clases', path: 'Clases', strictPopulate: false },

          { model: 'Cursos', path: 'Cursos', strictPopulate: false },
        ],
      }
    )

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Modulos') > -1) && {
        strictPopulate: false,
        model: 'Modulos',
        path: 'Modulos',

        populate: [
          { strictPopulate: false, model: 'Cursos', path: 'Cursos' },

          { strictPopulate: false, model: 'Clases', path: 'Clases' },

          { strictPopulate: false, model: 'Cursos', path: 'Cursos' },
        ],
      }
    )

    .then((clases) => {
      options.res.json(paginate.paginate(clases, { page: query.page, limit: query.limit || 10 }))
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
      if (Clases.schema.path(query.searchField).instance === 'Boolean') {
        findString = { [query.searchField]: JSON.parse(query.searchString) }
      } else if (Clases.schema.path(query.searchField).instance === 'Date') {
        findString = { $expr: { $eq: [query.searchString, { $dateToString: { date: `$${query.searchField}`, format: '%Y-%m-%d' } }] } }
      } else {
        if (query.exactMatch) {
          findString = { [query.searchField]: query.searchString }
        } else {
          findString = { [query.searchField]: { $regex: new RegExp(query.searchString, 'i') } }
        }
      }

      if (Clases.schema.path(query.searchField).instance === 'ObjectID' || Clases.schema.path(query.searchField).instance === 'Array') {
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

    Clases.find(findString)
      .sort(query.sort && { [query.sort.field]: query.sort.method === 'desc' ? -1 : 1 })
      .collation({ locale: query.sortLanguage, strength: 1 })

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Modulos') > -1) && {
          strictPopulate: false,
          path: 'Modulos',

          populate: [
            { model: 'Cursos', path: 'Cursos', strictPopulate: false },

            { model: 'Clases', path: 'Clases', strictPopulate: false },

            { model: 'Cursos', path: 'Cursos', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Modulos') > -1) && {
          strictPopulate: false,
          model: 'Modulos',
          path: 'Modulos',

          populate: [
            { strictPopulate: false, model: 'Cursos', path: 'Cursos' },

            { strictPopulate: false, model: 'Clases', path: 'Clases' },

            { strictPopulate: false, model: 'Cursos', path: 'Cursos' },
          ],
        }
      )

      .then((clase) => {
        resolve(paginate.paginate(clase, { page: query.page, limit: query.limit || 10 }))
      })
      .catch((err) => {
        options.res.status(500).send({
          message: err.message || 'Some error occurred while retrieving records.',
        })
      })
  })
}

// Find a single Clase with a ID
exports.findOne = (options) => {
  return new Promise((resolve, reject) => {
    const query = { populate: 'true' }
    const id = options.req ? options.req.params.ID : options.ID
    Clases.findById(id)

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Modulos') > -1) && {
          strictPopulate: false,
          path: 'Modulos',

          populate: [
            { model: 'Cursos', path: 'Cursos', strictPopulate: false },

            { model: 'Clases', path: 'Clases', strictPopulate: false },

            { model: 'Cursos', path: 'Cursos', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Modulos') > -1) && {
          strictPopulate: false,
          model: 'Modulos',
          path: 'Modulos',

          populate: [
            { strictPopulate: false, model: 'Cursos', path: 'Cursos' },

            { strictPopulate: false, model: 'Clases', path: 'Clases' },

            { strictPopulate: false, model: 'Cursos', path: 'Cursos' },
          ],
        }
      )

      .then((clase) => {
        if (!clase) {
          return options.res.status(404).send({
            message: 'Clase not found with id ' + id,
          })
        }
        resolve(paginate.paginate([clase]))
      })
      .catch((err) => {
        if (err.kind === 'ObjectId') {
          return options.res.status(404).send({
            message: 'Clase not found with id ' + id,
          })
        }
        return options.res.status(500).send({
          message: 'Error retrieving Clase with id ' + id,
        })
      })
  })
}

// Update a clase identified by the ID in the request
exports.update = (options) => {
  return new Promise(async (resolve, reject) => {
    const id = options.req ? options.req.params.ID : options.ID
    const data = options.req ? options.req.body : options.data
    const updatedData = {}

    if (typeof data.Nombre !== 'undefined') updatedData['Nombre'] = data.Nombre

    if (typeof data.Duracion !== 'undefined') updatedData['Duracion'] = data.Duracion

    if (typeof data.Enlace !== 'undefined') updatedData['Enlace'] = data.Enlace

    if (typeof data.Descripcion !== 'undefined') updatedData['Descripcion'] = data.Descripcion

    if (typeof data.Ejercicio !== 'undefined') updatedData['Ejercicio'] = data.Ejercicio

    updatedData['Modulos'] = []
    try {
      const Modulos = require('../controllers/modulos.controller.js')
      let ReceivedModulos = typeof data.Modulos === 'string' ? JSON.parse(data.Modulos) : data.Modulos
      ModulosRaw = Array.isArray(ReceivedModulos) ? ReceivedModulos : [ReceivedModulos]
      for await (const Modulosinfo of ModulosRaw) {
        const ModulosFiles = {}

        if (!Modulosinfo._id) {
          const mongoose = require('mongoose')
          let ModulosID = new mongoose.Types.ObjectId()

          Object.keys(Modulosinfo).forEach((info) => {
            if (
              Modulosinfo[info] &&
              typeof Modulosinfo[info] === 'object' &&
              (typeof Modulosinfo[info].NombreModulo === 'string' || typeof Modulosinfo.NombreModulo === 'string')
            ) {
              ModulosFiles[info] = Modulosinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Modulosinfo, _id: ModulosID }
          req.files = { ...ModulosFiles }
          try {
            const result = await Modulos.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Modulos.find({ query: { searchField: e.field, searchString: Modulosinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Modulos'].push(ModulosID)
        } else {
          updatedData['Modulos'].push(Modulosinfo._id)
        }
      }
    } catch (e) {
      updatedData['Modulos'] = data.Modulos
    }

    // Find Clase and update it with the request body
    const query = { populate: 'true' }
    Clases.findByIdAndUpdate(id, updatedData, { new: true })

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Modulos') > -1) && {
          strictPopulate: false,
          path: 'Modulos',

          populate: [
            { model: 'Cursos', path: 'Cursos', strictPopulate: false },

            { model: 'Clases', path: 'Clases', strictPopulate: false },

            { model: 'Cursos', path: 'Cursos', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Modulos') > -1) && {
          strictPopulate: false,
          model: 'Modulos',
          path: 'Modulos',

          populate: [
            { strictPopulate: false, model: 'Cursos', path: 'Cursos' },

            { strictPopulate: false, model: 'Clases', path: 'Clases' },

            { strictPopulate: false, model: 'Cursos', path: 'Cursos' },
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

// Delete a clase with the specified ID in the request
exports.delete = (options) => {
  return new Promise((resolve, reject) => {
    const params = options.req ? options.req.params : options
    let theFilter = { _id: params.ID }

    if (options.queryString && options.queryField) {
      theFilter = { [options.queryField]: options.queryString }
    }
    Clases.deleteMany(theFilter)
      .then((result) => {
        resolve(result)
      })
      .catch((e) => {
        reject(e)
      })
  })
}
