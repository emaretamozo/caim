module.exports = (app) => {
  const fotospublicitarias = require('../controllers/fotospublicitarias.controller.js')

  // Get all records
  app.get('/api/fotospublicitarias', (req, res) => {
    fotospublicitarias.findAll({ req, res })
  })

  // Search records
  app.get('/api/fotospublicitarias/search', (req, res) => {
    fotospublicitarias.find({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Retrieve a single record
  app.get('/api/fotospublicitarias/:ID', (req, res) => {
    fotospublicitarias.findOne({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Add a record
  app.post('/api/fotospublicitarias', (req, res) => {
    fotospublicitarias
      .createAsPromise({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(e.code || 500).send(e)
      })
  })

  // Update a record
  app.put('/api/fotospublicitarias/:ID', (req, res) => {
    fotospublicitarias
      .update({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })

  // Delete a record
  app.delete('/api/fotospublicitarias/:ID', (req, res) => {
    fotospublicitarias
      .delete({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })
}
