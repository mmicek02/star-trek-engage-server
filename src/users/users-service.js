const bcrypt = require('bcryptjs')
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UsersService = {
    getAllUsers(knex) {
        return knex.select('*').from('users')
    },
    insertUser(knex, newUser) {
        return knex
            .insert(newUser)
            .into('users')
            .returning('*')
            .then( rows => {
                return rows[0]
            })
    },
    getById(knex, userid) {
        return knex
            .from('users')
            .select('*')
            .where('userid', userid)
            .first();
    },
    deleteUser(knex, userid) {
        return knex('users')
            .where({ userid })
            .delete()
    },
    updateUser(knex, userid, newUserFields) {
        return knex('users')
            .where({ userid })
            .update(newUserFields)
    },
    hasUserWithUserName(db, username) {
        return db('users')
            .where({ username })
            .first()
            .then(user => !!user)
    },
    validatePassword(userpassword) {
        if (userpassword.length < 8) {
            return 'Password must be longer than 8 characters'
        }
        if (userpassword.length > 72) {
            return 'Password must be less than 72 characters'
        }
        if (userpassword.startsWith(' ') || userpassword.endsWith(' ')) {
            return 'Password must not start or end with empty spaces'
        }
        if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(userpassword)) {
            return 'Password must contain 1 upper case, lower case, number and special character'
        }
            return null
    },
    hashPassword(password) {
        return bcrypt.hash(password, 12)
    },
};

module.exports = UsersService;