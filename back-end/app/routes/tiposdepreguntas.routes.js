module.exports = (app) => {
  const tiposdepreguntas = require('../controllers/tiposdepreguntas.controller.js')

  // Get all records
  app.get('/api/tiposdepreguntas', (req, res) => {
    tiposdepreguntas.findAll({ req, res })
  })

  // Search records
  app.get('/api/tiposdepreguntas/search', (req, res) => {
    tiposdepreguntas.find({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Retrieve a single record
  app.get('/api/tiposdepreguntas/:ID', (req, res) => {
    tiposdepreguntas.findOne({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Add a record
  app.post('/api/tiposdepreguntas', (req, res) => {
    tiposdepreguntas
      .createAsPromise({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(e.code || 500).send(e)
      })
  })

  // Update a record
  app.put('/api/tiposdepreguntas/:ID', (req, res) => {
    tiposdepreguntas
      .update({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })

  // Delete a record
  app.delete('/api/tiposdepreguntas/:ID', (req, res) => {
    tiposdepreguntas
      .delete({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })
}
