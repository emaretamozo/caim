const Modulos = require('../models/modulos.model.js')
const fs = require('fs')
const paginate = require('../paginate')
const errors = require('../services/errors.service')

// Create and Save a new Modulo
exports.create = async (options) => {
  const data = options.req ? options.req.body : options.data
  const updatedData = {}

  if (typeof data.NumerodeModulo !== 'undefined') updatedData['NumerodeModulo'] = data.NumerodeModulo

  if (typeof data.NombreModulo !== 'undefined') updatedData['NombreModulo'] = data.NombreModulo

  updatedData['Clases'] = []
  try {
    const Clases = require('../controllers/clases.controller.js')
    let ReceivedClases = typeof data.Clases === 'string' ? JSON.parse(data.Clases) : data.Clases
    ClasesRaw = Array.isArray(ReceivedClases) ? ReceivedClases : [ReceivedClases]
    for await (const Clasesinfo of ClasesRaw) {
      const ClasesFiles = {}

      if (!Clasesinfo._id) {
        const mongoose = require('mongoose')
        let ClasesID = new mongoose.Types.ObjectId()

        Object.keys(Clasesinfo).forEach((info) => {
          if (
            Clasesinfo[info] &&
            typeof Clasesinfo[info] === 'object' &&
            (typeof Clasesinfo[info].Nombre === 'string' || typeof Clasesinfo.Nombre === 'string')
          ) {
            ClasesFiles[info] = Clasesinfo[info]
          }
        })

        let req = options.req
        req.body = { ...Clasesinfo, _id: ClasesID }
        req.files = { ...ClasesFiles }
        try {
          const result = await Clases.createAsPromise({ req, res: options.res })
        } catch (e) {
          if (e.code === 422) {
            const duplicateError = await Clases.find({ query: { searchField: e.field, searchString: Clasesinfo[e.field] } })
            ContactsID = duplicateError.docs[0]._id
          }
        }

        updatedData['Clases'].push(ClasesID)
      } else {
        updatedData['Clases'].push(Clasesinfo._id)
      }
    }
  } catch (e) {
    updatedData['Clases'] = data.Clases
  }

  updatedData['Cursos'] = []
  try {
    const Cursos = require('../controllers/cursos.controller.js')
    let ReceivedCursos = typeof data.Cursos === 'string' ? JSON.parse(data.Cursos) : data.Cursos
    CursosRaw = Array.isArray(ReceivedCursos) ? ReceivedCursos : [ReceivedCursos]
    for await (const Cursosinfo of CursosRaw) {
      const CursosFiles = {}

      if (!Cursosinfo._id) {
        const mongoose = require('mongoose')
        let CursosID = new mongoose.Types.ObjectId()

        Object.keys(Cursosinfo).forEach((info) => {
          if (
            Cursosinfo[info] &&
            typeof Cursosinfo[info] === 'object' &&
            (typeof Cursosinfo[info].Nombre === 'string' || typeof Cursosinfo.Nombre === 'string')
          ) {
            CursosFiles[info] = Cursosinfo[info]
          }
        })

        let req = options.req
        req.body = { ...Cursosinfo, _id: CursosID }
        req.files = { ...CursosFiles }
        try {
          const result = await Cursos.createAsPromise({ req, res: options.res })
        } catch (e) {
          if (e.code === 422) {
            const duplicateError = await Cursos.find({ query: { searchField: e.field, searchString: Cursosinfo[e.field] } })
            ContactsID = duplicateError.docs[0]._id
          }
        }

        updatedData['Cursos'].push(CursosID)
      } else {
        updatedData['Cursos'].push(Cursosinfo._id)
      }
    }
  } catch (e) {
    updatedData['Cursos'] = data.Cursos
  }

  // Create a Modulo
  const Modulo = new Modulos(updatedData)

  // Save Modulo in the database
  Modulo.save()
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

    if (typeof data.NumerodeModulo !== 'undefined') updatedData['NumerodeModulo'] = data.NumerodeModulo

    if (typeof data.NombreModulo !== 'undefined') updatedData['NombreModulo'] = data.NombreModulo

    updatedData['Clases'] = []
    try {
      const Clases = require('../controllers/clases.controller.js')
      let ReceivedClases = typeof data.Clases === 'string' ? JSON.parse(data.Clases) : data.Clases
      ClasesRaw = Array.isArray(ReceivedClases) ? ReceivedClases : [ReceivedClases]
      for await (const Clasesinfo of ClasesRaw) {
        const ClasesFiles = {}

        if (!Clasesinfo._id) {
          const mongoose = require('mongoose')
          let ClasesID = new mongoose.Types.ObjectId()

          Object.keys(Clasesinfo).forEach((info) => {
            if (
              Clasesinfo[info] &&
              typeof Clasesinfo[info] === 'object' &&
              (typeof Clasesinfo[info].Nombre === 'string' || typeof Clasesinfo.Nombre === 'string')
            ) {
              ClasesFiles[info] = Clasesinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Clasesinfo, _id: ClasesID }
          req.files = { ...ClasesFiles }
          try {
            const result = await Clases.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Clases.find({ query: { searchField: e.field, searchString: Clasesinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Clases'].push(ClasesID)
        } else {
          updatedData['Clases'].push(Clasesinfo._id)
        }
      }
    } catch (e) {
      updatedData['Clases'] = data.Clases
    }

    updatedData['Cursos'] = []
    try {
      const Cursos = require('../controllers/cursos.controller.js')
      let ReceivedCursos = typeof data.Cursos === 'string' ? JSON.parse(data.Cursos) : data.Cursos
      CursosRaw = Array.isArray(ReceivedCursos) ? ReceivedCursos : [ReceivedCursos]
      for await (const Cursosinfo of CursosRaw) {
        const CursosFiles = {}

        if (!Cursosinfo._id) {
          const mongoose = require('mongoose')
          let CursosID = new mongoose.Types.ObjectId()

          Object.keys(Cursosinfo).forEach((info) => {
            if (
              Cursosinfo[info] &&
              typeof Cursosinfo[info] === 'object' &&
              (typeof Cursosinfo[info].Nombre === 'string' || typeof Cursosinfo.Nombre === 'string')
            ) {
              CursosFiles[info] = Cursosinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Cursosinfo, _id: CursosID }
          req.files = { ...CursosFiles }
          try {
            const result = await Cursos.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Cursos.find({ query: { searchField: e.field, searchString: Cursosinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Cursos'].push(CursosID)
        } else {
          updatedData['Cursos'].push(Cursosinfo._id)
        }
      }
    } catch (e) {
      updatedData['Cursos'] = data.Cursos
    }

    // Create a Modulo
    const Modulo = new Modulos(updatedData)

    // Save Modulo in the database
    Modulo.save()
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

// Retrieve and return all Modulos from the database.
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

  Modulos.find(findString)
    .sort(query.sort && { [query.sort.field]: query.sort.method === 'desc' ? -1 : 1 })
    .collation({ locale: query.sortLanguage, strength: 1 })

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Cursos') > -1) && {
        strictPopulate: false,
        path: 'Cursos',

        populate: [
          { model: 'Certificaciones', path: 'Certificaciones', strictPopulate: false },

          { model: 'Modulos', path: 'Modulos', strictPopulate: false },

          { model: 'TiposdePreguntas', path: 'TiposdePreguntas', strictPopulate: false },

          { model: 'Ejercicios', path: 'Ejercicios', strictPopulate: false },

          { model: 'Users', path: 'Users', strictPopulate: false },

          { model: 'TiposdePreguntas', path: 'PreguntasdelCurso', strictPopulate: false },
        ],
      }
    )

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Clases') > -1) && {
        strictPopulate: false,
        path: 'Clases',

        populate: [{ model: 'Modulos', path: 'Modulos', strictPopulate: false }],
      }
    )

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Clases') > -1) && {
        strictPopulate: false,
        model: 'Clases',
        path: 'Clases',

        populate: [{ strictPopulate: false, model: 'Modulos', path: 'Modulos' }],
      }
    )

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Cursos') > -1) && {
        strictPopulate: false,
        model: 'Cursos',
        path: 'Cursos',

        populate: [
          { strictPopulate: false, model: 'Modulos', path: 'Modulo' },

          { strictPopulate: false, model: 'TiposdePreguntas', path: 'PreguntasdelCurso' },

          { strictPopulate: false, model: 'Certificaciones', path: 'Certificaciones' },

          { strictPopulate: false, model: 'TiposdePreguntas', path: 'TiposdePreguntas' },

          { strictPopulate: false, model: 'Ejercicios', path: 'Ejercicios' },

          { strictPopulate: false, model: 'Users', path: 'Users' },
        ],
      }
    )

    .then((modulos) => {
      options.res.json(paginate.paginate(modulos, { page: query.page, limit: query.limit || 10 }))
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
      if (Modulos.schema.path(query.searchField).instance === 'Boolean') {
        findString = { [query.searchField]: JSON.parse(query.searchString) }
      } else if (Modulos.schema.path(query.searchField).instance === 'Date') {
        findString = { $expr: { $eq: [query.searchString, { $dateToString: { date: `$${query.searchField}`, format: '%Y-%m-%d' } }] } }
      } else {
        if (query.exactMatch) {
          findString = { [query.searchField]: query.searchString }
        } else {
          findString = { [query.searchField]: { $regex: new RegExp(query.searchString, 'i') } }
        }
      }

      if (Modulos.schema.path(query.searchField).instance === 'ObjectID' || Modulos.schema.path(query.searchField).instance === 'Array') {
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

    Modulos.find(findString)
      .sort(query.sort && { [query.sort.field]: query.sort.method === 'desc' ? -1 : 1 })
      .collation({ locale: query.sortLanguage, strength: 1 })

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Cursos') > -1) && {
          strictPopulate: false,
          path: 'Cursos',

          populate: [
            { model: 'Certificaciones', path: 'Certificaciones', strictPopulate: false },

            { model: 'Modulos', path: 'Modulos', strictPopulate: false },

            { model: 'TiposdePreguntas', path: 'TiposdePreguntas', strictPopulate: false },

            { model: 'Ejercicios', path: 'Ejercicios', strictPopulate: false },

            { model: 'Users', path: 'Users', strictPopulate: false },

            { model: 'TiposdePreguntas', path: 'PreguntasdelCurso', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Clases') > -1) && {
          strictPopulate: false,
          path: 'Clases',

          populate: [{ model: 'Modulos', path: 'Modulos', strictPopulate: false }],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Clases') > -1) && {
          strictPopulate: false,
          model: 'Clases',
          path: 'Clases',

          populate: [{ strictPopulate: false, model: 'Modulos', path: 'Modulos' }],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Cursos') > -1) && {
          strictPopulate: false,
          model: 'Cursos',
          path: 'Cursos',

          populate: [
            { strictPopulate: false, model: 'Modulos', path: 'Modulo' },

            { strictPopulate: false, model: 'TiposdePreguntas', path: 'PreguntasdelCurso' },

            { strictPopulate: false, model: 'Certificaciones', path: 'Certificaciones' },

            { strictPopulate: false, model: 'TiposdePreguntas', path: 'TiposdePreguntas' },

            { strictPopulate: false, model: 'Ejercicios', path: 'Ejercicios' },

            { strictPopulate: false, model: 'Users', path: 'Users' },
          ],
        }
      )

      .then((modulo) => {
        resolve(paginate.paginate(modulo, { page: query.page, limit: query.limit || 10 }))
      })
      .catch((err) => {
        options.res.status(500).send({
          message: err.message || 'Some error occurred while retrieving records.',
        })
      })
  })
}

// Find a single Modulo with a ID
exports.findOne = (options) => {
  return new Promise((resolve, reject) => {
    const query = { populate: 'true' }
    const id = options.req ? options.req.params.ID : options.ID
    Modulos.findById(id)

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Cursos') > -1) && {
          strictPopulate: false,
          path: 'Cursos',

          populate: [
            { model: 'Certificaciones', path: 'Certificaciones', strictPopulate: false },

            { model: 'Modulos', path: 'Modulos', strictPopulate: false },

            { model: 'TiposdePreguntas', path: 'TiposdePreguntas', strictPopulate: false },

            { model: 'Ejercicios', path: 'Ejercicios', strictPopulate: false },

            { model: 'Users', path: 'Users', strictPopulate: false },

            { model: 'TiposdePreguntas', path: 'PreguntasdelCurso', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Clases') > -1) && {
          strictPopulate: false,
          path: 'Clases',

          populate: [{ model: 'Modulos', path: 'Modulos', strictPopulate: false }],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Clases') > -1) && {
          strictPopulate: false,
          model: 'Clases',
          path: 'Clases',

          populate: [{ strictPopulate: false, model: 'Modulos', path: 'Modulos' }],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Cursos') > -1) && {
          strictPopulate: false,
          model: 'Cursos',
          path: 'Cursos',

          populate: [
            { strictPopulate: false, model: 'Modulos', path: 'Modulo' },

            { strictPopulate: false, model: 'TiposdePreguntas', path: 'PreguntasdelCurso' },

            { strictPopulate: false, model: 'Certificaciones', path: 'Certificaciones' },

            { strictPopulate: false, model: 'TiposdePreguntas', path: 'TiposdePreguntas' },

            { strictPopulate: false, model: 'Ejercicios', path: 'Ejercicios' },

            { strictPopulate: false, model: 'Users', path: 'Users' },
          ],
        }
      )

      .then((modulo) => {
        if (!modulo) {
          return options.res.status(404).send({
            message: 'Modulo not found with id ' + id,
          })
        }
        resolve(paginate.paginate([modulo]))
      })
      .catch((err) => {
        if (err.kind === 'ObjectId') {
          return options.res.status(404).send({
            message: 'Modulo not found with id ' + id,
          })
        }
        return options.res.status(500).send({
          message: 'Error retrieving Modulo with id ' + id,
        })
      })
  })
}

// Update a modulo identified by the ID in the request
exports.update = (options) => {
  return new Promise(async (resolve, reject) => {
    const id = options.req ? options.req.params.ID : options.ID
    const data = options.req ? options.req.body : options.data
    const updatedData = {}

    if (typeof data.NumerodeModulo !== 'undefined') updatedData['NumerodeModulo'] = data.NumerodeModulo

    if (typeof data.NombreModulo !== 'undefined') updatedData['NombreModulo'] = data.NombreModulo

    updatedData['Clases'] = []
    try {
      const Clases = require('../controllers/clases.controller.js')
      let ReceivedClases = typeof data.Clases === 'string' ? JSON.parse(data.Clases) : data.Clases
      ClasesRaw = Array.isArray(ReceivedClases) ? ReceivedClases : [ReceivedClases]
      for await (const Clasesinfo of ClasesRaw) {
        const ClasesFiles = {}

        if (!Clasesinfo._id) {
          const mongoose = require('mongoose')
          let ClasesID = new mongoose.Types.ObjectId()

          Object.keys(Clasesinfo).forEach((info) => {
            if (
              Clasesinfo[info] &&
              typeof Clasesinfo[info] === 'object' &&
              (typeof Clasesinfo[info].Nombre === 'string' || typeof Clasesinfo.Nombre === 'string')
            ) {
              ClasesFiles[info] = Clasesinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Clasesinfo, _id: ClasesID }
          req.files = { ...ClasesFiles }
          try {
            const result = await Clases.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Clases.find({ query: { searchField: e.field, searchString: Clasesinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Clases'].push(ClasesID)
        } else {
          updatedData['Clases'].push(Clasesinfo._id)
        }
      }
    } catch (e) {
      updatedData['Clases'] = data.Clases
    }

    updatedData['Cursos'] = []
    try {
      const Cursos = require('../controllers/cursos.controller.js')
      let ReceivedCursos = typeof data.Cursos === 'string' ? JSON.parse(data.Cursos) : data.Cursos
      CursosRaw = Array.isArray(ReceivedCursos) ? ReceivedCursos : [ReceivedCursos]
      for await (const Cursosinfo of CursosRaw) {
        const CursosFiles = {}

        if (!Cursosinfo._id) {
          const mongoose = require('mongoose')
          let CursosID = new mongoose.Types.ObjectId()

          Object.keys(Cursosinfo).forEach((info) => {
            if (
              Cursosinfo[info] &&
              typeof Cursosinfo[info] === 'object' &&
              (typeof Cursosinfo[info].Nombre === 'string' || typeof Cursosinfo.Nombre === 'string')
            ) {
              CursosFiles[info] = Cursosinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Cursosinfo, _id: CursosID }
          req.files = { ...CursosFiles }
          try {
            const result = await Cursos.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Cursos.find({ query: { searchField: e.field, searchString: Cursosinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Cursos'].push(CursosID)
        } else {
          updatedData['Cursos'].push(Cursosinfo._id)
        }
      }
    } catch (e) {
      updatedData['Cursos'] = data.Cursos
    }

    // Find Modulo and update it with the request body
    const query = { populate: 'true' }
    Modulos.findByIdAndUpdate(id, updatedData, { new: true })

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Cursos') > -1) && {
          strictPopulate: false,
          path: 'Cursos',

          populate: [
            { model: 'Certificaciones', path: 'Certificaciones', strictPopulate: false },

            { model: 'Modulos', path: 'Modulos', strictPopulate: false },

            { model: 'TiposdePreguntas', path: 'TiposdePreguntas', strictPopulate: false },

            { model: 'Ejercicios', path: 'Ejercicios', strictPopulate: false },

            { model: 'Users', path: 'Users', strictPopulate: false },

            { model: 'TiposdePreguntas', path: 'PreguntasdelCurso', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Clases') > -1) && {
          strictPopulate: false,
          path: 'Clases',

          populate: [{ model: 'Modulos', path: 'Modulos', strictPopulate: false }],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Clases') > -1) && {
          strictPopulate: false,
          model: 'Clases',
          path: 'Clases',

          populate: [{ strictPopulate: false, model: 'Modulos', path: 'Modulos' }],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Cursos') > -1) && {
          strictPopulate: false,
          model: 'Cursos',
          path: 'Cursos',

          populate: [
            { strictPopulate: false, model: 'Modulos', path: 'Modulo' },

            { strictPopulate: false, model: 'TiposdePreguntas', path: 'PreguntasdelCurso' },

            { strictPopulate: false, model: 'Certificaciones', path: 'Certificaciones' },

            { strictPopulate: false, model: 'TiposdePreguntas', path: 'TiposdePreguntas' },

            { strictPopulate: false, model: 'Ejercicios', path: 'Ejercicios' },

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

// Delete a modulo with the specified ID in the request
exports.delete = (options) => {
  return new Promise((resolve, reject) => {
    const params = options.req ? options.req.params : options
    let theFilter = { _id: params.ID }

    if (options.queryString && options.queryField) {
      theFilter = { [options.queryField]: options.queryString }
    }
    Modulos.deleteMany(theFilter)
      .then((result) => {
        resolve(result)
      })
      .catch((e) => {
        reject(e)
      })
  })
}
