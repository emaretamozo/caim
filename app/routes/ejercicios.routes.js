module.exports = (app) => {
  const ejercicios = require('../controllers/ejercicios.controller.js')

  // Get all records
  app.get('/api/ejercicios', (req, res) => {
    ejercicios.findAll({ req, res })
  })

  // Search records
  app.get('/api/ejercicios/search', (req, res) => {
    ejercicios.find({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Retrieve a single record
  app.get('/api/ejercicios/:ID', (req, res) => {
    ejercicios.findOne({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Add a record
  app.post('/api/ejercicios', (req, res) => {
    ejercicios
      .createAsPromise({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(e.code || 500).send(e)
      })
  })

  // Update a record
  app.put('/api/ejercicios/:ID', (req, res) => {
    ejercicios
      .update({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })

  // Delete a record
  app.delete('/api/ejercicios/:ID', (req, res) => {
    ejercicios
      .delete({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })
}
