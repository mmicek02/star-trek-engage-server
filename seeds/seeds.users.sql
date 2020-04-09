TRUNCATE users RESTART IDENTITY CASCADE;

INSERT INTO users 
    (userid, username, userpassword)
    VALUES
        (1, 'Ty Keobernick', '$2a$12$zJ.SH.1BFeA.CMRrpXHMf.wkal1ew9GhYBtQGyVkpLiO2m1qhnPhm'), /*te$TpaS$oRd*/
        (2, 'Michael Micek', '$2a$12$z/Jmmj9XIxl6VbzIQHV/7O4qPdUx831HeeWPjyNDCS3PqhbGF4z3W'), /*NEWte$TpaS$oRd*/
        (3, 'New User', '$2a$12$ozXe683QCRNur8uedD7xrez6zCSdEy.9JMxl0csGHNR0f24pQZyv2'); /*nEwUserpA$$*/