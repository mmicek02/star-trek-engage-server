const knex = require('knex');
const app = require('../src/app');
const { makeUserArray } = require('./users.fixture');
const { makeCharacterArray, makeMaliciousCharacter } = require('./character.fixture');

describe(`Character endpoints`, () => {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from database', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE users, characters RESTART INDENTITY CASCADE'))

    afterEach('cleanup',()=> db.raw('TRUNCATE users, characters RESTART IDENTITY CASCADE'))

    beforeEach(`insert users`, () => {
        const testUsers = makeUserArray();
        return db
            .into('users')
            .insert(testUsers)
    })

    describe(`GET /characters`, () => {
        context(`give there are characters for that user`, () => {
            const testCharacters = makeCharacterArray();
            beforeEach(`insert characters`, () => {
                return db
                    .into('characters')
                    .insert(testCharacters)
            })
            it(`should respond 200 and get the character list`, () => {
                return supertest(app)
                    .get(`/characters`)
                    .expect(200, testCharacters)
            })
        })
        context(`given no characters for user/database`, () => {
            it(`responds 200 and returns an empty array`, () => {
                return supertest(app)
                    .get(`/characters`)
                    .expect(200, [])
            })
        })
    })


    describe(`GET /characters/:characterId`, () => {
        context(`given there are no characters in the database`, () => {
            it(`should return 404 and give an error`, () => {
                return supertest(app)
                .get(`characters/1`)
                .expect(404, {
                    error: {
                        message: `Character doesn't exist.`
                    }
                })
            })
        })
        context(`given there are characters in the database`, () => {
            const testCharacters = makeCharacterArray();
            beforeEach(`insert characters`, () => {
                return db  
                    .into('characters')
                    .expect(testCharacters)
            })
            it(`should repond 200 and return the correct character via its ID`, () => {
                const idToGet = 2;
                expectedCharacter = testCharacters[idToGet-1];
                return supertest(app)
                    .get(`/characters/${idToGet}`)
                    .expect(200, expectedCharacter)
            })
        })
        context(`given an XSS attack character`,()=>{
            const { maliciousCharacter, expectedCharacter} = makeMaliciousCharacter();
            beforeEach(`insert xss character`,()=>{
                return db
                    .into('characters')
                    .insert(maliciousCharacter)
            })
            it(`should sanitize the note`,()=>{
                return supertest(app)
                    .get(`/characters/${maliciousNote.id}`)
                    .expect(200, expectedCharacter)
            })
        })
    })
})