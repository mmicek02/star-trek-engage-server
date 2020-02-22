CREATE TABLE IF NOT EXISTS characters (
    characterId INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    userId INTEGER NOT NULL,
    characterRole TEXT NOT NULL,
    characterName TEXT,
    species TEXT NOT NULL,
    attributes INTEGER NOT NULL,
    disciplines INTEGER NOT NULL,
    characterValue TEXT,
    equipment TEXT
);

CREATE TABLE IF NOT EXISTS users (
    userId INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    username TEXT NOT NULL,
    userPassword TEXT NOT NULL,
    dateJoined TIMESTAMP DEFAULT now() NOT NULL
);