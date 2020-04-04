const express = require('express')
const AuthService = require('./auth-service')

const authRouter = express.Router()
const jsonBodyParser = express.json()

authRouter
    .route('/login')
    .post(jsonBodyParser, (req, res, next) => {
        const {username, userpassword} = req.body
        const loginUser = { username, userpassword }
    for (const [key, value] of Object.entries(loginUser))
        if (value == null)
            return res.status(401).json({ 
                error: `Missing '${key}' in request body` 
            })

    AuthService.getUserWithUserName(
        req.app.get('db'),
        loginUser.username
    )
    .then(user => {
        if (!user || !bcrypt.compareSync(userpassword, user.userpassword))
            return res.status(401).json({ 
                error: 'Incorrect user_name or password',
            })

        return AuthService.comparePasswords(loginUser.userpassword, user.userpassword)
            .then(compareMatch => {
                if(!compareMatch)
                    return res.status(400).json({
                        error: 'Incorrect user_name or password',
                    })
                const sub = user.username
                const payload = { userid: user.userid }
                res.send({
                    authToken: AuthService.createJwt(sub, payload),
                })
            })
        })
        .catch(next)
    })
module.exports = authRouter