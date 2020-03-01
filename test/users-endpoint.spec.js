const knex = require('knex');
const app = require('../src/app');
const { makeUserArray } = require('./users.fixture');

describe(`User Endpoints`, () => {
    let db 

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after(() => db.destroy())

    before(() => db('users').truncate())

    afterEach(() => db('users').truncate())

    describe(`GET /api/users`, () => {
        context(`Given no users`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/users')
                    .expect(200, [])
            })
        })
        context(`Given 'users' has data`, () => {
            const testUsers = makeUserArray()
            beforeEach('insert users', () => {
                return db
                    .into('users')
                    .insert(testUsers)
            })
            // Tests for when there is data
            it(`responds with 200 and all users from 'users' table`, () => {
                return supertest(app)
                   .get('/api/users')
                   .expect(200, testUsers)
            })
        })
    })

    describe(`GET /api/users/:userid`, () => {
        context(`Given no users`, () => {
            it(`responds with 404`, () => {
                const userId = 123456
                return supertest(app)
                    .get(`/api/users/${userId}`)
                    .expect(404, {
                        error: { 
                            message: `User does not exist` 
                        }
                    })
            })
        })
        context('Given there are users in the database', () => {
            const testUsers = makeUserArray()
            
            beforeEach('insert users', () => {
                return db
                    .into('users')
                    .insert(testUsers)
            })

            it('responds with 200 and the specified article', () => {
                const userId = 2
                const expectedUser = testUsers[userId -1]
                return supertest(app)
                    .get(`/api/users/${userId}`)
                    .expect(200, expectedUser)
            })
        })
    })

    describe(`DELETE /api/users/:userid`, () => {
        context(`Given there are users in the database`, () => {
            const testUsers = makeUserArray()

            beforeEach('insert users', () => {
                return db
                    .into('users')
                    .insert(testUsers)
            })

            it('responds with 204 and removes the user', () => {
                const idToRemove = 2
                const expectedUsers = testUsers.filter(user => user.userid !== idToRemove)
                return supertest(app)
                    .delete(`/api/users/${idToRemove}`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get(`/api/users`)
                        .expect(expectedUsers)
                    )
            })
        })

        context(`Given no users`, () => {
            it(`responds with 404`, () => {
                const userId = 123456
                return supertest(app)
                    .delete(`/api/users/${userId}`)
                    .expect(404, {
                        error: { message: `User does not exist` }
                    })
            })
        })
    })
})