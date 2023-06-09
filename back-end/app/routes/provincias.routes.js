module.exports = (app) => {
  const provincias = require('../controllers/provincias.controller.js')

  // Get all records
  app.get('/api/provincias', (req, res) => {
    provincias.findAll({ req, res })
  })

  // Search records
  app.get('/api/provincias/search', (req, res) => {
    provincias.find({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Retrieve a single record
  app.get('/api/provincias/:ID', (req, res) => {
    provincias.findOne({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Add a record
  app.post('/api/provincias', (req, res) => {
    provincias
      .createAsPromise({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(e.code || 500).send(e)
      })
  })

  // Update a record
  app.put('/api/provincias/:ID', (req, res) => {
    provincias
      .update({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })

  // Delete a record
  app.delete('/api/provincias/:ID', (req, res) => {
    provincias
      .delete({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })
}
