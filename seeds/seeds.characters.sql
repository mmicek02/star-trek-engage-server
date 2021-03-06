TRUNCATE characters RESTART IDENTITY CASCADE;

INSERT INTO characters 
    (characterid, userid, characterRole, characterName, species, attributes, disciplines, characterValue)
    VALUES
        (1, 1, 'Chief Medical Office', 'Captain Test', 'human', 
            ARRAY[11, 10, 9, 9, 8, 7], 
            ARRAY[5, 4, 3, 3, 2, 2], 'Homeworld'),
        (2, 1, 'Chief Engineer', 'Danger Trill', 'trill', 
            ARRAY[11, 10, 8, 9, 9, 7], 
            ARRAY[5, 4, 3, 3, 2, 2], 'Dangerous');