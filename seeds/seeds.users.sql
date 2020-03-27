TRUNCATE users RESTART IDENTITY CASCADE;

INSERT INTO users 
    (userid, username, userpassword)
    VALUES
        (1, 'Ty Keobernick', '$2a$12$Dbw60QsyrrnW.TKSpLeswe6YpqMnlBLUpCNFPBjIr4HgQ1fsIKYYq'),
        (2, 'Michael Micek', '$2a$12$Q1s5rDI7/d5RWXAQMfhNleQgAMN2qRcz3960JtOeipfmAUGuViz1W'),
        (3, 'New User', '$2a$12$qMwbMgGqKbPVPszk4A9d1OquHciEdnXzuo4bOHlgAKsLueN3XF5Pq');