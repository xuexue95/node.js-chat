$(function () {

    // 创建 socket 对象
    var socket = io();

    // 封装一个用户对象
    var User = {
        // {username:1111,profile:'/1.jpg'}
        addNewUser:function(data){

            // 克隆元素
            var item = $('#bak .item').clone();

            // 修改元素
            item.find('h4').html(data.username)
            item.find('img').attr('src',data.profile)

            // 插入元素
            $('.users ul').append(item)
        },
        getUserName:function(){
            return $('input[name=username]').val()
        },
        getProfile:function(){
            return $('input[name=profile]').val()
        }
    }

    // 封装一个消息对象
    var Msg = {

        // data {profile:'1.jpg,username:'lisi','message':'hello'}
        send:function(data){
            console.log(data)
            // 在聊天窗口显示内容
            var msg  = $('#bak .right').clone()

            // 修改元素中的值
            msg.find('img').attr('src',data.profile)
            msg.find('.media-heading').html(data.username)
            msg.find('p').html(data.message)

            // 插入到聊天窗口
            msg.appendTo('#content')

            // 发送给服务器
            socket.emit('message',data)

            this.autoScroll()
        },

        recevie:function(data){
            console.log(data)
            // 在聊天窗口显示内容
            var msg  = $('#bak .left').clone()

            // 修改元素中的值
            msg.find('img').attr('src',data.profile)
            msg.find('.media-heading').html(data.username)
            msg.find('p').html(data.message)

            // 插入到聊天窗口
            msg.appendTo('#content')
            this.autoScroll()

        },

        autoScroll:function(){
            $('#content').scrollTop(100000)
        }

    }

    

    // 显示登录窗口
    $('#modal').modal();

    // 登录效果
    $('#profiles li').click(function(){

        // 获取 src 值
        var src = $(this).find('img').attr('src');

        // 修改隐藏域的值
        $('input[name=profile]').val(src);

        // 样式的变换
        $('#profiles li').removeClass('active');
        $(this).addClass('active');

    })

    // 登录按钮单击事件
    $('#login').click(function(){
        // 获取值
        var username = $('input[name=username]').val();
        var profile = $('input[name=profile]').val();

        // 发送信息给服务器
        socket.emit('login',{username:username,profile:profile})
    });

    // 发送按钮事件
    $('#send').click(function(){
        // 获取当前用户的输入值
        var v= $('textarea').val()
        Msg.send({username:User.getUserName(),profile:User.getProfile(),message:v})
        // 清空 textarea
        $('textarea').val('')
    })

    // 绑定事件 onload 窗口页面元素加载完毕之后 onbeforeunload 页面卸载和关闭之前
    // onunload 在页面销毁时触发的事件
    window.onbeforeunload = function(){
        return '确定要离开吗?'
    }
    window.onunload = function(){
        socket.emit('logout',{username:User.getUserName()})
    }

    // socket 监听
    socket.on('login',function(data){
        if (data == '1') {
            $('#modal').modal('hide');
            alert('登录成功');

            // 获取用户列表
            socket.emit('users');
        }
    })

    // 获取用户列表
    socket.on('users',function(data){
        
        // 遍历显示用户信息
        for(var i=0;i<data.length;i++){
            User.addNewUser(data[i])
        }
    })

    // 接受新用户登录信息
    socket.on('newuser',function(data){
        User.addNewUser(data)
    })

    // 退出用户的消息 {username:'1111'}
    socket.on('logout',function(data){
        $('.users .item').each(function(){
            if ($(this).find('h4').html() == data.username) {
                $(this).remove()
            }
        })
    })

    // 监听 message
    socket.on('message',function(data){
        Msg.recevie(data)
    })



})

