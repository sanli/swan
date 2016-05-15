//#!本文件由share.js自动产生, 命令行为: node sharecli.js gen member

// Page状态对象
var PG = new $P({
    default :{
        // 查询条件
        cond : {},
        // 翻页条件
        page : { skip: 0, limit: 20 },
        // 排序字段
        sort : { by : 'id', order : 1 },
        editing : false,
        searching : false
    },

    bind: function(){
        this.bindhash();
        $(PG).on('statechange', Module.onPageStateChange);
    },

    // 模块名称
    module : 'member',
});

var Module = $.extend(new $M(), {
    // =========================================================================
    //  PageStateChage是功能的入口,一般由某个界面事件触发出状态改变，再由状态的改变，
    //  触发某个页面载入动作或者是重新渲染
    // =========================================================================
    onPageStateChange : function (){
        var state = PG.state;
        
        // 初始化页面各个控件的状态
        Module.applyPageState(state);
        // 载入数据
        Module.loadPageData(state.cond, state.page);
    },

    applyPageState : function(state){
        // 初始化查询条件
        Module.loadprofile(function(module){
            var data = module.doc;

            Module.updateBaseInfo(data);
            Module.updateHoney(data);
            Module.updateContact(data);
        });
    },

    // 处理查询条件
    _processSearchCond : function(cond){
        $.processQuickSearch(cond, $('#search-form input[name=quick_search_key]'));
        // TODO: 处理需要特殊处理的查询条件
        
    },

    // 根据页面状态，载入数据
    loadPageData: function(stateCond, page){
        
    },


    // 页面载入的时候绑定各个事件
    bind : function(){
        $('a.action-add').on('click', function(e){
            e.preventDefault();
            Module.createModule();
        });

        $('#friendDeclareBtn').on('click', function(e){
            e.preventDefault();

            Module.onUpdateprofile('#friendDeclareDlg', '#friendDeclare-form', function(data){
                $('#friendDeclareDiv').html(data.交友宣言); 
            });
        });

        $('#baseinfoBtn').on('click', function(e){
            e.preventDefault();

            Module.onUpdateprofile('#member-baseinfo-dlg', '#member-baseinfo-form', function(data){
                Module.updateBaseInfo(data);
            });
        }); 

        $('#honeyBtn').on('click', function(e){
            e.preventDefault();

            Module.onUpdateprofile('#member-honey-dlg', '#member-honey-form', function(data){
                Module.updateHoney(data);
            });
        }); 

        $('#editContactBtn').on('click', function(e){
            e.preventDefault();

            Module.onUpdateprofile('#member-contact-dlg', '#member-contact-form', function(data){
                Module.updateContact(data);
            });
        }); 
    },
 
    //====================================================================================================================
    // 事件处理函数
    //====================================================================================================================
    // 编辑member信息
    onUpdateprofile: function(dlgid, formid, updatefn){
        var $form = $(formid);
        $form.spin();
        Module.loadprofile(function(module){
            var data = module.doc;
            $form.spin(false);
            $form.autofill(data, $M.SETOPT);

            $form.find('div[name=我要寻找]').multicheckbox('val', data.我要寻找);
            $form.find('div[name=爱情观念]').multicheckbox('val', data.爱情观念);
            $form.find('div[name=外貌]').multicheckbox('val', data.外貌);
            $form.find('div[name=个性]').multicheckbox('val', data.个性);
            $form.find('div[name=兴趣爱好]').multicheckbox('val', data.兴趣爱好);
        });

        $.showmodal(dlgid, function(fn){
            if ($form.validate().form()){
                // save change
                var data = $form.getdata({checkboxAsBoolean : true});

                data.我要寻找 = $form.find('div[name=我要寻找]').multicheckbox('val');
                data.爱情观念 = $form.find('div[name=爱情观念]').multicheckbox('val');
                data.外貌 = $form.find('div[name=外貌]').multicheckbox('val');
                data.个性 = $form.find('div[name=个性]').multicheckbox('val');
                data.兴趣爱好 = $form.find('div[name=兴趣爱好]').multicheckbox('val');
                Module.updateprofile({
                    data: data 
                }, function(result){
                    updatefn(data);
                    fn(null, data);
                }, function(err){
                    $.alert('body', err, 10000);
                    fn(err);
                });
            }else{
                return fn(new Error('输入内容有错误'));
            }
        })
    },


    updateBaseInfo : function(data){
        var odata = $.extend({}, data);
        odata.出生年月 = data.出生年 + '年' + data.出生月 + '月';
        odata.年龄 = new Date().getFullYear() - data.出生年;
        $('#member-baseinfo-form-ro').autofill(odata);
    },

    updateHoney : function(data){
        var odata = $.extend({}, data);
        odata.我要寻找 = data.我要寻找.join('、');
        odata.爱情观念 = data.爱情观念.join('、');
        odata.外貌 = data.外貌.join('、');
        odata.个性 = data.个性.join('、');
        odata.兴趣爱好 = data.兴趣爱好.join('、');

        $('#member-honey-form-ro').autofill(odata);
    },


    updateContact : function(data){
        var odata = $.extend({}, data);
        
        $('#member-contact-form-ro').autofill(odata);
    },
    
    // ========================================================================
    //      功能函数 
    // ========================================================================
        
    // 更新楼宇信息
    updateprofile : function(condition, fn, fail){
        $M.doupdate('/member/updateprofile', condition, { successfn : fn , failfn: fail});
    },

    // 查询详细信息
    loadprofile : function(fn){
        $M.doquery('/member/myprofile', {  }
            , { successfn : fn , alertPosition : '#cellDiv'});
    }
    // ========== 请尽量在这一行后面加入扩展代码，方便系统自动合并模版修改 ==========

});

function init(){
    $M.expandSharepageMacro();
    $M.createSharepageControl();
    Module.bind();
    PG.bind();
    $(window).trigger('hashchange');
};

$(document).ready(init);