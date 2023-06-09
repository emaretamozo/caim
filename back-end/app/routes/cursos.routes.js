module.exports = (app) => {
  const cursos = require('../controllers/cursos.controller.js')

  // Get all records
  app.get('/api/cursos', (req, res) => {
    cursos.findAll({ req, res })
  })

  // Search records
  app.get('/api/cursos/search', (req, res) => {
    cursos.find({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Retrieve a single record
  app.get('/api/cursos/:ID', (req, res) => {
    cursos.findOne({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Add a record
  app.post('/api/cursos', (req, res) => {
    cursos
      .createAsPromise({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(e.code || 500).send(e)
      })
  })

  // Update a record
  app.put('/api/cursos/:ID', (req, res) => {
    cursos
      .update({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })

  // Delete a record
  app.delete('/api/cursos/:ID', (req, res) => {
    cursos
      .delete({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })
}
