const Posts = require('../models/posts.model.js')
const fs = require('fs')
const paginate = require('../paginate')
const errors = require('../services/errors.service')

// Create and Save a new Post
exports.create = async (options) => {
  const data = options.req ? options.req.body : options.data
  const updatedData = {}

  if (options.req.files && options.req.files.ImagenPortada && options.req.files.ImagenPortada.data) {
    if (!fs.existsSync(`${options.req.app.get('filesFolder')}`)) fs.mkdirSync(`${options.req.app.get('filesFolder')}`, { recursive: true })
    fs.writeFileSync(`${options.req.app.get('filesFolder')}/${options.req.files.ImagenPortada.name}`, options.req.files.ImagenPortada.data)
    updatedData['ImagenPortada'] = options.req.files.ImagenPortada.name
  }

  if (typeof data.Destacado !== 'undefined') updatedData['Destacado'] = data.Destacado

  updatedData['Category'] = []
  try {
    const Categorias = require('../controllers/categorias.controller.js')
    let ReceivedCategory = typeof data.Category === 'string' ? JSON.parse(data.Category) : data.Category
    CategoryRaw = Array.isArray(ReceivedCategory) ? ReceivedCategory : [ReceivedCategory]
    for await (const Categoryinfo of CategoryRaw) {
      const CategoryFiles = {}

      if (!Categoryinfo._id) {
        const mongoose = require('mongoose')
        let CategoryID = new mongoose.Types.ObjectId()

        Object.keys(Categoryinfo).forEach((info) => {
          if (
            Categoryinfo[info] &&
            typeof Categoryinfo[info] === 'object' &&
            (typeof Categoryinfo[info].Name === 'string' || typeof Categoryinfo.Name === 'string')
          ) {
            CategoryFiles[info] = Categoryinfo[info]
          }
        })

        let req = options.req
        req.body = { ...Categoryinfo, _id: CategoryID }
        req.files = { ...CategoryFiles }
        try {
          const result = await Categorias.createAsPromise({ req, res: options.res })
        } catch (e) {
          if (e.code === 422) {
            const duplicateError = await Categorias.find({ query: { searchField: e.field, searchString: Categoryinfo[e.field] } })
            ContactsID = duplicateError.docs[0]._id
          }
        }

        updatedData['Category'].push(CategoryID)
      } else {
        updatedData['Category'].push(Categoryinfo._id)
      }
    }
  } catch (e) {
    updatedData['Category'] = data.Category
  }

  if (typeof data.Title !== 'undefined') updatedData['Title'] = data.Title

  if (typeof data.Description !== 'undefined') updatedData['Description'] = data.Description

  // Create a Post
  const Post = new Posts(updatedData)

  // Save Post in the database
  Post.save()
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

    if (options.req.files && options.req.files.ImagenPortada && options.req.files.ImagenPortada.data) {
      if (!fs.existsSync(`${options.req.app.get('filesFolder')}`)) fs.mkdirSync(`${options.req.app.get('filesFolder')}`, { recursive: true })
      fs.writeFileSync(`${options.req.app.get('filesFolder')}/${options.req.files.ImagenPortada.name}`, options.req.files.ImagenPortada.data)
      updatedData['ImagenPortada'] = options.req.files.ImagenPortada.name
    }

    if (typeof data.Destacado !== 'undefined') updatedData['Destacado'] = data.Destacado

    updatedData['Category'] = []
    try {
      const Categorias = require('../controllers/categorias.controller.js')
      let ReceivedCategory = typeof data.Category === 'string' ? JSON.parse(data.Category) : data.Category
      CategoryRaw = Array.isArray(ReceivedCategory) ? ReceivedCategory : [ReceivedCategory]
      for await (const Categoryinfo of CategoryRaw) {
        const CategoryFiles = {}

        if (!Categoryinfo._id) {
          const mongoose = require('mongoose')
          let CategoryID = new mongoose.Types.ObjectId()

          Object.keys(Categoryinfo).forEach((info) => {
            if (
              Categoryinfo[info] &&
              typeof Categoryinfo[info] === 'object' &&
              (typeof Categoryinfo[info].Name === 'string' || typeof Categoryinfo.Name === 'string')
            ) {
              CategoryFiles[info] = Categoryinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Categoryinfo, _id: CategoryID }
          req.files = { ...CategoryFiles }
          try {
            const result = await Categorias.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Categorias.find({ query: { searchField: e.field, searchString: Categoryinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Category'].push(CategoryID)
        } else {
          updatedData['Category'].push(Categoryinfo._id)
        }
      }
    } catch (e) {
      updatedData['Category'] = data.Category
    }

    if (typeof data.Title !== 'undefined') updatedData['Title'] = data.Title

    if (typeof data.Description !== 'undefined') updatedData['Description'] = data.Description

    // Create a Post
    const Post = new Posts(updatedData)

    // Save Post in the database
    Post.save()
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

// Retrieve and return all Posts from the database.
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

  Posts.find(findString)
    .sort(query.sort && { [query.sort.field]: query.sort.method === 'desc' ? -1 : 1 })
    .collation({ locale: query.sortLanguage, strength: 1 })

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Categorias') > -1) && {
        strictPopulate: false,
        model: 'Categorias',
        path: 'Category',
      }
    )

    .then((posts) => {
      options.res.json(paginate.paginate(posts, { page: query.page, limit: query.limit || 10 }))
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
      if (Posts.schema.path(query.searchField).instance === 'Boolean') {
        findString = { [query.searchField]: JSON.parse(query.searchString) }
      } else if (Posts.schema.path(query.searchField).instance === 'Date') {
        findString = { $expr: { $eq: [query.searchString, { $dateToString: { date: `$${query.searchField}`, format: '%Y-%m-%d' } }] } }
      } else {
        if (query.exactMatch) {
          findString = { [query.searchField]: query.searchString }
        } else {
          findString = { [query.searchField]: { $regex: new RegExp(query.searchString, 'i') } }
        }
      }

      if (Posts.schema.path(query.searchField).instance === 'ObjectID' || Posts.schema.path(query.searchField).instance === 'Array') {
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

    Posts.find(findString)
      .sort(query.sort && { [query.sort.field]: query.sort.method === 'desc' ? -1 : 1 })
      .collation({ locale: query.sortLanguage, strength: 1 })

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Categorias') > -1) && {
          strictPopulate: false,
          model: 'Categorias',
          path: 'Category',
        }
      )

      .then((post) => {
        resolve(paginate.paginate(post, { page: query.page, limit: query.limit || 10 }))
      })
      .catch((err) => {
        options.res.status(500).send({
          message: err.message || 'Some error occurred while retrieving records.',
        })
      })
  })
}

// Find a single Post with a ID
exports.findOne = (options) => {
  return new Promise((resolve, reject) => {
    const query = { populate: 'true' }
    const id = options.req ? options.req.params.ID : options.ID
    Posts.findById(id)

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Categorias') > -1) && {
          strictPopulate: false,
          model: 'Categorias',
          path: 'Category',
        }
      )

      .then((post) => {
        if (!post) {
          return options.res.status(404).send({
            message: 'Post not found with id ' + id,
          })
        }
        resolve(paginate.paginate([post]))
      })
      .catch((err) => {
        if (err.kind === 'ObjectId') {
          return options.res.status(404).send({
            message: 'Post not found with id ' + id,
          })
        }
        return options.res.status(500).send({
          message: 'Error retrieving Post with id ' + id,
        })
      })
  })
}

// Update a post identified by the ID in the request
exports.update = (options) => {
  return new Promise(async (resolve, reject) => {
    const id = options.req ? options.req.params.ID : options.ID
    const data = options.req ? options.req.body : options.data
    const updatedData = {}

    if (options.req.files && options.req.files.ImagenPortada && options.req.files.ImagenPortada.data) {
      if (!fs.existsSync(`${options.req.app.get('filesFolder')}`)) fs.mkdirSync(`${options.req.app.get('filesFolder')}`, { recursive: true })
      fs.writeFileSync(`${options.req.app.get('filesFolder')}/${options.req.files.ImagenPortada.name}`, options.req.files.ImagenPortada.data)
      updatedData['ImagenPortada'] = options.req.files.ImagenPortada.name
    }

    if (typeof data.Destacado !== 'undefined') updatedData['Destacado'] = data.Destacado

    updatedData['Category'] = []
    try {
      const Categorias = require('../controllers/categorias.controller.js')
      let ReceivedCategory = typeof data.Category === 'string' ? JSON.parse(data.Category) : data.Category
      CategoryRaw = Array.isArray(ReceivedCategory) ? ReceivedCategory : [ReceivedCategory]
      for await (const Categoryinfo of CategoryRaw) {
        const CategoryFiles = {}

        if (!Categoryinfo._id) {
          const mongoose = require('mongoose')
          let CategoryID = new mongoose.Types.ObjectId()

          Object.keys(Categoryinfo).forEach((info) => {
            if (
              Categoryinfo[info] &&
              typeof Categoryinfo[info] === 'object' &&
              (typeof Categoryinfo[info].Name === 'string' || typeof Categoryinfo.Name === 'string')
            ) {
              CategoryFiles[info] = Categoryinfo[info]
            }
          })

          let req = options.req
          req.body = { ...Categoryinfo, _id: CategoryID }
          req.files = { ...CategoryFiles }
          try {
            const result = await Categorias.createAsPromise({ req, res: options.res })
          } catch (e) {
            if (e.code === 422) {
              const duplicateError = await Categorias.find({ query: { searchField: e.field, searchString: Categoryinfo[e.field] } })
              ContactsID = duplicateError.docs[0]._id
            }
          }

          updatedData['Category'].push(CategoryID)
        } else {
          updatedData['Category'].push(Categoryinfo._id)
        }
      }
    } catch (e) {
      updatedData['Category'] = data.Category
    }

    if (typeof data.Title !== 'undefined') updatedData['Title'] = data.Title

    if (typeof data.Description !== 'undefined') updatedData['Description'] = data.Description

    // Find Post and update it with the request body
    const query = { populate: 'true' }
    Posts.findByIdAndUpdate(id, updatedData, { new: true })

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Categorias') > -1) && {
          strictPopulate: false,
          model: 'Categorias',
          path: 'Category',
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

// Delete a post with the specified ID in the request
exports.delete = (options) => {
  return new Promise((resolve, reject) => {
    const params = options.req ? options.req.params : options
    let theFilter = { _id: params.ID }

    if (options.queryString && options.queryField) {
      theFilter = { [options.queryField]: options.queryString }
    }
    Posts.deleteMany(theFilter)
      .then((result) => {
        resolve(result)
      })
      .catch((e) => {
        reject(e)
      })
  })
}
