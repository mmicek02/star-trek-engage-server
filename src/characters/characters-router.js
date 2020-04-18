const path = require('path')
const express = require('express');
const CharacterService = require('./character-service');
const { requireAuth } = require('../middleware/jwt-auth')

const characterRouter = express.Router()
const jsonParser = express.json()

const serializeCharacter = character => ({
    characterid: character.characterid,
    userid: character.userid,
    characterrole: character.characterrole,
    charactername: character.charactername,
    species: character.species,
    attributes: character.attributes,
    disciplines: character.disciplines,
    charactervalue: character.charactervalue,
    equipment: character.equipment,
})

characterRouter
    .route('/')
    .get((req, res, next) => {
        const knexIntance = req.app.get('db')
        CharacterService.getAllCharacters(knexIntance)
            .then(characters => {
                res.json(characters.map(serializeCharacter))
            })
            .catch(next) 
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { characterrole, charactername, species, attributes, disciplines, charactervalue, equipment } = req.body;
        const newCharacter = { characterrole, charactername, species, attributes, disciplines, charactervalue, equipment };
        
        for (const [key, value] of Object.entries(newCharacter)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }
        newCharacter.userid = req.user.userid

        CharacterService.insertCharacter(
            req.app.get('db'),
            newCharacter
        )
            .then(character => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `${character.characterid}`))
                    .json(character)
            })
            .catch(next)
    })

characterRouter
    .route('/:characterid')
    .all(requireAuth)
    .all((req, res, next) => {
        CharacterService.getById(
            req.app.get('db'),
            req.params.characterid
        )
            .then(character => {
                if (!character) {
                    return res.status(404).json({
                        error: { 
                            message: `Character does not exist` 
                        }
                    })
                }
                res.character = character // save the character for the next middleware
                next()
            })
            .catch(next)
        })
    .get((req, res, next) => {
        res.json(serializeCharacter(res.character)) 
    })

    .delete((req, res, next) => {
        CharacterService.deleteCharacter(
            req.app.get('db'),
            req.params.characterid
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })

    .patch(jsonParser, (req, res, next) => {
        const { characterid, userid, characterrole, charactername, species, attributes, disciplines, charactervalue, equipment} = req.body;
        const characterToUpdate = { characterid, userid, characterrole, charactername, species, attributes, disciplines, charactervalue, equipment };
        
        const numberOfValues = Object.values(characterToUpdate).filter(Boolean).length            
            if(numberOfValues === 0) {
                return res.status(400).json({
                    error: { 
                        message: `Request body must contain either 'characterrole', 'species', 'charactervalue' or 'charactername'`
                    }
                })
            }
        
        CharacterService.updateCharacter(
            req.app.get('db'),
            req.params.characterid,
            characterToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = characterRouter;