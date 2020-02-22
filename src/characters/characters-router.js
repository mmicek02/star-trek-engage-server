const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../logger');
const CharacterService = require('./character-service');
const xss = require('xss');
const { characters } = require('../store');

const characterRouter = express.Router()
const jsonParser = express.json()

const serializeCharacter = character => ({
    id: character.id,
    role: character.role,
    species: character.species,
    value: character.value,
    name: character.name,
    userId: character.userId
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
        const { role, species, value, name, userId } = req.body;
        const newCharacter = { role, species, value, name, userId };
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
                .location(req.originalUrl + `/${character.id}`)
                .json(serializeCharacter(character))
        })
        .catch(next)
    })

characterRouter
    .route('/:characterId')
    .all((req, res, next) => {
        CharacterService.getById(
            req.app.get('db'),
            req.params.characterId
        )
        .then(character => {
            //Make sure we find the character
            if (!character) {
                logger.error(`Character with id ${characterId} not found.`);
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
        const { role, species, value, name, userId } = req.body;
        const updateCharacter = { role, species, value, name, userId };
        for (const [key, value] of Object.entries(updateCharacter)) {
            if(value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }
        CharacterService.updateCharacter(
            req.app.get('db'),
            req.params.characterId,
            updateCharacter
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = characterRouter;