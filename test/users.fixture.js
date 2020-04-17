const bcrypt = require('bcryptjs')

function makePlainUserArray() {
    return [
        {
            userid: 1,
            username: "Ty Keobernick",
            userpassword: "te$TpaS$oRd",
        },
        {
            userid: 2,
            username: "Michael Micek",
            userpassword: "NEWte$TpaS$oRd",
        },
        {
            userid: 3,
            username: "New User",
            userpassword: "nEwUserpA$$",
        }
    ]
}
function makeUserArray() {
    return makePlainUserArray().map(u => ({...u, userpassword: bcrypt.hashSync(u.userpassword, 4) }));
}
module.exports = {
    makePlainUserArray,
    makeUserArray
};