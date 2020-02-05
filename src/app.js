require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const uuid = require('uuid/v4');
const characterRouter = require('./characters/characters-router')
require('dotenv').config()
const knex = require('knex')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';


const knexIntance = knex({
    client: 'pg',
    connection: process.env.DB_URL,
})

console.log('knex and driver installed correctly')

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

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

app.use(function validateBearerToken( req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Athorization')

    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        logger.error(`Unathorized request to path ${req.path}`);
        return res.status(401).json({ error: 'Unathorized request' })
    }
    next()
})

app.use(characterRouter)

module.exports = app