module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres@localhost/startrekengage',
    CLIENT_ORIGIN: 'https://star-trek-engage-client-app.now.sh',
}