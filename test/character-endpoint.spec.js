const knex = require('knex');
const app = require('../src/app');
const { makeUserArray } = require('./users.fixture');
const { makeCharacterArray, makeMaliciousCharacter } = require('./character.fixture');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const testUsers = makeUserArray();
const encryptedUsers = testUsers.map(u => ({ userid: u.userid, username: u.username, userpassword: bcrypt.hashSync(u.userpassword, 4) }))
const testCharacters = makeCharacterArray();



describe(`Character endpoints`, () => {
    let db

    function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
        const token = jwt.sign({ userid: user.userid }, secret, {
            subject: user.username,
            algorithm: 'HS256',
        })
        return `Bearer ${token}`
    }

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after(async () => {
        await db('users').whereIn('username', testUsers.map(u => u.username)).del()
        db.destroy()
    })

    before(() => db('characters').truncate())
    before(() => db.into('users').insert(testUsers))
    
    afterEach(() => db('characters').truncate())

    describe(`Protected endpoints`, () => {

        beforeEach('insert characters', () => {
            return db
             .into('users').into(testUsers)
             .into('characters').insert(testCharacters)
        })

        const protectedEnpoints = [
            {
                name: 'GET /api/characters/:characterid',
                path: '/api/characters/1'
            },
        ]

        protectedEnpoints.forEach(endpoint => {
            describe(endpoint.name, () => {
                // Test for when this header is missing or incorrect
                it(`responds with 401 'Missing bearer token' when no bearer token`, () => {
                    return supertest(app)
                    .get(endpoint.path)
                    .expect(401, { error: `Missing bearer token` })
                })
                // Test for the protected endpoint when the token is present, but the credentials are missing
                it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
                    const validUser = testUsers[0]
                    const invalidSecret = 'bad-secret'
                    return supertest(app)
                    .get(endpoint.path)
                    .set('Authorization', makeAuthHeader(validUser, invalidSecret))
                    .expect(401, { error: `Unauthorized request` })
                })
                // Test for credentials for a user that doesn't exist 
                it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
                    const invalidUser = { username: 'user-not', userid: 1 }
                    return supertest(app)
                        .get(endpoint.path)
                        .set('Authorization', makeAuthHeader(invalidUser))
                        .expect(401, { error: `Unauthorized request` })
                })
            })
        })
    })

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
                    .into('users').insert(testUsers)
                    .into('characters').insert(maliciousCharacter)
            })

            it(`removes XSS attack content`, () => {
                return supertest(app)
                    .get(`/api/characters/${maliciousCharacter.characterid}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .expect(200, expectedCharacter)
            })
        })
    })

    describe(`POST /api/characters`, () => {
        context(`Given the user posts a new character`, () => {
            
    
            beforeEach('insert characters and users', () => {
                return db
                    .into('users').insert(testUsers)
                    .into('characters').insert(testCharacters)
            })
            // Test one
            it(`responds 401 'Missing bearer token' when invalid password`, () => {
                  const userInvalidPass = { username: testUsers[0].username, userpassword: 'wrong' }
                  return supertest(app)
                    .post('/api/characters')
                    .set('Authorization', makeAuthHeader(userInvalidPass))
                    .expect(401, { error: `Missing bearer token` })
            })
            // Test Two
            it(`creates a character, responding with 201 and the new character`, () => {

                const testUser = testUsers[0]
                const newCharacter = {
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
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .send(newCharacter)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.userid).to.eql(testUser.userid)
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
                    .expect(res =>
                        db
                         .from('characters')
                         .select('*')
                         .where({ userid: res.body.userid})
                         .first()
                         .then(row => {
                            expect(row.body.userid).to.eql(testUser.userid)
                            expect(row.body.characterrole).to.eql(newCharacter.characterrole)
                            expect(row.body.charactername).to.eql(newCharacter.charactername)
                            expect(row.body.species).to.eql(newCharacter.species)
                            expect(row.body.attributes).to.eql(newCharacter.attributes)
                            expect(row.body.disciplines).to.eql(newCharacter.disciplines)
                            expect(row.body.charactervalue).to.eql(newCharacter.charactervalue)
                            expect(row.body.equipment).to.eql(newCharacter.equipment)
                        })    
                    )
            })

            const requiredFields = [ 'characterrole', 'charactername', 'species', 'attributes', 'disciplines', 'charactervalue', 'equipment']

            requiredFields.forEach(field => {
                const newCharacter = {
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
                        .set('Authorization', makeAuthHeader(testUsers[0]))
                        .send(newCharacter)
                        .expect(400, {
                            error: { message: `Missing '${field}' in request body` }
                        })
                })
            })
        })
    })

    describe(`GET /api/characters/:characterid`, () => {
        context(`Given no characters`, () => {
            
            beforeEach('insert characters', () => {
                return db
                 .into('users').insert(testUsers)
                 .into('characters').insert(testCharacters)
            })

            it(`responds with 404 and give an error`, () => {
                const characterId = 123456
                return supertest(app)
                    .get(`/api/characters/${characterId}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .expect(404, {
                        error: { message: `Character does not exist` }
                    })
            })
        })
        context('Given there are characters in the database', () => {
        
            const testUsers = makeUserArray()
            
            beforeEach('insert characters', () => {
                return db
                    .into('users').insert(testUsers)
                    .into('characters').insert(testCharacters)
            })

            it('responds with 200 and the specified article', () => {
                const characterId = 2
                const expectedCharacter = testCharacters[characterId -1]
                return supertest(app)
                    .get(`/api/characters/${characterId}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .expect(200, expectedCharacter)
            })
        })

        context(`Given an XSS attack character`, () => {
            const { maliciousCharacter, expectedCharacter} = makeMaliciousCharacter()
            const testUser = makeUserArray()[1]
            
            beforeEach('insert malicious article', () => {
                return db
                    .into('characters')
                    .insert(maliciousCharacter)
            })

            it(`removes XSS attack content`, () => {
                return supertest(app)
                    .get(`/api/characters/${maliciousCharacter.characterid}`)
                    .set('Authorization', makeAuthHeader(testUser))
                    .expect(200, expectedCharacter)
            })
        })
    })

    describe(`DELETE /api/characters/:characterid`, () => {
        context(`Given there are characters in the database`, () => {
        
            
            beforeEach('insert characters', () => {
                return db
                 .into('users').insert(encryptedUsers)
                 .into('characters').insert(testCharacters)
            })

            it('responds with 204 and removes the character', () => {
                const idToRemove = 2
                const expectedCharacters = testCharacters.filter(character => character.characterid !== idToRemove)
                return supertest(app)
                    .delete(`/api/characters/${idToRemove}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get(`/api/characters`)
                        .expect(expectedCharacters)
                    )
            })
        })

        context(`Given no characters`, () => {
        
            
            beforeEach('insert characters', () => {
                return db
                 .into('users').insert(encryptedUsers)
                 .into('characters').insert(testCharacters)
            })

            it(`responds with 404`, () => {
                const characterId = 123456
                return supertest(app)
                    .delete(`/api/characters/${characterId}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .expect(404, {
                        error: { message: `Character does not exist` }
                    })
            })
        })
    })

    describe(`PATCH /api/characters/:characterid`, () => {
        context(`Given no characters`, () => {
        
            const testUsers = makeUserArray()
            beforeEach('insert characters', () => {
                return db
                    .into('users').insert(testUsers)
                    .into('characters').insert(testCharacters)
            })

            it(`responds wiht 404`, () => {
                const characterId = 123456
                return supertest(app)
                    .patch(`/api/characters/${characterId}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .expect(404, {
                        error: { message: `Character does not exist` }
                    })
            })
        })

        context(`Given there are characters in the database`, () => {
        
            const testUsers = makeUserArray()
            beforeEach('insert characters', () => {
                return db
                    .into('users').insert(testUsers)
                    .into('characters').insert(testCharacters)
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
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .send(updateCharacter)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/api/characters/${idOfCharacterToUpdate}`)
                            .set('Authorization', makeAuthHeader(testUsers[0]))
                            .expect(expectedCharacter)
                    )
            })

            it(`responds with 400 when no required fields supplied`, () => {
                const idOfCharacterToUpdate = 2
                return supertest(app)
                    .patch(`/api/characters/${idOfCharacterToUpdate}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
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
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .send({
                        ...updateCharacter,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/characters/${idOfCharacterToUpdate}`)
                            .set('Authorization', makeAuthHeader(testUsers[0]))
                            .expect(expectedCharacter)
                    )
                })
            })
    })
})