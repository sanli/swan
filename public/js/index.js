//#!本文件由share.js自动产生于Mon Sep 15 2014 23:05:13 GMT+0800 (CST), 产生命令行为: node share.js gen sysmodule CRUD ..

"use strict";

// Page状态对象
var PG = new $P({
    default :{
        // 查询条件
        cond : {},
        // 翻页条件
        page : { skip: 0, limit: 20 },
        // 排序字段
        sort : { by: 'parent_id' , order : -1 },
        editing : false,
        searching : false
    },

    bind: function(){
        this.bindhash();
        $(PG).on('statechange', Module.onPageStateChange);
    },

    // 模块名称
    module : 'module',
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
        // $('#search-form').clearall().autofill(state.cond, { queryexp : true });
        // $('#detail-search-form').clearall().autofill(state.cond, { queryexp : true });
    },

    // 处理查询条件
    _processSearchCond : function(cond){
        // $.processQuickSearch(cond, $('#search-form input[name=quick_search_key]'));
        // TODO: 处理需要特殊处理的查询条件
        
    },

    // 根据页面状态，载入数据
    loadPageData: function(stateCond, page){
        $('#cellDiv').spin();
        var editing = PG.state.editing,
            searching = PG.state.searching,
            sort = PG.state.sort,
            sortarg = {},
            cond = $.extend({},stateCond);
        sortarg[sort.by] = sort.order;

        console.log("loadpage:" , cond);

        // 处理需要做正则表达式查询的条件
        Module._processSearchCond(cond);
        // $.showSearchBlock($('#searchPanel'), searching, $('#searchBtnGroup'));

        // 加载数据表
        // Module.listPage(cond, sortarg, page
        //     , function(module){
        //         var $resultTarget = $('#cellTable');
        //         Module._cache = {};
        //         $.each(module.docs, function(i, doc){
        //             Module._cache[doc._id] = doc;
        //         });

        //         $M.fillResult($resultTarget, {
        //             columns : Module.columns ,
        //             cells : module.docs,
        //             tempId : 'cellTableTmpl',
        //             sort: sort
        //         });
        //         $('#cellDiv').spin(false);
        //         $.showControlBlock($('#cellDiv'), editing, $('#editingBtnGroup'));                
        //     });

        // 加载分页条
        // Module.showPagebar(cond, page
        //     , function(html){
        //         var $pagebar = $('#pagebar');
        //         $pagebar.empty().append(html);
        //     });
    },


    // 页面载入的时候绑定各个事件
    bind : function(){
        // 标题栏自动隐藏
        $('nav.sub-navbar').affix({ 
            offset: { top: 50 } 
        }).on('affix.bs.affix', function(e){
            $('#mainContent').addClass('affixed');
            $('div.main-navbar').addClass('moveout');
            $('nav.sub-navbar').removeClass('col-md-offset-2 col-md-10').addClass('col-md-12');
        }).on('affix-top.bs.affix', function(e){
            $('#mainContent').removeClass('affixed');
            $('div.main-navbar').removeClass('moveout');
            $('nav.sub-navbar').removeClass('col-md-12').addClass('col-md-offset-2 col-md-10');
        });

        $('a.action-add').on('click', function(e){
            Module.createModule();
            e.preventDefault();
        });

        $('a.importbtn').on('click', Module.onImportFile);
        $('#search-form').keypress(function(e){
            if (event.which == 13 ) {
                e.preventDefault();
                var search = $('#search-form').getdata({skipEmpty : true, queryexp : true});
                var state = $.extend({}, PG.state);
                state.cond = search;
                state.page.skip = 0;
                PG.pushState(state);
            };
        }).submit(function(e){
            e.preventDefault();
            var search = $('#search-form').getdata({skipEmpty : true, queryexp : true});
            var state = $.extend({}, PG.state);
            state.cond = search;
            state.page.skip = 0;
            PG.pushState(state);
        });
        // 详细条件查询
        $('#detailSearchBtn').click(function(e){
            var search = $('#detail-search-form').getdata({skipEmpty : true, queryexp : true});
            var state = $.extend({}, PG.state);
            state.cond = search;
            state.page.skip = 0;
            PG.pushState(state);
        });

        // ============= 实现数据导航功能 =============
        // 翻页
        $('#pagebar').on('click','.pagination a', function(e){
            e.preventDefault();
            var $a = $(e.target);
            var tgt = $a.attr('href'),
                params = $.deparam(tgt.replace(/^#/,''));
            var state = $.extend({}, PG.state),
                limit = state.page.limit
                state.page.skip = params.skipto * limit;
            PG.pushState(state);
        });

        // 开启查询模式
        $('#searchBtnGroup').click(function(e){
            var state = $.extend({},PG.state);
            // NOTE: 因为click事件发生时active状态还没有改变，所以hasClass('active')返回"false"
            // 所以这里不是一个bug
            state.searching = $('#searchBtnGroup').hasClass('active') ? 'false' : 'true';
            $.showSearchBlock($('#searchPanel'), state.searching);
            if(state.searching === 'false'){
                $('#search-form').clearall();
                $('#detail-search-form').clearall();
                state.cond = {};
            }
            PG.pushState(state);
        });
        // 预览数据
        $('#cellDiv').on('click', 'a.action-view', function(e){
            var id = $(e.target).closest('tr').data('id');
            Module.viewModule(id);
        });
        // 字段排序
        $('#cellDiv').on('click', 'a.sortlink', $M.createSortHander(PG));

        // 登录
        $('#cfsubmit').on('click', function(){
            if ($('#login-form').validate().form()){
                var data = $('#login-form').getdata($M.GETOPT);

                $M.doquery('/member/signin'
                    , data
                    , { successfn : function(){
                            $.alert('登录成功，开始跳转');
                            //
                            $('#login-form').submit();
                        }, 
                        failfn : function(err){
                            $.alert('登录失败');
                        }});   
            }
        });

        Module.locateCity();
    },
        
    //====================================================================================================================
    // 事件处理函数
    //====================================================================================================================
    //需要新建一个sysmodule
    createModule: function(){
        function _createModule(condition, fn, fail){
            $M.doupdate('/sys/module/create', condition, { successfn : fn , failfn: fail});
        };

        $('#module-form').clearall({ clearhidden : false });
        $.showmodal('#moduleDlg', function(fn){
            if ($('#module-form').validate().form()){
                // save change
                var data = $('#module-form').getdata($M.GETOPT);

                // TODO: getdata不能自动获取的数据在这里手工获取
                data.parent_id = $('#module-form div[name=parent_id]').data('value'); 
                data.icon = $('#module-form div[name=icon]').data('value'); 
                data.actionList = Module.getActionList($('#module-form div[name=actionList]'));

                var os = [];
                $('#module-form div[name=owner_system] :checked').each(function(i, el){
                    return os.push($(el).val());
                });
                data.owner_system = os.join(',');

                _createModule({ data: data }, function(result){
                    $('#moduleDlg').modal('hide');
                    Module.loadPageData(PG.state.cond, PG.state.page);
                    fn();
                }, function(err){
                    $.alert('#moduleDlg .modal-body', err, 10000);
                    fn(err);
                });
            }else{
                return fn(new Error('输入内容有错误'));
            }
        }, null , "创建新系统模块");
    },

    // 删除sysmodule
    deleteModule: function(id, options){
        $.ask("删除对象","是否确认删除,删除后不能恢复？", function(){
            $M.dodelete('/sys/module/delete'
                , { _id : id }
                , { successfn : function(){
                        Module.loadPageData(PG.state.cond, PG.state.page);
                    }});
        });
    },


    viewModule : function(id , options){
        //载入选中对象的具体数据
        $('#module-form-view').clearall();
        Module.loadDataDetail(id, function(module){
            var data = module.doc;
            $('#module-form-view').autofill(data, $M.SETOPT);

            // TODO:autofill不能填充的数据在这里手工填充
            // ...
        });
        $.showmodal('#moduleViewDlg');
    },


    // 编辑sysmodule信息
    updateModule: function(id, options){
        //载入选中对象的具体数据
        $('#module-form').clearall({ clearhidden : false });
        $('#module-form').spin();
        Module.loadDataDetail(id, function(module){
            var data = module.doc;
            $('#module-form').autofill(data, $M.SETOPT);
            $('#module-form').spin(false);

            // TODO:autofill不能填充的数据在这里手工填充
            $('#module-form div[name=parent_id]').moduleselect('val', data.parent_id );
            $('#module-form div[name=icon]').iconselect('val', data.icon);
            Module.setActionList($('#module-form div[name=actionList]'), data.actionList);
        });
        
        //弹出对话框
        $.showmodal('#moduleDlg', function(fn){
            if ($('#module-form').validate().form()){
                // save change
                var data = $('#module-form').getdata($M.GETOPT);

                // TODO: getdata不能自动获取的数据在这里手工获取
                data.parent_id = $('#module-form div[name=parent_id]').data('value'); 
                data.icon = $('#module-form div[name=icon]').data('value'); 
                data.actionList = Module.getActionList($('#module-form div[name=actionList]'));

                // 所属系统
                var os = [];
                $('#module-form div[name=owner_system] :checked').each(function(i, el){
                    return os.push($(el).val());
                });
                data.owner_system = os.join(',');

                Module.updateModuleInfo({ 
                    _id: id,
                    data: data 
                }, function(result){
                    Module.loadPageData(PG.state.cond, PG.state.page);
                    fn();
                }, function(err){
                    $.alert('#moduleDlg .modal-body', err, 10000);
                    fn(new Error("保存数据出错:" + err));
                });
            }else{
                return fn(new Error('输入内容有错误'));
            }
        });
    },

    // ========================================================================
    //      功能函数 
    // ========================================================================
    // listnavi
    listNavi : function(fn, fail){
        $M.doquery('/sys/module/listnavi'
            , { } 
            , { successfn : fn , failfn : fail , alertPosition : '#cellDiv' });
    }, // ==== listnavi end =====

    // 根据查询条件和分页条件载入数据页面
    listPage : function(cond, sort, page, fn, fail){
        $M.doquery('/sys/module/list'
            , { cond : cond, page: page, sort : sort} 
            , { successfn : fn , failfn : fail , alertPosition : '#cellDiv' });
    },

    showPagebar : function(cond, page, fn){
        $M.doquery('/sys/module/count'
            , { cond: cond }
            , { successfn : function(module){
                var pagebarHtml = $M.renderPagebar("pagebarTpl", module.count, page);
                fn(pagebarHtml);
            }});
    },

    // 更新楼宇信息
    updateModuleInfo : function(condition, fn, fail){
        $M.doupdate('/sys/module/update', condition, { successfn : fn , failfn: fail});
    },

    // 查询详细信息
    loadDataDetail : function(id, fn){
        $M.doquery('/sys/module/get', { _id : id }
            , { successfn : fn, alertPosition : '#cellDiv'});
    },

    // ========== 请尽量在这一行后面加入扩展代码，方便系统自动合并模版修改 ==========
    getActionList : function($element){
        var actionIds = $element.find('.btn.active')
                .map(function(i, el){  return $(el).data('value'); });
        return _.map(actionIds, function(value){ 
            return $M.getAction(value); 
        });
    },

    setActionList : function($element, actionIds){
        $element.find('.btn').removeClass('active');
        _.each(actionIds, function(action){
            $element.find('.btn[data-value=' + action.action_id + ']').button('toggle');
        }); 
    },

    // ========================================================================
    //    扩展函数
    // ========================================================================
    // 定位当前城市
    locateCity : function(){

    }
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
    Module.bind();
    PG.bind();
    $(window).trigger('hashchange');
};

$(document).ready(init);