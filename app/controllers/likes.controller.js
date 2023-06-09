const Likes = require('../models/likes.model.js')
const fs = require('fs')
const paginate = require('../paginate')
const errors = require('../services/errors.service')

// Create and Save a new Like
exports.create = async (options) => {
  const data = options.req ? options.req.body : options.data
  const updatedData = {}

  updatedData['User'] = {}
  try {
    const Users = require('../models/users.model.js')
    let ReceivedUser = typeof data.User === 'string' ? JSON.parse(data.User) : data.User
    Userinfo = Array.isArray(ReceivedUser) ? ReceivedUser[0] : ReceivedUser
    if (!Userinfo._id) {
      const mongoose = require('mongoose')
      const UserID = new mongoose.Types.ObjectId()
      const Usersrecord = new Users({ ...Userinfo, _id: UserID })
      Usersrecord.save()
      updatedData['User'] = UserID
    } else {
      updatedData['User'] = Userinfo._id
    }
  } catch (e) {
    updatedData['User'] = data.User
  }

  updatedData['Liked'] = {}
  try {
    const Users = require('../models/users.model.js')
    let ReceivedLiked = typeof data.Liked === 'string' ? JSON.parse(data.Liked) : data.Liked
    Likedinfo = Array.isArray(ReceivedLiked) ? ReceivedLiked[0] : ReceivedLiked
    if (!Likedinfo._id) {
      const mongoose = require('mongoose')
      const LikedID = new mongoose.Types.ObjectId()
      const Usersrecord = new Users({ ...Likedinfo, _id: LikedID })
      Usersrecord.save()
      updatedData['Liked'] = LikedID
    } else {
      updatedData['Liked'] = Likedinfo._id
    }
  } catch (e) {
    updatedData['Liked'] = data.Liked
  }

  // Create a Like
  const Like = new Likes(updatedData)

  // Save Like in the database
  Like.save()
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

    updatedData['User'] = {}
    try {
      const Users = require('../models/users.model.js')
      let ReceivedUser = typeof data.User === 'string' ? JSON.parse(data.User) : data.User
      Userinfo = Array.isArray(ReceivedUser) ? ReceivedUser[0] : ReceivedUser
      if (!Userinfo._id) {
        const mongoose = require('mongoose')
        const UserID = new mongoose.Types.ObjectId()
        const Usersrecord = new Users({ ...Userinfo, _id: UserID })
        Usersrecord.save()
        updatedData['User'] = UserID
      } else {
        updatedData['User'] = Userinfo._id
      }
    } catch (e) {
      updatedData['User'] = data.User
    }

    updatedData['Liked'] = {}
    try {
      const Users = require('../models/users.model.js')
      let ReceivedLiked = typeof data.Liked === 'string' ? JSON.parse(data.Liked) : data.Liked
      Likedinfo = Array.isArray(ReceivedLiked) ? ReceivedLiked[0] : ReceivedLiked
      if (!Likedinfo._id) {
        const mongoose = require('mongoose')
        const LikedID = new mongoose.Types.ObjectId()
        const Usersrecord = new Users({ ...Likedinfo, _id: LikedID })
        Usersrecord.save()
        updatedData['Liked'] = LikedID
      } else {
        updatedData['Liked'] = Likedinfo._id
      }
    } catch (e) {
      updatedData['Liked'] = data.Liked
    }

    // Create a Like
    const Like = new Likes(updatedData)

    // Save Like in the database
    Like.save()
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

// Retrieve and return all Likes from the database.
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

  Likes.find(findString)
    .sort(query.sort && { [query.sort.field]: query.sort.method === 'desc' ? -1 : 1 })
    .collation({ locale: query.sortLanguage, strength: 1 })

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Users') > -1) && {
        strictPopulate: false,
        model: 'Users',
        path: 'User',

        populate: [
          { strictPopulate: false, model: 'Centros', path: 'Centros' },

          { strictPopulate: false, model: 'Provincias', path: 'Provincia' },

          { strictPopulate: false, model: 'Centros', path: 'Centro' },

          { strictPopulate: false, model: 'Cursos', path: 'Curso' },
        ],
      }
    )

    .populate(
      (query.populate === 'true' || query.populate?.indexOf('Users') > -1) && {
        strictPopulate: false,
        model: 'Users',
        path: 'Liked',

        populate: [
          { strictPopulate: false, model: 'Centros', path: 'Centros' },

          { strictPopulate: false, model: 'Provincias', path: 'Provincia' },

          { strictPopulate: false, model: 'Centros', path: 'Centro' },

          { strictPopulate: false, model: 'Cursos', path: 'Curso' },
        ],
      }
    )

    .then((likes) => {
      options.res.json(paginate.paginate(likes, { page: query.page, limit: query.limit || 10 }))
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
      if (Likes.schema.path(query.searchField).instance === 'Boolean') {
        findString = { [query.searchField]: JSON.parse(query.searchString) }
      } else if (Likes.schema.path(query.searchField).instance === 'Date') {
        findString = { $expr: { $eq: [query.searchString, { $dateToString: { date: `$${query.searchField}`, format: '%Y-%m-%d' } }] } }
      } else {
        if (query.exactMatch) {
          findString = { [query.searchField]: query.searchString }
        } else {
          findString = { [query.searchField]: { $regex: new RegExp(query.searchString, 'i') } }
        }
      }

      if (Likes.schema.path(query.searchField).instance === 'ObjectID' || Likes.schema.path(query.searchField).instance === 'Array') {
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

    Likes.find(findString)
      .sort(query.sort && { [query.sort.field]: query.sort.method === 'desc' ? -1 : 1 })
      .collation({ locale: query.sortLanguage, strength: 1 })

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Users') > -1) && {
          strictPopulate: false,
          model: 'Users',
          path: 'User',

          populate: [
            { strictPopulate: false, model: 'Centros', path: 'Centros' },

            { strictPopulate: false, model: 'Provincias', path: 'Provincia' },

            { strictPopulate: false, model: 'Centros', path: 'Centro' },

            { strictPopulate: false, model: 'Cursos', path: 'Curso' },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Users') > -1) && {
          strictPopulate: false,
          model: 'Users',
          path: 'Liked',

          populate: [
            { strictPopulate: false, model: 'Centros', path: 'Centros' },

            { strictPopulate: false, model: 'Provincias', path: 'Provincia' },

            { strictPopulate: false, model: 'Centros', path: 'Centro' },

            { strictPopulate: false, model: 'Cursos', path: 'Curso' },
          ],
        }
      )

      .then((like) => {
        resolve(paginate.paginate(like, { page: query.page, limit: query.limit || 10 }))
      })
      .catch((err) => {
        options.res.status(500).send({
          message: err.message || 'Some error occurred while retrieving records.',
        })
      })
  })
}

// Find a single Like with a ID
exports.findOne = (options) => {
  return new Promise((resolve, reject) => {
    const query = { populate: 'true' }
    const id = options.req ? options.req.params.ID : options.ID
    Likes.findById(id)

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Users') > -1) && {
          strictPopulate: false,
          model: 'Users',
          path: 'User',

          populate: [
            { strictPopulate: false, model: 'Centros', path: 'Centros' },

            { strictPopulate: false, model: 'Provincias', path: 'Provincia' },

            { strictPopulate: false, model: 'Centros', path: 'Centro' },

            { strictPopulate: false, model: 'Cursos', path: 'Curso' },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Users') > -1) && {
          strictPopulate: false,
          model: 'Users',
          path: 'Liked',

          populate: [
            { strictPopulate: false, model: 'Centros', path: 'Centros' },

            { strictPopulate: false, model: 'Provincias', path: 'Provincia' },

            { strictPopulate: false, model: 'Centros', path: 'Centro' },

            { strictPopulate: false, model: 'Cursos', path: 'Curso' },
          ],
        }
      )

      .then((like) => {
        if (!like) {
          return options.res.status(404).send({
            message: 'Like not found with id ' + id,
          })
        }
        resolve(paginate.paginate([like]))
      })
      .catch((err) => {
        if (err.kind === 'ObjectId') {
          return options.res.status(404).send({
            message: 'Like not found with id ' + id,
          })
        }
        return options.res.status(500).send({
          message: 'Error retrieving Like with id ' + id,
        })
      })
  })
}

// Update a like identified by the ID in the request
exports.update = (options) => {
  return new Promise(async (resolve, reject) => {
    const id = options.req ? options.req.params.ID : options.ID
    const data = options.req ? options.req.body : options.data
    const updatedData = {}

    updatedData['User'] = {}
    try {
      const Users = require('../models/users.model.js')
      let ReceivedUser = typeof data.User === 'string' ? JSON.parse(data.User) : data.User
      Userinfo = Array.isArray(ReceivedUser) ? ReceivedUser[0] : ReceivedUser
      if (!Userinfo._id) {
        const mongoose = require('mongoose')
        const UserID = new mongoose.Types.ObjectId()
        const Usersrecord = new Users({ ...Userinfo, _id: UserID })
        Usersrecord.save()
        updatedData['User'] = UserID
      } else {
        updatedData['User'] = Userinfo._id
      }
    } catch (e) {
      updatedData['User'] = data.User
    }

    updatedData['Liked'] = {}
    try {
      const Users = require('../models/users.model.js')
      let ReceivedLiked = typeof data.Liked === 'string' ? JSON.parse(data.Liked) : data.Liked
      Likedinfo = Array.isArray(ReceivedLiked) ? ReceivedLiked[0] : ReceivedLiked
      if (!Likedinfo._id) {
        const mongoose = require('mongoose')
        const LikedID = new mongoose.Types.ObjectId()
        const Usersrecord = new Users({ ...Likedinfo, _id: LikedID })
        Usersrecord.save()
        updatedData['Liked'] = LikedID
      } else {
        updatedData['Liked'] = Likedinfo._id
      }
    } catch (e) {
      updatedData['Liked'] = data.Liked
    }

    // Find Like and update it with the request body
    const query = { populate: 'true' }
    Likes.findByIdAndUpdate(id, updatedData, { new: true })

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Users') > -1) && {
          strictPopulate: false,
          model: 'Users',
          path: 'User',

          populate: [
            { strictPopulate: false, model: 'Centros', path: 'Centros' },

            { strictPopulate: false, model: 'Provincias', path: 'Provincia' },

            { strictPopulate: false, model: 'Centros', path: 'Centro' },

            { strictPopulate: false, model: 'Cursos', path: 'Curso' },
          ],
        }
      )

      .populate(
        (query.populate === 'true' || query.populate?.indexOf('Users') > -1) && {
          strictPopulate: false,
          model: 'Users',
          path: 'Liked',

          populate: [
            { strictPopulate: false, model: 'Centros', path: 'Centros' },

            { strictPopulate: false, model: 'Provincias', path: 'Provincia' },

            { strictPopulate: false, model: 'Centros', path: 'Centro' },

            { strictPopulate: false, model: 'Cursos', path: 'Curso' },
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

// Delete a like with the specified ID in the request
exports.delete = (options) => {
  return new Promise((resolve, reject) => {
    const params = options.req ? options.req.params : options
    let theFilter = { _id: params.ID }

    if (options.queryString && options.queryField) {
      theFilter = { [options.queryField]: options.queryString }
    }
    Likes.deleteMany(theFilter)
      .then((result) => {
        resolve(result)
      })
      .catch((e) => {
        reject(e)
      })
  })
}
