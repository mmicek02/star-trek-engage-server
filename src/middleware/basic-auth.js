function requireAuth(req, res, next) {
    const authToken = req.get('Authorization') || ''

    let basicToken
    if(!authToken.toLowerCase().startsWith('basic ')) {
        return res.status(401).json({ error: 'Missing basic token' })
    } else {
        basicToken = authToken.slice('basic '.length, authToken.length)
    }

    const [tokenUserName, tokenUserPassword] = Buffer
        .from(basicToken, 'base64')
        .toString()
        .split(':')
    
    console.log(tokenUserName)

    if (!tokenUserName || !tokenUserPassword) {
        return res.status(401).json({ error: 'Unauthorized request' })
    }

    req.app.get('db')('users')
        .where({ username: tokenUserName })
        .first()
        .then(user => {
            if (!user || user.userpassword !== tokenUserPassword) {
                return res.status(401).json({ error: 'Unauthorized request' })
            }
            
            req.user = user
            next()
        })
        .catch(next)
}

module.exports = {
    requireAuth
}