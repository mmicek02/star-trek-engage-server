INSERT INTO characters (characterid, userid, characterRole, characterName, species, attributes, disciplines, characterValue)
VALUES
    (911, 1, 'Chief Medical Office', 'This text contains an intentionally broken image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie); alert(''you just got pretend hacked! oh noes!'');">. The image will try to load, when it fails, <strong>it executes malicious JavaScript</strong>', 'human', 
        ARRAY[11, 10, 9, 9, 8, 7], 
        ARRAY[5, 4, 3, 3, 2, 2], 'Homeworld')