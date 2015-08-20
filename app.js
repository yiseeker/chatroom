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

io.on('connection',function(socket){
    console.log('a user is connected!');
    socket.on('disconnect',function(){
        console.log('user is leaving...');
    });
    socket.on('ev_toserver',function(_content){
        console.log('GET : '+_content);
        io.emit('ev_toclient',_content);
    });
})


server.listen(3000,function(){
    console.log('app: listening port 3000');
})

module.exports = app;
