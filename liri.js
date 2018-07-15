require("dotenv").config();


var keys = require("./keys.js");
var request = require("request");
var inquirer = require("inquirer");
var Twitter = require("twitter");
var Spotify = require("node-spotify-api");
var fs = require("fs");

var spotify = new Spotify({
  id: keys.spotify.id,
  secret: keys.spotify.secret
});

var client = new Twitter(keys.twitter);


console.log("\n__________________________________________________\n");
inquirer.prompt([

  {
    type: "input",
    name: "name",
    message: "Welome to Liri! What is your name?",
    validate: function validateName(name) {
      return name !== '';
    }
  },

]).then(function (user) {
  console.log("\nGreetings " + user.name.toUpperCase() + "!\n");
  askForTask();
});





function handleTask(inquirerResponse) {
  switch (inquirerResponse.task) {
    case "Log Out":
      logOut();
      break

    case "Look Up a Movie":
      lookUpMovie();
      break

    case "Look Up a Song":
      lookUpSong();
      break

    case "See Recent Tweets":
      lookUpTweets();
      break

    case "Show Me a Random Movie!":
      randomMovie();
      break

      case "Show Me Recently Searched Movies":
      showLog();
      break
  }
}


/// Functions for handling task inputs below.
function askForTask() {
  return inquirer.prompt([{
    type: "list",
    name: "task",
    message: "What can I do for you today?",
    choices: ["See Recent Tweets", "Look Up a Song", "Look Up a Movie", "Show Me a Random Movie!", "Show Me Recently Searched Movies", "Log Out"]
  }])
    .then(handleTask);

}

function logOut() {
  console.log("Goodbye!");
  process.exit();

}

function lookUpMovie() {
  console.log("\n--------------------------------------------\n");
  return inquirer.prompt([{
    type: "input",
    name: "movie",
    message: "What Movie would you like me to look up for you?",
    validate: function validateMovie(name) {
      return name !== '';
    }
  }]).then(function (user) {
    console.log(user.movie);

    var queryUrl = "http://www.omdbapi.com/?t=" + user.movie + "&y=&plot=short&apikey=trilogy";

    request(queryUrl, function (error, response, body) {
      if (!error && response.statusCode === 200) {

        console.log("\n____________________________________");
        console.log("\nHere is some info on " + user.movie.toUpperCase() + "!\n");
        console.log("Release Date: " + JSON.parse(body).Released);
        console.log("Rating: " + JSON.parse(body).Rated);
        console.log("Genre: " + JSON.parse(body).Genre);
        console.log("Cast: " + JSON.parse(body).Actors);
        console.log("Plot: " + JSON.parse(body).Plot);
        console.log("\n____________________________________");
        console.log("----------------------------------");
        askForTask();
        fs.appendFile("movies.txt", user.movie + ", ", function (err) {

          if (err) {
            return console.log(err);
          }
        });
      }
    });

  })

}

function lookUpSong() {
  console.log("\n-------------------------------------------\n");
  return inquirer.prompt([{
    type: "input",
    name: "song",
    message: "What Song would you like me to look up for you?",
    validate: function validateSong(name) {
      return name !== '';
    }
  }]).then(function (user) {
    console.log(user.song);

    return spotify.search({ type: 'track', query: user.song }, function (err, data) {
      if (err) {
        return console.log('Error occurred: ' + err);
      }
      else {
        console.log("\n____________________________________");
        console.log("Artist: " + data.tracks.items[0].artists[0].name);
        console.log("Album: " + data.tracks.items[0].album.name);
        console.log("Link: " + data.tracks.items[0].preview_url)
        console.log("____________________________________\n");
        console.log("----------------------------------");
        askForTask();
      }
    });
  })
}


function lookUpTweets() {
  // Search parameters includes my tweets up to last 20 tweets;
  // Search parameters includes my tweets up to last 20 tweets;
  var params = { q: 'CodyCode3', count: 20 };

  // Shows up to last 20 tweets and when created in terminal.
  client.get('search/tweets', params, function (error, tweets, response) {

    if (!error) {

      // Loops through tweets and prints out tweet text and creation date.
      for (var i = 0; i < tweets.statuses.length; i++) {
        console.log("______________________________________________________________________________________________________________________________________________________\n")
        var tweetText = tweets.statuses[i].text;
        console.log(tweetText);
      }
     
      console.log("\n______________________________________________________________________________________________________________________________________________________\n")

      askForTask();

    } else {
      console.log(error);
    }
  });

}

function randomMovie() {
  var movieList = ["Brief Encounter", "Casablanca", "Before Sunrise", "Before Sunset", "Breathless", "In the Mood for Love", "The Apartment", "Hannah & Her Sisters", "Eternal Sunshine of the Spotless Mind", "Room With a View", "Jules et Jim", "All That Heaven Allows", "Gone with the Wind", "An Affair to Remember", "Umbrellas of Cherbourg", "Lost in Translation", "Roman Holiday", "Wall-E", "My Night With Maud", "Voyage to Italy", "Dr Zhivago", "Harold & Maude", "When Harry Met Sally", "Say Anything....", "Fabulous Baker Boys", "A Matter of Life & Death", "Chinatown", "Touch of Evil", "Vertigo", " Badlands", "Rashomon", "Double Indemnity", "Get Carter", "Pulp Fiction", "Hidden", "Goodfellas", "The Conversation", "Bonnie & Clyde", "The Killing", "French Connection", "The Big Sleep", "La Ceremonie", "Point Blank", "Hard Boiled", "Long Good Friday", "A Prophet", "Heat", "Scarface (1983)", "Miller’s Crossing", "Postman Always Rings Twice  (1942)", "Jour Se Leve", "Annie Hall", "Borat", "Some Like it Hot", "Team America", "Dr Strangelove", "The Ladykillers", "Duck Soup", "Rushmore", "Kind Hearts & Coronets", "Monty Python’s Life of Brian", "Airplane!", "Election", "His Girl Friday", "The Big Lebowski", "This Is Spinal Tap", "Bringing Up Baby", "There’s Something About Mary", "Dazed and Confused", "MASH", "Groundhog Day", "Clueless", "The Great Dictator", "Clerks", "The Jerk", "Shaun of the Dead", "Apocalypse Now", "North by Northwest", "Once Upon a Time in the West", "The Wild Bunch", "Deliverance", "City of God", "Paths of Glory", "The Wages of Fear", "Crouching Tiger Hidden Dragon", " The Thin Red Line", "Raiders of the Lost Ark", " Bullitt", "Ran", "Die Hard", "The Adventures of Robin Hood", " The Searchers", "Goldfinger", "Full Metal Jacket", "Last of the Mohicans", "Deer Hunter", "Gladiator", "Rome Open City", "Butch Cassidy", "Where Eagles Dare", "The Incredibles", "Andrei Rublev", "Mulholland Dr", "L’Atalante", "Tokyo Story", "Citizen Kane", "A Clockwork Orange", "Days of Heaven", "Wild Strawberries", "White Ribbon", "The Gospel According to St Matthew", "Aguirre Wrath of God", "Pather Panchali", "The Conformist", "Death in Venice", "The Godfather Parts I and II", "The Graduate", "There Will Be Blood", "Battleship Potemkin", "Rules of the Game", "Shadows", "Distant Voices Still Lives", "Passion of Joan of Arc", "La Dolce Vita", "Breaking the Waves", "Spirit of the Beehive", "2001", "Metropolis", "Blade Runner", "Alien", "The Wizard of Oz", "ET", "Solaris", "Spirited Away", "Star Wars  (1977)", "Close Encounters", "King Kong", "Terminator/Terminator 2", "The Matrix", "Alphaville", "Back to the Future", "Planet of the Apes", "Brazil", "The Lord of the Rings trilogy", "Dark Star", "Day the Earth Stood Still", "Edward Scissorhands", "Akira", "Princess Bride", "Pan’s Labyrinth", "Starship Troopers", "Psycho", "Rosemary’s Baby",  "The Wicker Man", "The Shining", "The Exorcist", "Nosferatu  (1922)", "Let the Right One In", "Vampyr", "Peeping Tom", "The Innocents", "Ringu", "The Haunting", "Texas Chainsaw Massacre", "Dead of Night", "The Cabinet of Dr Caligari", "Halloween", "Bride of Frankenstein", "Les Diaboliques", "Audition", "Dracula   (1958)", "The Blair Witch Project", "Evil Dead/Evil Dead II", "Carrie", "Les Vampires (1915)"]
  var randomIndex = Math.floor(Math.random() * movieList.length);
  var randomMovie = movieList[randomIndex];
  console.log(randomMovie)
  var queryUrl = "http://www.omdbapi.com/?t=" + randomMovie + "&y=&plot=short&apikey=trilogy";

  request(queryUrl, function (error, response, body) {
    if (!error && response.statusCode === 200) {

      console.log("\n____________________________________");
      console.log("\nHere is some info on " + randomMovie.toUpperCase() + "!\n");
      console.log("Release Date: " + JSON.parse(body).Released);
      console.log("Rating: " + JSON.parse(body).Rated);
      console.log("Genre: " + JSON.parse(body).Genre);
      console.log("Cast: " + JSON.parse(body).Actors);
      console.log("Plot: " + JSON.parse(body).Plot);
      console.log("\n____________________________________");
      console.log("----------------------------------");
      askForTask();
    }
  });

  fs.appendFile("movies.txt", randomMovie + ", ", function (err) {

    // If the code experiences any errors it will log the error to the console.
    if (err) {
      return console.log(err);
    }
  });
}

function showLog(){
  console.log("______________________________________________________________________________________________________________________________________________________\n")
  fs.readFile("movies.txt", "utf8", function(error, data) {

    if (error) {
      return console.log(error);
    }
      console.log(data);
      console.log("______________________________________________________________________________________________________________________________________________________\n")
      askForTask();
   });
  }

