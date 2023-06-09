const Centros = require('../models/centros.model.js')
const fs = require('fs')
const paginate = require('../paginate')
const errors = require('../services/errors.service')

// Create and Save a new Centro
exports.create = async (options) => {
  const data = options.req ? options.req.body : options.data
  const updatedData = {}

  if (typeof data.Nombre !== 'undefined') updatedData['Nombre'] = data.Nombre

  if (typeof data.Direccion !== 'undefined') updatedData['Direccion'] = data.Direccion

  if (typeof data.Localidad !== 'undefined') updatedData['Localidad'] = data.Localidad

  if (typeof data.Telefonos !== 'undefined') updatedData['Telefonos'] = data.Telefonos

  if (typeof data.Contacto !== 'undefined') updatedData['Contacto'] = data.Contacto

  if (typeof data.Sitio !== 'undefined') updatedData['Sitio'] = data.Sitio

  if (options.req.files && options.req.files.Logo && options.req.files.Logo.data) {
    if (!fs.existsSync(`${options.req.app.get('filesFolder')}`)) fs.mkdirSync(`${options.req.app.get('filesFolder')}`, { recursive: true })
    fs.writeFileSync(`${options.req.app.get('filesFolder')}/${options.req.files.Logo.name}`, options.req.files.Logo.data)
    updatedData['Logo'] = options.req.files.Logo.name
  }

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

  updatedData['Profesional'] = []
  try {
    const Users = require('../controllers/users.controller.js')
    let ReceivedProfesional = typeof data.Profesional === 'string' ? JSON.parse(data.Profesional) : data.Profesional
    ProfesionalRaw = Array.isArray(ReceivedProfesional) ? ReceivedProfesional : [ReceivedProfesional]
    for await (const Profesionalinfo of ProfesionalRaw) {
      const ProfesionalFiles = {}

      if (!Profesionalinfo._id) {
        const mongoose = require('mongoose')
        let ProfesionalID = new mongoose.Types.ObjectId()

        Object.keys(Profesionalinfo).forEach((info) => {
          if (
            Profesionalinfo[info] &&
            typeof Profesionalinfo[info] === 'object' &&
            (typeof Profesionalinfo[info].Nombre === 'string' || typeof Profesionalinfo.Nombre === 'string')
          ) {
            ProfesionalFiles[info] = Profesionalinfo[info]
          }
        })

        let req = options.req
        req.body = { ...Profesionalinfo, _id: ProfesionalID }
        req.files = { ...ProfesionalFiles }
        try {
          const result = await Users.createAsPromise({ req, res: options.res })
        } catch (e) {
          if (e.code === 422) {
            const duplicateError = await Users.find({ query: { searchField: e.field, searchString: Profesionalinfo[e.field] } })
            ContactsID = duplicateError.docs[0]._id
          }
        }

        updatedData['Profesional'].push(ProfesionalID)
      } else {
        updatedData['Profesional'].push(Profesionalinfo._id)
      }
    }
  } catch (e) {
    updatedData['Profesional'] = data.Profesional
  }

  updatedData['Zonas'] = []
  try {
    const Zonas = require('../controllers/zonas.controller.js')
    let ReceivedZonas = typeof data.Zonas === 'string' ? JSON.parse(data.Zonas) : data.Zonas
    ZonasRaw = Array.isArray(ReceivedZonas) ? ReceivedZonas : [ReceivedZonas]
    for await (const Zonasinfo of ZonasRaw) {
      const ZonasFiles = {}

      if (!Zonasinfo._id) {
        const mongoose = require('mongoose')
        let ZonasID = new mongoose.Types.ObjectId()

        Object.keys(Zonasinfo).forEach((info) => {
          if (
            Zonasinfo[info] &&
            typeof Zonasinfo[info] === 'object' &&
            (typeof Zonasinfo[info].Nombre === 'string' || typeof Zonasinfo.Nombre === 'string')
          ) {
            ZonasFiles[info] = Zonasinfo[info]
          }
        })

        let req = options.req
        req.body = { ...Zonasinfo, _id: ZonasID }
        req.files = { ...ZonasFiles }
        try {
          const result = await Zonas.createAsPromise({ req, res: options.res })
        } catch (e) {
          if (e.code === 422) {
            const duplicateError = await Zonas.find({ query: { searchField: e.field, searchString: Zonasinfo[e.field] } })
            ContactsID = duplicateError.docs[0]._id
          }
        }

        updatedData['Zonas'].push(ZonasID)
      } else {
        updatedData['Zonas'].push(Zonasinfo._id)
      }
    }
  } catch (e) {
    updatedData['Zonas'] = data.Zonas
  }

  // Create a Centro
  const Centro = new Centros(updatedData)

  // Save Centro in the database
  Centro.save()
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

    if (typeof data.Direccion !== 'undefined') updatedData['Direccion'] = data.Direccion

    if (typeof data.Localidad !== 'undefined') updatedData['Localidad'] = data.Localidad

    if (typeof data.Telefonos !== 'undefined') updatedData['Telefonos'] = data.Telefonos

    if (typeof data.Contacto !== 'undefined') updatedData['Contacto'] = data.Contacto

    if (typeof data.Sitio !== 'undefined') updatedData['Sitio'] = data.Sitio

    if (options.req.files && options.req.files.Logo && options.req.files.Logo.data) {
      if (!fs.existsSync(`${options.req.app.get('filesFolder')}`)) fs.mkdirSync(`${options.req.app.get('filesFolder')}`, { recursive: true })
      fs.writeFileSync(`${options.req.app.get('filesFolder')}/${options.req.files.Logo.name}`, options.req.files.Logo.data)
      updatedData['Logo'] = options.req.files.Logo.name
    }

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

    updatedData['Profesional'] = []
    try {
      const Users = require('../controllers/users.controller.js')
      let ReceivedProfesional = typeof data.Profesional === 'string' ? JSON.parse(data.Profesional) : data.Profesional
      ProfesionalRaw = Array.isArray(ReceivedProfesional) ? ReceivedProfesional : [ReceivedProfesional]
      for await (const Profesionalinfo of ProfesionalRaw) {
        const ProfesionalFiles = {}

        if (!Profesionalinfo._id) {
          const mongoose = require('mongoose')
          let ProfesionalID = new mongoose.Types.ObjectId()

          Object.keys(Profesionalinfo).forEach((info) => {
            if (
              Profesionalinfo[info] &&
              typeof Profesionalinfo[info] === 'object' &&
              (typeof Profesionalinfo[info].Nombre === 'string' || typeof Profesionalinfo.Nombre === 'string')
            ) {
              ProfesionalFiles[info] = Profesionalinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Profesionalinfo, _id: ProfesionalID }
          req.files = { ...ProfesionalFiles }
          try {
            const result = await Users.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Users.find({ query: { searchField: e.field, searchString: Profesionalinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Profesional'].push(ProfesionalID)
        } else {
          updatedData['Profesional'].push(Profesionalinfo._id)
        }
      }
    } catch (e) {
      updatedData['Profesional'] = data.Profesional
    }

    updatedData['Zonas'] = []
    try {
      const Zonas = require('../controllers/zonas.controller.js')
      let ReceivedZonas = typeof data.Zonas === 'string' ? JSON.parse(data.Zonas) : data.Zonas
      ZonasRaw = Array.isArray(ReceivedZonas) ? ReceivedZonas : [ReceivedZonas]
      for await (const Zonasinfo of ZonasRaw) {
        const ZonasFiles = {}

        if (!Zonasinfo._id) {
          const mongoose = require('mongoose')
          let ZonasID = new mongoose.Types.ObjectId()

          Object.keys(Zonasinfo).forEach((info) => {
            if (
              Zonasinfo[info] &&
              typeof Zonasinfo[info] === 'object' &&
              (typeof Zonasinfo[info].Nombre === 'string' || typeof Zonasinfo.Nombre === 'string')
            ) {
              ZonasFiles[info] = Zonasinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Zonasinfo, _id: ZonasID }
          req.files = { ...ZonasFiles }
          try {
            const result = await Zonas.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Zonas.find({ query: { searchField: e.field, searchString: Zonasinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Zonas'].push(ZonasID)
        } else {
          updatedData['Zonas'].push(Zonasinfo._id)
        }
      }
    } catch (e) {
      updatedData['Zonas'] = data.Zonas
    }

    // Create a Centro
    const Centro = new Centros(updatedData)

    // Save Centro in the database
    Centro.save()
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

// Retrieve and return all Centros from the database.
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

  Centros.find(findString)
    .sort(query.sort && { [query.sort.field]: query.sort.method === 'desc' ? -1 : 1 })
    .collation({ locale: query.sortLanguage, strength: 1 })

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Certificaciones') > -1) && {
        strictPopulate: false,
        path: 'Certificaciones',

        populate: [{ model: 'Cursos', path: 'Curso', strictPopulate: false }],
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

          { model: 'Cursos', path: 'Curso', strictPopulate: false },
        ],
      }
    )

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Provincias') > -1) && {
        strictPopulate: false,
        model: 'Provincias',
        path: 'Provincia',

        populate: [
          { strictPopulate: false, model: 'Users', path: 'Users' },

          { strictPopulate: false, model: 'Zonas', path: 'Zonas' },
        ],
      }
    )

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Users') > -1) && {
        strictPopulate: false,
        model: 'Users',
        path: 'Profesional',

        populate: [
          { strictPopulate: false, model: 'Provincias', path: 'Provincia' },

          { strictPopulate: false, model: 'Centros', path: 'Centro' },

          { strictPopulate: false, model: 'Cursos', path: 'Curso' },

          { strictPopulate: false, model: 'Likes', path: 'Likes' },

          { strictPopulate: false, model: 'Likes', path: 'Likes' },
        ],
      }
    )

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Zonas') > -1) && {
        strictPopulate: false,
        model: 'Zonas',
        path: 'Zonas',

        populate: [{ strictPopulate: false, model: 'Provincias', path: 'Provincias' }],
      }
    )

    .then((centros) => {
      options.res.json(paginate.paginate(centros, { page: query.page, limit: query.limit || 10 }))
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
      if (Centros.schema.path(query.searchField).instance === 'Boolean') {
        findString = { [query.searchField]: JSON.parse(query.searchString) }
      } else if (Centros.schema.path(query.searchField).instance === 'Date') {
        findString = { $expr: { $eq: [query.searchString, { $dateToString: { date: `$${query.searchField}`, format: '%Y-%m-%d' } }] } }
      } else {
        if (query.exactMatch) {
          findString = { [query.searchField]: query.searchString }
        } else {
          findString = { [query.searchField]: { $regex: new RegExp(query.searchString, 'i') } }
        }
      }

      if (Centros.schema.path(query.searchField).instance === 'ObjectID' || Centros.schema.path(query.searchField).instance === 'Array') {
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

    Centros.find(findString)
      .sort(query.sort && { [query.sort.field]: query.sort.method === 'desc' ? -1 : 1 })
      .collation({ locale: query.sortLanguage, strength: 1 })

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Certificaciones') > -1) && {
          strictPopulate: false,
          path: 'Certificaciones',

          populate: [{ model: 'Cursos', path: 'Curso', strictPopulate: false }],
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

            { model: 'Cursos', path: 'Curso', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Provincias') > -1) && {
          strictPopulate: false,
          model: 'Provincias',
          path: 'Provincia',

          populate: [
            { strictPopulate: false, model: 'Users', path: 'Users' },

            { strictPopulate: false, model: 'Zonas', path: 'Zonas' },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Users') > -1) && {
          strictPopulate: false,
          model: 'Users',
          path: 'Profesional',

          populate: [
            { strictPopulate: false, model: 'Provincias', path: 'Provincia' },

            { strictPopulate: false, model: 'Centros', path: 'Centro' },

            { strictPopulate: false, model: 'Cursos', path: 'Curso' },

            { strictPopulate: false, model: 'Likes', path: 'Likes' },

            { strictPopulate: false, model: 'Likes', path: 'Likes' },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Zonas') > -1) && {
          strictPopulate: false,
          model: 'Zonas',
          path: 'Zonas',

          populate: [{ strictPopulate: false, model: 'Provincias', path: 'Provincias' }],
        }
      )

      .then((centro) => {
        resolve(paginate.paginate(centro, { page: query.page, limit: query.limit || 10 }))
      })
      .catch((err) => {
        options.res.status(500).send({
          message: err.message || 'Some error occurred while retrieving records.',
        })
      })
  })
}

// Find a single Centro with a ID
exports.findOne = (options) => {
  return new Promise((resolve, reject) => {
    const query = { populate: 'true' }
    const id = options.req ? options.req.params.ID : options.ID
    Centros.findById(id)

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Certificaciones') > -1) && {
          strictPopulate: false,
          path: 'Certificaciones',

          populate: [{ model: 'Cursos', path: 'Curso', strictPopulate: false }],
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

            { model: 'Cursos', path: 'Curso', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Provincias') > -1) && {
          strictPopulate: false,
          model: 'Provincias',
          path: 'Provincia',

          populate: [
            { strictPopulate: false, model: 'Users', path: 'Users' },

            { strictPopulate: false, model: 'Zonas', path: 'Zonas' },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Users') > -1) && {
          strictPopulate: false,
          model: 'Users',
          path: 'Profesional',

          populate: [
            { strictPopulate: false, model: 'Provincias', path: 'Provincia' },

            { strictPopulate: false, model: 'Centros', path: 'Centro' },

            { strictPopulate: false, model: 'Cursos', path: 'Curso' },

            { strictPopulate: false, model: 'Likes', path: 'Likes' },

            { strictPopulate: false, model: 'Likes', path: 'Likes' },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Zonas') > -1) && {
          strictPopulate: false,
          model: 'Zonas',
          path: 'Zonas',

          populate: [{ strictPopulate: false, model: 'Provincias', path: 'Provincias' }],
        }
      )

      .then((centro) => {
        if (!centro) {
          return options.res.status(404).send({
            message: 'Centro not found with id ' + id,
          })
        }
        resolve(paginate.paginate([centro]))
      })
      .catch((err) => {
        if (err.kind === 'ObjectId') {
          return options.res.status(404).send({
            message: 'Centro not found with id ' + id,
          })
        }
        return options.res.status(500).send({
          message: 'Error retrieving Centro with id ' + id,
        })
      })
  })
}

// Update a centro identified by the ID in the request
exports.update = (options) => {
  return new Promise(async (resolve, reject) => {
    const id = options.req ? options.req.params.ID : options.ID
    const data = options.req ? options.req.body : options.data
    const updatedData = {}

    if (typeof data.Nombre !== 'undefined') updatedData['Nombre'] = data.Nombre

    if (typeof data.Direccion !== 'undefined') updatedData['Direccion'] = data.Direccion

    if (typeof data.Localidad !== 'undefined') updatedData['Localidad'] = data.Localidad

    if (typeof data.Telefonos !== 'undefined') updatedData['Telefonos'] = data.Telefonos

    if (typeof data.Contacto !== 'undefined') updatedData['Contacto'] = data.Contacto

    if (typeof data.Sitio !== 'undefined') updatedData['Sitio'] = data.Sitio

    if (options.req.files && options.req.files.Logo && options.req.files.Logo.data) {
      if (!fs.existsSync(`${options.req.app.get('filesFolder')}`)) fs.mkdirSync(`${options.req.app.get('filesFolder')}`, { recursive: true })
      fs.writeFileSync(`${options.req.app.get('filesFolder')}/${options.req.files.Logo.name}`, options.req.files.Logo.data)
      updatedData['Logo'] = options.req.files.Logo.name
    }

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

    updatedData['Profesional'] = []
    try {
      const Users = require('../controllers/users.controller.js')
      let ReceivedProfesional = typeof data.Profesional === 'string' ? JSON.parse(data.Profesional) : data.Profesional
      ProfesionalRaw = Array.isArray(ReceivedProfesional) ? ReceivedProfesional : [ReceivedProfesional]
      for await (const Profesionalinfo of ProfesionalRaw) {
        const ProfesionalFiles = {}

        if (!Profesionalinfo._id) {
          const mongoose = require('mongoose')
          let ProfesionalID = new mongoose.Types.ObjectId()

          Object.keys(Profesionalinfo).forEach((info) => {
            if (
              Profesionalinfo[info] &&
              typeof Profesionalinfo[info] === 'object' &&
              (typeof Profesionalinfo[info].Nombre === 'string' || typeof Profesionalinfo.Nombre === 'string')
            ) {
              ProfesionalFiles[info] = Profesionalinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Profesionalinfo, _id: ProfesionalID }
          req.files = { ...ProfesionalFiles }
          try {
            const result = await Users.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Users.find({ query: { searchField: e.field, searchString: Profesionalinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Profesional'].push(ProfesionalID)
        } else {
          updatedData['Profesional'].push(Profesionalinfo._id)
        }
      }
    } catch (e) {
      updatedData['Profesional'] = data.Profesional
    }

    updatedData['Zonas'] = []
    try {
      const Zonas = require('../controllers/zonas.controller.js')
      let ReceivedZonas = typeof data.Zonas === 'string' ? JSON.parse(data.Zonas) : data.Zonas
      ZonasRaw = Array.isArray(ReceivedZonas) ? ReceivedZonas : [ReceivedZonas]
      for await (const Zonasinfo of ZonasRaw) {
        const ZonasFiles = {}

        if (!Zonasinfo._id) {
          const mongoose = require('mongoose')
          let ZonasID = new mongoose.Types.ObjectId()

          Object.keys(Zonasinfo).forEach((info) => {
            if (
              Zonasinfo[info] &&
              typeof Zonasinfo[info] === 'object' &&
              (typeof Zonasinfo[info].Nombre === 'string' || typeof Zonasinfo.Nombre === 'string')
            ) {
              ZonasFiles[info] = Zonasinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Zonasinfo, _id: ZonasID }
          req.files = { ...ZonasFiles }
          try {
            const result = await Zonas.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Zonas.find({ query: { searchField: e.field, searchString: Zonasinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Zonas'].push(ZonasID)
        } else {
          updatedData['Zonas'].push(Zonasinfo._id)
        }
      }
    } catch (e) {
      updatedData['Zonas'] = data.Zonas
    }

    // Find Centro and update it with the request body
    const query = { populate: 'true' }
    Centros.findByIdAndUpdate(id, updatedData, { new: true })

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Certificaciones') > -1) && {
          strictPopulate: false,
          path: 'Certificaciones',

          populate: [{ model: 'Cursos', path: 'Curso', strictPopulate: false }],
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

            { model: 'Cursos', path: 'Curso', strictPopulate: false },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Provincias') > -1) && {
          strictPopulate: false,
          model: 'Provincias',
          path: 'Provincia',

          populate: [
            { strictPopulate: false, model: 'Users', path: 'Users' },

            { strictPopulate: false, model: 'Zonas', path: 'Zonas' },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Users') > -1) && {
          strictPopulate: false,
          model: 'Users',
          path: 'Profesional',

          populate: [
            { strictPopulate: false, model: 'Provincias', path: 'Provincia' },

            { strictPopulate: false, model: 'Centros', path: 'Centro' },

            { strictPopulate: false, model: 'Cursos', path: 'Curso' },

            { strictPopulate: false, model: 'Likes', path: 'Likes' },

            { strictPopulate: false, model: 'Likes', path: 'Likes' },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Zonas') > -1) && {
          strictPopulate: false,
          model: 'Zonas',
          path: 'Zonas',

          populate: [{ strictPopulate: false, model: 'Provincias', path: 'Provincias' }],
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

// Delete a centro with the specified ID in the request
exports.delete = (options) => {
  return new Promise((resolve, reject) => {
    const params = options.req ? options.req.params : options
    let theFilter = { _id: params.ID }

    if (options.queryString && options.queryField) {
      theFilter = { [options.queryField]: options.queryString }
    }
    Centros.deleteMany(theFilter)
      .then((result) => {
        resolve(result)
      })
      .catch((e) => {
        reject(e)
      })
  })
}
