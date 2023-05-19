var express = require('express');
var serve_static = require('serve-static');
var http = require('http');
const fs = require('fs');

var app = express();

app.use(serve_static(__dirname+"/public"));

console.log(__dirname + "/public")

var serveur = http.Server(app);

var io = require('socket.io').listen(serveur);

function check_exist(user, data){
    var bool = true;
    data.forEach(element => {
        //console.log(typeof user.pseudonyme + ' ' + typeof element.pseudonyme);
        //console.log(user.pseudonyme + ' ' + element.pseudonyme);
        if(element.pseudonyme == user.pseudonyme){
            //console.log('false');
            bool = false;
        }
    });
    return bool;
}

io.sockets.on('connection', function(socket){

    console.log("Un client s'est connecté!");
    
    socket.on('disconnect', function(){
        console.log("Un client s'est déconnecté!");
    })


    //fonctions register/login
    socket.on('create_user', function(){
        socket.emit('register');
    })

    socket.on('new_user', function(user){
        //console.log(user);
        var data = fs.readFileSync('users.json');
        //console.log(data)

        if(data == ""){
            console.log("undefined");
            fs.writeFile("users.json", JSON.stringify([user]), (error)=>{
                if(error){
                    console.log(error);
                    throw error;
                }
            console.log("users.json written correctly");
            socket.emit('reset');
            socket.emit('logged_in');
        })
        }
        else{
            var myObject = JSON.parse(data);
            if(check_exist(user, myObject) == true){
                
                console.log(myObject);
        
                myObject.push(user);

                fs.writeFile("users.json", JSON.stringify(myObject), (error)=>{
                    if(error){
                        console.log(error);
                        throw error;
                    }
                console.log("users.json written correctly");
                socket.emit('reset');
                socket.emit('logged_in');
            });
            }
        else{
            socket.emit('already_exist', user.pseudonyme);
            socket.emit('reset');
        }
    }


    })

    socket.on('login_button', function(){
        socket.emit('info_login');
    })

    socket.on('test_login', function(test_login){
        var data = fs.readFileSync('users.json');
        if(data == ""){
            socket.emit('alert_noexist');
        }
        else{
            var myObject = JSON.parse(data);
            var isOK = false;
            var ispseudoOK = false;

            myObject.forEach((element) =>{
                if(element.pseudonyme == test_login.pseudonyme && element.mdp == test_login.mdp){
                    isOK = true;
                }
                if(element.pseudonyme == test_login.pseudonyme){
                    ispseudoOK = true;
                }
            });

            if(isOK == true){
                socket.emit('login');
            }
            else if(isOK == false && ispseudoOK == true){
                socket.emit('wrong_password_alert');
            }
            else{
                socket.emit('alert_noexist');
            }
        }
    })

    //fonctions chat
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
    
})

//Ecoute sur un seul port
serveur.listen(8080, function(){
    console.log("Serveur en écoute sur le port 8080");
});