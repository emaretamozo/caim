module.exports = (app) => {
  const likes = require('../controllers/likes.controller.js')

  // Get all records
  app.get('/api/likes', (req, res) => {
    likes.findAll({ req, res })
  })

  // Search records
  app.get('/api/likes/search', (req, res) => {
    likes.find({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Retrieve a single record
  app.get('/api/likes/:ID', (req, res) => {
    likes.findOne({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Add a record
  app.post('/api/likes', (req, res) => {
    likes
      .createAsPromise({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(e.code || 500).send(e)
      })
  })

  // Update a record
  app.put('/api/likes/:ID', (req, res) => {
    likes
      .update({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })

  // Delete a record
  app.delete('/api/likes/:ID', (req, res) => {
    likes
      .delete({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })
}
