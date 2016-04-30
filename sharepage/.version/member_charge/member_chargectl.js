//#!本文件由share.js自动产生, 命令行为: node share.js gen member_charge
/**
 * member_chargeHTTP入口模块, 需要在主文件中添加map
 * var member_charge = require('./routes/member_charge').bindurl(app);
 */
'use strict';
var member_chargedb = require('./member_chargedb.js')
    // base function
    , share = require('../../sharepage.js')
    , express = require('express')
    , path = require('path')
    , sf = require('../../config.js')
    , commons = require('../../routes/commons.js')
    , inspect = require('util').inspect
    , ObjectID = require('mongodb').ObjectID;

// 模块相关的全局属性
const module_name = 'member_charge', module_desc = '会员操作日志';

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
}


// 注册URL
exports.bindurl=function(app){
    //静态文件
    app.use(express.static(path.join(__dirname, 'public')));
    //模版文件
    share.pushview(app, path.join(__dirname, 'view'));

    //动态文件
    share.bindurl(app, '/member_charge.html', { outType : 'page'}, exports.page);
    share.bindurl(app, '/member_charge/create', exports.create);
    share.bindurl(app, '/member_charge/update', exports.update);
    share.bindurl(app, '/member_charge/list', exports.list);

    share.bindurl(app, '/member_charge/get', exports.get);
    share.bindurl(app, '/member_charge/retriveByCond', exports.retriveByCond);
    share.bindurl(app, '/member_charge/delete', exports.delete);
    share.bindurl(app, '/member_charge/count', exports.count);


    share.bindurl(app, '/member_charge/dlg/:dlgfile', { outType : 'page'}, exports.dlg);
    //TODO: 扩展的API加在下面
    // ...
}


// GUI页面
exports.page = function(req, res){
    res.render('member_chargepage.html', {
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

    member_chargedb.create(arg.data, function(err, newDoc){
        if(err) return share.rt(false, `创建新${module_desc}对象出错:`  + err.message, res);

        share.rt(true, { _id: newDoc._id }, res);
    });
}

// 更新对象
exports.update = function(req, res){
    var arg = share.getParam(`更新${module_desc}对象`, req, res, [CRUD._id, CRUD.data]);
    if(!arg.passed) return;

    var data = arg.data;
    delete data._id;
    member_chargedb.update( arg._id , data , function(err, cnt){
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
    member_chargedb.list(arg.cond, arg.sort, page, function(err, docs){
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
    member_chargedb.count(arg.cond, function(err, count){
        if(err) return share.rt(false, err.message, res);
        
        share.rt(true, {count: count}, res);
    });
}



// 查询对象详细信息
exports.get = function(req, res){
    var arg = share.getParam(`读取${module_desc}对象数据`, req, res, [CRUD._id]);
    if(!arg.passed) return;

    member_chargedb.findById(arg._id, function(err, doc){
        if(err) return share.rt(false, `查询${module_desc}出错:` + err.message, res);
        if(!doc) return share.rt(false, "找不到对象：" + _id);

        share.rt(true, { doc : doc }, res);
    });
}

// 按照条件查询站点数据
exports.retriveByCond = function(req, res){ 
    var arg = share.getParam(`查询${module_desc}`, req, res, [PAGE.cond]);
    if(!arg.passed) return;

    member_chargedb.findByCond(arg.cond, function(err, doc){
        if(err) return share.rt(false, `查询${module_desc}出错:` + err.message, res);
        
        share.rt(true, { doc : doc }, res);
    });    
}

// 删除对象
exports.delete = function(req, res){
    var arg = share.getParam(`删除${module_desc}`, req, res, [CRUD._id]);
    if(!arg.passed) return;

    member_chargedb.delete(arg._id , function(err, doc){
        if(err) return share.rt(false, `删除${module_desc}出错:` + err.message, res);
        
        share.rt(true, { doc : doc }, res);
    });
}






// 返回对话框内容
exports.dlg = function(req, res){
    var arg = share.getParam("输出对话框:", req, res, [PAGE.dlgfile]);
    if(!arg.passed)
       return;

    res.render( 'member_charge/' + arg.dlgfile, {
        user : req.session.user,
        commons : require('../../routes/commons.js'),
    });
};


// === 扩展的代码请加在这一行下面，方便以后升级模板的时候合并 ===





