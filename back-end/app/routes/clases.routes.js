module.exports = (app) => {
  const clases = require('../controllers/clases.controller.js')

  // Get all records
  app.get('/api/clases', (req, res) => {
    clases.findAll({ req, res })
  })

  // Search records
  app.get('/api/clases/search', (req, res) => {
    clases.find({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Retrieve a single record
  app.get('/api/clases/:ID', (req, res) => {
    clases.findOne({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Add a record
  app.post('/api/clases', (req, res) => {
    clases
      .createAsPromise({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(e.code || 500).send(e)
      })
  })

  // Update a record
  app.put('/api/clases/:ID', (req, res) => {
    clases
      .update({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })

  // Delete a record
  app.delete('/api/clases/:ID', (req, res) => {
    clases
      .delete({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })
}
