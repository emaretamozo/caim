module.exports = (app) => {
  const modulos = require('../controllers/modulos.controller.js')

  // Get all records
  app.get('/api/modulos', (req, res) => {
    modulos.findAll({ req, res })
  })

  // Search records
  app.get('/api/modulos/search', (req, res) => {
    modulos.find({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Retrieve a single record
  app.get('/api/modulos/:ID', (req, res) => {
    modulos.findOne({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Add a record
  app.post('/api/modulos', (req, res) => {
    modulos
      .createAsPromise({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(e.code || 500).send(e)
      })
  })

  // Update a record
  app.put('/api/modulos/:ID', (req, res) => {
    modulos
      .update({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })

  // Delete a record
  app.delete('/api/modulos/:ID', (req, res) => {
    modulos
      .delete({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })
}
