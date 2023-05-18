var express = require('express');
var serve_static = require('serve-static');
var http = require('http');

var app = express();

app.use(serve_static(__dirname+"/public"));

console.log(__dirname + "/public")

var serveur = http.createServer(app);

//Ecoute sur un seul port
serveur.listen(8080, function(){
    console.log("Serveur en écoute sur le port 8080");
});

var io = require('socket.io').listen(serveur);

io.sockets.on('connection', function(socket){

    console.log("Un client s'est connecté!");
    
    socket.on('send-message', function(message, room){
        console.log("Message reçu: ", message);
        if(room){
            socket.to(room).emit('receive-message', message);
        }
        else{
            socket.broadcast.emit('receive-message', message);
        }
    });

    socket.on('join-room', function(room){
        socket.join(room);
    });

    socket.on('disconnect', function(){
        console.log("Un client s'est déconnecté!");
    })
});

