const path = require('path')
const express = require('express');
const UsersService = require('./users-service');

const userRouter = express.Router()
const jsonParser = express.json()

const bcrypt = require('bcryptjs')

const serializeUser = user => ({
    userid: user.userid,
    username: user.username,
    userpassword: user.userpassword,
})

userRouter
    .route('/')
    .get((req, res, next) => {
        const knexIntance = req.app.get('db')
        UsersService.getAllUsers(knexIntance)
            .then(users => {
                res.json(users.map(serializeUser))
            })
            .catch(next) 
    })
    .post(jsonParser, (req, res, next) => {
        console.log(req.body)
        const { username, userpassword } = req.body;
        const newUser = { username, userpassword: userpassword };
        
        for (const [key, value] of Object.entries(newUser)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

        const passwordError = UsersService.validatePassword(userpassword)
        
        if (passwordError)
            return res.status(400).json({ error: passwordError })
        
        UsersService.hasUserWithUserName(
            req.app.get('db'),
            username
        )
            .then(hasUserWithUserName => {
                if (hasUserWithUserName)
                    return res.status(400).json({ error: `Username already taken` })
            
                return UsersService.hashPassword(userpassword)
                    .then(hashPassword => {
                        const newUser = {
                            username,
                            userpassword: hashPassword,
                        }
                        console.log(newUser)
                return UsersService.insertUser(
                    req.app.get('db'),
                    newUser
                )
                    .then(user => { console.log('Test')
                        res
                            .status(201)
                            .location(path.posix.join(req.originalUrl, `/${user.userid}`))
                            .json(UsersService.serializeUser(user))
                    })
                    })
            })   
            .catch(next)
    })

userRouter
    .route('/:userid')
    .all((req, res, next) => {
        UsersService.getById(
            req.app.get('db'),
            req.params.userid
        )
            .then(user => {
                if (!user) {
                    return res.status(404).json({
                        error: { 
                            message: `User does not exist` 
                        }
                    })
                }
                res.user = user // save the user for the next middleware
                next()
            })
            .catch(next)
        })
    .get((req, res, next) => {
        res.json(serializeUser(res.user)) 
    })

    .delete((req, res, next) => {
        UsersService.deleteUser(
            req.app.get('db'),
            req.params.userid
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = userRouter;