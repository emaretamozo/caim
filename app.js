const dotenv = require('dotenv')
dotenv.config({ path: './config/.env.development' })

const express = require('express')
const bodyParser = require('body-parser')
const fileupload = require('express-fileupload')

const app = express()

app.set('filesFolder', __dirname + '/../dist/img')

//Como hostear react directo desde express? Asi --> 
//Primero le decimos a express que use todos los archivos del build de react asi:
app.use(express.static(__dirname + "/build"));
//Luego le decimos a express que sirva todo eso desde el home
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/build", "index.html"))
});

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, XMLHttpRequest, authorization, *')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ limit: '10mb' }))
app.use(fileupload())

const dbConfig = require('./config/database.config.js')
const mongoose = require('mongoose')

mongoose.Promise = global.Promise

// Connecting to the database
mongoose.set('strictQuery', false)
mongoose
  .connect(dbConfig.url, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log('Successfully connected to the database')
  })
  .catch((err) => {
    console.log('Could not connect to the database. Exiting now...', err)
    // process.exit();
  })

require('./app/routes/centros.routes.js')(app)

require('./app/routes/provincias.routes.js')(app)

require('./app/routes/cursos.routes.js')(app)

require('./app/routes/certificaciones.routes.js')(app)

require('./app/routes/modulos.routes.js')(app)

require('./app/routes/clases.routes.js')(app)

require('./app/routes/preguntas.routes.js')(app)

require('./app/routes/tiposdepreguntas.routes.js')(app)

require('./app/routes/respuestas.routes.js')(app)

require('./app/routes/ejercicios.routes.js')(app)

require('./app/routes/categorias.routes.js')(app)

require('./app/routes/posts.routes.js')(app)

require('./app/routes/users.routes.js')(app)

require('./app/routes/likes.routes.js')(app)

require('./app/routes/contactarnos.routes.js')(app)

require('./app/routes/fotospublicitarias.routes.js')(app)

require('./app/routes/zonas.routes.js')(app)

app.use('/images', express.static(__dirname + '/../dist/img'))

module.exports = app
