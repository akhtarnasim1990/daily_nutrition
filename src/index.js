const express = require('express')
const mongoose = require('mongoose')
require('./db/mongoose')
// const User = require('./models/user')
// const Meal = require('./models/meal')
const userRouter = require('./routers/user')
const mealRouter = require('./routers/meal')

const app = express()
const port = process.env.PORT || 8080

app.use(express.json())
app.use(userRouter)
app.use(mealRouter)

app.listen(port , () => {
    console.log('Server is on up port ' + port)
})