const express = require('express')
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
    origin: 'https://admin-panel-chi-azure.vercel.app',
    credentials: true,
  })
)
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
    secret: 'moykluch32332!',
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      secure: true, // Установите true, если используете HTTPS
      expires: null,
      sameSite: 'Lax',
      path: '/',
    },
  })
)

app.use(router)

const PORT = process.env.PORT || 4001
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`)
})
