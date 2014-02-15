var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(__dirname)); // Current directory is root



app.get('/test', function(req, res){
  res.send('Hello World');
});



var port = 8082
app.listen(port);
console.log('Listening on port', port);

