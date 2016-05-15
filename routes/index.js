
'use strict';
var share = require('../sharepage.js')
    , express = require('express')
    , path = require('path')
    , sf = require('../config.js')
    , commons = require('./commons.js')
    , inspect = require('util').inspect
    , ObjectID = require('mongodb').ObjectID;


// 注册URL
exports.bindurl=function(app){
    share.bindurl(app, '/', { needAuth : false, outType : 'page'}, exports.index);
    share.bindurl(app, '/main.html', { outType : 'page'}, exports.main);    
	share.bindurl(app, '/signin.html', { needAuth : false, outType : 'page'}, exports.signin);

    // 首页
    share.bindurl(app, '/index.html', { needAuth : false, outType : 'page'}, exports.index);
    // 新用户注册
    share.bindurl(app, '/register.html', { needAuth : false, outType : 'page'}, exports.register);
    
    // 
    share.bindurl(app, '/comingsoon.html', { needAuth : false, outType : 'page'}, exports.comingsoon);
}

/*
 * GET home page.
 */
exports.index = function(req, res){
    res.render('front/indexpage.html', {
        conf : require('../config.js'),
        user: req.session.user,
        member: req.session.member,
        commons : commons,
        opt : {
            title : "天鹅网"
        }
    });
};

/*
 * GET home page.
 */
exports.register = function(req, res){
    res.render('front/registerpage.html', {
        conf : require('../config.js'),
        user: req.session.user,
        commons : commons,
        opt : {
            title : "天鹅网"
        }
    });
};


/*
 * GET home page.
 */
exports.comingsoon = function(req, res){
    res.render('front/coming_soonpage.html', {
        conf : require('../config.js'),
        user: req.session.user,
        commons : commons,
        opt : {
            title : "天鹅网"
        }
    });
};

/*
 * GET home page.
 */
exports.main = function(req, res){
    res.render('mainpage.html', {
        conf : require('../config.js'),
        user: req.session.user,
        commons : commons,
        opt : {
            title : "天鹅网"
        }
    });
};


/*
 * GET home page.
 */
exports.signin = function(req, res){
	res.render('signin.html', {
		conf : require('../config.js'),
	    user: req.session.user,
	    commons : commons,
	    opt : {
            title : "sharepage-project"
        }
	});
};

