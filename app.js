//*********************************************
//Variable Region Starts
var clientList=new Array();
var express = require('express');
var routes = require('./routes/index');
var users = require('./routes/users');
var path=require('path');
var app = express();
var server=require('http').Server(app);
var io=require('socket.io').listen(server);
//Variable Region Ends
//*********************************************



//*********************************************
//Setting Region Starts
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

io.on('connection',function(socket){
    socket.on('disconnect',function(){
        var room=GetRoomBySocketId(socket.id);
        if(room!='')
        {
            socket.broadcast.to(room).emit('_offline',socket.id);
        }
        clientList.Remove(socket.id);
        console.log('user leave, remove socketid and emmit to room: '+socket.id);
        Traversal();
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
            if(IsSocketOnLine(message.to))//if destination socket still online,send offer to it
            {
                io.sockets.connected[message.to].emit('_message',message);
                console.log('[emit offer] from : '+message.from+' to : '+message.to);
            }
            else//if socket offline, remove from the clientList array
            {
                var sid=message.to;
                socket.emit('_offline',sid);
                clientList.Remove(sid);
                console.log('[user offline] : '+sid);
            }
        }
        else if(message.type=='answer')
        {
            if(IsSocketOnLine(message.to))//if destination socket still online,send offer to it
            {
                io.sockets.connected[message.to].emit('_message',message);
                console.log('[emit answer] from : '+message.from+' to : '+message.to);
            }
            else//if socket offline, remove from the clientList array
            {
                var sid=message.to;
                socket.emit('_offline',sid);
                clientList.Remove(sid);
                console.log('[user offline] : '+sid);
            }
        }
        else if(message.type=='candidate')
        {
            socket.broadcast.to(GetRoomBySocketId(socket.id)).emit('_message',message);
            console.log('[emit candidate] from : '+socket.id);
            //console.log('[CANDIDATE INFO] : '+JSON.stringify(message.data));
        }
    });
});



server.listen(3000,function(){
    console.log('app: listening port 3000');
});

//Setting Region Ends
//*********************************************



///Function Region Start
function IsSocketOnLine(sid){
    for(var i in clientList)
    {
        if(clientList[i].socketid==sid)
        {
            return true;
        }
    }
    return false;
}

//define remove method of Array Prototype
Array.prototype.Remove=function(val)
{
    var index=-1;
    for(var i in clientList)
    {
        if(clientList[i].socketid==val)
        {
            index=i;
            break;
        }
    }
    if(index>-1)
    {
        this.splice(index,1);
    }
};

function GetRoomBySocketId(sid)
{
    for(var i in clientList)
    {
        if(clientList[i].socketid==sid)
        {
            return clientList[i].room;
        }
    }
    return '';
}


function Traversal()
{
    console.log('Current Clients on Server:');
    for(var i in clientList)
    {
        if(typeof(clientList[i].socketid)!='undefined')
        {
            console.log('ID='+clientList[i].socketid);
        }
    }
}


//Function Region Ends



module.exports = app;
