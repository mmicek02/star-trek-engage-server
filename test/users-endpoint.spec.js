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

    before(() => db.raw('TRUNCATE characters, users RESTART IDENTITY CASCADE'))

    afterEach(() => db.raw('TRUNCATE characters, users RESTART IDENTITY CASCADE'))

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

            it('responds with 200 and the specified users', () => {
                const userId = 2
                const expectedUser = testUsers[userId -1]
                return supertest(app)
                    .get(`/api/users/${userId}`)
                    .expect(200, expectedUser)
            })
        })
    })

    describe(`POST /api/users`, () => {
        it(`creates a user and responds 201 with the new user`,()=> {
            const newUser = {
                username: 'Username',
                userpassword: 'Password',
            }
            return supertest(app)
                .post('/api/users')
                .send(newUser)
                .expect(201)
                .expect(res => {
                    expect(res.body.username).to.eql(newUser.username)
                    expect(res.body.userpassword).to.eql(newUser.userpassword)
                    expect(res.body).to.have.property('userid')
                    expect(res.headers.location).to.eql(`/api/users/${res.body.userid}`)
                })
                    .then(res => {
                        return supertest(app)
                            .get(`/api/users/${res.body.userid}`)
                            .expect(res.body)
                    })
        })

        const requiredFields = ['username', 'userpassword']

        requiredFields.forEach(field => {
            const newUser = {
                username: 'Username',
                userpassword: 'Password',
        }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newUser[field]

                return supertest(app)
                    .post('/api/users')
                    .send(newUser)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    })
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