const dotenv = require('dotenv')
dotenv.config({ path: './config/.env.development' })
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const fileupload = require('express-fileupload')

const https = require('https')

const app = express()

app.set('filesFolder', __dirname + '/../dist/img')

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, XMLHttpRequest, authorization, *')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ limit: '10mb' }))
app.use(fileupload())
app.all('*', checkReq)
function checkReq(req, res, next) {
  if (req.files) {
    const keys = Object.keys(req.files)
    keys.forEach((key) => {
      const regex = /(.*)\[([0-9]*)\]/gm
      let m = regex.exec(key)
      if (m) {
        if (m[2] === '0') {
          req.body[m[1]] = []
          req.files[m[1]] = []
        }
        req.body[m[1]].push(req.files[key])
        req.files[m[1]].push(req.files[key])
        delete req.files[key]
      }
    })
  }
  next()
}

const dbConfig = require('./config/database.config.js')
const mongoose = require('mongoose')

mongoose.Promise = global.Promise

// Connecting to the database
mongoose.set('strictQuery', false)
mongoose
  .connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Successfully connected to the database')
  })
  .catch((err) => {
    console.log('Could not connect to the database. Exiting now...', err)
    // process.exit();
  })

require('./app/routes/apiRoutes.js')(app)

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

const nodemailer = require('nodemailer')
var transport = {
  host: 'smtp.gmail.com',
  port: '465',
  auth: {
    user: '',
    pass: '',
  },
}

var transporter = nodemailer.createTransport(transport)
transporter.verify((error, success) => {
  if (error) {
    console.log(error)
  } else {
    console.log('All works fine, congratz!')
  }
})
app.use(express.json())
app.set('sendEmail', async function (emailDetails, extra) {
  var mail = {
    from: emailDetails.name,
    to: emailDetails.email,
    subject: emailDetails.subject,
    html: emailDetails.message,
  }

  if (typeof addICal === 'function' && extra && extra.sendWithIcal) {
    addICal(mail, extra)
  }

  transporter.sendMail(mail, (err, data) => {
    if (err) {
      return { msg: 'fail' }
    } else {
      return { msg: 'success' }
    }
  })
})
app.post('/api/sendEmail', (req, res, next) => {
  const name = req.body.name
  const email = req.body.email
  const message = req.body.messageHtml
  const subject = req.body.subject
  res.json(app.get('sendEmail')({ name, email, message, subject }, req.body.extra))
})

app.use('/images', express.static(__dirname + '/../dist/img'))

let tries = 0

function doListen() {
  const port = 4567

  const server = app

    .listen(port, '0.0.0.0')
    .on('listening', () => {
      console.log(`Aptugo app listening on port ${port}!`)
    })
    .on('error', (err) => {
      if (err.errno === 'EADDRINUSE') {
        if (tries < 3) {
          console.log('Port busy, waiting a couple of seconds...')
          tries++
          setTimeout(doListen, 2000)
        } else {
          console.log('Tired of waiting, will kill the process...')
          exec(`kill -9 $(lsof -t -i:${port})`)
          setTimeout(doListen, 2000)
        }
      } else {
        console.log(err)
      }
    })
    .on('connection', (conn) => {
      console.log('connection')
    })
}

doListen()
