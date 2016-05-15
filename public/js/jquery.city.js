/*
 * jquery.city
 * EDIT.SIMBA.20150812
 * Version: 1.0.0
 * Author: SIMBA
 */



(function($){
	
	$.fn.city = function(opts){

		var ths = this,
			thsTop = ths[0].offsetTop,
			thsLeft = ths[0].offsetLeft,
			thsHeight = ths[0].offsetHeight,
			$selWarp = ths.siblings(".city-select-warp"),
			$cityTab = "",
			$citySelect = "",
			$province = "",
			cityArr = {
				province : ds,
				city : [],
				district : [],
				street : [],
			},
			city = {
				province : "",
				city : "",
				district : "",
				street : "",
			};

		//主体框架
		var str =	'<div class="city-select-tab clear">'+
						'<a class="" attr-cont="city-province">省份</a>'+
						'<a class="" attr-cont="city-city">城市</a>'+
						'<a class="" attr-cont="city-district">县区</a>'+
						'<a class="" attr-cont="city-street">街道</a>'+
					'</div>'+
					'<div class="city-select-content">'+
						'<div class="city-select city-province"></div>'+
						'<div class="city-select city-city"></div>'+
						'<div class="city-select city-district"></div>'+
						'<div class="city-select city-street"></div>'+
					'</div>';
					
		//初始化
		var init = function(){
			//样式调整
			$selWarp.html("");
			$selWarp.append(str);
			$selWarp.addClass("city-none");
			$selWarp.css({
				"top" : thsTop + thsHeight + 5 + "px",
				"left" : thsLeft + "px",
			});
			//
			$cityTab = $selWarp.find(".city-select-tab");
			$citySelect = $selWarp.find(".city-select");
			$province = $selWarp.find(".city-province");


			//绑定事件
			ths.on("focus",cityShow);
			//tab事件绑定
			$cityTab.on("click","a",cityTab);
			//select事件绑定
			$citySelect.on("click","a",addData);
		},
		cityShow = function(){
			$selWarp.removeClass("city-none");
			//默认显示省份内容
			var $first = $cityTab.find("a").eq(0);
			$first.trigger("click");
			$citySelect.html("");

			//是否为第一次打开
			if($citySelect.eq(0).find("a").size() == 0){
				firstAddData(ds,0);
			}

		},
		addData = function(){
			var $ths = $(this),
				thsID = $ths.attr("attr-id"),
				thsTxt = $ths.text(),
				$thsPa = $ths.parent(),
				$Alla = $thsPa.find("a"),
				n = $cityTab.find("a").index($cityTab.find("a[class=cityChoo]")),
				thsAttrFor = $cityTab.find("a").eq(n).attr("attr-cont"),
				nextAttr = $cityTab.find("a").eq(n+1);

			//样式修改
			$Alla.removeClass("cityChoo");
			$ths.addClass("cityChoo");
			$cityTab.find("a").eq(n+1).trigger("click");

			//赋值
			var thsFor = thsAttrFor.split("-")[1];

			//重新选择城市清空
			for(var j = n; j < $citySelect.size()-1; j ++){
				$citySelect.eq(j+1).html("");
			}

			for(var i = 0; i < cityArr[thsFor].length; i ++){
				if(thsID == cityArr[thsFor][i].id){
					if(cityArr[thsFor][i].children == "" || cityArr[thsFor][i].children == undefined){
						close();
					}else{
						var nextAttrFor = $cityTab.find("a").eq(n+1).attr("attr-cont"),
							nextFor = nextAttrFor.split("-")[1];
						cityArr[nextFor] = cityArr[thsFor][i].children;
						firstAddData(cityArr[nextFor],n+1);
					}
				}
			}

			//更新所选城市的值
			city = {
				province : $citySelect.eq(0).find("a.cityChoo").text(),
				city : $citySelect.eq(1).find("a.cityChoo").text(),
				district : $citySelect.eq(2).find("a.cityChoo").text(),
				street : $citySelect.eq(3).find("a.cityChoo").text(),
			};

			var iptVal = city.province + 
						(city.city == "" ? "" : "/" + city.city) + 
						(city.district == "" ? "" : "/" + city.district) + 
						(city.street == "" ? "" : "/" + city.street);

			ths.val(iptVal);

		},
		cityTab = function(){
			var $ths = $(this),
				thsFor = $ths.attr("attr-cont"),
				$tabCon = $("." + thsFor);
			$cityTab.find("a").removeClass("cityChoo");
			$ths.addClass("cityChoo");
			$citySelect.hide();
			$tabCon.show();
		},
		firstAddData = function(arr,num){
			$citySelect.eq(num).html("");
			for(var i = 0; i < arr.length; i ++){
				var str = '<a href="javascript:" attr-id="' + arr[i].id + '">' + arr[i].name + '</a>';
				$citySelect.eq(num).append(str);
			}
		},
		close = function(){
			$selWarp.addClass("city-none");
		}

		//点击屏幕其余部位消失
		$(document).on("click",function(event){
			var eo = $(event.target);
			if(!eo.parents().is(".city-select-warp") && eo.attr("id") != ths.attr("id")){
				close();
			}
		});

		init();
	}

	
})(jQuery); 