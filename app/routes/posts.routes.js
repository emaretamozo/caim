module.exports = (app) => {
  const posts = require('../controllers/posts.controller.js')

  // Get all records
  app.get('/api/posts', (req, res) => {
    posts.findAll({ req, res })
  })

  // Search records
  app.get('/api/posts/search', (req, res) => {
    posts.find({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Retrieve a single record
  app.get('/api/posts/:ID', (req, res) => {
    posts.findOne({ req, res }).then((result) => {
      res.send(result)
    })
  })

  // Add a record
  app.post('/api/posts', (req, res) => {
    posts
      .createAsPromise({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(e.code || 500).send(e)
      })
  })

  // Update a record
  app.put('/api/posts/:ID', (req, res) => {
    posts
      .update({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })

  // Delete a record
  app.delete('/api/posts/:ID', (req, res) => {
    posts
      .delete({ req, res })
      .then((result) => {
        res.send(result)
      })
      .catch((e) => {
        res.status(500).send(e)
      })
  })
}
