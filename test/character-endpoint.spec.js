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
        app.set('db', db)
    })

    after(() => db.destroy())

    before(() => db('characters').truncate())

    afterEach(() => db('characters').truncate())

    // Tests for when there are characters
    describe(`GET /characters`, () => {
        context(`Given no characters`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/characters')
                    .expect(200, [])
            })
        })
        context(`Given 'characters' has data`, () => {
            const testCharacters = makeCharacterArray()
            beforeEach('insert characters', () => {
                return db
                    .into('characters')
                    .insert(testCharacters)
            })
            // Tests for when there is data
            it(`responds with 200 and all characters from 'characters' table`, () => {
                return supertest(app)
                   .get('/characters')
                   .expect(200, testCharacters)
            })
        })
        context(`Given an XSS attack character`, () => {
            const { maliciousCharacter, expectedCharacter} = makeMaliciousCharacter()

            beforeEach('insert malicious article', () => {
                return db
                    .into('characters')
                    .insert(maliciousCharacter)
            })

            it(`removes XSS attack content`, () => {
                return supertest(app)
                    .get(`/characters/${maliciousCharacter.characterid}`)
                    .expect(200, expectedCharacter)
            })
        })
    })

    describe(`POST /characters`, () => {
        it(`creates a character, responding with 201 and the new character`, () => {
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
            return supertest(app)
            .post('/characters')
            .send(newCharacter)
            .expect(201)
            .expect(res => {
                expect(res.body.userid).to.eql(newCharacter.userid)
                expect(res.body.characterrole).to.eql(newCharacter.characterrole)
                expect(res.body.charactername).to.eql(newCharacter.charactername)
                expect(res.body.species).to.eql(newCharacter.species)
                expect(res.body.attributes).to.eql(newCharacter.attributes)
                expect(res.body.disciplines).to.eql(newCharacter.disciplines)
                expect(res.body.charactervalue).to.eql(newCharacter.charactervalue)
                expect(res.body.equipment).to.eql(newCharacter.equipment)
                expect(res.body).to.have.property('characterid')
                expect(res.headers.location).to.eql(`/characters/${res.body.characterid}`)
            })
            .then(res => 
                supertest(app)
                    .get(`/characters/${res.body.characterid}`)
                    .expect(res.body)
            )
        })

        const requiredFields = ['userid', 'characterrole', 'charactername', 'species', 'attributes', 'disciplines', 'charactervalue', 'equipment']

        requiredFields.forEach(field => {
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
            
            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newCharacter[field]
    
                return supertest(app)
                    .post('/characters')
                    .send(newCharacter)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    })
            })
        })
    })

    describe(`GET /characters/:characterid`, () => {
        context(`Given no characters`, () => {
            it(`responds with 404`, () => {
                const characterId = 123456
                return supertest(app)
                    .get(`/character/${characterId}`)
                    .expect(404, {
                        error: { message: `Character does not exist` }
                    })
            })
        })
        context('Given there are characters in the database', () => {
            const testCharacters = makeCharacterArray()
            
            beforeEach('insert characters', () => {
                return db
                    .into('characters')
                    .insert(testCharacters)
            })

            it('responds with 200 and the specified article', () => {
                const characterId = 2
                const expectedCharacter = testCharacters[characterId -1]
                return supertest(app)
                    .get(`/characters/${characterId}`)
                    .expect(200, expectedCharacter)
            })
        })

        context(`Given an XSS attack character`, () => {
            const { maliciousCharacter, expectedCharacter} = makeMaliciousCharacter()

            beforeEach('insert malicious article', () => {
                return db
                    .into('characters')
                    .insert(maliciousCharacter)
            })

            it(`removes XSS attack content`, () => {
                return supertest(app)
                    .get(`/characters/${maliciousCharacter.characterid}`)
                    .expect(200, expectedCharacter)
            })
        })
    })

    describe(`DELETE /characters/:characterid`, () => {
        context(`Given there are characters in the database`, () => {
            const testCharacters = makeCharacterArray()

            beforeEach('insert characters', () => {
                return db
                    .into('characters')
                    .insert(testCharacters)
            })

            it('responds with 204 and removes the character', () => {
                const idToRemove = 2
                const expectedCharacters = testCharacters.filter(character => character.characterid !== idToRemove)
                return supertest(app)
                    .delete(`/characters/${idToRemove}`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get(`/characters`)
                        .expect(expectedCharacters)
                    )
            })
        })

        context(`Given no articles`, () => {
            it(`responds with 404`, () => {
                const characterId = 123456
                return supertest(app)
                    .delete(`/characters/${characterId}`)
                    .expect(404, {
                        error: { message: `Character does not exist` }
                    })
            })
        })
    })
})


//         // Tests to delete a character with a certain 'characterid'
//         it(`deleteCharacter() removes a character by 'characterid' from 'characters' table`, () => {
//             const characterId = 2
//             return CharacterService.deleteCharacter(db, characterId)
//                 .then(() => CharacterService.getAllCharacters(db))
//                 .then(allCharacters => {
//                     testCharacters = [
//                         {
//                             characterid: 1,
//                             userid: 1,
//                             characterrole: 'Chief Engineer',
//                             charactername: 'Captain Ty',
//                             species: 'human',
//                             attributes: [
//                                 11, 10, 9, 9, 8, 7
//                             ],
//                             disciplines: [
//                                 5, 4, 3, 3, 2, 2
//                             ],
//                             charactervalue: 'Smart',
//                             equipment: 'phaser'
//                         }
//                     ]
//                     const expected = testCharacters.filter(character => character.characterid !== characterId)
//                     expect(allCharacters).to.eql(expected)
//                 })
//         })
//         // Tests to update a character with a certain 'characterid'
//         it(`updateCharacter() updates a character from the 'characters' table`, () => {
//             const idOfCharacterToUpdate = 1
//             const newCharacterData = {
//                 userid: 1,
//                 characterrole: 'Chief Engineer',
//                 charactername: 'Captain Ty',
//                 species: 'human',
//                 attributes: [
//                     11, 10, 9, 9, 8, 7
//                 ],
//                 disciplines: [
//                     5, 4, 3, 3, 2, 2
//                 ],
//                 charactervalue: 'Smart',
//                 equipment: 'phaser'
//             }
//             return CharacterService.updateCharacter(db, idOfCharacterToUpdate, newCharacterData)
//                 .then(() => CharacterService.getById(db, idOfCharacterToUpdate))
//                 .then(character => {
//                     expect(character).to.eql({
//                         characterid: idOfCharacterToUpdate,
//                         ...newCharacterData,
//                     })
//                 })
//         })
//         // Test for when XSS attack characters present
//         context(`Given an XSS attack character`, () => {
//         const { maliciousCharacter, expectedCharacter} = makeMaliciousCharacter()

//         beforeEach('insert malicious article', () => {
//             return db
//                 .into('characters')
//                 .insert(maliciousCharacter)
//         })

//         it(`removes XSS attack content`, () => {
//             return supertest(app)
//                 .get(`/characters/${maliciousCharacter.characterid}`)
//                 .expect(200, expectedCharacter)
//         })
//     })
//     })
//     // Tests for when there no characters
//     context(`Given 'characters' has no data`, () => {
//         //Test for when there are no characters at all
//         it(`getAllCharacters() resolves an empty array`, () => {
//             return CharacterService.getAllCharacters(db)
//                 .then(actual => {
//                     expect(actual).to.eql([])
//                 })
//         })
//         // Tests for when a new character is added and assigns it a new 'characterid'
//         it(`insertCharacter() inserts a character and resolves the character with an 'characterid`, () => {
//             const newCharacter = {
//                 userid: 1,
//                 characterrole: 'Chief Office',
//                 charactername: 'Mr. Vulcan',
//                 species: 'Vulcan',
//                 attributes: [
//                     11, 10, 9, 9, 8, 7
//                 ],
//                 disciplines: [
//                     5, 4, 3, 3, 2, 2
//                 ],
//                 charactervalue: 'Smart',
//                 equipment: 'Tricorder',
//             }
//             return CharacterService.insertCharacter(db, newCharacter)
//                 .then(actual => {
//                     expect (actual).to.eql({
//                         characterid: 1,
//                         userid: newCharacter.userid,
//                         characterrole: newCharacter.characterrole,
//                         charactername: newCharacter.charactername,
//                         species: newCharacter.species,
//                         attributes: newCharacter.attributes,
//                         disciplines: newCharacter.disciplines,
//                         charactervalue: newCharacter.charactervalue,
//                         equipment: newCharacter.equipment,
//                     })
//                 })
//         })
//     })
// })  