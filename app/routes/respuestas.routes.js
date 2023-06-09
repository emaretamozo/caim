module.exports = (app) => {
  const respuestas = require('../controllers/respuestas.controller.js')

  // Get all records
  app.get('/api/respuestas', (req, res) => {
    respuestas.findAll({ req, res })
  })

  // Search records
  app.get('/api/respuestas/search', (req, res) => {
    respuestas.find({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Retrieve a single record
  app.get('/api/respuestas/:ID', (req, res) => {
    respuestas.findOne({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Add a record
  app.post('/api/respuestas', (req, res) => {
    respuestas
      .createAsPromise({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(e.code || 500).send(e)
      })
  })

  // Update a record
  app.put('/api/respuestas/:ID', (req, res) => {
    respuestas
      .update({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })

  // Delete a record
  app.delete('/api/respuestas/:ID', (req, res) => {
    respuestas
      .delete({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })
}
