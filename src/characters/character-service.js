const CharacterService = {
    getAllCharacters(knex) {
        return knex.select('*').from('characters')
    },
    insertCharacter(knex, newCharacter) {
        return knex
            .insert(newCharacter)
            .into('characters')
            .returning('*')
            .then( rows => {
                return rows[0]
            })
    },
    getById(knex, characterid) {
        return knex
            .from('characters')
            .select('*')
            .where('characterid', characterid)
            .first();
    },
    deleteCharacter(knex, characterid) {
        return knex('characters')
            .where({ characterid })
            .delete()
    },
    updateCharacter(knex, characterid, newCharacterFields) {
        return knex('characters')
            .where({ characterid })
            .update(newCharacterFields)
    },
};

module.exports = CharacterService;