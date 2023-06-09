module.exports = (app) => {
  const certificaciones = require('../controllers/certificaciones.controller.js')

  // Get all records
  app.get('/api/certificaciones', (req, res) => {
    certificaciones.findAll({ req, res })
  })

  // Search records
  app.get('/api/certificaciones/search', (req, res) => {
    certificaciones.find({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Retrieve a single record
  app.get('/api/certificaciones/:ID', (req, res) => {
    certificaciones.findOne({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Add a record
  app.post('/api/certificaciones', (req, res) => {
    certificaciones
      .createAsPromise({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(e.code || 500).send(e)
      })
  })

  // Update a record
  app.put('/api/certificaciones/:ID', (req, res) => {
    certificaciones
      .update({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })

  // Delete a record
  app.delete('/api/certificaciones/:ID', (req, res) => {
    certificaciones
      .delete({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })

  // BuscadorCertificaciones
  app.post('/api/certificaciones/buscadorcertificaciones', (req, res) => {
    const ObjectID = require('mongoose').Types.ObjectId
    const Certificaciones = require('../models/certificaciones.model.js')

    const queryCondicional = []

    if (req.body.Nombre) {
      queryCondicional.push({ Nombre: req.body.Nombre })
    }
    if (req.body.CUV) {
      queryCondicional.push({ CUV: req.body.CUV })
    }
    if (req.body.Curso) {
      queryCondicional.push({ Curso: new ObjectID(req.body.Curso) })
    }

    let varAgregate = [
      {
        $lookup: {
          from: 'cursos',
          localField: 'Curso',
          foreignField: '_id',
          as: 'resultCursos',
        },
      },
      {
        $project: {
          CUV: 1,
          Nombre: 1,
          Curso: '$resultCursos',
          DNI: 1,
        },
      },
    ]
    if (queryCondicional.length) {
      varAgregate.unshift({
        $match: {
          $and: queryCondicional,
        },
      })
      Certificaciones.aggregate(varAgregate).then((result) => {
        res.send(result)
        console.log(result)
      })
    } else {
      res.send([])
    }
  })
}
