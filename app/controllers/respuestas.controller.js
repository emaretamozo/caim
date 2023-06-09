const Respuestas = require('../models/respuestas.model.js')
const fs = require('fs')
const paginate = require('../paginate')
const errors = require('../services/errors.service')

// Create and Save a new Respuesta
exports.create = async (options) => {
  const data = options.req ? options.req.body : options.data
  const updatedData = {}

  if (typeof data.Detalle !== 'undefined') updatedData['Detalle'] = data.Detalle

  updatedData['Preguntas'] = []
  try {
    const Preguntas = require('../controllers/preguntas.controller.js')
    let ReceivedPreguntas = typeof data.Preguntas === 'string' ? JSON.parse(data.Preguntas) : data.Preguntas
    PreguntasRaw = Array.isArray(ReceivedPreguntas) ? ReceivedPreguntas : [ReceivedPreguntas]
    for await (const Preguntasinfo of PreguntasRaw) {
      const PreguntasFiles = {}

      if (!Preguntasinfo._id) {
        const mongoose = require('mongoose')
        let PreguntasID = new mongoose.Types.ObjectId()

        Object.keys(Preguntasinfo).forEach((info) => {
          if (
            Preguntasinfo[info] &&
            typeof Preguntasinfo[info] === 'object' &&
            (typeof Preguntasinfo[info].Desarrollo === 'string' || typeof Preguntasinfo.Desarrollo === 'string')
          ) {
            PreguntasFiles[info] = Preguntasinfo[info]
          }
        })

        let req = options.req
        req.body = { ...Preguntasinfo, _id: PreguntasID }
        req.files = { ...PreguntasFiles }
        try {
          const result = await Preguntas.createAsPromise({ req, res: options.res })
        } catch (e) {
          if (e.code === 422) {
            const duplicateError = await Preguntas.find({ query: { searchField: e.field, searchString: Preguntasinfo[e.field] } })
            ContactsID = duplicateError.docs[0]._id
          }
        }

        updatedData['Preguntas'].push(PreguntasID)
      } else {
        updatedData['Preguntas'].push(Preguntasinfo._id)
      }
    }
  } catch (e) {
    updatedData['Preguntas'] = data.Preguntas
  }

  // Create a Respuesta
  const Respuesta = new Respuestas(updatedData)

  // Save Respuesta in the database
  Respuesta.save()
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

    if (typeof data.Detalle !== 'undefined') updatedData['Detalle'] = data.Detalle

    updatedData['Preguntas'] = []
    try {
      const Preguntas = require('../controllers/preguntas.controller.js')
      let ReceivedPreguntas = typeof data.Preguntas === 'string' ? JSON.parse(data.Preguntas) : data.Preguntas
      PreguntasRaw = Array.isArray(ReceivedPreguntas) ? ReceivedPreguntas : [ReceivedPreguntas]
      for await (const Preguntasinfo of PreguntasRaw) {
        const PreguntasFiles = {}

        if (!Preguntasinfo._id) {
          const mongoose = require('mongoose')
          let PreguntasID = new mongoose.Types.ObjectId()

          Object.keys(Preguntasinfo).forEach((info) => {
            if (
              Preguntasinfo[info] &&
              typeof Preguntasinfo[info] === 'object' &&
              (typeof Preguntasinfo[info].Desarrollo === 'string' || typeof Preguntasinfo.Desarrollo === 'string')
            ) {
              PreguntasFiles[info] = Preguntasinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Preguntasinfo, _id: PreguntasID }
          req.files = { ...PreguntasFiles }
          try {
            const result = await Preguntas.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Preguntas.find({ query: { searchField: e.field, searchString: Preguntasinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Preguntas'].push(PreguntasID)
        } else {
          updatedData['Preguntas'].push(Preguntasinfo._id)
        }
      }
    } catch (e) {
      updatedData['Preguntas'] = data.Preguntas
    }

    // Create a Respuesta
    const Respuesta = new Respuestas(updatedData)

    // Save Respuesta in the database
    Respuesta.save()
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

// Retrieve and return all Respuestas from the database.
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

  Respuestas.find(findString)
    .sort(query.sort && { [query.sort.field]: query.sort.method === 'desc' ? -1 : 1 })
    .collation({ locale: query.sortLanguage, strength: 1 })

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Preguntas') > -1) && {
        strictPopulate: false,
        model: 'Preguntas',
        path: 'Preguntas',

        populate: [{ strictPopulate: false, model: 'TiposdePreguntas', path: 'Tipos' }],
      }
    )

    .then((respuestas) => {
      options.res.json(paginate.paginate(respuestas, { page: query.page, limit: query.limit || 10 }))
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
      if (Respuestas.schema.path(query.searchField).instance === 'Boolean') {
        findString = { [query.searchField]: JSON.parse(query.searchString) }
      } else if (Respuestas.schema.path(query.searchField).instance === 'Date') {
        findString = { $expr: { $eq: [query.searchString, { $dateToString: { date: `$${query.searchField}`, format: '%Y-%m-%d' } }] } }
      } else {
        if (query.exactMatch) {
          findString = { [query.searchField]: query.searchString }
        } else {
          findString = { [query.searchField]: { $regex: new RegExp(query.searchString, 'i') } }
        }
      }

      if (Respuestas.schema.path(query.searchField).instance === 'ObjectID' || Respuestas.schema.path(query.searchField).instance === 'Array') {
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

    Respuestas.find(findString)
      .sort(query.sort && { [query.sort.field]: query.sort.method === 'desc' ? -1 : 1 })
      .collation({ locale: query.sortLanguage, strength: 1 })

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Preguntas') > -1) && {
          strictPopulate: false,
          model: 'Preguntas',
          path: 'Preguntas',

          populate: [{ strictPopulate: false, model: 'TiposdePreguntas', path: 'Tipos' }],
        }
      )

      .then((respuesta) => {
        resolve(paginate.paginate(respuesta, { page: query.page, limit: query.limit || 10 }))
      })
      .catch((err) => {
        options.res.status(500).send({
          message: err.message || 'Some error occurred while retrieving records.',
        })
      })
  })
}

// Find a single Respuesta with a ID
exports.findOne = (options) => {
  return new Promise((resolve, reject) => {
    const query = { populate: 'true' }
    const id = options.req ? options.req.params.ID : options.ID
    Respuestas.findById(id)

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Preguntas') > -1) && {
          strictPopulate: false,
          model: 'Preguntas',
          path: 'Preguntas',

          populate: [{ strictPopulate: false, model: 'TiposdePreguntas', path: 'Tipos' }],
        }
      )

      .then((respuesta) => {
        if (!respuesta) {
          return options.res.status(404).send({
            message: 'Respuesta not found with id ' + id,
          })
        }
        resolve(paginate.paginate([respuesta]))
      })
      .catch((err) => {
        if (err.kind === 'ObjectId') {
          return options.res.status(404).send({
            message: 'Respuesta not found with id ' + id,
          })
        }
        return options.res.status(500).send({
          message: 'Error retrieving Respuesta with id ' + id,
        })
      })
  })
}

// Update a respuesta identified by the ID in the request
exports.update = (options) => {
  return new Promise(async (resolve, reject) => {
    const id = options.req ? options.req.params.ID : options.ID
    const data = options.req ? options.req.body : options.data
    const updatedData = {}

    if (typeof data.Detalle !== 'undefined') updatedData['Detalle'] = data.Detalle

    updatedData['Preguntas'] = []
    try {
      const Preguntas = require('../controllers/preguntas.controller.js')
      let ReceivedPreguntas = typeof data.Preguntas === 'string' ? JSON.parse(data.Preguntas) : data.Preguntas
      PreguntasRaw = Array.isArray(ReceivedPreguntas) ? ReceivedPreguntas : [ReceivedPreguntas]
      for await (const Preguntasinfo of PreguntasRaw) {
        const PreguntasFiles = {}

        if (!Preguntasinfo._id) {
          const mongoose = require('mongoose')
          let PreguntasID = new mongoose.Types.ObjectId()

          Object.keys(Preguntasinfo).forEach((info) => {
            if (
              Preguntasinfo[info] &&
              typeof Preguntasinfo[info] === 'object' &&
              (typeof Preguntasinfo[info].Desarrollo === 'string' || typeof Preguntasinfo.Desarrollo === 'string')
            ) {
              PreguntasFiles[info] = Preguntasinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Preguntasinfo, _id: PreguntasID }
          req.files = { ...PreguntasFiles }
          try {
            const result = await Preguntas.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Preguntas.find({ query: { searchField: e.field, searchString: Preguntasinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Preguntas'].push(PreguntasID)
        } else {
          updatedData['Preguntas'].push(Preguntasinfo._id)
        }
      }
    } catch (e) {
      updatedData['Preguntas'] = data.Preguntas
    }

    // Find Respuesta and update it with the request body
    const query = { populate: 'true' }
    Respuestas.findByIdAndUpdate(id, updatedData, { new: true })

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Preguntas') > -1) && {
          strictPopulate: false,
          model: 'Preguntas',
          path: 'Preguntas',

          populate: [{ strictPopulate: false, model: 'TiposdePreguntas', path: 'Tipos' }],
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

// Delete a respuesta with the specified ID in the request
exports.delete = (options) => {
  return new Promise((resolve, reject) => {
    const params = options.req ? options.req.params : options
    let theFilter = { _id: params.ID }

    if (options.queryString && options.queryField) {
      theFilter = { [options.queryField]: options.queryString }
    }
    Respuestas.deleteMany(theFilter)
      .then((result) => {
        resolve(result)
      })
      .catch((e) => {
        reject(e)
      })
  })
}
