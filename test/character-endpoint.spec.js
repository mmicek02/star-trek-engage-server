const CharacterService = require('../src/characters/character-service')
const knex = require('knex');
const app = require('../src/app');
const { makeUserArray } = require('./users.fixture');
const { makeCharacterArray, makeMaliciousCharacter } = require('./character.fixture');

describe(`Character endpoints`, () => {
let db

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
    })

    before(() => db('characters').truncate())

    afterEach(() => db('characters').truncate())

    after(() => db.destroy())

    // Tests for when there are characters
    context(`Given 'characters' has data`, () => {
        const testCharacters = makeCharacterArray()
        beforeEach(() => {
            return db
                .into('characters')
                .insert(testCharacters)
        })
        // Tests for when there is data
        it(`getAllCharacters resolves all characters from 'characters' table`, () => {
            return CharacterService.getAllCharacters(db)
                .then(actual => {
                    expect(actual).to.eql(testCharacters)
                })
        })
        // Test for when we want to find a specific character using their 'characterid'
        it(`getById() resolves a character by 'characterid' from 'characters' table`, () => {
            const secondId = 2
            const secondTestCharacter = testCharacters[secondId -1]
            return CharacterService.getById(db, secondId)
                .then(actual => {
                    expect(actual).to.eql({
                        characterid: secondId,
                        userid: secondTestCharacter.userid,
                        characterrole: secondTestCharacter.characterrole,
                        charactername: secondTestCharacter.charactername,
                        species: secondTestCharacter.species,
                        attributes: secondTestCharacter.attributes,
                        disciplines: secondTestCharacter.disciplines,
                        charactervalue: secondTestCharacter.charactervalue,
                        equipment: secondTestCharacter.equipment,
                    })
                })
        })
        // Tests to delete a character with a certain 'characterid'
        it(`deleteCharacter() removes a character by 'characterid' from 'characters' table`, () => {
            const characterId = 2
            return CharacterService.deleteCharacter(db, characterId)
                .then(() => CharacterService.getAllCharacters(db))
                .then(allCharacters => {
                    testCharacters = [
                        {
                            characterid: 1,
                            userid: 1,
                            characterrole: 'Chief Engineer',
                            charactername: 'Captain Ty',
                            species: 'human',
                            attributes: [
                                11, 10, 9, 9, 8, 7
                            ],
                            disciplines: [
                                5, 4, 3, 3, 2, 2
                            ],
                            charactervalue: 'Smart',
                            equipment: 'phaser'
                        }
                    ]
                    const expected = testCharacters.filter(character => character.characterid !== characterId)
                    expect(allCharacters).to.eql(expected)
                })
        })
        // Tests to update a character with a certain 'characterid'
        it(`updateCharacter() updates a character from the 'characters' table`, () => {
            const idOfCharacterToUpdate = 1
            const newCharacterData = {
                userid: 1,
                characterrole: 'Chief Engineer',
                charactername: 'Captain Ty',
                species: 'human',
                attributes: [
                    11, 10, 9, 9, 8, 7
                ],
                disciplines: [
                    5, 4, 3, 3, 2, 2
                ],
                charactervalue: 'Smart',
                equipment: 'phaser'
            }
            return CharacterService.updateCharacter(db, idOfCharacterToUpdate, newCharacterData)
                .then(() => CharacterService.getById(db, idOfCharacterToUpdate))
                .then(character => {
                    expect(character).to.eql({
                        characterid: idOfCharacterToUpdate,
                        ...newCharacterData,
                    })
                })
        })
    })

    // Tests for when there no characters
    context(`Given 'characters' has no data`, () => {
        //Test for when there are no characters at all
        it(`getAllCharacters() resolves an empty array`, () => {
            return CharacterService.getAllCharacters(db)
                .then(actual => {
                    expect(actual).to.eql([])
                })
        })
        // Tests for when a new character is added and assigns it a new 'characterid'
        it(`insertCharacter() inserts a character and resolves the character with an 'characterid`, () => {
            const newCharacter = {
                userid: 1,
                characterrole: 'Chief Office',
                charactername: 'Mr. Vulcan',
                species: 'Vulcan',
                attributes: [
                    11, 10, 9, 9, 8, 7
                ],
                disciplines: [
                    5, 4, 3, 3, 2, 2
                ],
                charactervalue: 'Smart',
                equipment: 'Tricorder',
            }
            return CharacterService.insertCharacter(db, newCharacter)
                .then(actual => {
                    expect (actual).to.eql({
                        characterid: 1,
                        userid: newCharacter.userid,
                        characterrole: newCharacter.characterrole,
                        charactername: newCharacter.charactername,
                        species: newCharacter.species,
                        attributes: newCharacter.attributes,
                        disciplines: newCharacter.disciplines,
                        charactervalue: newCharacter.charactervalue,
                        equipment: newCharacter.equipment,
                    })
                })
        })
    })
})  
//     // describe(`GET /characters`, () => {
//     //     context(`give there are characters for that user`, () => {
//     //         const testCharacters = makeCharacterArray();
//     //         beforeEach(`insert characters`, () => {
//     //             return db
//     //                 .into('characters')
//     //                 .insert(testCharacters)
//     //         })
//     //         it(`should respond 200 and get the character list`, () => {
//     //             return supertest(app)
//     //                 .get(`/characters`)
//     //                 .expect(200, testCharacters)
//     //         })
//     //     })
//     //     context(`given no characters for user/database`, () => {
//     //         it(`responds 200 and returns an empty array`, () => {
//     //             return supertest(app)
//     //                 .get(`/characters`)
//     //                 .expect(200, [])
//     //         })
//     //     })
//     // })


//     // describe(`GET /characters/:characterId`, () => {
//     //     context(`given there are no characters in the database`, () => {
//     //         it(`should return 404 and give an error`, () => {
//     //             return supertest(app)
//     //             .get(`/characters/1`)
//     //             .expect(404, {
//     //                 error: {
//     //                     message: `Character doesn't exist.`
//     //                 }
//     //             })
//     //         })
//     //     })
//     //     context(`given there are characters in the database`, () => {
//     //         const testCharacters = makeCharacterArray();
//     //         beforeEach(`insert characters`, () => {
//     //             return db  
//     //                 .into('/characters')
//     //                 .expect(testCharacters)
//     //         })
//     //         it(`should repond 200 and return the correct character via its ID`, () => {
//     //             const idToGet = 2;
//     //             expectedCharacter = testCharacters[idToGet-1];
//     //             return supertest(app)
//     //                 .get(`/characters/${idToGet}`)
//     //                 .expect(200, expectedCharacter)
//     //         })
//     //     })
//     //     context(`given an XSS attack character`,()=>{
//     //         const { maliciousCharacter, expectedCharacter} = makeMaliciousCharacter();
//     //         beforeEach(`insert xss character`,()=>{
//     //             return db
//     //                 .into('characters')
//     //                 .insert(maliciousCharacter)
//     //         })
//     //         it(`should sanitize the note`,()=>{
//     //             return supertest(app)
//     //                 .get(`/characters/${maliciousCharacter.characterid}`)
//     //                 .expect(200, expectedCharacter)
//     //         })
//     //     })
//     // })