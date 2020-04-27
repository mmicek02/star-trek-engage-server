const knex = require('knex');
const app = require('../src/app');
const { makeUserArray } = require('./users.fixture');

describe.only(`User Endpoints`, () => {
    let db 

    const testUsers = makeUserArray();
    const testUser = testUsers[0];
    
    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after(async () => {
        //await db('users').whereIn('username', testUsers.map(u => u.username)).del()
        db.destroy()
    })

    before(async () => db.raw('TRUNCATE characters, users RESTART IDENTITY CASCADE'))

    beforeEach('insert users', async () => {
        return db
            .into('users')
            .insert(testUsers)
    })

    afterEach(async () => {
        db.raw('TRUNCATE characters, users RESTART IDENTITY CASCADE')
        await db.raw('DELETE FROM users WHERE 1=1');
    })

    describe(`GET /api/users`, () => {
        context(`Given no users`, () => {
            // it(`responds with 200 and an empty list`, () => {
            //     return supertest(app)
            //         .get('/api/users')
            //         .expect(200, [])
            // })
        })
        context(`Given 'users' has data`, () => {
            //const testUsers = makeUserArray()
            // beforeEach('insert users', () => {
            //     return db
            //         .into('users')
            //         .insert(testUsers)
            // })
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
            //const testUsers = makeUserArray()
            
            // beforeEach('insert users', () => {
            //     return db
            //         .into('users')
            //         .insert(testUsers)
            // })

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
                userpassword: 'Pas$word1',
            }
            return supertest(app)
                .post('/api/users')
                .send(newUser)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('userid')
                    expect(res.body.username).to.eql(newUser.username)
                    expect(res.body).to.have.property('userpassword')
                    expect(res.headers.location).to.eql(`/api/users/${res.body.userid}`)
                })
                .expect(res => 
                    db
                        .from('users')
                        .select('*')
                        .where({ userid: res.body.userid })
                        .first()
                        .then( row => {
                            expect(row.username).to.eql(newUser.username)

                            return bcrypt.compare(newUser.userpassword, row.userpassword)
                        })
                        .then(compareMatch => {
                            expect(compareMatch).to.be.true
                        })

                )
        })

        const requiredFields = ['username', 'userpassword']

        requiredFields.forEach(field => {
            const newUser = {
                username: 'Username',
                userpassword: 'Pas$word1',
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

            it(`responds 400 'Password must be longer than 8 characters' when empty password`, () => {
                const userShortPassword = {
                    username: 'test user_name',
                    userpassword: '1234567',
                }
                return supertest(app)
                    .post('/api/users')
                    .send(userShortPassword)
                    .expect(400, { error: `Password must be longer than 8 characters` })
            })

            it(`responds 400 'Password must be less than 72 characters' when long password`, () => {
                  const userLongPassword = {
                    username: 'test user_name',
                    userpassword: '*'.repeat(73),
                  }
                  return supertest(app)
                    .post('/api/users')
                    .send(userLongPassword)
                    .expect(400, { error: `Password must be less than 72 characters` })
            })

            it(`responds 400 error when password starts with spaces`, () => {
                const userPasswordStartsSpaces = {
                    username: 'test user_name',
                    userpassword: ' 1Aa!2Bb@',
                }
                return supertest(app)
                    .post('/api/users')
                    .send(userPasswordStartsSpaces)
                    .expect(400, { error: `Password must not start or end with empty spaces` })
            })

            it(`responds 400 error when password ends with spaces`, () => {
                const userPasswordEndsSpaces = {
                    username: 'test user_name',
                    userpassword: '1Aa!2Bb@ ',
                }
                return supertest(app)
                    .post('/api/users')
                    .send(userPasswordEndsSpaces)
                    .expect(400, { error: `Password must not start or end with empty spaces` })
            })

            it(`responds 400 error when password isn't complex enough`, () => {
                const userPasswordNotComplex = {
                    username: 'test user_name',
                    userpassword: '11AAaabb',
                }
                return supertest(app)
                    .post('/api/users')
                    .send(userPasswordNotComplex)
                .   expect(400, { error: `Password must contain 1 upper case, lower case, number and special character` })
            })

            it(`responds 400 'Username already taken' when username isn't unique`, () => {
                  const duplicateUser = {
                    username: testUser.username,
                    userpassword: '11AAaa!!',
                  }
                  return supertest(app)
                    .post('/api/users')
                    .send(duplicateUser)
                    .expect(400, { error: `Username already taken` })
                })
        })
    })


    describe(`DELETE /api/users/:userid`, () => {
        context(`Given there are users in the database`, () => {
            //const testUsers = makeUserArray()

            // beforeEach('insert users', () => {
            //     return db
            //         .into('users')
            //         .insert(testUsers)
            // })

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