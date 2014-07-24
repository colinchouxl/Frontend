/**
 *  浏览器插件站内模拟器
 */
var Extension = function(){
	
};

Extension.prototype = {
	NEWTAB: "_/chrome/newtab",
	SITE_URL: location.host,
	ALL_SAVED_CON: ".all",
	CONTENT_AREA: ".note.editable",
	PREFIX: "eff_",
	APP_WIDTH: 310,
	BAR_WIDTH: 25,
	app_body: null,
	url_lib: {
		"save_note": "/note/save"
	},

	request_open: function(){
		if(localStorage){
			if(localStorage.monitor_inited == undefined){
				localStorage.monitor_closed = 1;
				//之前从未打开过
				localStorage.monitor_inited = 1;
			}

			var show_app = localStorage.monitor_closed == "1" ? true : false;
		}

		//加载样式表
		var link = document.createElement("link");
		link.rel = "stylesheet";
		link.href= "/layout/extension-monitor.css";
		var head = document.getElementsByTagName("head")[0];
		head.appendChild(link);

		this.open_app(show_app);

	},

	open_app: function(deny){
		var params = location.search.slice(1).split("&");
		if(params.length && jQuery.inArray("__sharesource=okmemo",params) !== -1){
			return false;
		}

		if(jQuery("#stick").length == 0){
			//给页面上附上html
			var app_html = "<div id=\"sticks_wrapper\">"+
			"<div id=\"stick_menu\">"+
				"<div id=\""+this.PREFIX+"close_panel\"><a href=\"#\" data-event=\"switch-panel\" class=\""+this.PREFIX+"switch "+this.PREFIX+"tab\" draggable=\"false\"></a></div>"+
				"<div id=\""+this.PREFIX+"app_note\"><a href=\"#\" data-event=\"open-note\" class=\""+this.PREFIX+"open-note "+this.PREFIX+"tab active\" draggable=\"false\"></a></div>"+
			"</div>"+
			"<iframe src=\"http://"+this.SITE_URL+"\" id=\"stick\" onload=\"\"></iframe>"+
			"<div id=\"iframe_overlay\" contenteditable=\"true\"></div></div>";

			jQuery("body").append(app_html);
		}else{
			jQuery("iframe#stick").toggle();
		}

		if(deny) jQuery("iframe#stick").hide();

		//发送当前状态，
		if(jQuery("#stick").length > 0){
			if(jQuery("iframe#stick").css("display") == "none"){
				if(true){
					var width_left = $(document).width() - this.BAR_WIDTH;
					$("html").css({"width":width_left,"margin-left":this.BAR_WIDTH+"px"});
				}
				if(localStorage) localStorage.monitor_closed = 1;
			}else{
				if(true){
					var panel_width = this.APP_WIDTH + this.BAR_WIDTH;
					var width_left = $(document).width() - panel_width;
					$("html").css({"width":width_left,"margin-left":panel_width+"px"});
				}
				
				if(localStorage) localStorage.monitor_closed = 0;
			}
		}
	},

	hide_app: function(){

	},

	save_content: function(content,source){
		content = jQuery.trim(content);
		if(!!!content) return false;
		content = encode_content(content);
		source = !!source ? source : "";
		var title = get_title(content);
		var that = this;
		var note = new Note({title:title,content:content,source:source});
		note.save(function(data){
			//判断是否登录
			if(that.user_logged_in){
				var feedback = get_json_feedback(data);
			}else{
				var feedback = data;
			}
			
			if(feedback.status == "ok"){
				note.id = feedback.id;
				note.app_hidden = (jQuery("#sticks_wrapper").css("display") == "none") || (jQuery("iframe#stick").css("display") == "none");
				that.display_note(note);

				//通知框架中的APP数据发生变化，并同步变化，将新增的note添加到APP.notes
				var frame = $("#sticks_wrapper iframe#stick").get(0);
				if(frame && !_extension.user_logged_in){
					var new_note = window.APP.get_note(note.id);
					frame.contentWindow.APP.notes.push(new_note);
				}
			}else{
				//添加失败
			}
		});
	},

	//框架中展示便签
	display_note: function(note){
		var extension = this;
		var new_class = "newly_added"+Date.now();
		note.construct_item(new_class);

		//更新$("#note").data("last_refresh")为note返回的保存时间，
		//这样就不会被定时的同步再取一次
		jQuery("#search_results .by-tag",this.app_body).data("last_refresh",get_current_time());

		//添加地理位置
	    if(jQuery(this.app_body).hasClass("geo_on")){
	    	if(extension.user_logged_in){
		        get_position(function(lnglat){
		            console.log(lnglat);
		            if(lnglat){
		                var coords = lnglat.lat + "|" + lnglat.lng;
		                note.add_coords(coords,function(data){
		                	if(console) console.log(data);
		                });
		            }
		        });
		    }
	    }

	    //分类
	    var default_type = "all";
	    var $active_tag = null;

	    //按照面板分类，
	    if(/\bresults\-of\-(tasks|contacts|notes|links|images)\b/.test($("#search_results",this.app_body).attr("class"))){
	    	//得到系统默认分类
	        default_type = jQuery("#search_results",this.app_body).attr("class").match(/\bresults\-of\-(tasks|contacts|notes|links|images)\b/)[1];
	        $active_tag = $("#tag_"+default_type);
	    }


	    //如果将便签添加到图片或者链接，则必须包含链接，如果不包含链接，则切换到笔记面板
	    if(default_type == "images" || default_type == "links"){
	        if(!link_regexp.test(note.content) && !ip_link_regexp.test(note.content)){
	            //切换到笔记面板
	            //如果不存在乘装结果的容器，则创建一个
	            if($("#search_results .by-tag .tag-result.tag-"+$("#tag_notes").data("id"),this.app_body).length == 0){
	                $("#search_results .by-tag",this.app_body).append("<div class=\"tag-result tag-"+$("#tag_notes").data("id")+"\"></div>");
	            }

	            $("#search_results .by-tag .tag-result.show",this.app_body).removeClass("show");
	            $("#search_results .by-tag .tag-result.tag-"+$("#tag_notes").data("id"),this.app_body).addClass("show").prepend(note.html);
	            

	            var clickEvent = window.parent.document.createEvent("MouseEvent");
	            clickEvent.initMouseEvent("click", true, true, window.parent, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	            
	            var alink = $("#search_area .by-tag .tag#tag_notes",this.app_body).get(0);
	            alink.dispatchEvent(clickEvent);
	        }else{
	        	//放入当前打开的面板中
				jQuery("#search_results .by-tag.result .tag-result.show",this.app_body).prepend(note.html);
	        }
	    }else{
	    	//放入当前打开的面板中
			jQuery("#search_results .by-tag.result .tag-result.show",this.app_body).prepend(note.html);
	    }

	    var note_node = jQuery("#search_results .by-tag.result .note-con."+new_class+" "+this.CONTENT_AREA,this.app_body).data("value",note.content).attr("contenteditable",true).get(0);
		var that = note_node;
	    var form = jQuery(that).closest("form");
	    var note_con = jQuery(that).closest(".note-con");
	    
	    if(note_node){
			read_mode(note_node);
			jQuery("#search_results .by-tag.result .note-con."+new_class+" "+this.CONTENT_AREA,this.app_body).data("value",note.content)
			
			var feature_img = $("a[rel=\"image\"]",form).get(0);

            if(feature_img){
                var img_node = document.createElement("img");

                is_image_url(feature_img.href,img_entity_onload,img_node);

                img_node.onerror = function(){
                    //加载失败，将图片去除
                    $(this).closest(".img-entity").removeClass("entity-loaded");
                    this.remove();
                };

                img_node.src = feature_img.href;

                jQuery(form).find(".entities-con .img-entity").html("<a class=\"lb entity\" data-lightbox=\"in-memo\" href=\""+feature_img.href+"\"></a>").find("a.lb.entity").append(img_node);
            }

			if(note_node.scrollHeight == 0){
				var new_height = jQuery(note_node).height();
	         	jQuery(note_node).height(Math.min(150,new_height));
			}else{
				note_node.style.height = Math.min(150,note_node.scrollHeight) + "px";
			}
			
			recount_in_tag("addnew");
		}

		if(jQuery("#search_results",this.app_body).hasClass("custom-tag-results")){
	        //自定义标签面板中添加，非默认五大分类
	        default_type = "custom";
	        $active_tag = $("#search_area .by-tag .tag.active",this.app_body);

	        //在应用被隐藏的情况下只加上笔记标签
	        if(!note.app_hidden){
	        	note.addTag($active_tag.data("id"),function(data){
	        		if(extension.user_logged_in) var feedback = get_json_feedback(data);
	        		else var feedback = data;
	        		
		            if(feedback.status == "ok"){
		                //如果添加的当前的标签有色彩值，则需要为新建的便签加上色彩值
		                var color = $active_tag.data("color");
		                if(!!color){
		                    jQuery(form).append("<div class=\"default_tag\" data-id=\""+$active_tag.data("id")+"\" style=\"background:"+color+"\"></div>");
		                	if($(note_con).hasClass("highlighted")) $(note_con).removeClass("highlighted");
		                	highlight_colored_tags(note_con);
		                }
		            }
	        	});
			}
	    }

	    //在任务面板中添加便签
	    if(default_type != "all" && default_type == "tasks") $(note_con).addClass("task");

	    //自动分类
	    note.classify(default_type,function(o){
	        var stick_types = o.types ? o.types : new Array();
	        if(extension.user_logged_in) var feedback = get_json_feedback(o.data);
	        else var feedback = o.data;
	        
	        if(feedback.status && feedback.status == "ok"){
	            //为便签添加上相应的颜色
	            var default_tag = null,color="";

	            for(var i=0,len=stick_types.length; i<len; i++){
	                default_tag = jQuery("#tag_"+stick_types[i],extension.app_body).get(0);

	                if(default_tag){
	                	//如果添加的当前的标签有色彩值，则需要为新建的便签加上色彩值
	                    var color = jQuery(default_tag).data("color");

	                    if(!!color){
	                        jQuery(form).append("<div class=\"default_tag\" data-id=\""+$("#tag_"+stick_types[i]).data("id")+"\" style=\"background:"+color+"\"></div>");
	                    }
	                }

	                if(stick_types[i] == "tasks"){
	                	jQuery(that).addClass("task");
	                }
	            }
	            if($(note_con).hasClass("highlighted")) $(note_con).removeClass("highlighted");
	            highlight_colored_tags(note_con);
	        }else{
	            if(console) console.log(o);
	        }
	    });
	}


};

jQuery(document).ready(function($){
	var _extension = new Extension();
	
	//当前用户是否登录
	_extension.user_logged_in = $("body").hasClass("logged-in");

	//不支持localStorage的不打开
	if(localStorage == undefined) return false;
	
	if(!_extension.user_logged_in) window.APP.init_dataset();

	//移动设备不打开
	if($("body").hasClass("touch-device")) return false;

	//如果在图片分享页面也不打开
	if($("body").hasClass("in-frame")) return false;

	//请求打开应用
	_extension.request_open();

	//便签应用开关
	$("body").on("click","#stick_menu #"+_extension.PREFIX+"close_panel a."+_extension.PREFIX+"switch",function(event){
		event.preventDefault();

		_extension.open_app();
	});

	$("body").on("click","#stick_menu a."+_extension.PREFIX+"tab",function(event){
		event.preventDefault();
		if($(this).hasClass("active")) return false;
		var evt = jQuery(this).data("event");
		if(evt && /^open/.test(evt)){
			send_msg({request:"switch-app",action:evt});
			$("#stick_menu a.tab.active").removeClass("active");
			$(this).addClass("active");
			if(jQuery("iframe#stick").css("display") == "none") open_app();
		}
	});

	//监听拖拽事件，若拖拽到应用区域则给出响应
	$("body").on("dragstart",function(event){
		//创建一个覆盖层div覆盖掉iframe

		//只有在存在侧栏的情况下才在拖拽时加载覆盖层
		if($("#stick").length > 0 && $("#stick").css("display") != "none"){
			$("#iframe_overlay").addClass("dragging");
		}
	});

	$("body").on("dragend",function(event){
		//添加记事成功后，删除覆盖层
		$("#iframe_overlay").removeClass("dragging");
	});

	$("body").on("dragenter","#iframe_overlay",function(event){
		$("#iframe_overlay").addClass("dragenter").removeClass("dragover");
	});

	$("body").on("dragover","#iframe_overlay",function(event){
		$("#iframe_overlay").addClass("dragover").removeClass("dragenter");
	});

	$("body").on("drop","#iframe_overlay",function(event){
		$("#iframe_overlay").removeClass("dragging dragover dragenter");
		var content = event.originalEvent.dataTransfer.getData("text/html");
		var source = window.location.href;

		_extension.save_content(content,source);
		event.originalEvent.preventDefault();
	});

	var stick_frame = document.getElementById("stick");
	

	//图片墙框架
	var app_body = stick_frame.contentWindow.document.body;
	Extension.prototype.app_body = app_body;

	var image_pad_frame = document.getElementById("images_pad");
	
	if(image_pad_frame){
		var images_body = image_pad_frame.contentWindow.document.body;
		
		$(".image-wrapper a.getit",images_body).on("click",function(event){
			event.preventDefault();
			
			
			var $item = $(this).closest(".item");
	        var img = $item.find(".image-wrapper img").get(0);
	        
	        if(!!!img) return false;
	        var note = new Note({content:img.src});
	        
	        if($("iframe#stick").css("display") == "none"){
	        	if(localStorage.monitor_closed == 0) $("#eff_close_panel .eff_switch.eff_tab").trigger("click");
	        }

	        if(!$(document.body).hasClass("extension-monitor-loaded")){
				//正确的做法是将要添加的内容放入一个队列，当window.onload事件触发时再进行添加
				if(!_extension.notes_to_save) _extension.notes_to_save = new Array();
				var stamp = Date.now();
				_extension.notes_to_save.push({content:img.src,stamp:stamp,callback:function(){
					$item.addClass("added").removeClass("saving").append("<p class=\"added-msg\" style=\"position:absolute;top:5px;left:0;width:100%;text-align:center;\"><span style=\"display:inline-block;color:white;font-size:12px;border-radius:5px;padding:5px 15px;background:#97E497\">添加成功</span></p>");
	                
	                setTimeout(function(){
	                    $item.find("p.added-msg").fadeOut(function(){$(this).remove();});
	                },1000);
				} });
				$item.addClass("saving");
				return false;
			}

	        note.save(function(data){
	            if(console) console.log(data);
	            if(_extension.user_logged_in) var feedback = get_json_feedback(data);
	            else var feedback = data;

	            if(feedback.status == "ok"){
	                note.id = feedback.id;
					note.app_hidden = (jQuery("#sticks_wrapper").css("display") == "none") || (jQuery("iframe#stick").css("display") == "none");
					_extension.display_note(note);

					//通知框架中的APP数据发生变化，并同步变化，将新增的note添加到APP.notes
					var frame = $("#sticks_wrapper iframe#stick").get(0);
					if(frame && !_extension.user_logged_in){
						var new_note = window.APP.get_note(note.id);
						frame.contentWindow.APP.notes.push(new_note);
					}

	                $item.addClass("added").append("<p class=\"added-msg\" style=\"position:absolute;top:5px;left:0;width:100%;text-align:center;\"><span style=\"display:inline-block;color:white;font-size:12px;border-radius:5px;padding:5px 15px;background:#97E497\">添加成功</span></p>");
	                
	                setTimeout(function(){
	                    $item.find("p.added-msg").fadeOut(function(){$(this).remove();});
	                },1000);
	            }else{

	            }
	        });
		});
	};

	//应用页面的交互
	//应用加载完成，通知主页面
	window.onload = stick_frame.onload = function(){
		$(window.parent.document.body).addClass("extension-monitor-loaded");
		var app_body = $("iframe#stick").get(0).contentWindow.document.body;
		Extension.prototype.app_body = app_body;

		if(_extension.notes_to_save && _extension.notes_to_save.length > 0){
			var note_to_save;
			for(var i=0,len=_extension.notes_to_save.length; i<len; i++){
				note_to_save = _extension.notes_to_save[i];
				if(note_to_save){
					_extension.save_content(note_to_save.content);

					//保存后是否需要做后续的一些处理，如提醒用户已经保存
					if(note_to_save.callback){
						note_to_save.callback();
					}

					//从未存储的便签数组中移除此条记录
					note_to_save = null;
					delete _extension.notes_to_save[i];
				}
			}
		}

		$(app_body).addClass("extension-monitor");
		$(app_body).on("click","a.maximize-note",function(event){
			//扩大编辑区域，需要扩大frame
			$("#sticks_wrapper").addClass("full-page");
			$("body").addClass("needs-full-page");
		});

		$(app_body).on("click","a.minimize-note",function(event){
			//扩大编辑区域，需要缩小frame
			$("#sticks_wrapper").removeClass("full-page");
			$("body").removeClass("needs-full-page");
		});

		$(app_body).on("click",".note-con form a.open",function(event){
			var src = this.href;
	        var anchor = src.indexOf("#");
	        var src = src.substring(anchor+1,src.length);
	        if(src.indexOf("http") != 0){
	            src = "http://"+src;
	        }

			is_image_url(src,function(url,img){
				if(!img){
					$("#sticks_wrapper").addClass("full-page");
					$("body").addClass("needs-full-page");
				}
			});
		});

		$(app_body).on("click","#new_windows .operations a",function(event){
			if($(this).hasClass("close")){
				$("#sticks_wrapper").removeClass("full-page");
				$("body").removeClass("needs-full-page");
			}else if($(this).hasClass("blank")){
				window.open(this.href);
			}
		});

		$(app_body).on("click","a.img-wall-btn",function(event){
			$("#sticks_wrapper").addClass("full-page");
			$("body").addClass("needs-full-page");
		});

		$(app_body).on("click","#image_wall .wall-op a.close",function(event){
			$("#sticks_wrapper").removeClass("full-page");
			$("body").removeClass("needs-full-page");
		});

		//上次选中内容
		var selected_content="";
		//当网页中出现选中状态的文字时，在鼠标旁边给出添加提示
		document.body.onmouseup = function(event){
			var content = getSelectedHTML();
			if($.trim(content) == ""){
				if(window.getSelection){
					content = window.getSelection().toString();
				} else{
					var range = document.selection.createRange();
					content = range.htmlText;
				}
			}

			//当点击的是添加便签链接时
			if(event.target.id == "quick_add"){
				var source = window.location.href;
				_extension.save_content(content,source);
				$(event.target).remove();
				selected_content = "";
			}else{
				if(content == selected_content || $.trim(content) == ""){
					if($("a#quick_add").length > 0){
						$("a#quick_add").remove();
					}
					selected_content = "";
				}else{
					selected_content = content;
					if($("a#quick_add").length > 0){
						$("a#quick_add").remove();
					}
					//选择内容的最前方放入一个占位符
					prependToSelection();

					// var left = parseInt(event.pageX) + 10,
					// 	top = event.pageY;

					$(document.body).append("<a href=\"#\" id=\"quick_add\">添加便签</a>");

					// var elHeight = $("a#quick_add").height();
					// top = top - parseInt(elHeight)-40;
					// if(top < 0){
					// 	top = 0;
					// }
					var top = $("#pos_placeholder").offset().top-2*$("#pos_placeholder").height();
					if(top < 0) top = 0;
					$("a#quick_add").css({left:$("#pos_placeholder").offset().left,top:top});	
				}
			}
		};

		//用户点击鼠标右键，则隐藏提示
		$("body").on("mousedown","div",function(event){
			if(event.which && event.which == 3){
				if($("a#quick_add").length > 0){
					$("a#quick_add").remove();
				}

				//检测是否有背景图片
				// if(jQuery(this).css("background-image") != "" && jQuery(this).css("background-image") != "none"){
				// 	event.stopPropagation();
				// 	send_msg({request:"open_background_menu"});
				// 	var content = "";
				// 	var background = jQuery(this).css("background-image");
				// 	var match = background.match(/\(\"?\'?([^<>"']+)\"?\'?\)/);
				// 	if(match){
				// 		content = match[1];
				// 	}else{
				// 		content = background;
				// 	}
				// }else{
				// 	event.stopPropagation();
				// 	send_msg({request:"close_background_menu"});
				// }
			}
		});
	};
});

//得到用户高亮的html
function getSelectedHTML() { 										
  if(window.getSelection){
	  var userSelection = window.getSelection();
		if (userSelection.isCollapsed) 
			return '';
		else {
			var range = userSelection.getRangeAt(0);
			var clonedSelection = range.cloneContents();
			var div = document.createElement('div');
			div.appendChild(clonedSelection);
			
			//将相对链接转换为绝对链接
			var hrefs = div.querySelectorAll('[href]');
			for (var i=0, len=hrefs.length; i<len; i++) 
				hrefs[i].href = hrefs[i].href;
			var srcs = div.querySelectorAll('[src]');
			for (var i=0, len=srcs.length; i<len; i++) 
				srcs[i].src = srcs[i].src;
			var content = div.innerHTML || window.getSelection().toString();
			
			return content;
		}
	}else if(document.selection){
		var userSelection = document.selection.createRange();
		return userSelection.htmlText;
	}else{
		return "";
	}
}

function prependToSelection(){
	var prev_span = document.getElementById("pos_placeholder");
	if(prev_span) prev_span.remove();
	var span = document.createElement("span");
	span.textContent = "";
	span.id = "pos_placeholder";
	if(window.getSelection){
		var range = window.getSelection().getRangeAt(0);
		range.insertNode(span);
	}else if(document.selection){
		var range = document.selection.createRange();
		range.collapse(true);
		if(range.boundingWidth == 0) //collapsed
		range.pasteHTML("<span id=\""+span.id+"\">"+span.textContent+"</span>")
	}
}