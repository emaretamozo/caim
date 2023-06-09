const Preguntas = require('../models/preguntas.model.js')
const fs = require('fs')
const paginate = require('../paginate')
const errors = require('../services/errors.service')

// Create and Save a new Pregunta
exports.create = async (options) => {
  const data = options.req ? options.req.body : options.data
  const updatedData = {}

  if (typeof data.Titulo !== 'undefined') updatedData['Titulo'] = data.Titulo

  if (typeof data.Desarrollo !== 'undefined') updatedData['Desarrollo'] = data.Desarrollo

  updatedData['Tipos'] = []
  try {
    const TiposdePreguntas = require('../controllers/tiposdepreguntas.controller.js')
    let ReceivedTipos = typeof data.Tipos === 'string' ? JSON.parse(data.Tipos) : data.Tipos
    TiposRaw = Array.isArray(ReceivedTipos) ? ReceivedTipos : [ReceivedTipos]
    for await (const Tiposinfo of TiposRaw) {
      const TiposFiles = {}

      if (!Tiposinfo._id) {
        const mongoose = require('mongoose')
        let TiposID = new mongoose.Types.ObjectId()

        Object.keys(Tiposinfo).forEach((info) => {
          if (
            Tiposinfo[info] &&
            typeof Tiposinfo[info] === 'object' &&
            (typeof Tiposinfo[info].Nombre === 'string' || typeof Tiposinfo.Nombre === 'string')
          ) {
            TiposFiles[info] = Tiposinfo[info]
          }
        })

        let req = options.req
        req.body = { ...Tiposinfo, _id: TiposID }
        req.files = { ...TiposFiles }
        try {
          const result = await TiposdePreguntas.createAsPromise({ req, res: options.res })
        } catch (e) {
          if (e.code === 422) {
            const duplicateError = await TiposdePreguntas.find({ query: { searchField: e.field, searchString: Tiposinfo[e.field] } })
            ContactsID = duplicateError.docs[0]._id
          }
        }

        updatedData['Tipos'].push(TiposID)
      } else {
        updatedData['Tipos'].push(Tiposinfo._id)
      }
    }
  } catch (e) {
    updatedData['Tipos'] = data.Tipos
  }

  // Create a Pregunta
  const Pregunta = new Preguntas(updatedData)

  // Save Pregunta in the database
  Pregunta.save()
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

    if (typeof data.Titulo !== 'undefined') updatedData['Titulo'] = data.Titulo

    if (typeof data.Desarrollo !== 'undefined') updatedData['Desarrollo'] = data.Desarrollo

    updatedData['Tipos'] = []
    try {
      const TiposdePreguntas = require('../controllers/tiposdepreguntas.controller.js')
      let ReceivedTipos = typeof data.Tipos === 'string' ? JSON.parse(data.Tipos) : data.Tipos
      TiposRaw = Array.isArray(ReceivedTipos) ? ReceivedTipos : [ReceivedTipos]
      for await (const Tiposinfo of TiposRaw) {
        const TiposFiles = {}

        if (!Tiposinfo._id) {
          const mongoose = require('mongoose')
          let TiposID = new mongoose.Types.ObjectId()

          Object.keys(Tiposinfo).forEach((info) => {
            if (
              Tiposinfo[info] &&
              typeof Tiposinfo[info] === 'object' &&
              (typeof Tiposinfo[info].Nombre === 'string' || typeof Tiposinfo.Nombre === 'string')
            ) {
              TiposFiles[info] = Tiposinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Tiposinfo, _id: TiposID }
          req.files = { ...TiposFiles }
          try {
            const result = await TiposdePreguntas.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await TiposdePreguntas.find({ query: { searchField: e.field, searchString: Tiposinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Tipos'].push(TiposID)
        } else {
          updatedData['Tipos'].push(Tiposinfo._id)
        }
      }
    } catch (e) {
      updatedData['Tipos'] = data.Tipos
    }

    // Create a Pregunta
    const Pregunta = new Preguntas(updatedData)

    // Save Pregunta in the database
    Pregunta.save()
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

// Retrieve and return all Preguntas from the database.
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

  Preguntas.find(findString)
    .sort(query.sort && { [query.sort.field]: query.sort.method === 'desc' ? -1 : 1 })
    .collation({ locale: query.sortLanguage, strength: 1 })

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Respuestas') > -1) && {
        strictPopulate: false,
        path: 'Respuestas',
      }
    )

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('TiposdePreguntas') > -1) && {
        strictPopulate: false,
        model: 'TiposdePreguntas',
        path: 'Tipos',

        populate: [
          { strictPopulate: false, model: 'Cursos', path: 'Cursos' },

          { strictPopulate: false, model: 'Cursos', path: 'Cursos' },
        ],
      }
    )

    .then((preguntas) => {
      options.res.json(paginate.paginate(preguntas, { page: query.page, limit: query.limit || 10 }))
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
      if (Preguntas.schema.path(query.searchField).instance === 'Boolean') {
        findString = { [query.searchField]: JSON.parse(query.searchString) }
      } else if (Preguntas.schema.path(query.searchField).instance === 'Date') {
        findString = { $expr: { $eq: [query.searchString, { $dateToString: { date: `$${query.searchField}`, format: '%Y-%m-%d' } }] } }
      } else {
        if (query.exactMatch) {
          findString = { [query.searchField]: query.searchString }
        } else {
          findString = { [query.searchField]: { $regex: new RegExp(query.searchString, 'i') } }
        }
      }

      if (Preguntas.schema.path(query.searchField).instance === 'ObjectID' || Preguntas.schema.path(query.searchField).instance === 'Array') {
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

    Preguntas.find(findString)
      .sort(query.sort && { [query.sort.field]: query.sort.method === 'desc' ? -1 : 1 })
      .collation({ locale: query.sortLanguage, strength: 1 })

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Respuestas') > -1) && {
          strictPopulate: false,
          path: 'Respuestas',
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('TiposdePreguntas') > -1) && {
          strictPopulate: false,
          model: 'TiposdePreguntas',
          path: 'Tipos',

          populate: [
            { strictPopulate: false, model: 'Cursos', path: 'Cursos' },

            { strictPopulate: false, model: 'Cursos', path: 'Cursos' },
          ],
        }
      )

      .then((pregunta) => {
        resolve(paginate.paginate(pregunta, { page: query.page, limit: query.limit || 10 }))
      })
      .catch((err) => {
        options.res.status(500).send({
          message: err.message || 'Some error occurred while retrieving records.',
        })
      })
  })
}

// Find a single Pregunta with a ID
exports.findOne = (options) => {
  return new Promise((resolve, reject) => {
    const query = { populate: 'true' }
    const id = options.req ? options.req.params.ID : options.ID
    Preguntas.findById(id)

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Respuestas') > -1) && {
          strictPopulate: false,
          path: 'Respuestas',
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('TiposdePreguntas') > -1) && {
          strictPopulate: false,
          model: 'TiposdePreguntas',
          path: 'Tipos',

          populate: [
            { strictPopulate: false, model: 'Cursos', path: 'Cursos' },

            { strictPopulate: false, model: 'Cursos', path: 'Cursos' },
          ],
        }
      )

      .then((pregunta) => {
        if (!pregunta) {
          return options.res.status(404).send({
            message: 'Pregunta not found with id ' + id,
          })
        }
        resolve(paginate.paginate([pregunta]))
      })
      .catch((err) => {
        if (err.kind === 'ObjectId') {
          return options.res.status(404).send({
            message: 'Pregunta not found with id ' + id,
          })
        }
        return options.res.status(500).send({
          message: 'Error retrieving Pregunta with id ' + id,
        })
      })
  })
}

// Update a pregunta identified by the ID in the request
exports.update = (options) => {
  return new Promise(async (resolve, reject) => {
    const id = options.req ? options.req.params.ID : options.ID
    const data = options.req ? options.req.body : options.data
    const updatedData = {}

    if (typeof data.Titulo !== 'undefined') updatedData['Titulo'] = data.Titulo

    if (typeof data.Desarrollo !== 'undefined') updatedData['Desarrollo'] = data.Desarrollo

    updatedData['Tipos'] = []
    try {
      const TiposdePreguntas = require('../controllers/tiposdepreguntas.controller.js')
      let ReceivedTipos = typeof data.Tipos === 'string' ? JSON.parse(data.Tipos) : data.Tipos
      TiposRaw = Array.isArray(ReceivedTipos) ? ReceivedTipos : [ReceivedTipos]
      for await (const Tiposinfo of TiposRaw) {
        const TiposFiles = {}

        if (!Tiposinfo._id) {
          const mongoose = require('mongoose')
          let TiposID = new mongoose.Types.ObjectId()

          Object.keys(Tiposinfo).forEach((info) => {
            if (
              Tiposinfo[info] &&
              typeof Tiposinfo[info] === 'object' &&
              (typeof Tiposinfo[info].Nombre === 'string' || typeof Tiposinfo.Nombre === 'string')
            ) {
              TiposFiles[info] = Tiposinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Tiposinfo, _id: TiposID }
          req.files = { ...TiposFiles }
          try {
            const result = await TiposdePreguntas.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await TiposdePreguntas.find({ query: { searchField: e.field, searchString: Tiposinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Tipos'].push(TiposID)
        } else {
          updatedData['Tipos'].push(Tiposinfo._id)
        }
      }
    } catch (e) {
      updatedData['Tipos'] = data.Tipos
    }

    // Find Pregunta and update it with the request body
    const query = { populate: 'true' }
    Preguntas.findByIdAndUpdate(id, updatedData, { new: true })

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Respuestas') > -1) && {
          strictPopulate: false,
          path: 'Respuestas',
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('TiposdePreguntas') > -1) && {
          strictPopulate: false,
          model: 'TiposdePreguntas',
          path: 'Tipos',

          populate: [
            { strictPopulate: false, model: 'Cursos', path: 'Cursos' },

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

// Delete a pregunta with the specified ID in the request
exports.delete = (options) => {
  return new Promise((resolve, reject) => {
    const params = options.req ? options.req.params : options
    let theFilter = { _id: params.ID }

    if (options.queryString && options.queryField) {
      theFilter = { [options.queryField]: options.queryString }
    }
    Preguntas.deleteMany(theFilter)
      .then((result) => {
        resolve(result)
      })
      .catch((e) => {
        reject(e)
      })
  })
}
