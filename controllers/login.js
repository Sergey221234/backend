const User = require('../models/user')

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Поиск пользователя по email и паролю
    const authenticatedUser = await User.findOne({ email, password })

    if (!authenticatedUser) {
      return res.status(401).json({ message: 'Неверные учетные данные' })
    }

    req.session.userId = authenticatedUser._id

    console.log(req.session.userId)

    req.session.save((err) => {
      if (err) {
        console.error('Ошибка сохранения сессии:', err)
      }
      console.log(req.session.userId)
      res.status(200).json({
        message: 'Аутентификация успешна',
        user: authenticatedUser,
      })
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
}
module.exports = login
