require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')

const {CLIENT_ORIGIN} = require('./config');

const { NODE_ENV } = require('./config')

const characterRouter = require('./characters/characters-router')
const userRouter = require('./users/users-router')
const authRouter = require('./Auth/auth-router')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

app.use('/api/characters', characterRouter)
app.use('/api/users', userRouter)
app.use('/api/auth', authRouter)

app.use(function errorHandle(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app