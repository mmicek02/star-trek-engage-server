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
    describe(`GET /api/characters`, () => {
        context(`Given no characters`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/characters')
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
                   .get('/api/characters')
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
                    .get(`/api/characters/${maliciousCharacter.characterid}`)
                    .expect(200, expectedCharacter)
            })
        })
    })

    describe(`POST /api/characters`, () => {
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
            .post('/api/characters')
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
                expect(res.headers.location).to.eql(`/api/characters/${res.body.characterid}`)
            })
            .then(res => 
                supertest(app)
                    .get(`/api/characters/${res.body.characterid}`)
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
                    .post('/api/characters')
                    .send(newCharacter)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    })
            })
        })
    })

    describe(`GET /api/characters/:characterid`, () => {
        context(`Given no characters`, () => {
            it(`responds with 404`, () => {
                const characterId = 123456
                return supertest(app)
                    .get(`/api/characters/${characterId}`)
                    .expect(404, {
                        error: { 
                            message: `Character does not exist` 
                        }
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
                    .get(`/api/characters/${characterId}`)
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
                    .get(`/api/characters/${maliciousCharacter.characterid}`)
                    .expect(200, expectedCharacter)
            })
        })
    })

    describe(`DELETE /api/characters/:characterid`, () => {
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
                    .delete(`/api/characters/${idToRemove}`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get(`/api/characters`)
                        .expect(expectedCharacters)
                    )
            })
        })

        context(`Given no articles`, () => {
            it(`responds with 404`, () => {
                const characterId = 123456
                return supertest(app)
                    .delete(`/api/characters/${characterId}`)
                    .expect(404, {
                        error: { message: `Character does not exist` }
                    })
            })
        })
    })

    describe(`PATCH /api/characters/:characterid`, () => {
        context(`Given no characters`, () => {
            it(`responds wiht 404`, () => {
                const characterId = 123456
                return supertest(app)
                    .patch(`/api/characters/${characterId}`)
                    .expect(404, {
                        error: { message: `Character does not exist` }
                    })
            })
        })

        context(`Given there are characters in the database`, () => {
            const testCharacters = makeCharacterArray()

            beforeEach('insert characters', () => {
                return db
                    .into('characters')
                    .insert(testCharacters)
            })
            it(`responds with 204 and updates the character`, () => {
                const idOfCharacterToUpdate = 2
                const updateCharacter = {
                    userid: 1,
                    characterrole: 'Chief Medical Officer',
                    charactername: 'Updated Mr. Vulcan',
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
                const expectedCharacter = {
                    ...testCharacters[idOfCharacterToUpdate - 1],
                    ...updateCharacter
                }

                return supertest(app)
                    .patch(`/api/characters/${idOfCharacterToUpdate}`)
                    .send(updateCharacter)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/api/characters/${idOfCharacterToUpdate}`)
                            .expect(expectedCharacter)
                    )
            })

            it(`responds with 400 when no required fields supplied`, () => {
                const idOfCharacterToUpdate = 2
                return supertest(app)
                    .patch(`/api/characters/${idOfCharacterToUpdate}`)
                    .send({ irreleventField: 'foo' })
                    .expect(400, {
                        error: { 
                            message: `Request body must contain either 'characterrole', 'species', 'charactervalue' or 'charactername'`
                        }
                    })
            })

            it(`responds with 204 when updating only a subset of fields`, () => {
                const idOfCharacterToUpdate = 2
                const updateCharacter = {
                    charactername: "updated character name",
                }
                const expectedCharacter = {
                    ...testCharacters[idOfCharacterToUpdate - 1],
                    ...updateCharacter
                }
            
                return supertest(app)
                    .patch(`/api/characters/${idOfCharacterToUpdate}`)
                    .send({
                        ...updateCharacter,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/characters/${idOfCharacterToUpdate}`)
                        .expect(expectedCharacter)
                    )
                })
            })
    })
})