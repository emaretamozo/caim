module.exports = (app) => {
  const zonas = require('../controllers/zonas.controller.js')

  // Get all records
  app.get('/api/zonas', (req, res) => {
    zonas.findAll({ req, res })
  })

  // Search records
  app.get('/api/zonas/search', (req, res) => {
    zonas.find({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Retrieve a single record
  app.get('/api/zonas/:ID', (req, res) => {
    zonas.findOne({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Add a record
  app.post('/api/zonas', (req, res) => {
    zonas
      .createAsPromise({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(e.code || 500).send(e)
      })
  })

  // Update a record
  app.put('/api/zonas/:ID', (req, res) => {
    zonas
      .update({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })

  // Delete a record
  app.delete('/api/zonas/:ID', (req, res) => {
    zonas
      .delete({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })
}
