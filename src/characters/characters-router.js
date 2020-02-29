const express = require('express');
const xss = require('xss');
const CharacterService = require('./character-service');

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
    .post(jsonParser, (req, res, next) => {
        const { userid, characterrole, charactername, species, attributes, disciplines, charactervalue, equipment } = req.body;
        const newCharacter = { userid, characterrole, charactername, species, attributes, disciplines, charactervalue, equipment };
        
        for (const [key, value] of Object.entries(newCharacter)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }
        
        CharacterService.insertCharacter(
            req.app.get('db'),
            newCharacter
        )
            .then(character => {
                res
                    .status(201)
                    .location(`/characters/${character.characterid}`)
                    .json(character)
            })
            .catch(next)
    })

characterRouter
    .route('/:characterid')
    .all((req, res, next) => {
        CharacterService.getById(
            req.app.get('db'),
            req.params.characterid
        )
            .then(character => {
                if (!character) {
                    return res.status(404).json({
                        error: { message: `Character does not exist` }
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
        const { characterid, userid, characterrole, charactername, species, attributes, disciplines, charactervalue } = req.body;
        const updateCharacter = { characterid, userid, characterrole, charactername, species, attributes, disciplines, charactervalue };
        for (const [key, value] of Object.entries(updateCharacter)) {
            if(value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }
        CharacterService.updateCharacter(
            req.app.get('db'),
            req.params.characterid,
            updateCharacter
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = characterRouter;