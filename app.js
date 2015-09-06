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

var clientCount=0;

io.on('connection',function(socket){
    socket.on('disconnect',function(){
        console.log('user leave,count: '+(--clientCount));
        if(clientCount!=2)
        {
            io.sockets.emit('not ready');
            console.log('Server is not Ready!');
        }
    });
    socket.on('join',function(){
        console.log('user join, count: '+(++clientCount));
        if(clientCount==2)
        {
            io.sockets.emit('ready');
            console.log('Server is Ready!');
        }
    });
    socket.on('offer',function(description){
        console.log('offer arrives');
        socket.broadcast.emit('offer',description);
    });
    socket.on('answer',function(desc){
        console.log('answer arrives');
        socket.broadcast.emit('answer',desc);
    });
    socket.on('icecandidate',function(candidate){
        console.log(socket.id+' : candidate arrives:\n'+JSON.stringify(candidate));
        socket.broadcast.emit('icecandidate',candidate);
    });
})


server.listen(3000,function(){
    console.log('app: listening port 3000');
})

module.exports = app;
