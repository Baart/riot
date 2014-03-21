var http = require("https");
   

var apikey = "9f6da8c3-d74c-445c-8208-3d746bfe844b";


var requestName = function(name, callback) {
    var url = "https://prod.api.pvp.net/api/lol/euw/v1.3/summoner/by-name/"+name+"?api_key=" + apikey;
    request(url, callback);
}

var requestInfo = function(id, callback) {
    var url = "https://prod.api.pvp.net/api/lol/euw/v1.3/game/by-summoner/"+id+"/recent?api_key=" + apikey;
    request(url, callback);
}


var request = function(url, callback) {
    // get is a simple wrapper for request()
    // which sets the http method to GET
    http.get(url, function (response) {
        // data is streamed in chunks from the server
        // so we have to handle the "data" event    
        var buffer = "";

        if(response.statusCode == 404) {
                callback("Not found", null);
                return;
        }

        response.on("data", function (chunk) {
            buffer += chunk;
        }); 

        response.on("end", function (err) {
            // finished transferring data
            // dump the raw data
            var data;

            try {
                data = JSON.parse(buffer);
            } catch(e) {
                console.log("cannot parse:", buffer);
                callback("cannot parse answer", null);
                return;
            }
            callback(null, data);
        });
    });
}


// Check in mongo if we have id

// If we dont, gather from riot, then copy to mongo

// When we have the id, check last update on mongo

// If older than  seconds, update from riot, then copy to mongo

// display information


//var address = "mongodb://weedoseeds.no-ip.org:27017/exampleDb"
var address = "mongodb://localhost:27017/exampleDb"
// Retrieve
var MongoClient = require('mongodb').MongoClient;


var playerCollection = "players";
var statsCollection = "stats";

// Connect to the db
MongoClient.connect(address, function(err, db) {
    if(err) { return console.dir(err); }
    onConnected(db);
});

var cleanCollection = function(db, collectionName) {
    console.log("cleaning", collectionName);
    var collection = db.collection(collectionName);
    collection.remove({}, function(err, result) {
        console.log("cleaned", result, "elements from", collectionName)
    })
}


var addPlayerToLocalDB = function(db, name, data) {
    var doc = {name:name, data:data[name]};
    //console.log("adding player", name, "to local database");
    db.collection(playerCollection).insert(doc, {status:"ok"}, function(err, result) {
        //console.log("added player", name, "to local database");
    });
}

var addStatsToLocalDB = function(db, data) {
    var doc = data;
    console.log("adding id", data.summonerId);
    //console.log("-> data", data);
    db.collection(statsCollection).insert(doc, {status:"ok"}, function(err, result) {
        console.log("added id", data.summonerId);
    });
}


var findPlayer = function(db, name, callback) {

    name = name.toLowerCase();
    console.log("looking for player", name);
    var collection = db.collection(playerCollection);

    collection.find({'name':name}).nextObject(function(err, doc) {
        if(!doc) {
            console.log(name, "not in base yet");
            requestName(name, function(err, data) {
                if(err) {
                    console.log("cannot gather", name);
                    callback(err, doc);
                    return;
                } 
                //console.log("Got new data for player", name,":", data[name]);
                addPlayerToLocalDB(db, name, data);
                callback(null, {name:name, data:data[name]});
            });
        } else {
            console.log(name, "already in base");//, doc)
            callback(null, doc);
        }
    });
}

var findStats = function(db, id, callback) {
    console.log("looking for id", id);
    var collection = db.collection(statsCollection);

    collection.find({'summonerId':id}).nextObject(function(err, doc) {
        if(!doc) {
            console.log(id, "not in base yet");
            requestInfo(id, function(err, data) {
                if(err) {
                    console.log("cannot gather", id);
                    callback(err, doc);
                    return;
                } 
                console.log("Got new data for player", id);//,":", data);
                addStatsToLocalDB(db, data);
                callback(err, data);
            });
        } else {
            console.log(id, "already in base");//, doc)
            callback(err, doc);
        }
    });   
}


var processStats = function(err, data) {
    console.log("got data for process:", data.summonerId);

    data.games.forEach(function(game) {
        console.log(game.championId);
    })
}

var process = function(db) {
    //cleanCollection(db, statsCollection);
    //cleanCollection(db, playerCollection);
    
    // Search ID by summonerName
    findPlayer(db, "Bre", function(err, data) {
        if(err) {
            console.log("error in findPlayer:", err);
            return;
        }

        var id = data.data.id;
        var name = data.data.name;
        console.log("found id:", id, "for player", name);

        findStats(db, id, function(err, data) {
            if(err) {
                console.log("error in findStats:", err);
                return;
            }

            //console.log("got data", data);

            var games = data.games;

            games.forEach(function(game) {
                console.log("champ:", game.championId);
            })
        })


    });
    
}



var myDb;

var onConnected = function(db) {
    console.log("connection ok");
    //process(db);
    myDb = db;
}





///  Express


var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(__dirname+"/public")); // Current directory is root

app.use(function(req, res, next) {
    if (req.headers.origin) {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization')
        res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE')
        if (req.method === 'OPTIONS') return res.send(200)
    }
    next()
})



app.get('/test', function(req, res){
  res.send('Hello World');
});


app.get('/stats/:name', function(req, res){

    var name = req.params.name

    var db = myDb;

     // Search ID by summonerName
    findPlayer(db, name, function(err, data) {
        if(err) {
            console.log("error in findPlayer:", err);
            return;
        }

        var id = data.data.id;
        var name = data.data.name;
        console.log("found id:", id, "for player", name);

        findStats(db, id, function(err, data) {
            if(err) {
                console.log("error in findStats:", err);
                return;
            }
            //console.log("got data", data);
            var games = data.games;

            games.forEach(function(game) {
                console.log("champ:", game.championId);
            })
            res.send(data);
        })


    });


});




var port = 8082
app.listen(port);
console.log('Listening on port', port);


/*

var host = "127.0.0.1";
var port = 8082;
var express = require("express");

var app = express();
app.use(app.router); //use both root and other routes below
app.use(express.static(__dirname + "/public")); //use static files in ROOT/public folder

app.get("/", function(request, response){ //root dir
    response.send("Hello!!");
});

app.listen(port, host);


*/