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
    deleteUser(knex, Uuserid) {
        return knex('users')
            .where({ userid })
            .delete()
    },
    updateUser(knex, userid, newUserFields) {
        return knex('users')
            .where({ userid })
            .update(newUserFields)
    },
};

module.exports = UsersService;