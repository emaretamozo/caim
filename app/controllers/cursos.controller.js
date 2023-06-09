const Cursos = require('../models/cursos.model.js')
const fs = require('fs')
const paginate = require('../paginate')
const errors = require('../services/errors.service')

// Create and Save a new Curso
exports.create = async (options) => {
  const data = options.req ? options.req.body : options.data
  const updatedData = {}

  if (typeof data.Nombre !== 'undefined') updatedData['Nombre'] = data.Nombre

  if (typeof data.Duracion !== 'undefined') updatedData['Duracion'] = data.Duracion

  if (options.req.files && options.req.files.Imagen && options.req.files.Imagen.data) {
    if (!fs.existsSync(`${options.req.app.get('filesFolder')}`)) fs.mkdirSync(`${options.req.app.get('filesFolder')}`, { recursive: true })
    fs.writeFileSync(`${options.req.app.get('filesFolder')}/${options.req.files.Imagen.name}`, options.req.files.Imagen.data)
    updatedData['Imagen'] = options.req.files.Imagen.name
  }

  updatedData['Modulo'] = []
  try {
    const Modulos = require('../controllers/modulos.controller.js')
    let ReceivedModulo = typeof data.Modulo === 'string' ? JSON.parse(data.Modulo) : data.Modulo
    ModuloRaw = Array.isArray(ReceivedModulo) ? ReceivedModulo : [ReceivedModulo]
    for await (const Moduloinfo of ModuloRaw) {
      const ModuloFiles = {}

      if (!Moduloinfo._id) {
        const mongoose = require('mongoose')
        let ModuloID = new mongoose.Types.ObjectId()

        Object.keys(Moduloinfo).forEach((info) => {
          if (
            Moduloinfo[info] &&
            typeof Moduloinfo[info] === 'object' &&
            (typeof Moduloinfo[info].NombreModulo === 'string' || typeof Moduloinfo.NombreModulo === 'string')
          ) {
            ModuloFiles[info] = Moduloinfo[info]
          }
        })

        let req = options.req
        req.body = { ...Moduloinfo, _id: ModuloID }
        req.files = { ...ModuloFiles }
        try {
          const result = await Modulos.createAsPromise({ req, res: options.res })
        } catch (e) {
          if (e.code === 422) {
            const duplicateError = await Modulos.find({ query: { searchField: e.field, searchString: Moduloinfo[e.field] } })
            ContactsID = duplicateError.docs[0]._id
          }
        }

        updatedData['Modulo'].push(ModuloID)
      } else {
        updatedData['Modulo'].push(Moduloinfo._id)
      }
    }
  } catch (e) {
    updatedData['Modulo'] = data.Modulo
  }

  updatedData['PreguntasdelCurso'] = []
  try {
    const TiposdePreguntas = require('../controllers/tiposdepreguntas.controller.js')
    let ReceivedPreguntasdelCurso = typeof data.PreguntasdelCurso === 'string' ? JSON.parse(data.PreguntasdelCurso) : data.PreguntasdelCurso
    PreguntasdelCursoRaw = Array.isArray(ReceivedPreguntasdelCurso) ? ReceivedPreguntasdelCurso : [ReceivedPreguntasdelCurso]
    for await (const PreguntasdelCursoinfo of PreguntasdelCursoRaw) {
      const PreguntasdelCursoFiles = {}

      if (!PreguntasdelCursoinfo._id) {
        const mongoose = require('mongoose')
        let PreguntasdelCursoID = new mongoose.Types.ObjectId()

        Object.keys(PreguntasdelCursoinfo).forEach((info) => {
          if (
            PreguntasdelCursoinfo[info] &&
            typeof PreguntasdelCursoinfo[info] === 'object' &&
            (typeof PreguntasdelCursoinfo[info].Nombre === 'string' || typeof PreguntasdelCursoinfo.Nombre === 'string')
          ) {
            PreguntasdelCursoFiles[info] = PreguntasdelCursoinfo[info]
          }
        })

        let req = options.req
        req.body = { ...PreguntasdelCursoinfo, _id: PreguntasdelCursoID }
        req.files = { ...PreguntasdelCursoFiles }
        try {
          const result = await TiposdePreguntas.createAsPromise({ req, res: options.res })
        } catch (e) {
          if (e.code === 422) {
            const duplicateError = await TiposdePreguntas.find({ query: { searchField: e.field, searchString: PreguntasdelCursoinfo[e.field] } })
            ContactsID = duplicateError.docs[0]._id
          }
        }

        updatedData['PreguntasdelCurso'].push(PreguntasdelCursoID)
      } else {
        updatedData['PreguntasdelCurso'].push(PreguntasdelCursoinfo._id)
      }
    }
  } catch (e) {
    updatedData['PreguntasdelCurso'] = data.PreguntasdelCurso
  }

  if (typeof data.Descripcion !== 'undefined') updatedData['Descripcion'] = data.Descripcion

  if (options.req.files && options.req.files.Icono && options.req.files.Icono.data) {
    if (!fs.existsSync(`${options.req.app.get('filesFolder')}`)) fs.mkdirSync(`${options.req.app.get('filesFolder')}`, { recursive: true })
    fs.writeFileSync(`${options.req.app.get('filesFolder')}/${options.req.files.Icono.name}`, options.req.files.Icono.data)
    updatedData['Icono'] = options.req.files.Icono.name
  }

  if (typeof data.Temario !== 'undefined') updatedData['Temario'] = data.Temario

  if (typeof data.NombreTecnico !== 'undefined') updatedData['NombreTecnico'] = data.NombreTecnico

  // Create a Curso
  const Curso = new Cursos(updatedData)

  // Save Curso in the database
  Curso.save()
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

    if (options.req.files && options.req.files.Imagen && options.req.files.Imagen.data) {
      if (!fs.existsSync(`${options.req.app.get('filesFolder')}`)) fs.mkdirSync(`${options.req.app.get('filesFolder')}`, { recursive: true })
      fs.writeFileSync(`${options.req.app.get('filesFolder')}/${options.req.files.Imagen.name}`, options.req.files.Imagen.data)
      updatedData['Imagen'] = options.req.files.Imagen.name
    }

    updatedData['Modulo'] = []
    try {
      const Modulos = require('../controllers/modulos.controller.js')
      let ReceivedModulo = typeof data.Modulo === 'string' ? JSON.parse(data.Modulo) : data.Modulo
      ModuloRaw = Array.isArray(ReceivedModulo) ? ReceivedModulo : [ReceivedModulo]
      for await (const Moduloinfo of ModuloRaw) {
        const ModuloFiles = {}

        if (!Moduloinfo._id) {
          const mongoose = require('mongoose')
          let ModuloID = new mongoose.Types.ObjectId()

          Object.keys(Moduloinfo).forEach((info) => {
            if (
              Moduloinfo[info] &&
              typeof Moduloinfo[info] === 'object' &&
              (typeof Moduloinfo[info].NombreModulo === 'string' || typeof Moduloinfo.NombreModulo === 'string')
            ) {
              ModuloFiles[info] = Moduloinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Moduloinfo, _id: ModuloID }
          req.files = { ...ModuloFiles }
          try {
            const result = await Modulos.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Modulos.find({ query: { searchField: e.field, searchString: Moduloinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Modulo'].push(ModuloID)
        } else {
          updatedData['Modulo'].push(Moduloinfo._id)
        }
      }
    } catch (e) {
      updatedData['Modulo'] = data.Modulo
    }

    updatedData['PreguntasdelCurso'] = []
    try {
      const TiposdePreguntas = require('../controllers/tiposdepreguntas.controller.js')
      let ReceivedPreguntasdelCurso = typeof data.PreguntasdelCurso === 'string' ? JSON.parse(data.PreguntasdelCurso) : data.PreguntasdelCurso
      PreguntasdelCursoRaw = Array.isArray(ReceivedPreguntasdelCurso) ? ReceivedPreguntasdelCurso : [ReceivedPreguntasdelCurso]
      for await (const PreguntasdelCursoinfo of PreguntasdelCursoRaw) {
        const PreguntasdelCursoFiles = {}

        if (!PreguntasdelCursoinfo._id) {
          const mongoose = require('mongoose')
          let PreguntasdelCursoID = new mongoose.Types.ObjectId()

          Object.keys(PreguntasdelCursoinfo).forEach((info) => {
            if (
              PreguntasdelCursoinfo[info] &&
              typeof PreguntasdelCursoinfo[info] === 'object' &&
              (typeof PreguntasdelCursoinfo[info].Nombre === 'string' || typeof PreguntasdelCursoinfo.Nombre === 'string')
            ) {
              PreguntasdelCursoFiles[info] = PreguntasdelCursoinfo[info]
            }
          })

          let req = options.req
          req.body = { ...PreguntasdelCursoinfo, _id: PreguntasdelCursoID }
          req.files = { ...PreguntasdelCursoFiles }
          try {
            const result = await TiposdePreguntas.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await TiposdePreguntas.find({ query: { searchField: e.field, searchString: PreguntasdelCursoinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['PreguntasdelCurso'].push(PreguntasdelCursoID)
        } else {
          updatedData['PreguntasdelCurso'].push(PreguntasdelCursoinfo._id)
        }
      }
    } catch (e) {
      updatedData['PreguntasdelCurso'] = data.PreguntasdelCurso
    }

    if (typeof data.Descripcion !== 'undefined') updatedData['Descripcion'] = data.Descripcion

    if (options.req.files && options.req.files.Icono && options.req.files.Icono.data) {
      if (!fs.existsSync(`${options.req.app.get('filesFolder')}`)) fs.mkdirSync(`${options.req.app.get('filesFolder')}`, { recursive: true })
      fs.writeFileSync(`${options.req.app.get('filesFolder')}/${options.req.files.Icono.name}`, options.req.files.Icono.data)
      updatedData['Icono'] = options.req.files.Icono.name
    }

    if (typeof data.Temario !== 'undefined') updatedData['Temario'] = data.Temario

    if (typeof data.NombreTecnico !== 'undefined') updatedData['NombreTecnico'] = data.NombreTecnico

    // Create a Curso
    const Curso = new Cursos(updatedData)

    // Save Curso in the database
    Curso.save()
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

// Retrieve and return all Cursos from the database.
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

  Cursos.find(findString)
    .sort(query.sort && { [query.sort.field]: query.sort.method === 'desc' ? -1 : 1 })
    .collation({ locale: query.sortLanguage, strength: 1 })

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Certificaciones') > -1) && {
        strictPopulate: false,
        path: 'Certificaciones',

        populate: [{ model: 'Centros', path: 'Centro', strictPopulate: false }],
      }
    )

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Modulos') > -1) && {
        strictPopulate: false,
        path: 'Modulos',

        populate: [
          { model: 'Cursos', path: 'Cursos', strictPopulate: false },

          { model: 'Clases', path: 'Clases', strictPopulate: false },

          { model: 'Clases', path: 'Clases', strictPopulate: false },
        ],
      }
    )

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('TiposdePreguntas') > -1) && {
        strictPopulate: false,
        path: 'TiposdePreguntas',

        populate: [
          { model: 'Cursos', path: 'Cursos', strictPopulate: false },

          { model: 'Preguntas', path: 'Preguntas', strictPopulate: false },
        ],
      }
    )

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Ejercicios') > -1) && {
        strictPopulate: false,
        path: 'Ejercicios',
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

          { model: 'Provincias', path: 'Provincia', strictPopulate: false },

          { model: 'Centros', path: 'Centro', strictPopulate: false },
        ],
      }
    )

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Modulos') > -1) && {
        strictPopulate: false,
        model: 'Modulos',
        path: 'Modulo',

        populate: [
          { strictPopulate: false, model: 'Clases', path: 'Clases' },

          { strictPopulate: false, model: 'Cursos', path: 'Cursos' },

          { strictPopulate: false, model: 'Clases', path: 'Clases' },
        ],
      }
    )

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('TiposdePreguntas') > -1) && {
        strictPopulate: false,
        model: 'TiposdePreguntas',
        path: 'PreguntasdelCurso',

        populate: [
          { strictPopulate: false, model: 'Preguntas', path: 'Preguntas' },

          { strictPopulate: false, model: 'Cursos', path: 'Cursos' },
        ],
      }
    )

    .then((cursos) => {
      options.res.json(paginate.paginate(cursos, { page: query.page, limit: query.limit || 10 }))
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
      if (Cursos.schema.path(query.searchField).instance === 'Boolean') {
        findString = { [query.searchField]: JSON.parse(query.searchString) }
      } else if (Cursos.schema.path(query.searchField).instance === 'Date') {
        findString = { $expr: { $eq: [query.searchString, { $dateToString: { date: `$${query.searchField}`, format: '%Y-%m-%d' } }] } }
      } else {
        if (query.exactMatch) {
          findString = { [query.searchField]: query.searchString }
        } else {
          findString = { [query.searchField]: { $regex: new RegExp(query.searchString, 'i') } }
        }
      }

      if (Cursos.schema.path(query.searchField).instance === 'ObjectID' || Cursos.schema.path(query.searchField).instance === 'Array') {
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

    Cursos.find(findString)
      .sort(query.sort && { [query.sort.field]: query.sort.method === 'desc' ? -1 : 1 })
      .collation({ locale: query.sortLanguage, strength: 1 })

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Certificaciones') > -1) && {
          strictPopulate: false,
          path: 'Certificaciones',

          populate: [{ model: 'Centros', path: 'Centro', strictPopulate: false }],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Modulos') > -1) && {
          strictPopulate: false,
          path: 'Modulos',

          populate: [
            { model: 'Cursos', path: 'Cursos', strictPopulate: false },

            { model: 'Clases', path: 'Clases', strictPopulate: false },

            { model: 'Clases', path: 'Clases', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('TiposdePreguntas') > -1) && {
          strictPopulate: false,
          path: 'TiposdePreguntas',

          populate: [
            { model: 'Cursos', path: 'Cursos', strictPopulate: false },

            { model: 'Preguntas', path: 'Preguntas', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Ejercicios') > -1) && {
          strictPopulate: false,
          path: 'Ejercicios',
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

            { model: 'Provincias', path: 'Provincia', strictPopulate: false },

            { model: 'Centros', path: 'Centro', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Modulos') > -1) && {
          strictPopulate: false,
          model: 'Modulos',
          path: 'Modulo',

          populate: [
            { strictPopulate: false, model: 'Clases', path: 'Clases' },

            { strictPopulate: false, model: 'Cursos', path: 'Cursos' },

            { strictPopulate: false, model: 'Clases', path: 'Clases' },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('TiposdePreguntas') > -1) && {
          strictPopulate: false,
          model: 'TiposdePreguntas',
          path: 'PreguntasdelCurso',

          populate: [
            { strictPopulate: false, model: 'Preguntas', path: 'Preguntas' },

            { strictPopulate: false, model: 'Cursos', path: 'Cursos' },
          ],
        }
      )

      .then((curso) => {
        resolve(paginate.paginate(curso, { page: query.page, limit: query.limit || 10 }))
      })
      .catch((err) => {
        options.res.status(500).send({
          message: err.message || 'Some error occurred while retrieving records.',
        })
      })
  })
}

// Find a single Curso with a ID
exports.findOne = (options) => {
  return new Promise((resolve, reject) => {
    const query = { populate: 'true' }
    const id = options.req ? options.req.params.ID : options.ID
    Cursos.findById(id)

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Certificaciones') > -1) && {
          strictPopulate: false,
          path: 'Certificaciones',

          populate: [{ model: 'Centros', path: 'Centro', strictPopulate: false }],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Modulos') > -1) && {
          strictPopulate: false,
          path: 'Modulos',

          populate: [
            { model: 'Cursos', path: 'Cursos', strictPopulate: false },

            { model: 'Clases', path: 'Clases', strictPopulate: false },

            { model: 'Clases', path: 'Clases', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('TiposdePreguntas') > -1) && {
          strictPopulate: false,
          path: 'TiposdePreguntas',

          populate: [
            { model: 'Cursos', path: 'Cursos', strictPopulate: false },

            { model: 'Preguntas', path: 'Preguntas', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Ejercicios') > -1) && {
          strictPopulate: false,
          path: 'Ejercicios',
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

            { model: 'Provincias', path: 'Provincia', strictPopulate: false },

            { model: 'Centros', path: 'Centro', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Modulos') > -1) && {
          strictPopulate: false,
          model: 'Modulos',
          path: 'Modulo',

          populate: [
            { strictPopulate: false, model: 'Clases', path: 'Clases' },

            { strictPopulate: false, model: 'Cursos', path: 'Cursos' },

            { strictPopulate: false, model: 'Clases', path: 'Clases' },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('TiposdePreguntas') > -1) && {
          strictPopulate: false,
          model: 'TiposdePreguntas',
          path: 'PreguntasdelCurso',

          populate: [
            { strictPopulate: false, model: 'Preguntas', path: 'Preguntas' },

            { strictPopulate: false, model: 'Cursos', path: 'Cursos' },
          ],
        }
      )

      .then((curso) => {
        if (!curso) {
          return options.res.status(404).send({
            message: 'Curso not found with id ' + id,
          })
        }
        resolve(paginate.paginate([curso]))
      })
      .catch((err) => {
        if (err.kind === 'ObjectId') {
          return options.res.status(404).send({
            message: 'Curso not found with id ' + id,
          })
        }
        return options.res.status(500).send({
          message: 'Error retrieving Curso with id ' + id,
        })
      })
  })
}

// Update a curso identified by the ID in the request
exports.update = (options) => {
  return new Promise(async (resolve, reject) => {
    const id = options.req ? options.req.params.ID : options.ID
    const data = options.req ? options.req.body : options.data
    const updatedData = {}

    if (typeof data.Nombre !== 'undefined') updatedData['Nombre'] = data.Nombre

    if (typeof data.Duracion !== 'undefined') updatedData['Duracion'] = data.Duracion

    if (options.req.files && options.req.files.Imagen && options.req.files.Imagen.data) {
      if (!fs.existsSync(`${options.req.app.get('filesFolder')}`)) fs.mkdirSync(`${options.req.app.get('filesFolder')}`, { recursive: true })
      fs.writeFileSync(`${options.req.app.get('filesFolder')}/${options.req.files.Imagen.name}`, options.req.files.Imagen.data)
      updatedData['Imagen'] = options.req.files.Imagen.name
    }

    updatedData['Modulo'] = []
    try {
      const Modulos = require('../controllers/modulos.controller.js')
      let ReceivedModulo = typeof data.Modulo === 'string' ? JSON.parse(data.Modulo) : data.Modulo
      ModuloRaw = Array.isArray(ReceivedModulo) ? ReceivedModulo : [ReceivedModulo]
      for await (const Moduloinfo of ModuloRaw) {
        const ModuloFiles = {}

        if (!Moduloinfo._id) {
          const mongoose = require('mongoose')
          let ModuloID = new mongoose.Types.ObjectId()

          Object.keys(Moduloinfo).forEach((info) => {
            if (
              Moduloinfo[info] &&
              typeof Moduloinfo[info] === 'object' &&
              (typeof Moduloinfo[info].NombreModulo === 'string' || typeof Moduloinfo.NombreModulo === 'string')
            ) {
              ModuloFiles[info] = Moduloinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Moduloinfo, _id: ModuloID }
          req.files = { ...ModuloFiles }
          try {
            const result = await Modulos.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Modulos.find({ query: { searchField: e.field, searchString: Moduloinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Modulo'].push(ModuloID)
        } else {
          updatedData['Modulo'].push(Moduloinfo._id)
        }
      }
    } catch (e) {
      updatedData['Modulo'] = data.Modulo
    }

    updatedData['PreguntasdelCurso'] = []
    try {
      const TiposdePreguntas = require('../controllers/tiposdepreguntas.controller.js')
      let ReceivedPreguntasdelCurso = typeof data.PreguntasdelCurso === 'string' ? JSON.parse(data.PreguntasdelCurso) : data.PreguntasdelCurso
      PreguntasdelCursoRaw = Array.isArray(ReceivedPreguntasdelCurso) ? ReceivedPreguntasdelCurso : [ReceivedPreguntasdelCurso]
      for await (const PreguntasdelCursoinfo of PreguntasdelCursoRaw) {
        const PreguntasdelCursoFiles = {}

        if (!PreguntasdelCursoinfo._id) {
          const mongoose = require('mongoose')
          let PreguntasdelCursoID = new mongoose.Types.ObjectId()

          Object.keys(PreguntasdelCursoinfo).forEach((info) => {
            if (
              PreguntasdelCursoinfo[info] &&
              typeof PreguntasdelCursoinfo[info] === 'object' &&
              (typeof PreguntasdelCursoinfo[info].Nombre === 'string' || typeof PreguntasdelCursoinfo.Nombre === 'string')
            ) {
              PreguntasdelCursoFiles[info] = PreguntasdelCursoinfo[info]
            }
          })

          let req = options.req
          req.body = { ...PreguntasdelCursoinfo, _id: PreguntasdelCursoID }
          req.files = { ...PreguntasdelCursoFiles }
          try {
            const result = await TiposdePreguntas.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await TiposdePreguntas.find({ query: { searchField: e.field, searchString: PreguntasdelCursoinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['PreguntasdelCurso'].push(PreguntasdelCursoID)
        } else {
          updatedData['PreguntasdelCurso'].push(PreguntasdelCursoinfo._id)
        }
      }
    } catch (e) {
      updatedData['PreguntasdelCurso'] = data.PreguntasdelCurso
    }

    if (typeof data.Descripcion !== 'undefined') updatedData['Descripcion'] = data.Descripcion

    if (options.req.files && options.req.files.Icono && options.req.files.Icono.data) {
      if (!fs.existsSync(`${options.req.app.get('filesFolder')}`)) fs.mkdirSync(`${options.req.app.get('filesFolder')}`, { recursive: true })
      fs.writeFileSync(`${options.req.app.get('filesFolder')}/${options.req.files.Icono.name}`, options.req.files.Icono.data)
      updatedData['Icono'] = options.req.files.Icono.name
    }

    if (typeof data.Temario !== 'undefined') updatedData['Temario'] = data.Temario

    if (typeof data.NombreTecnico !== 'undefined') updatedData['NombreTecnico'] = data.NombreTecnico

    // Find Curso and update it with the request body
    const query = { populate: 'true' }
    Cursos.findByIdAndUpdate(id, updatedData, { new: true })

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Certificaciones') > -1) && {
          strictPopulate: false,
          path: 'Certificaciones',

          populate: [{ model: 'Centros', path: 'Centro', strictPopulate: false }],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Modulos') > -1) && {
          strictPopulate: false,
          path: 'Modulos',

          populate: [
            { model: 'Cursos', path: 'Cursos', strictPopulate: false },

            { model: 'Clases', path: 'Clases', strictPopulate: false },

            { model: 'Clases', path: 'Clases', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('TiposdePreguntas') > -1) && {
          strictPopulate: false,
          path: 'TiposdePreguntas',

          populate: [
            { model: 'Cursos', path: 'Cursos', strictPopulate: false },

            { model: 'Preguntas', path: 'Preguntas', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Ejercicios') > -1) && {
          strictPopulate: false,
          path: 'Ejercicios',
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

            { model: 'Provincias', path: 'Provincia', strictPopulate: false },

            { model: 'Centros', path: 'Centro', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Modulos') > -1) && {
          strictPopulate: false,
          model: 'Modulos',
          path: 'Modulo',

          populate: [
            { strictPopulate: false, model: 'Clases', path: 'Clases' },

            { strictPopulate: false, model: 'Cursos', path: 'Cursos' },

            { strictPopulate: false, model: 'Clases', path: 'Clases' },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('TiposdePreguntas') > -1) && {
          strictPopulate: false,
          model: 'TiposdePreguntas',
          path: 'PreguntasdelCurso',

          populate: [
            { strictPopulate: false, model: 'Preguntas', path: 'Preguntas' },

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

// Delete a curso with the specified ID in the request
exports.delete = (options) => {
  return new Promise((resolve, reject) => {
    const params = options.req ? options.req.params : options
    let theFilter = { _id: params.ID }

    if (options.queryString && options.queryField) {
      theFilter = { [options.queryField]: options.queryString }
    }
    Cursos.deleteMany(theFilter)
      .then((result) => {
        resolve(result)
      })
      .catch((e) => {
        reject(e)
      })
  })
}
