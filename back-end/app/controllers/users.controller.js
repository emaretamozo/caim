const Users = require('../models/users.model.js')
const fs = require('fs')
const paginate = require('../paginate')
const errors = require('../services/errors.service')

const bcrypt = require('bcryptjs')

// Create and Save a new Usersrecord
exports.create = async (options) => {
  const data = options.req ? options.req.body : options.data
  const updatedData = {}

  // required validation
  if (typeof data.Nombre !== 'undefined' && !data.Nombre) {
    options.res.status(422).send({ message: 'Nombre requires a value', field: 'Nombre' })
    return
  }

  // required validation
  if (typeof data.Password !== 'undefined' && !data.Password) {
    options.res.status(422).send({ message: 'Password requires a value', field: 'Password' })
    return
  }

  if (typeof data.Nombre !== 'undefined') updatedData['Nombre'] = data.Nombre

  if (typeof data.DNI !== 'undefined') updatedData['DNI'] = data.DNI

  if (typeof data.Email !== 'undefined') updatedData['Email'] = data.Email

  if (data.Password) updatedData['Password'] = bcrypt.hashSync(data.Password, 10)

  if (options.req.files && options.req.files.ProfilePic && options.req.files.ProfilePic.data) {
    if (!fs.existsSync(`${options.req.app.get('filesFolder')}`)) fs.mkdirSync(`${options.req.app.get('filesFolder')}`, { recursive: true })
    fs.writeFileSync(`${options.req.app.get('filesFolder')}/${options.req.files.ProfilePic.name}`, options.req.files.ProfilePic.data)
    updatedData['ProfilePic'] = options.req.files.ProfilePic.name
  }

  if (typeof data.Role !== 'undefined') updatedData['Role'] = data.Role

  if (typeof data.Telefono !== 'undefined') updatedData['Telefono'] = data.Telefono

  if (typeof data.Direccion !== 'undefined') updatedData['Direccion'] = data.Direccion

  if (typeof data.Localidad !== 'undefined') updatedData['Localidad'] = data.Localidad

  updatedData['Provincia'] = []
  try {
    const Provincias = require('../controllers/provincias.controller.js')
    let ReceivedProvincia = typeof data.Provincia === 'string' ? JSON.parse(data.Provincia) : data.Provincia
    ProvinciaRaw = Array.isArray(ReceivedProvincia) ? ReceivedProvincia : [ReceivedProvincia]
    for await (const Provinciainfo of ProvinciaRaw) {
      const ProvinciaFiles = {}

      if (!Provinciainfo._id) {
        const mongoose = require('mongoose')
        let ProvinciaID = new mongoose.Types.ObjectId()

        Object.keys(Provinciainfo).forEach((info) => {
          if (
            Provinciainfo[info] &&
            typeof Provinciainfo[info] === 'object' &&
            (typeof Provinciainfo[info].Name === 'string' || typeof Provinciainfo.Name === 'string')
          ) {
            ProvinciaFiles[info] = Provinciainfo[info]
          }
        })

        let req = options.req
        req.body = { ...Provinciainfo, _id: ProvinciaID }
        req.files = { ...ProvinciaFiles }
        try {
          const result = await Provincias.createAsPromise({ req, res: options.res })
        } catch (e) {
          if (e.code === 422) {
            const duplicateError = await Provincias.find({ query: { searchField: e.field, searchString: Provinciainfo[e.field] } })
            ContactsID = duplicateError.docs[0]._id
          }
        }

        updatedData['Provincia'].push(ProvinciaID)
      } else {
        updatedData['Provincia'].push(Provinciainfo._id)
      }
    }
  } catch (e) {
    updatedData['Provincia'] = data.Provincia
  }

  if (typeof data.Publicado !== 'undefined') updatedData['Publicado'] = data.Publicado

  updatedData['Centro'] = []
  try {
    const Centros = require('../controllers/centros.controller.js')
    let ReceivedCentro = typeof data.Centro === 'string' ? JSON.parse(data.Centro) : data.Centro
    CentroRaw = Array.isArray(ReceivedCentro) ? ReceivedCentro : [ReceivedCentro]
    for await (const Centroinfo of CentroRaw) {
      const CentroFiles = {}

      if (!Centroinfo._id) {
        const mongoose = require('mongoose')
        let CentroID = new mongoose.Types.ObjectId()

        Object.keys(Centroinfo).forEach((info) => {
          if (
            Centroinfo[info] &&
            typeof Centroinfo[info] === 'object' &&
            (typeof Centroinfo[info].Nombre === 'string' || typeof Centroinfo.Nombre === 'string')
          ) {
            CentroFiles[info] = Centroinfo[info]
          }
        })

        let req = options.req
        req.body = { ...Centroinfo, _id: CentroID }
        req.files = { ...CentroFiles }
        try {
          const result = await Centros.createAsPromise({ req, res: options.res })
        } catch (e) {
          if (e.code === 422) {
            const duplicateError = await Centros.find({ query: { searchField: e.field, searchString: Centroinfo[e.field] } })
            ContactsID = duplicateError.docs[0]._id
          }
        }

        updatedData['Centro'].push(CentroID)
      } else {
        updatedData['Centro'].push(Centroinfo._id)
      }
    }
  } catch (e) {
    updatedData['Centro'] = data.Centro
  }

  updatedData['Curso'] = []
  try {
    const Cursos = require('../controllers/cursos.controller.js')
    let ReceivedCurso = typeof data.Curso === 'string' ? JSON.parse(data.Curso) : data.Curso
    CursoRaw = Array.isArray(ReceivedCurso) ? ReceivedCurso : [ReceivedCurso]
    for await (const Cursoinfo of CursoRaw) {
      const CursoFiles = {}

      if (!Cursoinfo._id) {
        const mongoose = require('mongoose')
        let CursoID = new mongoose.Types.ObjectId()

        Object.keys(Cursoinfo).forEach((info) => {
          if (
            Cursoinfo[info] &&
            typeof Cursoinfo[info] === 'object' &&
            (typeof Cursoinfo[info].Nombre === 'string' || typeof Cursoinfo.Nombre === 'string')
          ) {
            CursoFiles[info] = Cursoinfo[info]
          }
        })

        let req = options.req
        req.body = { ...Cursoinfo, _id: CursoID }
        req.files = { ...CursoFiles }
        try {
          const result = await Cursos.createAsPromise({ req, res: options.res })
        } catch (e) {
          if (e.code === 422) {
            const duplicateError = await Cursos.find({ query: { searchField: e.field, searchString: Cursoinfo[e.field] } })
            ContactsID = duplicateError.docs[0]._id
          }
        }

        updatedData['Curso'].push(CursoID)
      } else {
        updatedData['Curso'].push(Cursoinfo._id)
      }
    }
  } catch (e) {
    updatedData['Curso'] = data.Curso
  }

  // Create a Usersrecord
  const Usersrecord = new Users(updatedData)

  // Save Usersrecord in the database
  Usersrecord.save()
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

    // required validation
    if (typeof data.Nombre !== 'undefined' && !data.Nombre) {
      options.res.status(422).send({ message: 'Nombre requires a value', field: 'Nombre' })
      return
    }

    // required validation
    if (typeof data.Password !== 'undefined' && !data.Password) {
      options.res.status(422).send({ message: 'Password requires a value', field: 'Password' })
      return
    }

    if (typeof data.Nombre !== 'undefined') updatedData['Nombre'] = data.Nombre

    if (typeof data.DNI !== 'undefined') updatedData['DNI'] = data.DNI

    if (typeof data.Email !== 'undefined') updatedData['Email'] = data.Email

    if (data.Password) updatedData['Password'] = bcrypt.hashSync(data.Password, 10)

    if (options.req.files && options.req.files.ProfilePic && options.req.files.ProfilePic.data) {
      if (!fs.existsSync(`${options.req.app.get('filesFolder')}`)) fs.mkdirSync(`${options.req.app.get('filesFolder')}`, { recursive: true })
      fs.writeFileSync(`${options.req.app.get('filesFolder')}/${options.req.files.ProfilePic.name}`, options.req.files.ProfilePic.data)
      updatedData['ProfilePic'] = options.req.files.ProfilePic.name
    }

    if (typeof data.Role !== 'undefined') updatedData['Role'] = data.Role

    if (typeof data.Telefono !== 'undefined') updatedData['Telefono'] = data.Telefono

    if (typeof data.Direccion !== 'undefined') updatedData['Direccion'] = data.Direccion

    if (typeof data.Localidad !== 'undefined') updatedData['Localidad'] = data.Localidad

    updatedData['Provincia'] = []
    try {
      const Provincias = require('../controllers/provincias.controller.js')
      let ReceivedProvincia = typeof data.Provincia === 'string' ? JSON.parse(data.Provincia) : data.Provincia
      ProvinciaRaw = Array.isArray(ReceivedProvincia) ? ReceivedProvincia : [ReceivedProvincia]
      for await (const Provinciainfo of ProvinciaRaw) {
        const ProvinciaFiles = {}

        if (!Provinciainfo._id) {
          const mongoose = require('mongoose')
          let ProvinciaID = new mongoose.Types.ObjectId()

          Object.keys(Provinciainfo).forEach((info) => {
            if (
              Provinciainfo[info] &&
              typeof Provinciainfo[info] === 'object' &&
              (typeof Provinciainfo[info].Name === 'string' || typeof Provinciainfo.Name === 'string')
            ) {
              ProvinciaFiles[info] = Provinciainfo[info]
            }
          })

          let req = options.req
          req.body = { ...Provinciainfo, _id: ProvinciaID }
          req.files = { ...ProvinciaFiles }
          try {
            const result = await Provincias.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Provincias.find({ query: { searchField: e.field, searchString: Provinciainfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Provincia'].push(ProvinciaID)
        } else {
          updatedData['Provincia'].push(Provinciainfo._id)
        }
      }
    } catch (e) {
      updatedData['Provincia'] = data.Provincia
    }

    if (typeof data.Publicado !== 'undefined') updatedData['Publicado'] = data.Publicado

    updatedData['Centro'] = []
    try {
      const Centros = require('../controllers/centros.controller.js')
      let ReceivedCentro = typeof data.Centro === 'string' ? JSON.parse(data.Centro) : data.Centro
      CentroRaw = Array.isArray(ReceivedCentro) ? ReceivedCentro : [ReceivedCentro]
      for await (const Centroinfo of CentroRaw) {
        const CentroFiles = {}

        if (!Centroinfo._id) {
          const mongoose = require('mongoose')
          let CentroID = new mongoose.Types.ObjectId()

          Object.keys(Centroinfo).forEach((info) => {
            if (
              Centroinfo[info] &&
              typeof Centroinfo[info] === 'object' &&
              (typeof Centroinfo[info].Nombre === 'string' || typeof Centroinfo.Nombre === 'string')
            ) {
              CentroFiles[info] = Centroinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Centroinfo, _id: CentroID }
          req.files = { ...CentroFiles }
          try {
            const result = await Centros.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Centros.find({ query: { searchField: e.field, searchString: Centroinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Centro'].push(CentroID)
        } else {
          updatedData['Centro'].push(Centroinfo._id)
        }
      }
    } catch (e) {
      updatedData['Centro'] = data.Centro
    }

    updatedData['Curso'] = []
    try {
      const Cursos = require('../controllers/cursos.controller.js')
      let ReceivedCurso = typeof data.Curso === 'string' ? JSON.parse(data.Curso) : data.Curso
      CursoRaw = Array.isArray(ReceivedCurso) ? ReceivedCurso : [ReceivedCurso]
      for await (const Cursoinfo of CursoRaw) {
        const CursoFiles = {}

        if (!Cursoinfo._id) {
          const mongoose = require('mongoose')
          let CursoID = new mongoose.Types.ObjectId()

          Object.keys(Cursoinfo).forEach((info) => {
            if (
              Cursoinfo[info] &&
              typeof Cursoinfo[info] === 'object' &&
              (typeof Cursoinfo[info].Nombre === 'string' || typeof Cursoinfo.Nombre === 'string')
            ) {
              CursoFiles[info] = Cursoinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Cursoinfo, _id: CursoID }
          req.files = { ...CursoFiles }
          try {
            const result = await Cursos.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Cursos.find({ query: { searchField: e.field, searchString: Cursoinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Curso'].push(CursoID)
        } else {
          updatedData['Curso'].push(Cursoinfo._id)
        }
      }
    } catch (e) {
      updatedData['Curso'] = data.Curso
    }

    // Create a Usersrecord
    const Usersrecord = new Users(updatedData)

    // Save Usersrecord in the database
    Usersrecord.save()
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

// Retrieve and return all Users from the database.
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

  Users.find(findString)
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

          { model: 'Zonas', path: 'Zonas', strictPopulate: false },
        ],
      }
    )

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Likes') > -1) && {
        strictPopulate: false,
        path: 'Likes',
      }
    )

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Likes') > -1) && {
        strictPopulate: false,
        path: 'Likes',
      }
    )

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Provincias') > -1) && {
        strictPopulate: false,
        model: 'Provincias',
        path: 'Provincia',

        populate: [
          { strictPopulate: false, model: 'Centros', path: 'Centros' },

          { strictPopulate: false, model: 'Zonas', path: 'Zonas' },
        ],
      }
    )

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Centros') > -1) && {
        strictPopulate: false,
        model: 'Centros',
        path: 'Centro',

        populate: [
          { strictPopulate: false, model: 'Provincias', path: 'Provincia' },

          { strictPopulate: false, model: 'Users', path: 'Profesional' },

          { strictPopulate: false, model: 'Zonas', path: 'Zonas' },

          { strictPopulate: false, model: 'Certificaciones', path: 'Certificaciones' },
        ],
      }
    )

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Cursos') > -1) && {
        strictPopulate: false,
        model: 'Cursos',
        path: 'Curso',

        populate: [
          { strictPopulate: false, model: 'Modulos', path: 'Modulo' },

          { strictPopulate: false, model: 'TiposdePreguntas', path: 'PreguntasdelCurso' },

          { strictPopulate: false, model: 'Certificaciones', path: 'Certificaciones' },

          { strictPopulate: false, model: 'Modulos', path: 'Modulos' },

          { strictPopulate: false, model: 'TiposdePreguntas', path: 'TiposdePreguntas' },

          { strictPopulate: false, model: 'Ejercicios', path: 'Ejercicios' },
        ],
      }
    )

    .then((users) => {
      options.res.json(paginate.paginate(users, { page: query.page, limit: query.limit || 10 }))
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
      if (Users.schema.path(query.searchField).instance === 'Boolean') {
        findString = { [query.searchField]: JSON.parse(query.searchString) }
      } else if (Users.schema.path(query.searchField).instance === 'Date') {
        findString = { $expr: { $eq: [query.searchString, { $dateToString: { date: `$${query.searchField}`, format: '%Y-%m-%d' } }] } }
      } else {
        if (query.exactMatch) {
          findString = { [query.searchField]: query.searchString }
        } else {
          findString = { [query.searchField]: { $regex: new RegExp(query.searchString, 'i') } }
        }
      }

      if (Users.schema.path(query.searchField).instance === 'ObjectID' || Users.schema.path(query.searchField).instance === 'Array') {
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

    Users.find(findString)
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

            { model: 'Zonas', path: 'Zonas', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Likes') > -1) && {
          strictPopulate: false,
          path: 'Likes',
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Likes') > -1) && {
          strictPopulate: false,
          path: 'Likes',
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Provincias') > -1) && {
          strictPopulate: false,
          model: 'Provincias',
          path: 'Provincia',

          populate: [
            { strictPopulate: false, model: 'Centros', path: 'Centros' },

            { strictPopulate: false, model: 'Zonas', path: 'Zonas' },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Centros') > -1) && {
          strictPopulate: false,
          model: 'Centros',
          path: 'Centro',

          populate: [
            { strictPopulate: false, model: 'Provincias', path: 'Provincia' },

            { strictPopulate: false, model: 'Users', path: 'Profesional' },

            { strictPopulate: false, model: 'Zonas', path: 'Zonas' },

            { strictPopulate: false, model: 'Certificaciones', path: 'Certificaciones' },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Cursos') > -1) && {
          strictPopulate: false,
          model: 'Cursos',
          path: 'Curso',

          populate: [
            { strictPopulate: false, model: 'Modulos', path: 'Modulo' },

            { strictPopulate: false, model: 'TiposdePreguntas', path: 'PreguntasdelCurso' },

            { strictPopulate: false, model: 'Certificaciones', path: 'Certificaciones' },

            { strictPopulate: false, model: 'Modulos', path: 'Modulos' },

            { strictPopulate: false, model: 'TiposdePreguntas', path: 'TiposdePreguntas' },

            { strictPopulate: false, model: 'Ejercicios', path: 'Ejercicios' },
          ],
        }
      )

      .then((usersrecord) => {
        resolve(paginate.paginate(usersrecord, { page: query.page, limit: query.limit || 10 }))
      })
      .catch((err) => {
        options.res.status(500).send({
          message: err.message || 'Some error occurred while retrieving records.',
        })
      })
  })
}

// Find a single Usersrecord with a ID
exports.findOne = (options) => {
  return new Promise((resolve, reject) => {
    const query = { populate: 'true' }
    const id = options.req ? options.req.params.ID : options.ID
    Users.findById(id)

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Centros') > -1) && {
          strictPopulate: false,
          path: 'Centros',

          populate: [
            { model: 'Certificaciones', path: 'Certificaciones', strictPopulate: false },

            { model: 'Users', path: 'Users', strictPopulate: false },

            { model: 'Provincias', path: 'Provincia', strictPopulate: false },

            { model: 'Zonas', path: 'Zonas', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Likes') > -1) && {
          strictPopulate: false,
          path: 'Likes',
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Likes') > -1) && {
          strictPopulate: false,
          path: 'Likes',
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Provincias') > -1) && {
          strictPopulate: false,
          model: 'Provincias',
          path: 'Provincia',

          populate: [
            { strictPopulate: false, model: 'Centros', path: 'Centros' },

            { strictPopulate: false, model: 'Zonas', path: 'Zonas' },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Centros') > -1) && {
          strictPopulate: false,
          model: 'Centros',
          path: 'Centro',

          populate: [
            { strictPopulate: false, model: 'Provincias', path: 'Provincia' },

            { strictPopulate: false, model: 'Users', path: 'Profesional' },

            { strictPopulate: false, model: 'Zonas', path: 'Zonas' },

            { strictPopulate: false, model: 'Certificaciones', path: 'Certificaciones' },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Cursos') > -1) && {
          strictPopulate: false,
          model: 'Cursos',
          path: 'Curso',

          populate: [
            { strictPopulate: false, model: 'Modulos', path: 'Modulo' },

            { strictPopulate: false, model: 'TiposdePreguntas', path: 'PreguntasdelCurso' },

            { strictPopulate: false, model: 'Certificaciones', path: 'Certificaciones' },

            { strictPopulate: false, model: 'Modulos', path: 'Modulos' },

            { strictPopulate: false, model: 'TiposdePreguntas', path: 'TiposdePreguntas' },

            { strictPopulate: false, model: 'Ejercicios', path: 'Ejercicios' },
          ],
        }
      )

      .then((usersrecord) => {
        if (!usersrecord) {
          return options.res.status(404).send({
            message: 'Usersrecord not found with id ' + id,
          })
        }
        resolve(paginate.paginate([usersrecord]))
      })
      .catch((err) => {
        if (err.kind === 'ObjectId') {
          return options.res.status(404).send({
            message: 'Usersrecord not found with id ' + id,
          })
        }
        return options.res.status(500).send({
          message: 'Error retrieving Usersrecord with id ' + id,
        })
      })
  })
}

// Update a usersrecord identified by the ID in the request
exports.update = (options) => {
  return new Promise(async (resolve, reject) => {
    const id = options.req ? options.req.params.ID : options.ID
    const data = options.req ? options.req.body : options.data
    const updatedData = {}

    if (typeof data.Nombre !== 'undefined') updatedData['Nombre'] = data.Nombre

    if (typeof data.DNI !== 'undefined') updatedData['DNI'] = data.DNI

    if (typeof data.Email !== 'undefined') updatedData['Email'] = data.Email

    if (data.Password) updatedData['Password'] = bcrypt.hashSync(data.Password, 10)

    if (options.req.files && options.req.files.ProfilePic && options.req.files.ProfilePic.data) {
      if (!fs.existsSync(`${options.req.app.get('filesFolder')}`)) fs.mkdirSync(`${options.req.app.get('filesFolder')}`, { recursive: true })
      fs.writeFileSync(`${options.req.app.get('filesFolder')}/${options.req.files.ProfilePic.name}`, options.req.files.ProfilePic.data)
      updatedData['ProfilePic'] = options.req.files.ProfilePic.name
    }

    if (typeof data.Role !== 'undefined') updatedData['Role'] = data.Role

    if (typeof data.Telefono !== 'undefined') updatedData['Telefono'] = data.Telefono

    if (typeof data.Direccion !== 'undefined') updatedData['Direccion'] = data.Direccion

    if (typeof data.Localidad !== 'undefined') updatedData['Localidad'] = data.Localidad

    updatedData['Provincia'] = []
    try {
      const Provincias = require('../controllers/provincias.controller.js')
      let ReceivedProvincia = typeof data.Provincia === 'string' ? JSON.parse(data.Provincia) : data.Provincia
      ProvinciaRaw = Array.isArray(ReceivedProvincia) ? ReceivedProvincia : [ReceivedProvincia]
      for await (const Provinciainfo of ProvinciaRaw) {
        const ProvinciaFiles = {}

        if (!Provinciainfo._id) {
          const mongoose = require('mongoose')
          let ProvinciaID = new mongoose.Types.ObjectId()

          Object.keys(Provinciainfo).forEach((info) => {
            if (
              Provinciainfo[info] &&
              typeof Provinciainfo[info] === 'object' &&
              (typeof Provinciainfo[info].Name === 'string' || typeof Provinciainfo.Name === 'string')
            ) {
              ProvinciaFiles[info] = Provinciainfo[info]
            }
          })

          let req = options.req
          req.body = { ...Provinciainfo, _id: ProvinciaID }
          req.files = { ...ProvinciaFiles }
          try {
            const result = await Provincias.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Provincias.find({ query: { searchField: e.field, searchString: Provinciainfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Provincia'].push(ProvinciaID)
        } else {
          updatedData['Provincia'].push(Provinciainfo._id)
        }
      }
    } catch (e) {
      updatedData['Provincia'] = data.Provincia
    }

    if (typeof data.Publicado !== 'undefined') updatedData['Publicado'] = data.Publicado

    updatedData['Centro'] = []
    try {
      const Centros = require('../controllers/centros.controller.js')
      let ReceivedCentro = typeof data.Centro === 'string' ? JSON.parse(data.Centro) : data.Centro
      CentroRaw = Array.isArray(ReceivedCentro) ? ReceivedCentro : [ReceivedCentro]
      for await (const Centroinfo of CentroRaw) {
        const CentroFiles = {}

        if (!Centroinfo._id) {
          const mongoose = require('mongoose')
          let CentroID = new mongoose.Types.ObjectId()

          Object.keys(Centroinfo).forEach((info) => {
            if (
              Centroinfo[info] &&
              typeof Centroinfo[info] === 'object' &&
              (typeof Centroinfo[info].Nombre === 'string' || typeof Centroinfo.Nombre === 'string')
            ) {
              CentroFiles[info] = Centroinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Centroinfo, _id: CentroID }
          req.files = { ...CentroFiles }
          try {
            const result = await Centros.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Centros.find({ query: { searchField: e.field, searchString: Centroinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Centro'].push(CentroID)
        } else {
          updatedData['Centro'].push(Centroinfo._id)
        }
      }
    } catch (e) {
      updatedData['Centro'] = data.Centro
    }

    updatedData['Curso'] = []
    try {
      const Cursos = require('../controllers/cursos.controller.js')
      let ReceivedCurso = typeof data.Curso === 'string' ? JSON.parse(data.Curso) : data.Curso
      CursoRaw = Array.isArray(ReceivedCurso) ? ReceivedCurso : [ReceivedCurso]
      for await (const Cursoinfo of CursoRaw) {
        const CursoFiles = {}

        if (!Cursoinfo._id) {
          const mongoose = require('mongoose')
          let CursoID = new mongoose.Types.ObjectId()

          Object.keys(Cursoinfo).forEach((info) => {
            if (
              Cursoinfo[info] &&
              typeof Cursoinfo[info] === 'object' &&
              (typeof Cursoinfo[info].Nombre === 'string' || typeof Cursoinfo.Nombre === 'string')
            ) {
              CursoFiles[info] = Cursoinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Cursoinfo, _id: CursoID }
          req.files = { ...CursoFiles }
          try {
            const result = await Cursos.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Cursos.find({ query: { searchField: e.field, searchString: Cursoinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Curso'].push(CursoID)
        } else {
          updatedData['Curso'].push(Cursoinfo._id)
        }
      }
    } catch (e) {
      updatedData['Curso'] = data.Curso
    }

    // Find Usersrecord and update it with the request body
    const query = { populate: 'true' }
    Users.findByIdAndUpdate(id, updatedData, { new: true })

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Centros') > -1) && {
          strictPopulate: false,
          path: 'Centros',

          populate: [
            { model: 'Certificaciones', path: 'Certificaciones', strictPopulate: false },

            { model: 'Users', path: 'Users', strictPopulate: false },

            { model: 'Provincias', path: 'Provincia', strictPopulate: false },

            { model: 'Zonas', path: 'Zonas', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Likes') > -1) && {
          strictPopulate: false,
          path: 'Likes',
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Likes') > -1) && {
          strictPopulate: false,
          path: 'Likes',
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Provincias') > -1) && {
          strictPopulate: false,
          model: 'Provincias',
          path: 'Provincia',

          populate: [
            { strictPopulate: false, model: 'Centros', path: 'Centros' },

            { strictPopulate: false, model: 'Zonas', path: 'Zonas' },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Centros') > -1) && {
          strictPopulate: false,
          model: 'Centros',
          path: 'Centro',

          populate: [
            { strictPopulate: false, model: 'Provincias', path: 'Provincia' },

            { strictPopulate: false, model: 'Users', path: 'Profesional' },

            { strictPopulate: false, model: 'Zonas', path: 'Zonas' },

            { strictPopulate: false, model: 'Certificaciones', path: 'Certificaciones' },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Cursos') > -1) && {
          strictPopulate: false,
          model: 'Cursos',
          path: 'Curso',

          populate: [
            { strictPopulate: false, model: 'Modulos', path: 'Modulo' },

            { strictPopulate: false, model: 'TiposdePreguntas', path: 'PreguntasdelCurso' },

            { strictPopulate: false, model: 'Certificaciones', path: 'Certificaciones' },

            { strictPopulate: false, model: 'Modulos', path: 'Modulos' },

            { strictPopulate: false, model: 'TiposdePreguntas', path: 'TiposdePreguntas' },

            { strictPopulate: false, model: 'Ejercicios', path: 'Ejercicios' },
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

// Delete a usersrecord with the specified ID in the request
exports.delete = (options) => {
  return new Promise((resolve, reject) => {
    const params = options.req ? options.req.params : options
    let theFilter = { _id: params.ID }

    if (options.queryString && options.queryField) {
      theFilter = { [options.queryField]: options.queryString }
    }
    Users.deleteMany(theFilter)
      .then((result) => {
        resolve(result)
      })
      .catch((e) => {
        reject(e)
      })
  })
}
