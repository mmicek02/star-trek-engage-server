# STAR TREK ENGAGE

## Projet Details

### Screenshots
<img src ="./Screenshots/LandingPage.png" alt="Landing Page" width="300px">
<img src ="./Screenshots/CharacterCreation.png" alt="Character Creation Page" width="300px">
<img src ="./Screenshots/CharacterListView.png" alt="Character List View Page" width="300px">
<img src ="./Screenshots/CharacterDetails.png" alt="Character Details Page" width="300px">

### SUMMARY OF APP
Star Trek Engage is a web application designed as an aid to to players of the Star Trek tabletop role playing game (TTRPG) character creation process. This app will take the user (player) through each step involved in the process of making their character. Buy using the framework and methods already established in the published rulebook by Modiphius Entertainment, using this app means the process of creating a character with compelling motivations and interesting background is even easier. At the end of the process the user of the app will be able to export their completed character sheet as a PDF, meaning they are 100% ready for the thrilling adventures that awaits them and the rest of their crew!

### Technology Used
FRONT END: HTML, CSS, JS, REACT

BACK END: NODE.JS, EXPRESS.JS, SQL

### LINK TO LIVE APP
https://star-trek-engage-client-app.now.sh/


## Access the API

### Beer Endpoints

#### GET /api/characters
This will return the following information for each character, however the values might be different. 

{
    characterid: 3,
    userid: 1,
    characterrole: 'Chief Office',
    charactername: 'Mr. Vulcan',
    species: 'Vulcan',
    attributes: [
        11, 10, 9, 9, 8, 7
    ],
    disciplines: [
        5, 4, 3, 3, 2, 2
    ],
    charactervalue: 'Smart',
    equipment: 'Tricorder',
}

####  GET /api/characters/:characterid
This will return the following information for the character with the characterid 

{
    characterid: 3,
    userid: 1,
    characterrole: 'Chief Office',
    charactername: 'Mr. Vulcan',
    species: 'Vulcan',
    attributes: [
        11, 10, 9, 9, 8, 7
    ],
    disciplines: [
        5, 4, 3, 3, 2, 2
    ],
    charactervalue: 'Smart',
    equipment: 'Tricorder',
}

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.