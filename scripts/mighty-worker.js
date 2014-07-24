//常量容器
var CONSTANTS = {};

onmessage = function(e){
	var data = e.data;
	if(data.command){
		switch(data.command){
			//初始化
			case 'init':
				init(data);
				break;
			//代理发送同步请求
			case 'sync':
				sync_all(data.url,data.data);
				break;
			//同步单次操作
			case '_sync':
				post(data.url,data.data);
				break;
			default: return false;
		}
	}
}

//初始化环境变量，加载必要的js
function init(data){
	CONSTANTS = data.env;
	postMessage({type:"inited"});
}

function sync_all(url,data){
    get(url,data,function(){
    	postMessage({type:'response',data:this.response});
    },function(){
    	postMessage({type:'error',msg:'something error',response:this.response});
    },4000,function(){
    	postMessage({type:'error',msg:'sync timeout'});
    });
}

function get(url,data,onsuccess,onerror,timeout,ontimeout){
	if(!url) return false;
	if(data){
		if(typeof data == "object"){
			url += "?";
			for(var prop in data){
				url += prop+"="+data[prop]+"&";
			}
			url = url.replace(/\&$/,'');
		}else if(typeof data == "string"){
			url += "?";
			url += data;
		}
	}

	var xhr = new XMLHttpRequest();
	if(onerror) xhr.onerror = onerror;

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if(onsuccess) onsuccess.call(xhr);
        }
    };
    
    xhr.open("get", url, true);

    if(timeout){
    	xhr.timeout = timeout;
    	if(ontimeout) xhr.ontimeout = ontimeout;
    }
    
    xhr.send(null);
}

function post(url,data,onsuccess,onerror){
	console.log("post..."+url);
	if(!url) return false;
	if(data){
		if(typeof data == "object"){
			var tmp_data = "";
			for(var prop in data){
				tmp_data += prop+"="+data[prop]+"&";
			}
			data = tmp_data.replace(/\&$/,'');
		}else if(typeof data != "string"){
			postMessage({type:"error",msg:"post data invalid"});
			return false;
		}
	}else{
		data = null;
	}

	var xhr = new XMLHttpRequest();
	if(onerror) xhr.onerror = onerror;

	xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if(onsuccess) onsuccess.call(xhr);
        }
    };
    
    xhr.open("post", url, true);
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.send(data);
}











