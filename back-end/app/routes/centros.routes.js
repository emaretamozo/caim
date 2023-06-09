module.exports = (app) => {
  const centros = require('../controllers/centros.controller.js')

  // Get all records
  app.get('/api/centros', (req, res) => {
    centros.findAll({ req, res })
  })

  // Search records
  app.get('/api/centros/search', (req, res) => {
    centros.find({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Retrieve a single record
  app.get('/api/centros/:ID', (req, res) => {
    centros.findOne({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Add a record
  app.post('/api/centros', (req, res) => {
    centros
      .createAsPromise({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(e.code || 500).send(e)
      })
  })

  // Update a record
  app.put('/api/centros/:ID', (req, res) => {
    centros
      .update({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })

  // Delete a record
  app.delete('/api/centros/:ID', (req, res) => {
    centros
      .delete({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })
}
