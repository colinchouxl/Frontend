jQuery.fn.loadeff = function(o){
	var _this = this;
	var options = {hpos:"center",vpos:"center",src:""};
	$.extend(options,o);

	if(options.src != ""){
		var img = document.createElement("img");
			img.onerror = function(){
				console.warn("指定的图片"+options.src+"不存在");
				return false;
			};

			img.onload = loadEff;
			img.src = options.src;
			img.setAttribute("class",options.imgclass || "loadeff_img");
			img.style.position = "absolute";
			$("body").append(img);
			console.log("times");
	}

	function loadEff(){
		var loadeff_img = $(".loadeff_img").get(0);
		if(!!!loadeff_img){
			return false;
		}
		var imgWidth = $(loadeff_img).width(),
			imgHeight = $(loadeff_img).height();

		_this.each(function(){
			var pos = getPos(this,loadeff_img,options.hpos,options.vpos);
			this.loadeff = function(hpos,vpos){
				if(hpos && vpos){
					pos = getPos(this,loadeff_img,hpos,vpos);
				}
				$(loadeff_img).clone().appendTo(this).css({top:pos.top+"px",left:pos.left+"px"});
			};

			this.unloadeff = function(hpos,vpos){
				$(".loadeff_img",this).remove();
			};
		});

		function getPos(con,el,hpos,vpos){
			var elemPos = $(con).css("position"),
				elemWidth = $(con).width(),
				elemHeight = $(con).height(),
				elWidth = $(el).width(),
				elHeight = $(el).height(),
				posLeft = 0,
				posTop = 0;
			
			switch(hpos){
				case "center": posLeft = (elemWidth - elWidth)/2;break;
				case "left": posLeft = 0;break;
				case "right": posLeft = elemWidth - elWidth;break;
				default: posLeft = (parseInt(hpos) !== NaN) ? hpos : 0;
			}

			switch(vpos){
				case "center": posTop = (elemHeight - elHeight)/2;break;
				case "top": posTop = 0;
				case "bottom": posTop = elemHeight - elHeight;
				default: posTop = (parseInt(vpos) !== NaN) ? vpos : 0;
			}

			if(elemPos == "static"){
				var offParent = con.offsetParent;
				if(offParent){
					posLeft += $(offParent).offset().left;
					posTop += $(offParent).offset().top;
				}
			}
			return {left:posLeft,top:posTop};
		}
	}
	
};