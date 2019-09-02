// 引入 express 包
var express = require('express');

// 创建应用
var app = express();

//静态目录设置
app.use(express.static('./static'));

// 模板存放目录
app.set('views', './views');
app.set('view engine', 'ejs')

var server = require('http').createServer(app);

// 创建 socket 服务
var io = require('socket.io')(server);

// 路由规则
app.get('/chat', function (req, res) {
    res.render('chat')
});

// 所有的登录用户
var users = [];

// 获取登录用户的用户名和头像
function getLoginUserInfo() {
    var data = []
    for (var i = 0; i < users.length; i++) {
        var temp = {
            username: users[i].username,
            profile: users[i].profile
        }
        data.push(temp)
    }
    return data
};

io.on('connection', function (socket) {

    // 监听 login 频道
    // data  {usrname:'lisi',profile:'/1.jpg'}
    socket.on('login', function (data) {
        // 存储用户登录信息
        var user = {
            username: data.username,
            profile: data.profile,
            socket: socket  // 通过 socket 可以给用户发消息
        }

        // 压入数组
        users.push(user);

        // 向客户端发送消息
        socket.emit('login', '1')

        // 向所有的登录用户发送一条新用户添加消息
        socket.broadcast.emit('newuser', data)
    });

    // 监听 users 频道
    socket.on('users', function (data) {

        // 发送用户的信息
        socket.emit('users', getLoginUserInfo())
    });

    // 监听 logout 退出频道
    socket.on('logout', function (data) {

        // 广播通知其他客户端，该用户下线
        socket.broadcast.emit('logout', data)

        //将该用户从 users 中删除
        for (var i = 0; i < users.length; i++) {
            if (users[i].username == data.username) {
                users.splice(i, 1)
                break;
            }
        }
    })

    // 监听 message 频道
    socket.on('message', function (data) {
        socket.broadcast.emit('message', data)
        console.log(data)
    })
});


server.listen(4000, function () {
    console.log('server is running...');
});
