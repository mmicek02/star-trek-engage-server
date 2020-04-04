const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('Auth Endpionts', function() {
    let db 

    const { testUsers } = helpers.makeCharactersFixtures()
    const testUser = testUsers[0]

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after(() => db.destroy())

    before(() => db('characters').truncate())

    afterEach(() => db('characters').truncate())

    describe(`POST /api/auth/login`, () => {
        beforeEach('insert users', () => 
            helpers.seedUsers(
                db,
                testUsers,
            )
        )

    const requiredFields = ['username', 'userpassword']

    requiredFields.forEach(field => {
        const loginAttemptBody ={
            username: testUser.username,
            userpassword: testUser.userpassword,
        }

        it(`responds 400 with 400 required error when '${field}' is missing`, () => {
            delete loginAttemptBody[field]

            return supertest(app)
                .post('/api/auth/login')
                .send(loginAttemptBody)
                .expect(400, {
                    error: `Missing '${field}' in request body`, 
                })
        })
    })

    })
})