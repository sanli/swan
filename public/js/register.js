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
        $('#regbtn').on('click', function(e){
            e.preventDefault();
            Module.createModule();
        });
    },
 
    //====================================================================================================================
    // 事件处理函数
    //====================================================================================================================
    //需要新建一个member
    createModule: function(){
        function _createModule(condition, fn, fail){
            $M.doupdate('/member/create', condition, { successfn : fn , failfn: fail});
        };

        if ($('#module-form').validate().form()){
            // save change
            var data = $('#module-form').getdata({checkboxAsBoolean : true});
            //TODO : 创建特殊字段getdata不能自动获取的数据在这里手工获取
            // ...
                
            _createModule({ data: data }, function(result){
                Module.loadPageData(PG.state.cond, PG.state.page);
                $.alert('','注册成功，3秒钟后会跳转到您的主页面');
                setTimeout(function(){
                    location.href = '/member/profile.html';
                }, 2000);
            }, function(err){
                $.alert('#moduleDlg .modal-body', err, 10000);
                console.log('创建失败');
            });
        }else{
            $.alert('body', '内容填写有误，请检查修正一下');
        };
    },

    
    // ========================================================================
    //      功能函数 
    // ========================================================================
        
    // 更新楼宇信息
    updateModuleInfo : function(condition, fn, fail){
        $M.doupdate('/member/update', condition, { successfn : fn , failfn: fail});
    },

    // ========== 请尽量在这一行后面加入扩展代码，方便系统自动合并模版修改 ==========

});

function init(){
    $.ajax({
        dataType: "script",
        cache: true,
        url: '/js/address.js'
    }).done(function(){
        $("#city").city();
    });
    $M.expandSharepageMacro();
    $M.createSharepageControl();
    Module.bind();
    PG.bind();
    $(window).trigger('hashchange');
};

$(document).ready(init);