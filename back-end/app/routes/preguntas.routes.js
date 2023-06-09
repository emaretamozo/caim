module.exports = (app) => {
  const preguntas = require('../controllers/preguntas.controller.js')

  // Get all records
  app.get('/api/preguntas', (req, res) => {
    preguntas.findAll({ req, res })
  })

  // Search records
  app.get('/api/preguntas/search', (req, res) => {
    preguntas.find({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Retrieve a single record
  app.get('/api/preguntas/:ID', (req, res) => {
    preguntas.findOne({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Add a record
  app.post('/api/preguntas', (req, res) => {
    preguntas
      .createAsPromise({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(e.code || 500).send(e)
      })
  })

  // Update a record
  app.put('/api/preguntas/:ID', (req, res) => {
    preguntas
      .update({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })

  // Delete a record
  app.delete('/api/preguntas/:ID', (req, res) => {
    preguntas
      .delete({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })
}
