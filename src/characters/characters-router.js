const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const { characters } = require('../store')

const characterRouter = express.Router()
const bodyParser = express.json()

characterRouter
    .route('/characters')
    .get((req, res) => {
        res.json(characters);
    })

characterRouter
    .route('/characters/add-character')
    .post(bodyParser, (req, res) => {
        // create a new character
        const {userId, characterId, role, attributes, species, disciplines, value, name=false} = req.body;
        console.log(req.body)
        if (!characterId) {
            logger.error(`Character ID required`);
            return res
            .status(400)
            .send('CharacterId required');
        }
        if (!role) {
            logger.error(`Role required`);
            return res
            .status(400)
            .send('Role required');
        }
        if (!attributes) {
            logger.error(`Attributes required`);
            return res
            .status(400)
            .send('Attributes required');
        }
        if (!species) {
            logger.error(`Species required`);
            return res
            .status(400)
            .send('Species required');
        }
        if (!disciplines) {
            logger.error(`Disciplines required`);
            return res
            .status(400)
            .send('Disciplines required');
        }
        if (!value) {
            logger.error(`value required`);
            return res
            .status(400)
            .send('value required');
        }

        const id = uuid();
        const newCharacter = {        
        userId,
        characterId,
        role,
        attributes,
        species,
        disciplines,
        value,
        equipment
        };

    characters.push(newCharacter);

    logger.info(`Character with id ${id} created`)

    res
        .status(204)
        .location(`http://localhost:8000/${id}`)
        .send('All validation passed')
        .end();
        })

characterRouter
    .route('/characters/:characterId')
    .get((req, res) => {
        const { characterId } = req.params;
        const character = characters.find(c => c.characterId == characterId);
    
        //Make sure we find the character
        if (!character) {
            logger.error(`Character with id ${characterId} not found.`);
            return res
                .status(404)
                .send('Character Not Found');
        }
    
        res.json(character)
    })
    .delete((req, res) => {
        const { characterId } = req.params;

        const index = characters.findIndex(c = c.id === characterId);
    
        if (index === -1) {
            return res
                .status(404)
                .send('User not found');
        }
        characters.splice(index, 1);
    
        res
            .status(204)
            .end();
    })

module.exports = characterRouter