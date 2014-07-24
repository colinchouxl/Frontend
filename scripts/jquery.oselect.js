jQuery.oselect = function(custom_select,callback){
	//user give the custom_select param,but it is not an object
	if($.isFunction(custom_select) && typeof custom_select != "undefined"){
		callback = custom_select;
	}else if(!$.isPlainObject(custom_select) && typeof custom_select != "undefined"){
		console.error("the param need to be an instance of object instead of "+typeof oselect);
		return false;
	}

	if(!$.isFunction(callback) && typeof callback != "undefined"){
		console.warn("the param need to be an instance of object instead of "+typeof oselect);
	}
	
	var startmouse = {},
		curmouse = {},
		custom_select = $.isPlainObject(custom_select) ? custom_select : {},
		lastClick = null,
		i = 0,
        dropclasses = "",
		mousedown = false,
		dataarr = new Array(),
		oselect = {
			inputels : ".bookmark input[type='checkbox']",
			moveclass : "bookmark",
			dropclass : "folder",
			indexstr : "index",
			context : "body",
			selection : true,
			offset : 5,
			movedata : "id",
			dropdata : "cid"
		};
	$.extend(oselect,custom_select);
	if(oselect.selection){
		$(oselect.context).css({"-webkit-user-select": "none","-moz-user-select": "none","-ms-user-select": "none","-o-user-select": "none","user-select": "none",});
	}
	
	$(oselect.inputels).each(function(){
		$(this).data(oselect.indexstr,i++);
	});
        $(document).on("click",oselect.inputels,function(event){
		var event = event || window.event;
        var target = event.target || event.srcElement;
        if($(target).data(oselect.indexstr) === undefined){
            i = 0;
            $(oselect.inputels).each(function(){
                $(this).data(oselect.indexstr,i++);
            });
        }
		if(this.checked){
			$(this.parentNode).addClass("checked");
		}else{
			$(this.parentNode).removeClass("checked").removeClass("selection");
		}
		if(event.shiftKey){
			var lastIndex = $(lastClick).data(oselect.indexstr);
			var currentIndex = $(this).data(oselect.indexstr);
			var $inputs = $(oselect.inputels);
                        
			if(currentIndex > lastIndex){
				for(var j=lastIndex; j<currentIndex+1; j++){
					if(lastClick.checked){
						$inputs[j].checked = true;
						$($inputs[j].parentNode).addClass("checked");
					}else{
						$inputs[j].checked = false;
						$($inputs[j].parentNode).removeClass("checked").removeClass("selection");
					}
				}
			}else{
				for(var j=lastIndex; j>currentIndex-1; j--){
					if(lastClick.checked){
						$inputs[j].checked = true;
						$($inputs[j].parentNode).addClass("checked");
					}else{
						$inputs[j].checked = false;
						$($inputs[j].parentNode).removeClass("checked").removeClass("selection");
					}
				}
			}
			
		}
		lastClick = target;
	});
	
	$(document).on("mousedown.oselect",function(event){
		dataarr = new Array();
		var event = event || window.event;
		if(event.button && event.button == "2"){
			return false;
		}
		var target = event.target || event.srcElement;
		
		startmouse.x = event.pageX || event.clientX;
		startmouse.y = event.pageY || event.clientY;
		mousedown = true;
		//if target has class that we want to move,
		//we will not draw the selection area
		if($(target).hasClass(oselect.moveclass)){
			if($(target).hasClass("checked") || $(target).hasClass("selection")){
				var checked_num = $("."+oselect.moveclass+".selection,."+oselect.moveclass+".checked").length;
				//get all the data we need as an array
				$("."+oselect.moveclass+".selection,."+oselect.moveclass+".checked").each(function(){
					dataarr.push($(this).data(oselect.movedata));
				});
			}else{
				var checked_num = 1;
				//get current "selected" item's data
				dataarr.push($(target).data(oselect.movedata));
			}
			
			if($("#drag_num").length == 0){
				$("body").append("<div id='drag_num'></div>");
			}
			$("#drag_num").get(0).style.cssText = "background-color:#0ae;border:1px solid blue;padding:5px;border-radius:3px;display:none;position:absolute;z-index:9999;";
			$("#drag_num").html(checked_num).css({left:startmouse.x+"px",top:startmouse.y+"px"});
			return false;
		}

		if(oselect.selection){
			if($("#selection").length == 0){
				$("body").append("<div id='selection'></div>");
			}
			
			$("#selection").get(0).style.cssText = "background-color: #0ae;border: 1px solid blue;opacity: .6;display: none;position: absolute;z-index:9999";
			$("#selection").css({left:startmouse.x+"px",top:startmouse.y+"px"}).data({"startx":startmouse.x,"starty":startmouse.y});
			
		}
		
	});

	$(document).on("mousemove.oselect",function(event){
		var event = event || window.event,
                    left = $("#selection").data("startx"),
                    top = $("#selection").data("starty"),
                    selectedItems = new Array();
		curmouse.x = event.pageX || event.clientX;
		curmouse.y = event.pageY || event.clientY;
                if($.isArray(oselect.dropclass)){
                        dropclasses = "."+oselect.dropclass.join(",.");
                }else{
                        dropclasses = "."+oselect.dropclass;
                }
		if(mousedown && $("#drag_num").length != 0){
			$("#drag_num").show().css({left:curmouse.x+oselect.offset+"px",top:curmouse.y+oselect.offset+"px"});
			$(dropclasses).each(function(){
				var areaWidth = $(this).width(),
	                areaHeight = $(this).height(),
	                areaLeft = $(this).offset().left,
	                areaTop = $(this).offset().top,

	                itemLeft = $("#drag_num").offset().left,
	                itemTop = $("#drag_num").offset().top;
				if(itemLeft > areaLeft && itemLeft < areaLeft + areaWidth && itemTop > areaTop && itemTop < areaTop + areaHeight){
					$(this).css({opacity:.4,outline:"2px dashed orange"}).addClass("dragon");
					//we could get some information of the drop folder here
				}else{
					$(this).css({opacity:1,outline:"none"}).removeClass("dragon");
				}
			});
		}

		if(mousedown && $("#selection").length != 0){
			if(curmouse.x > left && curmouse.y > top)
				$("#selection").show().css({width:(curmouse.x-left)+"px",height:(curmouse.y-top)+"px"});
			if(curmouse.x < left && curmouse.y < top){
				$("#selection").show().css({left:curmouse.x+"px",top:curmouse.y+"px",width:(-curmouse.x+left)+"px",height:(-curmouse.y+top)+"px"});
			}
			//towards left bottom
			if(curmouse.x < left && curmouse.y > top){
				$("#selection").show().css({left:curmouse.x+"px",top:top+"px",width:(-curmouse.x+left)+"px",height:(curmouse.y-top)+"px"});
			}

			if(curmouse.x > left && curmouse.y < top){
				$("#selection").show().css({left:left+"px",top:curmouse.y+"px",width:(curmouse.x-left)+"px",height:(-curmouse.y+top)+"px"});
			}
			$(oselect.inputels).each(function(){
				var inputLeft = $(this).offset().left,
                                    inputTop = $(this).offset().top,
                                    selectionLeft = $("#selection").offset().left,
                                    selectionTop = $("#selection").offset().top,
                                    selectionWidth = $("#selection").width(),
                                    selectionHeight = $("#selection").height();

				if(inputLeft > selectionLeft && inputLeft < selectionLeft+selectionWidth && inputTop > selectionTop && inputTop < selectionHeight + selectionTop){
					if(!$(this.parentNode).hasClass("checked")){
						//$(this.parentNode).addClass("selection");
						//this.checked = true;
						selectedItems.push(this);
					}
				}else{
					if(!$(this.parentNode).hasClass("checked")){
						//$(this.parentNode).removeClass("selection");
						//this.checked = false;
					}
				}
			});

			if(selectedItems.length > 0){
				for(var i=0; i<selectedItems.length; i++){
					$(selectedItems[i].parentNode).addClass("selection");
					selectedItems[i].checked = true;
				}
			}
		}
	});

	$(document).on("mouseup.oselect",function(event){
		var event = event || window.event;
		var target = event.target || event.srcElement;

		if(mousedown){
            if($.isArray(oselect.dropclass)){
                    dropclasses = "."+oselect.dropclass.join(".dragon,.")+".dragon";
            }else{
                    dropclasses = "."+oselect.dropclass+".dragon";
            }

			if(dataarr.length != 0 && $(dropclasses).length > 0){
				var dataid = dataname = "";
				if($.isArray(oselect.dropdata)){
					for(var j=0; j<oselect.dropdata.length; j++){
						if($(dropclasses).data(oselect.dropdata[j])){
							dataid = $(dropclasses).data(oselect.dropdata[j]);
							dataname = oselect.dropdata[j];
						}
					}
				}else{
					dataid = $(dropclasses).data(oselect.dropdata);
					dataname = oselect.dropdata;
				}
				$(dropclasses).css({opacity:1,outline:"none"});
				var param = {};
                    param[dataname] = dataid;
                    param[oselect.movedata] = dataarr;
                if($.isFunction(callback)){
                	callback.call(null,param);
                }
			}
			mousedown = false;
			$("#selection,#drag_num").remove();
		}
	});
};