TRUNCATE users RESTART IDENTITY CASCADE;

INSERT INTO users 
    (userid, username, userpassword)
    VALUES
        (1, 'Ty Keobernick', 'te$TpaS$oRd'),
        (2, 'Michael Micek', 'NEWte$TpaS$oRd'),
        (3, 'New User', 'nEwUserpA$$');