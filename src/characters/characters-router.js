const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../logger');
const CharacterService = require('./character-service');
const xss = require('xss');
const { characters } = require('../store');

const characterRouter = express.Router()
const jsonParser = express.json()

const serializeCharacter = character => ({
    characterid: character.characterid,
    userId: character.userId,
    characterRole: character.characterRole,
    characterName: character.characterName,
    species: character.species,
    attributes: character.attributes,
    disciplines: character.disciplines,
    characterValue: character.characterValue
})

characterRouter
    .route('/')
    .get((req, res, next) => {
        CharacterService.getAllCharacters(
            req.app.get('db')
        )
        .then(characters => {
            res.json(characters.map(serializeCharacter))
        })
        .catch(next) 
    })
    .post(jsonParser, (req, res, next) => {
        const { characterid, userId, characterRole, characterName, species, attributes, disciplines, characterValue } = req.body;
        const newCharacter = { characterid, userId, characterRole, characterName, species, attributes, disciplines, characterValue };
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
    .route('/:characterId')
    .all((req, res, next) => {
        CharacterService.getById(
            req.app.get('db'),
            req.params.characterid
        )
        .then(character => {
            //Make sure we find the character
            if (!character) {
                logger.error(`Character with id ${characterid} not found.`);
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
            req.params.characterId
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { characterid, userId, characterRole, characterName, species, attributes, disciplines, characterValue } = req.body;
        const updateCharacter = { characterid, userId, characterRole, characterName, species, attributes, disciplines, characterValue };
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