const bcrypt = require('bcryptjs')

function makeUserArray() {
  return [
      {
          userid: 1,
          username: "Mike",
          userpassword: "password",
      },
      {
          userid: 2,
          username: "Larry",
          userpassword: "password",
      },
      {
          userid: 3,
          username: "Ty",
          userpassword: "hidden",
      }
  ]
}

function makeCharacterArray(users) {
  return [
      {
          characterid: 1,
          userid: users[0].userid,
          characterrole: 'Chief Engineer',
          charactername: 'Captain Ty',
          species: 'human',
          attributes: [
              11, 10, 9, 9, 8, 7
          ],
          disciplines: [
              5, 4, 3, 3, 2, 2
          ],
          charactervalue: 'Smart',
          equipment: 'phaser'
      },
      {
          characterid: 2,
          userid: users[0].userid,
          characterrole: 'Chief Medical Office',
          charactername: 'Dr. Trill',
          species: 'Trill',
          attributes: [
              11, 10, 9, 9, 8, 7
          ],
          disciplines: [
              5, 4, 3, 3, 2, 2
          ],
          charactervalue: 'Smart',
          equipment: 'Phaser'
      },
  ]
}

function makeMaliciousCharacter() {
  const maliciousCharacter = {
      characterid: 911,
      userid: 1,
      characterrole: '<script>alert("xss");</script>',
      charactername: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
      species: 'human',
      attributes: [
          11, 10, 9, 9, 8, 7
      ],
      disciplines: [
          5, 4, 3, 3, 2, 2
      ],
      charactervalue: 'Pretty',
      equipment: 'Tricorder',
  }
  const expectedCharacter = {
      ...maliciousCharacter,
      characterrole: '<script>alert("xss");</script>',
      charactername: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  }
  return {
      maliciousCharacter,
      expectedCharacter
  }
}

function makeCharactersFixtures() {
  const testUsers = makeUsersArray()
  const testCharacters = makeCharactersArray(testUsers)
  return { 
    testUsers, 
    testCharacters, 
  }
}

function seedCharactersTables(db, users, characters =[]) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await trx.into('users').insert(users)
    await trx.into('characters').insert(characters)
    // update the auto sequence to match the forced id values
    await Promise.all([
      trx.raw(
        `SELECT setval('users_userid_seq', ?)`,
        [users[users.length - 1].userid],
      ),
      trx.raw(
        `SELECT setval('characters_charactersid_seq', ?)`,
        [characters[characters.length - 1].characterid],
      ),
    ])
  })
}

function makeAuthHeader(user) {
  const token = Buffer.from(`${user.user_name}:${user.password}`).toString('base64')
  return `Basic ${token}`
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    userpassword: bcrypt.hashSync(user.userpassword, 1)
  }))
  return db.into('users').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

module.exports = {
    makeUserArray,
    makeCharacterArray,
    makeMaliciousCharacter,
    makeCharactersFixtures,
    makeAuthHeader,
    seedUsers,
  }