//#!本文件由share.js自动产生, 命令行为: node share.js gen enum CRUD ..
'use strict';
/**
 * enum数据库访问类
 */
var inspect = require('util').inspect
  , ObjectID = require('mongodb').ObjectID
  , mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , Data = require('../mongo.js')
  , Helper = require('../mongo.js').Helper
  , extend = require('node.extend')
  , csv = require('csv') 
  , share = require('../sharepage.js');

// 模块相关的全局属性
const module_name = 'enum', module_desc = '数据字典管理';
// === 基本数据结构定义，按照实际需求修改 ===

// TODO: 下面为Demo数据结构，请改成模块实际数据结构
var sys_enum = new Schema({
    // ID字段在每个对象中会自动创建，除非需要自己创建_id,否者不要放开
    /* _id : Schema.Types.ObjectId, */
    // ---- 基本信息 ----
    // 字典项名称
    enum_name : String,
    // 字典类型
    enum_type : String,
    // 字典的描述
    desc : String,
    // 模块显示在菜单上的字符
    items : [{
      name : String,
      value : String
    }],

    // ------------------ 通用数据 ----------------
    // 最后修改时间
    ctime : Date,
    // 最后修改时间
    utime : Date,
},  { collection: 'sys_enum' });

// 创建索引，以及设置唯一键
// TODO: 根据实际结构确定索引结构
sys_enum.index({_id : 1})
    .index({enum_name : 1}, { unique : true })
    .index({"enum_name" : 1, "items.name" : 1}, { unique : true });
var sys_enum = mongoose.model('sys_enum', sys_enum ),
    _Module = sys_enum ;
exports.sys_enum  = sys_enum;


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

      _refreshEnums();
      fn(err, newModule);
    });
};

// 更新对象
exports.update = function(_id, data, fn){
    data.utime = new Date();
    _Module.findByIdAndUpdate(_id, {$set: data}, {new : false}, function(err){
      if(!err) _refreshEnums();

      fn(err);
    });
};

//删除对象
exports.delete = function(_id, fn) {
    _Module.remove({ _id : { $in :_id } } , function(err){
      if(!err) _refreshEnums();

      fn(err);
    });
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



// =============================
// 通过CSV导入数据，需要导入数据的模块要修改一下的实现
// =============================
var imp = require('../data/imp.js');
function _createDataImporter( filename, Module, fields, args ){
    var self = imp.Importer( filename, Module, args );
    
    // 根据类型创建定义，从CSV文件的一行中创建对象
    self.createObjByType = function(record, line){
        var result = extend({}, args);
        record.forEach(function(field, index){
            var fieldname = fields[index];
            field = field.trim();
            result[fieldname] = field;
        });

        return result ;
    };

    // 替换或者是合并到新的基站数据中
    self.updateObject = function(obj, callback){
        // TODO: 修改主键和更新方法
        var select = { EnodeBID: obj.EnodeBID , city: obj.city },
            update = { $set : obj };
            // 导入数据到导入历史记录中
        Module.update( select, update , {upsert : true}, callback);
    };
    return self;
};

var cvsfield = ['enum_name', 'enum_type', 'desc', 'items'],
    cvsfield_validrule = ['enum_name*', 'enum_type*', 'desc', 'items'];
exports.importCSV = function(filename, fn, updater, opts) {
    var args = opts;
    if(!fs.existsSync(filename)){
        return fn(new Error('数据文件:' + filename + ' 不存在'));
    }
    
    // 创建验证工具或者是导入工具
    var impfn = opts.verify 
      ? imp.createDataValidator(filename, cvsfield_validrule, extend({}, args, {
            //TODO : 修改为对应的验证用数据字典名称前缀，一般是模块名称
            enumname_prefix : '数据字典'
        }), function(data){ 
          return data['enum_name'];
        }) 
      : _createDataImporter(filename, _Module, cvsfield, args);
      
    impfn.import(function(err, count, cellIds){
        if(err) {
            console.trace("导入enum出错", err);
            return fn(err)
        };

        return fn(err, count, cellIds);
    }, updater);
};
exports.cvsfield = cvsfield;




exports.createExporter = function(){
    //TODO : 修改导出字段名称
    var columns = ['字典项名称', '字典类型', '字典的描述', '字典值'],
      datafields = ['enum_name', 'enum_type', 'desc', 'items'];
    return {
        head : function(){
            return columns.join(',') + '\n';
        },
        data : function(data){
            var out = datafields.map(function(field){
                return share.getnest(data, field);
            });
            return '"' + out.join('","') + '"\n' ;
        }
    }
}

// =============== 扩展的代码请加在这一行下面，方便以后升级模板的时候合并 ===================
// 返回所有系统模块，用于内部的权限查询，会进行缓存，修改module是需要清楚Cache
var cachedGetAll = share._CreateCachedGetAllFn('sysenumdb.enums', "getAllEnums", _Module, {}, {}),
    invalideCache = cachedGetAll.invalide;

var cache = require('memory-cache');
// 载入缓存
function _loadCache(fn){
  cachedGetAll.list(function(err, enums){
    if(err) {
      console.trace(err);
      return fn(err);
    }else{
      console.log('载入字典完成, 一共载入：%s个项目', enums.length);
    }

    enums.forEach( (enumitem) => cache.put('enums.' + enumitem.enum_name, enumitem.items));
    fn && fn(null, enums);
  });
}

// 刷新缓存
function _refreshEnums(fn){
  invalideCache();
  _loadCache(fn);
}


exports.getEnum = function(enum_name){
  return cache.get('enums.' + enum_name);
}


// 系统启动的时候载入字典
_loadCache();
// ============================= 下面是单元测试用的代码 ================================
var isme = require('../sharepage.js').isme;
var tester = {
  testfn: function(){
    //TODO : 执行测试代码
  }
}

if(isme(__filename)){
  if(process.argv.length > 2 && isme(__filename)){
    testfn = process.argv[2];
    console.log("run test:%s", testfn);

    if(tester[testfn]){
      tester[testfn]();
    }
  }else{
    var testcmd = [];
    for(cmd in tester)
      testcmd.push(cmd);

    console.log('enumdb.js '+ testcmd.join('|'));
  }
}

