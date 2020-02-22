function makeCharacterArray() {
    return [
        {
            characterId: 1,
            userId: 1,
            characterRole: 'Chief Engineer',
            characterName: 'Captain Ty',
            species: 'human',
            attributes: [
                11, 10, 9, 9, 8, 7
            ],
            disciplines: [
                5, 4, 3, 3, 2, 2
            ],
            characterValue: 'Smart'
        },
        {
            characterId: 2,
            userId: 1,
            characterRole: 'Chief Medical Office',
            characterName: 'Dr. Trill',
            species: 'Trill',
            attributes: [
                11, 10, 9, 9, 8, 7
            ],
            disciplines: [
                5, 4, 3, 3, 2, 2
            ],
            characterValue: 'Smart'
        },
    ]
}

function makeMaliciousCharacter() {
    const maliciousCharacter = {
        characterId: 911,
        userId: 1,
        characterRole: '<script>alert("xss");</script>',
        characterName: 'Captain Ty',
        species: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        attributes: [
            11, 10, 9, 9, 8, 7
        ],
        disciplines: [
            5, 4, 3, 3, 2, 2
        ],
        characterValue: 'Pretty'
    }
    const expectedCharacter = {
        characterId: 911,
        user_id: 1,
        characterRole: '&lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        characterName: 'Captain Ty',
        species: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
        attributes: [
            11, 10, 9, 9, 8, 7
        ],
        disciplines: [
            5, 4, 3, 3, 2, 2
        ],
        characterValue: 'Pretty'
    }
    return {
        maliciousCharacter,
        expectedCharacter
    }
}

module.exports = {
    makeCharacterArray,
    makeMaliciousCharacter
}