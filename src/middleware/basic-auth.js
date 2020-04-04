const AuthService = require('../Auth/auth-service')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function requireAuth(req, res, next) {
    const authToken = req.get('Authorization') || ''
    
    let token

    if (!authToken.toLowerCase().startsWith('bearer ')) {
      return res.status(401).json({ error: 'Missing bearer token' })
    } else {
        token = authToken.slice('bearer '.length)
    }
    
    try {
        const data = jwt.verify(token, 'secret', { algorithms: ['HS256'] })
        console.log(data)
        req.userid = data.userid

     } catch (e) {
        return res.status(401).json({error: "Unauthorized request"});
     }
     return next()


  }
  // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjYsImlhdCI6MTU4NTg3NDI5Mywic3ViIjoiS2V2aW5TbWl0aCJ9.Xb0_7hG3c2M9cIZb1Qt9AmYk1DPHDLJojlrbm3spDeA
  module.exports = {
    requireAuth,
  }