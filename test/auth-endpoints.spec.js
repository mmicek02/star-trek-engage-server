const knex = require("knex");
const jwt = require('jsonwebtoken')
const app = require('../src/app')
const { makeUserArray, makePlainUserArray } = require('./users.fixture');
const { makeCharacterArray, makeMaliciousCharacter } = require('./character.fixture');

describe.only('Auth Endpoints', function() {
    let db
    const plainUsers = makePlainUserArray();
    const testUsers = makeUserArray();
    const testUser = plainUsers[0];
    const testCharacters = makeCharacterArray();
    console.log(process.env.TEST_DATABASE_URL)
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

    //after(() => db('users').where(1,1).del())
    afterEach(() => db('characters').truncate())

    describe(`POST /api/auth/login`, () => {
        beforeEach('insert characters', () => {
            return db
             //.into('users').insert(testUsers)
             .into('characters').insert(testCharacters)
        })
    
    const requiredFields = ['username', 'userpassword']
    
    requiredFields.forEach(field => {
        const loginAttemptBody = {
            username: testUser.username,
            userpassword: testUser.userpassword,
        }
    
        it(`responds with 400 required error when '${field}' is missing`, () => {
            delete loginAttemptBody[field]
        
            return supertest(app)
            .post('/api/auth/login')
            .send(loginAttemptBody)
            .expect(400, {
                    error: `Missing '${field}' in request body`,
            })
        })
    })

    it(`responds 400 'invalid username or userpassword' when bad username`, () => {
        const userInvalidUser = { username: 'user-not', userpassword: 'existy' }
        return supertest(app)
            .post('/api/auth/login')
            .send(userInvalidUser)
            .expect(400, { error: `Incorrect username or password` })
    })

    it(`responds 400 'invalid username or password' when bad password`, () => {
        const userInvalidPass = { username: testUser.username, userpassword: 'incorrect' }
        return supertest(app)
            .post('/api/auth/login')
            .send(userInvalidPass)
            .expect(400, { error: `Incorrect username or password` })
    })

    it(`responds 200 and JWT auth token using secret when valid credentials`, () => {
        const userValidCreds = {
            username: testUser.username,
            userpassword: testUser.userpassword,
        }
        const expectedToken = jwt.sign(
            { userid: testUser.userid }, // payload
            process.env.JWT_SECRET,
            {
                subject: testUser.username,
                algorithm: 'HS256',
            }
        )
        console.log(expectedToken)
        return supertest(app)
            .post('/api/auth/login')
            .send(userValidCreds)
            .expect(200, {
                authToken: expectedToken,
            })
    })

    })
})