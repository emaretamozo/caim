const Ejercicios = require('../models/ejercicios.model.js')
const fs = require('fs')
const paginate = require('../paginate')
const errors = require('../services/errors.service')

// Create and Save a new Ejercicio
exports.create = async (options) => {
  const data = options.req ? options.req.body : options.data
  const updatedData = {}

  if (typeof data.Nombre !== 'undefined') updatedData['Nombre'] = data.Nombre

  if (typeof data.URL !== 'undefined') updatedData['URL'] = data.URL

  updatedData['Ejercicio'] = []
  try {
    const Cursos = require('../controllers/cursos.controller.js')
    let ReceivedEjercicio = typeof data.Ejercicio === 'string' ? JSON.parse(data.Ejercicio) : data.Ejercicio
    EjercicioRaw = Array.isArray(ReceivedEjercicio) ? ReceivedEjercicio : [ReceivedEjercicio]
    for await (const Ejercicioinfo of EjercicioRaw) {
      const EjercicioFiles = {}

      if (!Ejercicioinfo._id) {
        const mongoose = require('mongoose')
        let EjercicioID = new mongoose.Types.ObjectId()

        Object.keys(Ejercicioinfo).forEach((info) => {
          if (
            Ejercicioinfo[info] &&
            typeof Ejercicioinfo[info] === 'object' &&
            (typeof Ejercicioinfo[info].Nombre === 'string' || typeof Ejercicioinfo.Nombre === 'string')
          ) {
            EjercicioFiles[info] = Ejercicioinfo[info]
          }
        })

        let req = options.req
        req.body = { ...Ejercicioinfo, _id: EjercicioID }
        req.files = { ...EjercicioFiles }
        try {
          const result = await Cursos.createAsPromise({ req, res: options.res })
        } catch (e) {
          if (e.code === 422) {
            const duplicateError = await Cursos.find({ query: { searchField: e.field, searchString: Ejercicioinfo[e.field] } })
            ContactsID = duplicateError.docs[0]._id
          }
        }

        updatedData['Ejercicio'].push(EjercicioID)
      } else {
        updatedData['Ejercicio'].push(Ejercicioinfo._id)
      }
    }
  } catch (e) {
    updatedData['Ejercicio'] = data.Ejercicio
  }

  // Create a Ejercicio
  const Ejercicio = new Ejercicios(updatedData)

  // Save Ejercicio in the database
  Ejercicio.save()
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

    if (typeof data.URL !== 'undefined') updatedData['URL'] = data.URL

    updatedData['Ejercicio'] = []
    try {
      const Cursos = require('../controllers/cursos.controller.js')
      let ReceivedEjercicio = typeof data.Ejercicio === 'string' ? JSON.parse(data.Ejercicio) : data.Ejercicio
      EjercicioRaw = Array.isArray(ReceivedEjercicio) ? ReceivedEjercicio : [ReceivedEjercicio]
      for await (const Ejercicioinfo of EjercicioRaw) {
        const EjercicioFiles = {}

        if (!Ejercicioinfo._id) {
          const mongoose = require('mongoose')
          let EjercicioID = new mongoose.Types.ObjectId()

          Object.keys(Ejercicioinfo).forEach((info) => {
            if (
              Ejercicioinfo[info] &&
              typeof Ejercicioinfo[info] === 'object' &&
              (typeof Ejercicioinfo[info].Nombre === 'string' || typeof Ejercicioinfo.Nombre === 'string')
            ) {
              EjercicioFiles[info] = Ejercicioinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Ejercicioinfo, _id: EjercicioID }
          req.files = { ...EjercicioFiles }
          try {
            const result = await Cursos.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Cursos.find({ query: { searchField: e.field, searchString: Ejercicioinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Ejercicio'].push(EjercicioID)
        } else {
          updatedData['Ejercicio'].push(Ejercicioinfo._id)
        }
      }
    } catch (e) {
      updatedData['Ejercicio'] = data.Ejercicio
    }

    // Create a Ejercicio
    const Ejercicio = new Ejercicios(updatedData)

    // Save Ejercicio in the database
    Ejercicio.save()
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

// Retrieve and return all Ejercicios from the database.
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

  Ejercicios.find(findString)
    .sort(query.sort && { [query.sort.field]: query.sort.method === 'desc' ? -1 : 1 })
    .collation({ locale: query.sortLanguage, strength: 1 })

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Cursos') > -1) && {
        strictPopulate: false,
        model: 'Cursos',
        path: 'Ejercicio',

        populate: [
          { strictPopulate: false, model: 'Modulos', path: 'Modulo' },

          { strictPopulate: false, model: 'TiposdePreguntas', path: 'PreguntasdelCurso' },

          { strictPopulate: false, model: 'Certificaciones', path: 'Certificaciones' },

          { strictPopulate: false, model: 'Modulos', path: 'Modulos' },

          { strictPopulate: false, model: 'TiposdePreguntas', path: 'TiposdePreguntas' },

          { strictPopulate: false, model: 'Users', path: 'Users' },
        ],
      }
    )

    .then((ejercicios) => {
      options.res.json(paginate.paginate(ejercicios, { page: query.page, limit: query.limit || 10 }))
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
      if (Ejercicios.schema.path(query.searchField).instance === 'Boolean') {
        findString = { [query.searchField]: JSON.parse(query.searchString) }
      } else if (Ejercicios.schema.path(query.searchField).instance === 'Date') {
        findString = { $expr: { $eq: [query.searchString, { $dateToString: { date: `$${query.searchField}`, format: '%Y-%m-%d' } }] } }
      } else {
        if (query.exactMatch) {
          findString = { [query.searchField]: query.searchString }
        } else {
          findString = { [query.searchField]: { $regex: new RegExp(query.searchString, 'i') } }
        }
      }

      if (Ejercicios.schema.path(query.searchField).instance === 'ObjectID' || Ejercicios.schema.path(query.searchField).instance === 'Array') {
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

    Ejercicios.find(findString)
      .sort(query.sort && { [query.sort.field]: query.sort.method === 'desc' ? -1 : 1 })
      .collation({ locale: query.sortLanguage, strength: 1 })

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Cursos') > -1) && {
          strictPopulate: false,
          model: 'Cursos',
          path: 'Ejercicio',

          populate: [
            { strictPopulate: false, model: 'Modulos', path: 'Modulo' },

            { strictPopulate: false, model: 'TiposdePreguntas', path: 'PreguntasdelCurso' },

            { strictPopulate: false, model: 'Certificaciones', path: 'Certificaciones' },

            { strictPopulate: false, model: 'Modulos', path: 'Modulos' },

            { strictPopulate: false, model: 'TiposdePreguntas', path: 'TiposdePreguntas' },

            { strictPopulate: false, model: 'Users', path: 'Users' },
          ],
        }
      )

      .then((ejercicio) => {
        resolve(paginate.paginate(ejercicio, { page: query.page, limit: query.limit || 10 }))
      })
      .catch((err) => {
        options.res.status(500).send({
          message: err.message || 'Some error occurred while retrieving records.',
        })
      })
  })
}

// Find a single Ejercicio with a ID
exports.findOne = (options) => {
  return new Promise((resolve, reject) => {
    const query = { populate: 'true' }
    const id = options.req ? options.req.params.ID : options.ID
    Ejercicios.findById(id)

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Cursos') > -1) && {
          strictPopulate: false,
          model: 'Cursos',
          path: 'Ejercicio',

          populate: [
            { strictPopulate: false, model: 'Modulos', path: 'Modulo' },

            { strictPopulate: false, model: 'TiposdePreguntas', path: 'PreguntasdelCurso' },

            { strictPopulate: false, model: 'Certificaciones', path: 'Certificaciones' },

            { strictPopulate: false, model: 'Modulos', path: 'Modulos' },

            { strictPopulate: false, model: 'TiposdePreguntas', path: 'TiposdePreguntas' },

            { strictPopulate: false, model: 'Users', path: 'Users' },
          ],
        }
      )

      .then((ejercicio) => {
        if (!ejercicio) {
          return options.res.status(404).send({
            message: 'Ejercicio not found with id ' + id,
          })
        }
        resolve(paginate.paginate([ejercicio]))
      })
      .catch((err) => {
        if (err.kind === 'ObjectId') {
          return options.res.status(404).send({
            message: 'Ejercicio not found with id ' + id,
          })
        }
        return options.res.status(500).send({
          message: 'Error retrieving Ejercicio with id ' + id,
        })
      })
  })
}

// Update a ejercicio identified by the ID in the request
exports.update = (options) => {
  return new Promise(async (resolve, reject) => {
    const id = options.req ? options.req.params.ID : options.ID
    const data = options.req ? options.req.body : options.data
    const updatedData = {}

    if (typeof data.Nombre !== 'undefined') updatedData['Nombre'] = data.Nombre

    if (typeof data.URL !== 'undefined') updatedData['URL'] = data.URL

    updatedData['Ejercicio'] = []
    try {
      const Cursos = require('../controllers/cursos.controller.js')
      let ReceivedEjercicio = typeof data.Ejercicio === 'string' ? JSON.parse(data.Ejercicio) : data.Ejercicio
      EjercicioRaw = Array.isArray(ReceivedEjercicio) ? ReceivedEjercicio : [ReceivedEjercicio]
      for await (const Ejercicioinfo of EjercicioRaw) {
        const EjercicioFiles = {}

        if (!Ejercicioinfo._id) {
          const mongoose = require('mongoose')
          let EjercicioID = new mongoose.Types.ObjectId()

          Object.keys(Ejercicioinfo).forEach((info) => {
            if (
              Ejercicioinfo[info] &&
              typeof Ejercicioinfo[info] === 'object' &&
              (typeof Ejercicioinfo[info].Nombre === 'string' || typeof Ejercicioinfo.Nombre === 'string')
            ) {
              EjercicioFiles[info] = Ejercicioinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Ejercicioinfo, _id: EjercicioID }
          req.files = { ...EjercicioFiles }
          try {
            const result = await Cursos.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Cursos.find({ query: { searchField: e.field, searchString: Ejercicioinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Ejercicio'].push(EjercicioID)
        } else {
          updatedData['Ejercicio'].push(Ejercicioinfo._id)
        }
      }
    } catch (e) {
      updatedData['Ejercicio'] = data.Ejercicio
    }

    // Find Ejercicio and update it with the request body
    const query = { populate: 'true' }
    Ejercicios.findByIdAndUpdate(id, updatedData, { new: true })

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Cursos') > -1) && {
          strictPopulate: false,
          model: 'Cursos',
          path: 'Ejercicio',

          populate: [
            { strictPopulate: false, model: 'Modulos', path: 'Modulo' },

            { strictPopulate: false, model: 'TiposdePreguntas', path: 'PreguntasdelCurso' },

            { strictPopulate: false, model: 'Certificaciones', path: 'Certificaciones' },

            { strictPopulate: false, model: 'Modulos', path: 'Modulos' },

            { strictPopulate: false, model: 'TiposdePreguntas', path: 'TiposdePreguntas' },

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

// Delete a ejercicio with the specified ID in the request
exports.delete = (options) => {
  return new Promise((resolve, reject) => {
    const params = options.req ? options.req.params : options
    let theFilter = { _id: params.ID }

    if (options.queryString && options.queryField) {
      theFilter = { [options.queryField]: options.queryString }
    }
    Ejercicios.deleteMany(theFilter)
      .then((result) => {
        resolve(result)
      })
      .catch((e) => {
        reject(e)
      })
  })
}
