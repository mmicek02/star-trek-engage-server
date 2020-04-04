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
      name: 'GET /api/characters',
      path: '/api/articles',
      method: supertest(app).get,
    },
  ]

  protectedEndpoints.forEach(endpoint => {
        describe(endpoint.name, () => {
            it(`responds 401 'Missing bearer token' when no bearer token`, () => {
                return endpoint.method(endpoint.path)
                  .expect(401, { 
                      error: `Missing bearer token` 
                    })
            })
            it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
            const validUser = testUsers[0]
            const invalidSecret = 'bad-secret'
            return endpoint.method(endpoint.path)
                .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
                .expect(401, { 
                    error: `Unauthorized request` 
                })
            })
            it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
              const invalidUser = { username: 'user-not-existy', userid: 1 }
              return endpoint.method(endpoint.path)
                .set('Authorization', helpers.makeAuthHeader(invalidUser))
                .expect(401, { error: `Unauthorized request` })
            })
        })
    })
})