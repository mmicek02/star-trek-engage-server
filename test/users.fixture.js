function makeUserArray() {
    return [
        {
            userid: 1,
            username: "Mike",
            userpassword: "password"
        },
        {
            userid: 2,
            username: "Larry",
            userpassword: "password"
        },
        {
            userid: 3,
            username: "Ty",
            userpassword: "hidden"
        }
    ]
}

module.exports = {
    makeUserArray
};