const path = require('path')
const express = require('express');
const UsersService = require('./users-service');

const usersRouter = express.Router()
const jsonParser = express.json()

const serializeUser = user => ({
    userid: user.userid,
    username: user.username,
    userpassword: user.userpassword,
})

usersRouter
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
        const { userid, username, userpassword } = req.body;
        const newUsers = { userid, username, userpassword };
        
        for (const [key, value] of Object.entries(newUsers)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }
        
        UsersService.insertUser(
            req.app.get('db'),
            newUsers
        )
            .then(user => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `${user.userid}`))
                    .json(user)
            })
            .catch(next)
    })

usersRouter
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