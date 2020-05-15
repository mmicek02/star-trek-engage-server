const express = require('express')
const AuthService = require('./auth-service')

const jsonBodyParser = express.json()
const authRouter = express.Router()

authRouter
    .post('/login', jsonBodyParser, (req, res, next) => {
        const { username, userpassword } = req.body
        const loginUser = { username, userpassword }
        console.log(loginUser)
        for (const [key, value] of Object.entries(loginUser)) 
            if (value == null )
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })

        AuthService.getUserWithUserName(
            req.app.get('db'),
            loginUser.username
        )
        .then(dbUser => {
            console.log(dbUser)
            if (!dbUser)
                return res.status(400).json({
                    error: { message: 'Incorrect username or password'},
                })
                
                return AuthService.comparePasswords(loginUser.userpassword, dbUser.userpassword)
                    .then(compareMatch => {
                        console.log(loginUser.userpassword, dbUser.userpassword, compareMatch)
                        if (!compareMatch)
                            return res.status(400).json({
                                error: { message: 'Incorrect username or password'}  
                                    ,
                    })

                    // return AuthService.comparePasswords(loginUser.userpassword, dbUser.userpassword)
                    //     .then(compareMatch => {
                    //         if (!compareMatch)
                    //             return res.status(400).json({
                    //                 error: 'Incorrect username or password'
                    //             })

                                const sub = dbUser.username
                                const payload = { userid: dbUser.userid }
                                res.send({
                                    userid: dbUser.userid,
                                    authToken: AuthService.createJwt(sub, payload)
                                })
                        //})
                   })
        })
        .catch(next)
  })

module.exports = authRouter