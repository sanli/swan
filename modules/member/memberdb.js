//#!本文件由share.js自动产生, 命令行为: node share.js gen member CRUD ..
'use strict';
/**
 * member数据库访问类
 */
var inspect = require('util').inspect
  , ObjectID = require('mongodb').ObjectID
  , mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , Data = require('../../mongo.js')
  , Helper = require('../../mongo.js').Helper
  , extend = require('node.extend')
  , csv = require('csv') 
  , share = require('../../sharepage.js');

// 模块相关的全局属性
const module_name = 'member', module_desc = '会员管理';
// === 基本数据结构定义，按照实际需求修改 ===

// TODO: 下面为Demo数据结构，请改成模块实际数据结构
var member = new Schema({
    // ID字段在每个对象中会自动创建，除非需要自己创建_id,否者不要放开
    /* _id : Schema.Types.ObjectId, */
    // ---- 基本信息 ----
    // 用户昵称唯一，且不能修改
    昵称 : String,
    // 模块显示在菜单上的字符
    密码 : String,
    // 用户QQ唯一
    QQ : String,
    // 用户邮箱唯一
    邮箱 : String,

    // ------------------ 以下基本信息 -------------
    // 注册后不可修改，男， 女
    性别 : String,
    身高 : Number,
    出生年: Number,
    出生月: Number,
    最高学历 : String,
    婚姻状况 : String,
    // 模块初始化的时候传入到模块的基础参数
    从事职业 : String,
    年收入 : String,
    所在省 : String,
    所在市 : String,
    所在区 : String,
    交友宣言 : String,

    // 个人信息
    相册 : [String],
    每月花费 : String,
    我要寻找 : [String],
    我能提供 : String,
    希望得到 : String,
    爱情观念 : [String],
    外貌 : [String],
    个性 : [String],
    兴趣爱好 : [String],
    自我介绍 : String,
    期望情人 : String,

    // other info
    交友宣言 : String,

    // ------------------ 联系资料 -------------
    手机 : String,
    微信 : String,
    其他 : String,

    // ------------------ 系统相关信息 -------------
    // 未认证 ／ 已发送 ／ 已验证
    手机认证状态 : { type : String, default : "未认证" },
    邮箱认证状态 : { type : String, default : "未认证" },
    QQ认证状态 : { type : String, default : "未认证" },
    视频认证状态 : { type : String, default : "未认证" },
    被浏览次数 : { type : Number, default : 0 },
    最后IP : String,
    // 单位是分钟
    在线时长 : { type : Number, default : 0 },
    最后签到时间 : Date,

    // ------------------ 服务卡通相关信息 -------------
    羽毛数量 : { type : Number, default : 20 },
    会员级别 : { type : String, default : '普通会员' },
    置顶 : { type : Boolean, default : false },
    被浏览量 : { type : Number, default : 0 },

    // ------------------ 通用数据 ----------------
    // 创建修改时间
    ctime : { type : Date, default :  Date.now },
    // 最后修改时间
    utime : { type : Date, default :  Date.now },
},  { collection: 'member' });

// 创建索引，以及设置唯一键
// TODO: 根据实际结构确定索引结构
member.index({_id : 1})
    .index({昵称 : 1}, { unique : true })
    .index({QQ : 1}, { unique : true })
    .index({邮箱 : 1}, { unique : true });
var member = mongoose.model('member', member ),
    _Module = member ;
exports.member  = member;


// 以下字段不用在列表查询的时候返回
// TODO:  需要修改为实际数据结构对应的字段
var defaultProjection = { ctime : 0, utime : 0 };


// === 基本功能实现函数,一般不用修改 ===
// 创建对象
exports.create = function(data, fn){
    var module = new _Module(data);
    module.ctime = new Date();
    module.utime = new Date();


    _Module.create(module, function(err, newModule){
      if(err) return fn(err);
      fn(err, newModule);
    });
};

// 更新对象
exports.update = function(_id, data, fn){
    data.utime = new Date();
    _Module.findByIdAndUpdate(_id, {$set: data}, {new : true}, fn);
};

//删除对象
exports.delete = function(_id, fn) {
    _Module.remove({ _id : { $in : _id } } , fn);
}

// 查询数据，支持排序和分页
exports.list = function(cond, sort, page, fn){
    // 使用Aggregate查询数据
  _Module.find(cond, defaultProjection)
    .sort(sort)
    .skip(page.skip)
    .limit(page.limit)
    .exec(fn);
}

// 普通查询,用于数据导出
exports.query = function(cond, sort, fn){
    _Module.find(cond)
    .sort(sort)
    .exec(fn);
}

//返回某个查询的返回值数量，主要用于分页
exports.count = function(cond, fn){
  _Module.find(cond)
    .count(function(err, count){
      if(err) return fn(err);

      fn(err, count);
    });
}

//按照ID查询对象
exports.findById = function(_id, fn){
  _Module.findById(_id, function(err, doc){
    fn(err, doc ? doc.toObject() : {});
  });
}

// 按照条件查询返回一个第一个找到的对象
exports.findByCond = function(cond, fn){
  _Module.findOne(cond, function(err, doc){
    fn(err, doc ? doc.toObject() : null);
  });  
}






// =============== 扩展的代码请加在这一行下面，方便以后升级模板的时候合并 ===================



// ============================= 下面是单元测试用的代码 ================================
var isme = require('../../sharepage.js').isme;
var tester = {
  testfn: function(){
    //TODO : 执行测试代码
  },

  test_hash : function(){
    var targets = ['password', 'This is log password', '中文也行？'];
    targets.forEach( pass=> console.log( pass + " => "+ share.hashpass(pass)));
  }

}

if(isme(__filename)){
  if(process.argv.length > 2 && isme(__filename)){
    var testfn = process.argv[2];
    console.log("run test:%s", testfn);

    if(tester[testfn]){
      tester[testfn]();
    }
  }else{
    var testcmd = [];
    for(var cmd in tester)
      testcmd.push(cmd);

    console.log('memberdb.js '+ testcmd.join('|'));
  }
}

