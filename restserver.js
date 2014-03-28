var https = require("https");
//var http = require("http");

   

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
    https.get(url, function (response) {
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
    var doc = {name:name, data:data[name], lastupdate:Date.now()};
    //console.log("adding player", name, "to local database");
    db.collection(playerCollection).insert(doc, {status:"ok"}, function(err, result) {
        //console.log("added player", name, "to local database");
    });

}

var addStatsToLocalDB = function(db, data) {
    var doc = data;

    var id = data.summonerId;
    doc.lastupdate = Date.now();
    doc._id = id;

    console.log("adding id", id);
    db.collection(statsCollection).update({_id:id}, doc, {upsert:true}, function(err, result) {
        console.log("added id", id);
    });

}



var findPlayers = function(db, callback) {
    console.log("looking for players");
    var collection = db.collection(playerCollection);
    collection.find({}, {}, {limit:50}).toArray(function(err, docs) {

        //console.log("DOCS:", docs);
        callback(null, docs);
    });
}


var findPlayer = function(db, name, callback) {

    name = name.toLowerCase();
    console.log("looking for player", name);
    var collection = db.collection(playerCollection);
    var query = { 'name':name };
    collection.findOne(query, function(err, doc) {
        if(!doc) {
            console.log(name, "not in base yet");
            requestName(name, function(err, data) {
                console.log('response of requestName', err, data);
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
    
    var query = {
        'summonerId':id,
        //'lastupdate': {
        //    $gt: Date.now() - 10000 // update if older than 10 seconds
        //}
    };

    collection.findOne(query, function(err, doc) {
        var needUpdate = false;

        if(!doc) {
            console.log(id, "not in base yet");
            needUpdate = true;
        }

        if(doc && Date.now() - doc.lastupdate > 10000) {
            console.log(Date.now());
            console.log(doc.lastupdate);
            console.log(id, "not up to date in base, cachedsince:", (Date.now() - doc.lastupdate)/1000, "seconds");
            needUpdate = true;
        }

        if(needUpdate) {
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
            console.log(id, "already up to date in base");//, doc)
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


var myDb;

var onConnected = function(db) {
    console.log("connection ok");
    myDb = db;

    /*
    TESTS
    */
    //cleanCollection(db, playerCollection);
    //cleanCollection(db, statsCollection);

/*
     // Search ID by summonerName
    findPlayer(db, "Bart", function(err, data) {
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
*/

}





///  Express

var port = 8082

var express = require('express');
var http = require("http");
var io = require('socket.io');

var app = express();

var server = http.createServer(app);

server.listen(port, function() {
    console.log('Listenning on port', port)
})

var sio = io.listen(server);


app.use(express.cookieParser('COOKIE-SECRET-KEY'));
app.use(express.cookieSession());


app.use(express.bodyParser());
app.use(express.methodOverride());


app.use(express.static(__dirname+"/public")); // Current directory is root



var fill = function(str, char, length) {
    while(str.length < length) {
        str = char + str;
    }
    return str;
}


var getFormattedDate = function() {
    var now = new Date();

    var y = now.getFullYear().toString();
    var M = (now.getMonth()+1).toString();
    var d = now.getDate().toString();

    var h = now.getHours().toString();
    var m = now.getMinutes().toString();
    var s = now.getSeconds().toString();

    var date = y + '/'
             + fill(M, '0', 2) + '/'
             + fill(d, '0', 2) + '-'
             + fill(h, '0', 2) + ':'
             + fill(m, '0', 2) + ':' 
             + fill(s, '0', 2);
    return date;
}


var lastMessages = [
    {
        date: getFormattedDate(),
        name: 'Server',
        message: 'Started'
    }
];


var addToChatHistory = function(date, name, message) {
    console.log("adding name to histore", name)
    var message = {
        date:date,
        name:name,
        message:message
    }
    lastMessages.push(message);
    while(lastMessages.length > 100) {
        lastMessages.shift();
    }
}

var sendMessageToClient = function(date, name, message) {
    sio.sockets.emit("message_to_client",{ 
        date: date,
        name: name,
        message: message
    });
}

sio.sockets.on('connection', function(socket) {
    console.log("connection !")

    // send former messages
    lastMessages.forEach(function(data) {
        //sendMessageToClient(data.date, data.name, data.message);

        sio.sockets.socket(socket.id).emit("message_to_client",{ 
            date: data.date,
            name: data.name,
            message: data.message
        });

    });

    socket.on('message_to_server', function(data) {
        if(data.message.length > 1024) {
            data.message = data.message.substr(0, 1024)
        }

        //console.log('received', data);
        var date = getFormattedDate();
        addToChatHistory(date, data.name, data.message);
        sendMessageToClient(date, data.name, data.message);
    });
});






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


app.get('/chatname', function(req, res) {
    console.log('cookie route', req.cookies);
    if (!req.cookies.chatname) {
        res.send({name:'MALPHITE'});
    } else {
        res.send({name: req.cookies.chatname});
    }
})


app.get('/players', function(req, res) {

    var db = myDb;
    findPlayers(db, function(err, data) {
        if(err) {
            console.log("error in findPlayer:", err);
            res.send([]);
            return;
        }
        console.log("HEY:", data);
        res.send(data);
    })
});


app.get('/stats/:name', function(req, res){

    var name = req.params.name
    var db = myDb;

    if(name == "hrp") {
        cleanCollection(db, playerCollection);
        res.send("ok");
        return;
    }

    if(name == "hrs") {
        cleanCollection(db, statsCollection);
        res.send("ok");
        return;
    }

     // Search ID by summonerName
    findPlayer(db, name, function(err, data) {
        if(err) {
            console.log("error in findPlayer:", err);
            return;
        }

        if(!data || !data.data) {
            console.log("unvalid player name")
            return;
        }

        console.log(data.data);

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


