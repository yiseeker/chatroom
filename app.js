var express = require('express');
var routes = require('./routes/index');
var users = require('./routes/users');
var path=require('path');

var app = express();

var server=require('http').Server(app);
var io=require('socket.io').listen(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//maintain a online client list
var clientList=new Array();
io.on('connection',function(socket){
    socket.on('disconnect',function(){
        console.log('user leave');
    });


    socket.on('_join',function(room){
        console.log('a user join, clientID='+socket.id);

        socket.join(room);
        var socketId=socket.id;

        //for a new comer, you have 2 step to go:
        //1.emit you join event to the room.
        socket.broadcast.to(room).emit('_join',socketId);

        //2.get online clients already in the room.
        var clientInRoom=new Array();
        for(var i in clientList)
        {
            if(clientList[i].room===room)
            {
                clientInRoom.push(clientList[i]);
            }
        }
        socket.emit('_getOnlineLists',clientInRoom);
        socket.emit('_getSocketId',socketId);
        //after all above done, add this client to the clientList.
        clientList.push({room:room,socketid:socketId});
    });

    socket.on('_message',function(message){
        if(message.type=='offer')
        {

        }
        else if(message.type=='answer')
        {

        }
        else if(message.type=='candidate')
        {

        }
    });
})


server.listen(3000,function(){
    console.log('app: listening port 3000');
})

module.exports = app;
