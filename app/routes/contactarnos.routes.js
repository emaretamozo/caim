module.exports = (app) => {
  const contactarnos = require('../controllers/contactarnos.controller.js')

  // Get all records
  app.get('/api/contactarnos', (req, res) => {
    contactarnos.findAll({ req, res })
  })

  // Search records
  app.get('/api/contactarnos/search', (req, res) => {
    contactarnos.find({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Retrieve a single record
  app.get('/api/contactarnos/:ID', (req, res) => {
    contactarnos.findOne({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Add a record
  app.post('/api/contactarnos', (req, res) => {
    contactarnos
      .createAsPromise({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(e.code || 500).send(e)
      })
  })

  // Update a record
  app.put('/api/contactarnos/:ID', (req, res) => {
    contactarnos
      .update({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })

  // Delete a record
  app.delete('/api/contactarnos/:ID', (req, res) => {
    contactarnos
      .delete({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })
}
