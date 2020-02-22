function makeCharacterArray() {
    return [
        {
            character_id: 1,
            role: 'Chief Engineer',
            species: 'human',
            attributes: [
                11, 10, 9, 9, 8, 7
            ],
            disciplines: [
                5, 4, 3, 3, 2, 2
            ],
            character_value: 'Smart',
            character_name: 'Captain Ty',
            user_id: 1
        },
        {
            character_id: 2,
            role: 'Chief Medical Office',
            species: 'Trill',
            attributes: [
                11, 10, 9, 9, 8, 7
            ],
            disciplines: [
                5, 4, 3, 3, 2, 2
            ],
            character_value: 'Smart',
            character_name: 'Dr. Trill',
            user_id: 1
        },
    ]
}

function makeMaliciousCharacter() {
    const maliciousCharacter = {
        character_id: 911,
        role: '<script>alert("xss");</script>',
        species: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        attributes: [
            11, 10, 9, 9, 8, 7
        ],
        disciplines: [
            5, 4, 3, 3, 2, 2
        ],
        character_value: 'Pretty',
        character_name: 'Captain Ty',
        user_id: 1
    }
    const expectedCharacter = {
        character_id: 911,
        role: '&lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        species: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
        attributes: [
            11, 10, 9, 9, 8, 7
        ],
        disciplines: [
            5, 4, 3, 3, 2, 2
        ],
        character_value: 'Pretty',
        character_name: 'Captain Ty',
        user_id: 1
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