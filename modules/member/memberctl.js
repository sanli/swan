//#!本文件由share.js自动产生, 命令行为: node share.js gen member
/**
 * memberHTTP入口模块, 需要在主文件中添加map
 * var member = require('./routes/member').bindurl(app);
 */
'use strict';
var memberdb = require('./memberdb.js')
    // base function
    , share = require('../../sharepage.js')
    , express = require('express')
    , path = require('path')
    , sf = require('../../config.js')
    , async = require('async')
    , commons = require('../../routes/commons.js')
    , inspect = require('util').inspect
    , _ = require('lodash')
    , ObjectID = require('mongodb').ObjectID;

// 模块相关的全局属性
const module_name = 'member', module_desc = '会员管理';

//LIST用到的参数
var PAGE = {
    // 列表页条件,包括页的开始记录数skip，和页面长度limit 
    page : {name:'page', key:'page', optional: true, default: { skip: 0, limit: 50 }},
    // 查询条件
    cond : {name: 'cond', key: 'cond', optional: true, default: {} },
    // 排序条件
    sort : {name: 'sort', key: 'sort', optional: true, default: { _id :1 } },
    // 类型
    type : {name: 'type', key: 'type', optional: false},
    // dlg file
    dlgfile : {name: 'dlgfile', key: 'dlgfile', optional: false}
}
//导入文件用到的参数
var IMP = {
    file : {name: 'file', key: 'file', optional: false},
}
//CRUD参数
var CRUD = {
    data : {name: 'data', key: 'data', optional: false},
    _id : {name:'_id', key:'_id', optional: false},
    uuid : {name:'uuid', key:'uuid', optional: false},
    username : {name: 'username', key: 'username', optional: false},
    password : {name: 'password', key: 'password', optional: false},
}


// 注册URL
exports.bindurl=function(app){
    //静态文件
    app.use(express.static(path.join(__dirname, 'public')));
    //模版文件
    share.pushview(app, path.join(__dirname, 'view'));

    //动态文件
    share.bindurl(app, '/member.html', { outType : 'page'}, exports.page);
    share.bindurl(app, '/member/create', { needAuth : false }, exports.create);
    share.bindurl(app, '/member/update', exports.update);
    share.bindurl(app, '/member/list', exports.list);

    share.bindurl(app, '/member/get', exports.get);
    share.bindurl(app, '/member/retriveByCond', exports.retriveByCond);
    share.bindurl(app, '/member/delete', exports.delete);
    share.bindurl(app, '/member/count', { needMember : true }, exports.count);


    share.bindurl(app, '/member/dlg/:dlgfile', { outType : 'page'}, exports.dlg);
    //TODO: 扩展的API加在下面
    // ...
    share.bindurl(app, '/member/signin', { needAuth : false, needMember : false }, exports.signin);
    share.bindurl(app, '/member/signout', { needAuth : false, needMember : false }, exports.signout);
    // 读取用户信息
    share.bindurl(app, '/member/myprofile', { needMember : true }, exports.myprofile);
    share.bindurl(app, '/member/updateprofile', { needMember : true }, exports.updateprofile);
    // 增加用户在线时间
    share.bindurl(app, '/member/onlinecheck', { needMember : true }, exports.onlinecheck);
    // 增加用户在线时间
    share.bindurl(app, '/member/dailycheck', { needMember : true }, exports.dailycheck);
    // 在线时间兑换羽毛
    share.bindurl(app, '/member/exchangefeather', { needMember : true }, exports.exchangefeather);
    

    // ===============前端页面======================
    // 个人中心
    share.bindurl(app, '/member/profile.html', { needMember : true , outType : 'page'}, exports.profile);
    share.bindurl(app, '/member/profile/:uuid', { needMember : true , outType : 'page'}, exports.viewprofile);
    // 成员列表
    share.bindurl(app, '/member/listmemberapi', { needMember : true }, exports.listmemberapi) ;
    share.bindurl(app, '/member/listmember.html', { needMember : true }, exports.listmember);
}


// GUI页面
exports.page = function(req, res){
    res.render('memberpage.html', {
        conf : conf,
        user : req.session.user,
        commons : commons,
        opt : {
            title : module_desc
        }
    });
};

// 更新对象
exports.create = function(req, res){
    var arg = share.getParam(`创建新${module_desc}对象:`, req, res, [CRUD.data]);
    if(!arg.passed)
       return;

    // hash the password
    if(arg.data.密码) {
        arg.data.密码 = share.hashpass(arg.data.密码);
    }
    memberdb.create(arg.data, function(err, newDoc){
        if(err) return share.rt(false, `创建新${module_desc}对象出错:`  + err.message, res);

        var member = newDoc.toObject();
        req.session.member = member;
        share.rt(true, { _id: newDoc._id }, res);
    });
}

// 更新对象
exports.update = function(req, res){
    var arg = share.getParam(`更新${module_desc}对象`, req, res, [CRUD._id, CRUD.data]);
    if(!arg.passed) return;

    var data = arg.data;
    delete data._id;
    memberdb.update( arg._id , data , function(err, cnt){
        if(err) {
            console.log(err);
            return share.rt(false, `更新${module_desc}对象出错:` + err.message, res);
        }
        
        share.rt(true, { cnt : cnt }, res);
    });
}


// 查询对象，并返回列表
exports.list = function(req, res){
    var arg = share.getParam(`查询${module_desc}列表`, req, res, [PAGE.page, PAGE.cond, PAGE.sort]);
    if(!arg.passed)
        return;

    var page = {
        skip : parseInt(arg.page.skip),
        limit : parseInt(arg.page.limit),
    };

    share.searchCondExp(arg.cond);
    share.fillUserDataRule(arg.cond, req);
    memberdb.list(arg.cond, arg.sort, page, function(err, docs){
        if(err) return share.rt(false, err.message, res);
        
        share.rt(true, {docs: docs}, res);
    });
};

// 查询结果集的返回数量
exports.count = function(req, res){
    var arg = share.getParam(`统计${module_desc}数量`, req, res, [PAGE.cond]);
    if(!arg.passed)
        return;

    share.searchCondExp(arg.cond);
    share.fillUserDataRule(arg.cond, req);
    memberdb.count(arg.cond, function(err, count){
        if(err) return share.rt(false, err.message, res);
        
        share.rt(true, {count: count}, res);
    });
}



// 查询对象详细信息
exports.get = function(req, res){
    var arg = share.getParam(`读取${module_desc}对象数据`, req, res, [CRUD._id]);
    if(!arg.passed) return;

    memberdb.findById(arg._id, function(err, doc){
        if(err) return share.rt(false, `查询${module_desc}出错:` + err.message, res);
        if(!doc) return share.rt(false, "找不到对象：" + _id);

        share.rt(true, { doc : doc }, res);
    });
}

// 按照条件查询站点数据
exports.retriveByCond = function(req, res){ 
    var arg = share.getParam(`查询${module_desc}`, req, res, [PAGE.cond]);
    if(!arg.passed) return;

    memberdb.findByCond(arg.cond, function(err, doc){
        if(err) return share.rt(false, `查询${module_desc}出错:` + err.message, res);
        
        share.rt(true, { doc : doc }, res);
    });    
}

// 删除对象
exports.delete = function(req, res){
    var arg = share.getParam(`删除${module_desc}`, req, res, [CRUD._id]);
    if(!arg.passed) return;

    memberdb.delete(arg._id , function(err, doc){
        if(err) return share.rt(false, `删除${module_desc}出错:` + err.message, res);
        
        share.rt(true, { doc : doc }, res);
    });
}


// 返回对话框内容
exports.dlg = function(req, res){
    var arg = share.getParam("输出对话框:", req, res, [PAGE.dlgfile]);
    if(!arg.passed)
       return;

    res.render( 'member/' + arg.dlgfile, {
        user : req.session.user,
        commons : require('../../routes/commons.js'),
    });
};


// === 扩展的代码请加在这一行下面，方便以后升级模板的时候合并 ===
exports.signout = function(req, res){
    req.session.member = null;
    res.redirect('/');
}

exports.signin = function(req, res){
    var arg = share.getParam("会员登陆", req, res, [CRUD.username, CRUD.password]);
    if(!arg.passed) return;

    var password = share.hashpass(arg.password);
    var username = arg.username;

    memberdb.findByCond( { 昵称 : username, 密码 : password }, function(err, member){
        if(err) return share.rt(false, "登录出错：" + err.message, res);
        if(!member) return share.rt(false, "用户不存在或者密码错误", res);

        console.log("会员登录成功，昵称：%s", member.昵称);
        delete member['密码'];
        req.session.member = member;
        share.rt(true, { msg : "登录成功" }, res);
    });
}

exports.myprofile = function(req, res){
    var memberid = req.session.member._id;
    memberdb.findById( memberid, function(err, member){
        if(err) return share.rt(false, "查询出错：" + err.message, res);
        if(!member) return share.rt(false, "用户不存在", res);

        share.rt(true, { doc : member }, res);
    });
}


exports.updateprofile = function(req, res){
    var memberid = req.session.member._id;

    var arg = share.getParam(`更新${module_desc}对象`, req, res, [CRUD.data]);
    if(!arg.passed) return;

    var data = arg.data;
    data.utime = new Date();
    delete data._id;
    memberdb.update( memberid , data , function(err, member){
        if(err) {
            console.log(err);
            return share.rt(false, `更新${module_desc}对象出错:` + err.message, res);
        }
        
        req.session.member = member.toObject();
        share.rt(true, { doc : member }, res);
    });
}

exports.onlinecheck = function(req, res){
    var memberid = req.session.member._id;
    var arg = share.getParam(`更新${module_desc}对象`, req, res, [CRUD.data]);
    if(!arg.passed) return;
    var inc = arg.data.inc;
    memberdb.findById( memberid, function(err, member){
        if(err) return share.rt(false, "查询出错：" + err.message, res);
        if(!member) return share.rt(false, "用户不存在", res);

        // 根据用户最后修改时间计算在线时长，每次收到OnlineCheck，在线时长增加一分钟
        // TODO: 会被刷，应该在服务器端计算在线时长，目前先在开户端计数
        _inc_online(memberid, inc, function(err, data){
            if(err) return share.rt(false, "查询出错：" + err.message, res);

            share.rt(true, { 在线时长 : member.在线时长 + inc }, res);
        });
        memberdb.member.update({ _id : memberid }
            , { $inc : { 在线时长 : inc } }
            , function(err){
           
            });
    });
}


function _inc_further(memberid, inc, fn){
    memberdb.member.findOneAndUpdate({ _id : memberid }
        , { $inc : { 羽毛数量 : inc } }
        , { new : true }
        , function(err, member){
            if(err) return fn(err);
            
            fn(null, { 羽毛数量 : member.羽毛数量 });
        });    
}


function _inc_online(memberid, inc, fn){
    memberdb.member.findOneAndUpdate({ _id : memberid }
        , { $inc : { 在线时长 : inc } }
        , { new : true }
        , function(err, member){
            if(err) return fn(err);
            
            fn(null, { 在线时长 : member.在线时长 });
        });    
}



// 签到送羽毛
var ONE_DAY = 24 * 60 * 60 * 1000;
exports.dailycheck = function(req, res){
    var memberid = req.session.member._id;
    memberdb.findById( memberid, function(err, member){
        if(err) return share.rt(false, "查询出错：" + err.message, res);
        if(!memberid) return share.rt(false, "用户不存在", res);

        if(member.最后签到时间 && (new Date().getTime() - member.最后签到时间) <= ONE_DAY){
            return share.rt(true, { 羽毛数量 : member.羽毛数量 }, res);
        }

        async.waterfall([
            function(callback){
                _inc_further(memberid, 1,callback);
            },
            function(data, callback){
                // 更新最后签到时间
                memberdb.member.update({ _id : memberid}
                    , { $set : { 最后签到时间 : new Date() } }
                    , function(err){
                        if(err) return callback(err);

                        callback(null, data);
                    });
            }
        ], function(err, result){
            if(err) return share.rt(false, "查询出错：" + err.message, res);

            return share.rt(true, { 羽毛数量 : result.羽毛数量 }, res);
        });
    });
}

// 在线时间换羽毛
var ONE_FURTHER = 10; // 10分钟换一个羽毛
exports.exchangefeather = function(req, res){
    var memberid = req.session.member._id;
    memberdb.findById( memberid, function(err, member){
        if(err) return share.rt(false, "查询出错：" + err.message, res);
        if(!memberid) return share.rt(false, "用户不存在", res);

        var furtherinc = Math.floor(member.在线时长 / ONE_FURTHER);
        var exchangetime = furtherinc * ONE_FURTHER;
        async.waterfall([
            function(callback){
                _inc_further(memberid, furtherinc, callback);
            },
            function(data, callback){
                _inc_online(memberid, exchangetime, function(err, odata){
                    if(err) return callback(err);
                    return callback(null, _.extend({}, data, odata));
                });
            }
        ], function(err, result){
            if(err) return share.rt(false, "查询出错：" + err.message, res);

            return share.rt(true, result, res);
        });
    });
}

exports.profile = function(req, res){
    res.render('front/profilepage.html', {
        conf : conf,
        user: req.session.user,
        member : req.session.member,
        commons : commons,
        session : req.session,
        opt : {
            title : "天鹅网",
        }
    });
}

// 看别人
exports.viewprofile = function(req, res){
    var arg = share.getParam(`更新${module_desc}对象`, req, res, [CRUD.uuid], { use : 'params'});
    if(!arg.passed) return;    

    async.series({
        viewmember : async.apply( memberdb.findById, arg.uuid),
    }, function(err, result){
        if(err) return rt(false, "用户不存在", res);
        if(!result.viewmember) return rt(false, "用户不存在", res);

        res.render('front/viewprofilepage.html', {
            conf : conf,
            user: req.session.user,
            member : req.session.member,
            viewmember : result.viewmember,
            commons : commons,
            session : req.session,
            opt : {
                title : "天鹅网",
            }
        });
    });
}

// 查询会员列表
exports.listmember = function(req, res){
    res.render('front/listmemberpage.html', {
        conf : conf,
        user : req.session.user,
        commons : commons,
        opt : {
            title : module_desc
        }
    });
}

// 查询对象，并返回列表
exports.listmemberapi = function(req, res){
    var arg = share.getParam(`查询${module_desc}列表 with listmemberapi`, req, res, [PAGE.page, PAGE.cond, PAGE.sort]);
    if(!arg.passed)
        return;

    var page = {
        skip : parseInt(arg.page.skip),
        limit : parseInt(arg.page.limit),
    };

    share.searchCondExp(arg.cond);
    share.fillUserDataRule(arg.cond, req);
    memberdb.list(arg.cond, arg.sort, page, function(err, docs){
        if(err) return share.rt(false, err.message, res);
        
        // 执行信息过滤

        share.rt(true, { docs: docs }, res);
    });
};


