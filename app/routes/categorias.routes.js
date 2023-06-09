module.exports = (app) => {
  const categorias = require('../controllers/categorias.controller.js')

  // Get all records
  app.get('/api/categorias', (req, res) => {
    categorias.findAll({ req, res })
  })

  // Search records
  app.get('/api/categorias/search', (req, res) => {
    categorias.find({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Retrieve a single record
  app.get('/api/categorias/:ID', (req, res) => {
    categorias.findOne({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Add a record
  app.post('/api/categorias', (req, res) => {
    categorias
      .createAsPromise({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(e.code || 500).send(e)
      })
  })

  // Update a record
  app.put('/api/categorias/:ID', (req, res) => {
    categorias
      .update({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })

  // Delete a record
  app.delete('/api/categorias/:ID', (req, res) => {
    categorias
      .delete({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })
}
