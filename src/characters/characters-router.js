const express = require('express');
const uuid = require('uuid/v4');
const CharacterService = require('./character-service');
const xss = require('xss');

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
    charactervalue: character.charactervalue
})

characterRouter
    .route('/')
    .get((req, res, next) => {
        const knexIntance = req.app.get('db')
        CharacterService.getAllCharacters(knexIntance)
            .then(characters => {
                res.json(characters)
            })
        .then(characters => {
            res.json(characters.map(serializeCharacter))
        })
        .catch(next) 
    })
    .post(jsonParser, (req, res, next) => {
        const { characterid, userid, characterrole, charactername, species, attributes, disciplines, charactervalue } = req.body;
        const newCharacter = { characterid, userid, characterrole, charactername, species, attributes, disciplines, charactervalue };
        for (const [key, value] of Object.entries(newCharacter)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing ${key} is request body`}
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
                .location(req.originalUrl + `/${character.characterid}`)
                .json(serializeCharacter(character))
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
            //Make sure we find the character
            if (!character) {
                return res.status(404).json({
                    error: { error: `Character does not exsist.`}
                })
            }  
            res.character = character;
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeCharacter(res.character));
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