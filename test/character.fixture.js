function makeCharacterArray() {
    return [
        {
            characterid: 3,
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

module.exports = {
    makeCharacterArray,
    makeMaliciousCharacter
}