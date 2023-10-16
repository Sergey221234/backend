const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)

const router = require('./routes/index')

const app = express()
app.use(express.json())

app.use(
  cors({
    origin: 'https://app.n2stools.com',
    credentials: true,
  })
)
const root = path.join(__dirname, 'build')
app.use(express.static(root))
mongoose
  .connect(
    'mongodb+srv://szaprudskyi:g03n7bjxmu@cluster0.m91emua.mongodb.net/?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log('MongoDB подключена')
  })
  .catch((err) => {
    console.error('Ошибка подключения к MongoDB:', err)
  })

const store = new MongoDBStore({
  uri: 'mongodb+srv://szaprudskyi:g03n7bjxmu@cluster0.m91emua.mongodb.net/?retryWrites=true&w=majority',
  collection: 'sessions',
  client: mongoose.connection,
})

app.use(
  session({
    secret: 'moykluch2dssd@',
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      secure: true, // Установите true, если используете HTTPS
      expires: null,
      sameSite: 'None',
      path: '/',
    },
  })
)

app.use(router)
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})
const PORT = process.env.PORT || 4001
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`)
})
