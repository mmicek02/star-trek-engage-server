function makeCharacterArray() {
    return [
        {
            characterid: 1,
            userid: 1,
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
            userid: 1,
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
        characterid: 1,
        userid: 1,
        characterrole: '<script>alert("xss");</script>',
        charactername: 'Captain Ty',
        species: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        attributes: [
            11, 10, 9, 9, 8, 7
        ],
        disciplines: [
            5, 4, 3, 3, 2, 2
        ],
        charactervalue: 'Pretty'
    }
    const expectedCharacter = {
        characterid: 1,
        userid: 1,
        characterrole: '&lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        charactername: 'Captain Ty',
        species: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
        attributes: [
            11, 10, 9, 9, 8, 7
        ],
        disciplines: [
            5, 4, 3, 3, 2, 2
        ],
        charactervalue: 'Pretty'
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