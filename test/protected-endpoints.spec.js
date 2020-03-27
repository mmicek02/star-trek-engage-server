const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Protected endpoints', function() {
  let db

  const {
    testUsers,
    testCharacters,
  } = helpers.makeCharactersFixtures()

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after(() => db.destroy())

  before(() => db('characters').truncate())

  afterEach(() => db('characters').truncate())

  beforeEach('insert characters', () =>
  helpers.seedCharactersTables(
    db,
    testUsers,
    testCharacters,
  )
)
const protectedEndpoints = [
    {
      name: 'GET /api/characters/:characterid',
      path: '/api/characters/1',
      method: supertest(app).get,
    },
    {
      name: 'GET /api/characters/',
      path: '/api/articles/',
      method: supertest(app).get,
    },
  ]

  protectedEndpoints.forEach(endpoint => {
        describe(endpoint.name, () => {
            it(`responds 401 'Missing basic token' when no basic token`, () => {
                return endpoint.method(endpoint.path)
                  .expect(401, { 
                      error: `Missing basic token` 
                    })
            })
            it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
            const userNoCreds = { username: '', userpassword: '' }
            return endpoint.method(endpoint.path)
                .set('Authorization', helpers.makeAuthHeader(userNoCreds))
                .expect(401, { 
                    error: `Unauthorized request` 
                })
            })
            it(`responds 401 'Unauthorized request' when invalid user`, () => {
                const userInvalidCreds = { username: 'user-not', userpassword: 'existy' }
                return endpoint.method(endpoint.path)
                    .set('Authorization', helpers.makeAuthHeader(userInvalidCreds))
                    .expect(401, { 
                        error: `Unauthorized request` 
                    })
            })
            it(`responds 401 'Unauthorized request' when invalid userpassword`, () => {
                const userInvalidPass = { username: testUsers[0].username, userpassword: 'wrong' }
                return endpoint.method(endpoint.path)
                    .set('Authorization', helpers.makeAuthHeader(userInvalidPass))
                    .expect(401, { 
                        error: `Unauthorized request` 
                    })
            })
        })
    })
})