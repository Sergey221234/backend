const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)

const router = require('./routes/index')

const app = express()
app.use(express.json())

const allowedOrigins = ['https://admin-panel-chi-azure.vercel.app']

app.use(
  cors({
    origin: function (origin, callback) {
      // Проверьте, разрешен ли origin
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true, // Разрешить передачу куки и заголовков аутентификации
  })
)
mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB подключена')
  })
  .catch((err) => {
    console.error('Ошибка подключения к MongoDB:', err)
  })

const store = new MongoDBStore({
  uri: process.env.DB,
  collection: 'sessions',
  client: mongoose.connection,
})

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      secure: true, // Установите true, если используете HTTPS
      expires: new Date(Date.now() + 3600000), // Настройте срок действия куки
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
