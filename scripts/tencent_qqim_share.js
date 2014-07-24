(function() {
    if (!window.alloy)
        window.alloy = {};
    window.alloy.ajaxProxyCallback = function(j, e) {
        var b = g.getProxyById(e);
        b && b.onAjaxFrameLoad()
    };
    var g, i = true, c = function(j) {
        this._ajaxRequestInstant = j
    }, t = {id: function(j) {
            return document.getElementById(j)
        },node: function(j, e) {
            var b = document.createElement(j);
            if (e)
                for (var h in e)
                    b.setAttribute(h, e[h]);
            return b
        }}, w = {browser: {set: function(j, e) {
                this[j] = e
            }},out: function() {
        },warn: function() {
        },info: function() {
        },error: function() {
            window.console && console.info(arguments)
        },
        string: {toQueryString: function(j) {
                var e = [], b;
                for (b in j)
                    e.push(encodeURIComponent("" + b) + "=" + encodeURIComponent("" + j[b]));
                return e.join("&")
            }}}, k = function(j, e) {
        j = ("" + j).replace(/_/g, ".");
        e = e || 1;
        j = String(j).split(".");
        j = j[0] + "." + (j[1] || "0");
        return j = Number(j).toFixed(e)
    };
    (function() {
        var j, e = e = navigator.userAgent.toLowerCase();
        (j = e.match(/msie ([\d.]+)/)) ? w.browser.set("ie", k(j[1])) : (j = e.match(/firefox\/([\d.]+)/)) ? w.browser.set("firefox", k(j[1])) : (j = e.match(/chrome\/([\d.]+)/)) ? w.browser.set("chrome", 
        k(j[1])) : (j = e.match(/opera.([\d.]+)/)) ? w.browser.set("opera", k(j[1])) : (j = e.match(/version\/([\d.]+).*safari/)) && w.browser.set("safari", k(j[1]))
    })();
    c.prototype = {send: function(j, e) {
            e = e || {};
            e.cacheTime = e.cacheTime || 0;
            e.onSuccess = e.onSuccess || function() {
            };
            e.onError = e.onError || function() {
            };
            e.onTimeout = e.onTimeout || function() {
            };
            e.onComplete = e.onComplete || function() {
            };
            var b = {method: e.method || "GET",contentType: e.contentType || "",enctype: e.enctype || "",data: e.data || {},param: e.param || {},arguments: e.arguments || 
                {},context: e.context || null,timeout: e.timeout || 3E4,onSuccess: function(l) {
                    l = l.responseText || "-";
                    var r = {};
                    try {
                        r = JSON.parse(l)
                    } catch (q) {
                        w.error("alloy.rpcservice: JSON \u683c\u5f0f\u51fa\u9519", "HttpRequest")
                    }
                    r.arguments = e.arguments || {};
                    e.onSuccess.call(e.context, r)
                },onError: function(l) {
                    e.onError.call(e.context, l)
                },onTimeout: function() {
                    var l = {};
                    l.arguments = e.arguments || {};
                    e.onTimeout.call(e.context, l)
                },onComplete: function() {
                    var l = {};
                    l.arguments = e.arguments || {};
                    e.onComplete.call(e.context, l)
                }};
            b.data = 
            w.string.toQueryString(b.data);
            if (b.method == "GET") {
                var h = b.data;
                if (e.cacheTime === 0)
                    h += h ? "&t=" + (new Date).getTime() : "t=" + (new Date).getTime();
                if (h)
                    j = j + "?" + h;
                b.data = null
            } else {
                b.contentType = "application/x-www-form-urlencoded";
                j.indexOf("?")
            }
            this._ajaxRequestInstant(j, b)
        }};
    var n = function(j, e) {
        var b = "qqweb_proxySendIframe_" + j, h = this, l;
        this._ajaxCallbacks = [];
        this._proxyAjaxSend = this._proxySend = null;
        l = document.body;
        var r = t.node("div", {"class": "hiddenIframe"});
        e += (/\?/.test(e) ? "&" : "?") + "id=" + j;
        r.innerHTML = 
        '<iframe id="' + b + '" class="hiddenIframe" name="' + b + '" src="' + e + '" width="1" height="1"></iframe>';
        l.appendChild(r);
        l = t.id(b);
        this.id = j;
        this.onAjaxFrameLoad = function() {
            var q = window.frames[b];
            w.out("ProxyRequest >>>>> iframe load.", "ProxyRequest");
            try {
                if (q.ajax) {
                    h._proxyAjaxSend = q.ajax;
                    var y = h._ajaxCallbacks;
                    q = 0;
                    for (var A = y.length; q < A; q++)
                        h.proxySend(y[q].url, y[q].option);
                    h._ajaxCallbacks = []
                } else {
                    w.warn("ProxyRequest >>>>> ajaxProxy error: ajax is undefined!!!!", "ProxyRequest");
                    resetIframeSrc()
                }
            } catch (D) {
                w.error("ProxyRequest >>>>> ajaxProxy error: " + 
                D.message + " !!!!", "ProxyRequest");
                resetIframeSrc()
            }
        };
        if (w.browser.firefox && i) {
            i = false;
            l.setAttribute("src", e)
        }
    };
    n.prototype = {send: function(j, e) {
            this._proxyAjaxSend ? this.proxySend(j, e) : this._ajaxCallbacks.push({url: j,option: e})
        },proxySend: function(j, e) {
            if (!this._proxySend)
                this._proxySend = new c(this._proxyAjaxSend);
            this._proxySend.send(j, e)
        }};
    var B = function() {
        this._proxyArr = {};
        this._proxyId = 1
    };
    B.prototype = {getProxyId: function() {
            return this._proxyId++
        },getProxy: function(j) {
            var e = this._proxyArr[j];
            if (!e) {
                e = 
                new n(this.getProxyId(), j);
                this._proxyArr[j] = e
            }
            return e
        },getProxyById: function(j) {
            for (var e in this._proxyArr)
                if (this._proxyArr[e].id == j)
                    return this._proxyArr[e];
            return null
        }};
    g = new B;
    window.qservice = {proxySend: function(j, e, b) {
            b = b || j.match(/^https?:\/\/[\.\d\w\-_:]+\//)[0] + "proxy.html";
            b += (/\?/.test(b) ? "&" : "?") + "callback=1";
            g.getProxy(b).send(j, e)
        }}
})();
mytracker.reportIsdEnd("load_share_all", true);
var JSON = (new Jx).json;
Jx().$package("share", function(g) {
    this.MAIN_DOMAIN = "qq.com";
    document.domain = this.MAIN_DOMAIN;
    this.TIME_STAMP = 20120217001;
    this.DATE_STAMP = g.format.date(new Date, "YYYYMMDD");
    this.CONST = {CGI_HOST: "http://cgi.connect.qq.com",DEFAULT_CGI_PROXY_URL: "http://cgi.connect.qq.com/proxy.html?t=" + this.TIME_STAMP};
    window.onerror = function(i, c, t) {
        try {
            console.info("error:" + ("" + (i.message || i.name || i.type || i)) + "," + t + "," + c)
        } catch (w) {
            return true
        }
    }
});
Jx().$package("mtaReport", function() {
    var g = _startTime, i = (new Date).getTime();
    this.setStartTime = function() {
        g = (new Date).getTime()
    };
    this.setEndTime = function() {
        i = (new Date).getTime()
    };
    this.getInterval = function() {
        return i - g
    };
    var c = function(k) {
        k = document.cookie.match(RegExp("(?:^|;+|\\s+)" + k + "=([^;]*)"));
        return !k ? "" : k[1]
    }, t = function() {
        var k = "", n = function() {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(j) {
                var e = Math.random() * 16 | 0;
                return (j == "x" ? e : e & 3 | 8).toString(16)
            }).toUpperCase()
        }, 
        B = c("ui");
        k = B ? B : n();
        document.cookie = "ui=" + k + ";domain=" + location.host + ";path=/;max-age=30758400";
        return function() {
            return k
        }
    }();
    window.reportImages = [new Image, new Image, new Image, new Image, new Image];
    var w = function() {
        var k = "PC", n = window.navigator.userAgent;
        if (/iPhone/.test(n))
            k = "iPhone";
        else if (/Android/.test(n))
            k = "Android";
        else if (/Windows Phone/.test(n))
            k = "WindowPhone";
        return function() {
            return k
        }
    }();
    this.report = function(k, n) {
        var B = function(l) {
            var r = window.location.hash;
            l = RegExp("(?:^|&)" + l + "=([^=&]+)(?:&|$)");
            r = r.replace(/^#/, "");
            if (r = l.exec(r))
                return r[1]
        }, j = function(l) {
            if (window.JSON)
                return JSON.stringify(l);
            else {
                var r = [], q;
                for (q in l)
                    typeof l[q] == "object" ? r.push('"' + q + '":' + j(l[q])) : r.push('"' + q + '":' + l[q]);
                return "{" + r.join(",") + "}"
            }
        }, e = {Android: "AJQL249T5CUA",PC: "AH46I8G5IHWE",iPhone: "I2KN7UR1DG5U"}, b = w();
        e = e[b] || e.PC;
        B = B("SDK") || B("sdk") || "";
        var h = c("uin") || 0;
        h = h && /^o([0-9]+)$/.test(h) ? parseFloat(RegExp.$1) : 0;
        e = {ky: e,ui: t(),et: 1E3,ts: ~~(+new Date / 1E3),ei: k,du: 1,kv: n};
        b = {Platform: b || "PC",appid: n.appid || 
            "",UIN: n.UIN || h,Entrance: b == "PC" ? "PC" : "H5",Time: "",SDK: B || "",Ext1: ""};
        if (n.Time)
            b.Time = n.Time;
        else
            delete b.Time;
        if (n.Ext1)
            b.Ext1 = n.Ext1;
        else
            delete b.Ext1;
        e.kv = b;
        b = "http://cgi.connect.qq.com/report/mstat/report?data=[" + j(e) + "]";
        e = window.reportImages.shift();
        !e && (e = new Image);
        e.src = b;
        e.onload = e.error = function() {
            window.reportImages.push(this)
        }
    };
    this.setEndTime();
    this.report("ShareQQPageOpen", {Time: mtaReport.getInterval()})
});
window.MM = function() {
    var g = new Image, i = {};
    return {init: function(c, t, w) {
            i = {appid: c,touin: t,releaseversion: w,frequency: 1}
        },report: function(c, t, w, k) {
            var n = [];
            i.commandid = c;
            i.resultcode = t;
            i.tmcost = w;
            if (k)
                for (var B in k)
                    if (k.hasOwnProperty(B))
                        i[B] = k[B];
            if (t == 0) {
                i.frequency = 20;
                if (Math.floor(Math.random() * 100 + 1) > 5)
                    return
            } else
                i.frequency = 1;
            for (var j in i)
                i.hasOwnProperty(j) && n.push(j + "=" + encodeURIComponent(i[j]));
            c = "http://wspeed.qq.com/w.cgi?" + n.join("&");
            g.src = c
        }}
}();
Jx().$package("share.utils", function(g) {
    $C = share.CONST;
    $E = g.event;
    $S = g.string;
    var i = g.browser.version.toString().indexOf(".") > -1 && g.browser.version.split(".")[0] < 23 || g.browser.name == "firefox" ? document.getElementById("embed2") : document.getElementById("embed1"), c, t = true, w = true, k = {};
    this.getTemplate = function(e) {
        var b = k[e];
        if (!b) {
            var h = document.getElementById(e);
            b = h.innerHTML;
            h.parentNode.removeChild(h);
            k[e] = b
        }
        if (!b)
            throw Error('no such template. [id="' + e + '"]');
        return b
    };
    this.getActionTarget = function(e, 
    b, h, l) {
        e = e.target;
        var r = b || 3;
        b = b !== -1;
        h = h || "cmd";
        for (l = l || document.body; e && e !== l && (b ? r-- > 0 : true); )
            if (e.getAttribute(h))
                return e;
            else
                e = e.parentNode;
        return null
    };
    this.getAvatar = function(e, b) {
        b = b || 1;
        var h = share.model.getTCode();
        if (this.getSelfUin() == e)
            return "http://face" + (e % 10 + 1) + ".qun.qq.com/cgi/svr/face/getface?cache=1&type=" + b + "&f=40&uin=" + e + "&t=" + Math.floor(new Date / 1E3) + "&vfwebqq=" + h;
        return "http://face" + (e % 10 + 1) + ".qun.qq.com/cgi/svr/face/getface?cache=1&type=" + b + "&f=40&uin=" + e + "&vfwebqq=" + h
    };
    var n;
    this.getSelfUin = function() {
        if (typeof n == "undefined")
            n = g.cookie.get("uin").replace(/^[o0]+/i, "");
        return n
    };
    var B = {};
    this.delay = function(e, b, h) {
        var l = arguments;
        if (l.length === 1) {
            h = e;
            b = 0;
            e = null
        } else if (l.length === 2) {
            h = b;
            b = e;
            e = null
        }
        b = b || 0;
        if (e && b) {
            e in B && window.clearTimeout(B[e]);
            l = window.setTimeout(function() {
                h.apply(window);
                B[e] = 0;
                delete B[e]
            }, b);
            B[e] = l
        } else
            window.setTimeout(h, b)
    };
    this.debounce = function(e, b, h) {
        var l;
        return function() {
            if (!l || +new Date - l > e) {
                h ? b() : setTimeout(b, e);
                l = +new Date
            }
        }
    };
    this.clearDelay = function(e) {
        e in B && window.clearTimeout(B[e]);
        B[e] = 0;
        delete B[e]
    };
    this.BatchProcess = g.Class({init: function() {
            this.processIds = [];
            this.runners = [];
            this.completeList = [];
            this.errors = this.count = 0
        },complete: function(e) {
            if (g.array.indexOf(this.processIds, e.id) >= 0) {
                this.completeList.push(e);
                this.count++;
                e.t == 1 && this.errors++;
                this.check()
            }
        },success: function(e, b) {
            this.complete({id: e,t: 0,data: b})
        },error: function(e, b) {
            this.complete({id: e,t: 1,data: b})
        },check: function() {
            this.processIds.length == this.count && 
            $E.notifyObservers(this, "BatchProcessCompleted", {list: this.completeList,errors: this.errors})
        },add: function(e, b) {
            this.processIds.push(e);
            this.runners.push(b)
        },run: function() {
            this.processIds.length > 0 ? g.array.forEach(this.runners, function(e) {
                e()
            }) : $E.notifyObservers(this, "BatchProcessCompleted", {list: [],errors: []})
        },getCallback: function(e) {
            var b;
            g.array.forEach(this.completeList, function(h) {
                if (h.id == e) {
                    b = h;
                    return false
                }
            });
            return b
        }});
    this.makeRandomNumberArray = function(e, b, h, l) {
        e = g.isUndefined(e) ? 1 : 
        e;
        b = g.isUndefined(b) ? 0 : b;
        h = g.isUndefined(h) ? 1 : h;
        l = g.isUndefined(l) ? true : l;
        var r = [], q;
        do {
            q = b + Math.random() * e;
            if (l)
                g.array.contains(r, q) || r.push(q);
            else
                r.push(q)
        } while (r.length < h);
        return r.length == 1 ? r[0] : r
    };
    this.makeRandomNumber = function(e, b) {
        b = g.isUndefined(b) ? 0 : b;
        return parseInt(b + Math.random() * e)
    };
    this.randomize = function(e, b) {
        (b = g.isUndefined(b) ? false : true) && e.slice(0);
        return e.sort(function() {
            return Math.random() > 0.5 ? -1 : 1
        })
    };
    this.getCSRFToken = function() {
        for (var e = g.cookie.get("skey"), b = 5381, h = 
        0, l = e.length; h < l; ++h)
            b += (b << 5) + e.charAt(h).charCodeAt();
        return b & 2147483647
    };
    this.getParameter = function(e, b) {
        b = b || location.href;
        var h = b.match(RegExp("(\\?|#|&)" + e + "=([^&#]*)(&|#|$)"));
        return !h ? "" : h[2]
    };
    this.isPtLoggedIn = function() {
        return !!(g.cookie.get("uin") && g.cookie.get("skey"))
    };
    this.addEvent = function(e, b, h, l) {
        var r = "", q = 0;
        if (typeof b == "string") {
            q = 1;
            switch (true) {
                case /^\./.test(b):
                    r = "className";
                    b = b.replace(".", "");
                    b = RegExp(" *" + b + " *");
                    break;
                case /^\#/.test(b):
                    r = "id";
                    b = RegExp(b.replace("#", ""));
                    break;
                default:
                    b = RegExp(b);
                    r = "tagName"
            }
        }
        var y = window.addEventListener ? "addEventListener" : "attachEvent";
        h = window.addEventListener ? h : "on" + h;
        e[y](h, function(A) {
            function D(C) {
                if (q) {
                    if (b.test(C[r].toLowerCase())) {
                        l.call(C, A);
                        return
                    }
                } else if (b == C) {
                    l.call(C, A);
                    return
                }
                C == e || C.parentNode == e || D(C.parentNode)
            }
            D(A.srcElement)
        })
    };
    this.lenReg = function(e) {
        return e.replace(/[^x00-xFF]/g, "**").length
    };
    this.sub_str = function(e, b) {
        if (b) {
            var h = 0, l = "";
            e = e.split("");
            for (var r = 0; r < e.length; r++) {
                l += e[r];
                if (/[^x00-xFF]/.test(e[r])) {
                    h += 
                    2;
                    if (h == b + 1)
                        return l
                } else
                    h++;
                if (h == b)
                    return l
            }
        }
    };
    this.sub_str_msg = function(e, b) {
        if (b) {
            var h = 0, l = "";
            e = e.split("");
            for (var r = 0; r < e.length; r++)
                if (/[^x00-xFF]/.test(e[r])) {
                    h += 2;
                    if (h < b + 1)
                        l += e[r];
                    else
                        return l
                } else {
                    h++;
                    if (h < b)
                        l += e[r];
                    else
                        return l
                }
        }
    };
    this.sub_str_create = function(e, b) {
        if (b) {
            var h = 0, l = "";
            e = e.split("");
            for (var r = 0; r < e.length; r++) {
                l += e[r];
                if (/[^x00-xFF]/.test(e[r])) {
                    h += 2;
                    if (h == b + 1 || h == e.length)
                        return l
                } else {
                    h++;
                    if (h == e.length)
                        return l
                }
                if (h == b)
                    return l
            }
        }
    };
    this.testIpad = navigator.userAgent.toLowerCase().indexOf("ipad") > 
    -1;
    this.initCphelper = function() {
        if (g.browser.name == "ie")
            try {
                c = new ActiveXObject("TimwpDll.TimwpCheck")
            } catch (e) {
                t = false
            }
        else if (i) {
            try {
                i.InitActiveX("TimwpDll.TimwpCheck")
            } catch (b) {
                try {
                    if (g.browser.version.split(".")[0] >= 23) {
                        i = document.getElementById("embed2");
                        w = false
                    } else
                        t = false
                } catch (h) {
                }
            }
            if (!w)
                try {
                    i.InitActiveX("TimwpDll.TimwpCheck")
                } catch (l) {
                    t = false
                }
        } else
            t = false
    };
    this.GetHummerQQVersion = function() {
        if (g.browser.name == "ie")
            try {
                var e = c.GetHummerQQVersion();
                return e
            } catch (b) {
                t = false;
                console.log(b)
            }
        else if (i)
            try {
                return e = 
                i.GetHummerQQVersion()
            } catch (h) {
                t = false;
                console.log(h)
            }
        else
            t = false
    };
    this.isQQRunning = function(e) {
        if (g.browser.name == "ie")
            try {
                var b = c.IsQQRunning(e);
                console.log(b);
                return b
            } catch (h) {
                console.log(h)
            }
        else if (i) {
            b = i.IsQQRunning(e);
            console.log(b);
            return b
        } else
            console.log("NULL")
    };
    this.isGroupAioAble = function() {
        var e = false;
        try {
            if (this.GetHummerQQVersion() >= 5065)
                e = true
        } catch (b) {
            t = false;
            console.log(b)
        }
        return e
    };
    this.startAio = function(e) {
        if (g.browser.name == "ie" || !t)
            window.location = "tencent://message/?Menu=yes&uin=" + 
            e.uin + "&fuin=" + e.fuin + "&Service=113";
        else
            try {
                i.DealTencentString("tencent://message/?Menu=yes&uin=" + e.uin + "&fuin=" + e.fuin + "&Service=113")
            } catch (b) {
                console.log(b);
                window.location = "tencent://message/?Menu=yes&uin=" + e.uin + "&fuin=" + e.fuin + "&Service=113"
            }
    };
    this.startGroupAio = function(e) {
        if (g.browser.name == "ie")
            window.location = "tencent://openchat/?subcmd=" + e.cmd + "&id=" + e.id + "&fuin=" + e.fuin;
        else
            try {
                i.DealTencentString("tencent://openchat/?subcmd=" + e.cmd + "&id=" + e.id + "&fuin=" + e.fuin)
            } catch (b) {
                window.location = 
                "tencent://openchat/?subcmd=" + e.cmd + "&id=" + e.id + "&fuin=" + e.fuin
            }
    };
    this.saveMsg = function(e) {
        if (g.browser.name == "ie") {
            var b = JSON.stringify(e.shareto).replace(/\"/g, '\\"');
            e = "tencent://QQInternet/?subcmd=savemsg&dwFromUin=" + e.dwFromUin + "&shareto=" + encodeURI(b) + "&msgcontent=" + encodeURI(e.msgcontent) + "&fuin=" + e.fuin;
            window.location = e
        } else {
            b = JSON.stringify(e.shareto);
            e = "tencent://QQInternet/?subcmd=savemsg&dwFromUin=" + e.dwFromUin + "&shareto=" + encodeURI(b) + "&msgcontent=" + encodeURI(e.msgcontent) + "&fuin=" + 
            e.fuin;
            i.DealTencentString(e)
        }
    };
    this.bubbleSort = function(e) {
        compareFunc = function(y, A) {
            return y - A
        };
        for (var b = e.length, h, l, r = 0; r < b - 1; r++) {
            l = false;
            for (var q = b - 1; q > r; q--)
                if (compareFunc(e[q].type, e[q - 1].type) < 0) {
                    l = true;
                    h = e[q - 1];
                    e[q - 1] = e[q];
                    e[q] = h
                }
            if (!l)
                break
        }
        return e
    };
    this.css = function(e, b) {
        try {
            return e.currentStyle[b]
        } catch (h) {
            return getComputedStyle(e).getPropertyValue(b)
        }
    };
    var j = {};
    this.lastAnimationEnd = function(e, b) {
        if (j[e]) {
            clearInterval(j[e].timer);
            j[e].callBack && j[e].callBack(b)
        }
    };
    this.animate = 
    function(e, b, h, l, r) {
        var q = {}, y = {}, A;
        for (A in b) {
            var D = parseInt(this.css(e, A));
            y[A] = D;
            q[A] = parseInt(parseInt(b[A]) - D) / h
        }
        var C = 0, o;
        o = setInterval(function() {
            C++;
            var G = (0 * Math.pow(1 - C / 40 * 1E3 / h, 3) + 1.26 * (C / 40 * 1E3 / h) * Math.pow(1 - C / 40 * 1E3 / h, 2) + 3 * 0.8 * (C / 40 * 1E3 / h) * (C / 40 * 1E3 / h) * (1 - C / 40 * 1E3 / h) + 1 * Math.pow(C / 40 * 1E3 / h, 3)) * h, H;
            for (H in q)
                if (H == "opacity")
                    if (window.addEventListener)
                        e.style[H] = y[H] + q[H] * G;
                    else {
                        e.style.filter = "alpha(opacity=" + (y[H] + q[H] * G) * 100 + ")";
                        var L = function(s) {
                            s = s.childNodes;
                            for (var I = 0, E = s.length; I < 
                            E; I++)
                                s[I] && s[I].nodeType == 1 && s[I].tagName.toLowerCase() == "img" && (s[I].style.filter = "alpha(opacity=" + (y[H] + q[H] * G) * 100 + ")") || L(s[I])
                        };
                        L(e)
                    }
                else
                    e.style[H] = parseInt(y[H] + q[H] * G) + "px";
            if (C == h / 1E3 * 40) {
                clearInterval(o);
                l && l();
                r && delete j[r]
            }
        }, 25);
        r && (j[r] = {timer: o,callBack: l})
    };
    this.getElementPos = function(e) {
        var b = navigator.userAgent.toLowerCase();
        b.indexOf("opera");
        b.indexOf("msie");
        if (e.parentNode === null || e.style.display == "none")
            return false;
        var h = null, l = [];
        if (e.getBoundingClientRect) {
            b = e.getBoundingClientRect();
            return {x: b.left + Math.max(document.documentElement.scrollLeft, document.body.scrollLeft),y: b.top + Math.max(document.documentElement.scrollTop, document.body.scrollTop)}
        } else if (document.getBoxObjectFor) {
            b = document.getBoxObjectFor(e);
            h = e.style.borderLeftWidth ? parseInt(e.style.borderLeftWidth) : 0;
            l = e.style.borderTopWidth ? parseInt(e.style.borderTopWidth) : 0;
            l = [b.x - h, b.y - l]
        } else {
            l = [e.offsetLeft, e.offsetTop];
            h = e.offsetParent;
            if (h != e)
                for (; h; ) {
                    l[0] += h.offsetLeft;
                    l[1] += h.offsetTop;
                    h = h.offsetParent
                }
            if (b.indexOf("opera") != 
            -1 || b.indexOf("safari") != -1 && e.style.position == "absolute") {
                l[0] -= document.body.offsetLeft;
                l[1] -= document.body.offsetTop
            }
        }
        for (h = e.parentNode ? e.parentNode : null; h && h.tagName != "BODY" && h.tagName != "HTML"; ) {
            l[0] -= h.scrollLeft;
            l[1] -= h.scrollTop;
            h = h.parentNode ? h.parentNode : null
        }
        return {x: l[0],y: l[1]}
    }
});
Jx().$package("share.utils", function() {
    this.pinyin = {_pyvalue: ["a", "ai", "an", "ang", "ao", "ba", "bai", "ban", "bang", "bao", "bei", "ben", "beng", "bi", "bian", "biao", "bie", "bin", "bing", "bo", "bu", "ca", "cai", "can", "cang", "cao", "ce", "cen", "ceng", "cha", "chai", "chan", "chang", "chao", "che", "chen", "cheng", "chi", "chong", "chou", "chu", "chuai", "chuan", "chuang", "chui", "chun", "chuo", "ci", "cong", "cou", "cu", "cuan", "cui", "cun", "cuo", "da", "dai", "dan", "dang", "dao", "de", "dei", "deng", "di", "dia", "dian", "diao", "die", "ding", "diu", 
            "dong", "dou", "du", "duan", "dui", "dun", "duo", "e", "ei", "en", "er", "fa", "fan", "fang", "fei", "fen", "feng", "fo", "fou", "fu", "ga", "gai", "gan", "gang", "gao", "ge", "gei", "gen", "geng", "gong", "gou", "gu", "gua", "guai", "guan", "guang", "gui", "gun", "guo", "ha", "hai", "han", "hang", "hao", "he", "hei", "hen", "heng", "hng", "hong", "hou", "hu", "hua", "huai", "huan", "huang", "hui", "hun", "huo", "ji", "jia", "jian", "jiang", "jiao", "jie", "jin", "jing", "jiong", "jiu", "ju", "juan", "jue", "jun", "ka", "kai", "kan", "kang", "kao", "ke", "ken", "keng", "kong", 
            "kou", "ku", "kua", "kuai", "kuan", "kuang", "kui", "kun", "kuo", "la", "lai", "lan", "lang", "lao", "le", "lei", "leng", "li", "lia", "lian", "liang", "liao", "lie", "lin", "ling", "liu", "lo", "long", "lou", "lu", "luan", "lun", "luo", "lue", "lv", "m", "ma", "mai", "man", "mang", "mao", "me", "mei", "men", "meng", "mi", "mian", "miao", "mie", "min", "ming", "miu", "mo", "mou", "mu", "n", "na", "nai", "nan", "nang", "nao", "ne", "nei", "nen", "neng", "ng", "ni", "nian", "niang", "niao", "nie", "nin", "ning", "niu", "nong", "nou", "nu", "nuan", "nuo", "nue", "nv", "o", "ou", "pa", 
            "pai", "pan", "pang", "pao", "pei", "pen", "peng", "pi", "pian", "piao", "pie", "pin", "ping", "po", "pou", "pu", "qi", "qia", "qian", "qiang", "qiao", "qie", "qin", "qing", "qiong", "qiu", "qu", "quan", "que", "qun", "ran", "rang", "rao", "re", "ren", "reng", "ri", "rong", "rou", "ru", "ruan", "rui", "run", "ruo", "sa", "sai", "san", "sang", "sao", "se", "sen", "seng", "sha", "shai", "shan", "shang", "shao", "she", "shei", "shen", "sheng", "shi", "shou", "shu", "shua", "shuai", "shuan", "shuang", "shui", "shun", "shuo", "si", "song", "sou", "su", "suan", "sui", "sun", "suo", 
            "ta", "tai", "tan", "tang", "tao", "te", "tei", "teng", "ti", "tian", "tiao", "tie", "ting", "tong", "tou", "tu", "tuan", "tui", "tun", "tuo", "wa", "wai", "wan", "wang", "wei", "wen", "weng", "wo", "wu", "xi", "xia", "xian", "xiang", "xiao", "xie", "xin", "xing", "xiong", "xiu", "xu", "xuan", "xue", "xun", "ya", "yan", "yang", "yao", "ye", "yi", "yin", "ying", "yo", "yong", "you", "yu", "yuan", "yue", "yun", "za", "zai", "zan", "zang", "zao", "ze", "zei", "zen", "zeng", "zha", "zhai", "zhan", "zhang", "zhao", "zhe", "zhei", "zhen", "zheng", "zhi", "zhong", "zhou", "zhu", "zhua", 
            "zhuai", "zhuan", "zhuang", "zhui", "zhun", "zhuo", "zi", "zong", "zou", "zu", "zuan", "zui", "zun", "zuo"],_pystr: ["\u963f\u554a\u5475\u814c\u5416\u9515\u554a\u5475\u55c4\u554a\u5475\u554a\u5475\u963f\u554a\u5475", "\u54c0\u6328\u57c3\u5509\u54ce\u6371\u953f\u5446\u6328\u764c\u7691\u6371\u77ee\u54ce\u853c\u972d\u55f3\u7231\u788d\u827e\u5509\u54ce\u9698\u66a7\u55f3\u7477\u55cc\u5ad2\u7839", "\u5b89\u8c19\u978d\u6c28\u5eb5\u6849\u9e4c\u5e7f\u5382\u4ffa\u94f5\u63de\u57ef\u6848\u6309\u6697\u5cb8\u9eef\u80fa\u72b4", 
            "\u80ae\u6602\u76ce", "\u71ac\u51f9\u71ac\u6556\u56a3\u55f7\u93d6\u9ccc\u7ff1\u7352\u8071\u87af\u5ed2\u9068\u8884\u62d7\u5aaa\u5965\u6fb3\u50b2\u61ca\u5773\u62d7\u9a9c\u5c99\u93ca", "\u516b\u5427\u5df4\u53ed\u82ad\u6252\u75a4\u7b06\u7c91\u5c9c\u634c\u516b\u62d4\u8dcb\u8307\u83dd\u9b43\u628a\u9776\u94af\u628a\u7238\u7f62\u9738\u575d\u8019\u705e\u9c85\u5427\u7f62", "\u63b0\u767d\u767e\u6446\u4f2f\u67cf\u4f70\u636d\u8d25\u62dc\u5457\u7a17", "\u822c\u73ed\u642c\u6591\u9881\u6273\u7622\u764d\u7248\u677f\u962a\u5742\u94a3\u8228\u529e\u534a\u4f34\u626e\u74e3\u62cc\u7eca", 
            "\u5e2e\u90a6\u6d5c\u6886\u8180\u699c\u7ed1\u68d2\u8180\u508d\u78c5\u8c24\u9551\u868c\u84a1", "\u5305\u80de\u70ae\u5265\u8912\u82de\u5b62\u7172\u9f85\u8584\u96f9\u4fdd\u5b9d\u9971\u5821\u8446\u8913\u9e28\u62a5\u66b4\u62b1\u7206\u9c8d\u66dd\u5228\u7011\u8c79\u8db5", "\u80cc\u60b2\u676f\u7891\u5351\u9642\u57e4\u8406\u9e4e\u5317\u88ab\u5907\u80cc\u8f88\u500d\u8d1d\u84d3\u60eb\u6096\u72c8\u7119\u90b6\u94a1\u5b5b\u789a\u8919\u943e\u97b4\u81c2\u5457", "\u5954\u8d32\u951b\u672c\u82ef\u755a\u5954\u7b28\u592f\u574c", 
            "\u5d29\u7ef7\u5623\u752d\u7ef7\u7ef7\u8e66\u8ff8\u750f\u6cf5\u868c", "\u903c\u9f3b\u8378\u6bd4\u7b14\u5f7c\u9119\u5315\u4ffe\u59a3\u5421\u79d5\u822d\u5fc5\u6bd5\u5e01\u79d8\u907f\u95ed\u58c1\u81c2\u5f0a\u8f9f\u78a7\u62c2\u6bd9\u853d\u5e87\u74a7\u655d\u6ccc\u965b\u5f3c\u7be6\u5a62\u610e\u75f9\u94cb\u88e8\u6fde\u9ac0\u5eb3\u6bd6\u6ed7\u84d6\u57e4\u8298\u5b16\u835c\u8d32\u7540\u8406\u859c\u7b5a\u7b85\u54d4\u895e\u8df8\u72f4", "\u7f16\u8fb9\u97ad\u782d\u7178\u8759\u7b3e\u9cca\u8d2c\u6241\u533e\u78a5\u7a86\u890a\u4fbf\u53d8\u904d\u8fa9\u8fa8\u8fab\u535e\u82c4\u6c74\u5fed\u5f01\u7f0f\u8fb9", 
            "\u6807\u5f6a\u52fa\u9556\u8198\u9aa0\u9573\u6753\u98da\u98d1\u98d9\u762d\u9adf\u8868\u88f1\u5a4a\u9cd4", "\u618b\u762a\u9cd6\u522b\u8e69\u762a\u522b", "\u5bbe\u6ee8\u5f6c\u658c\u7f24\u6fd2\u69df\u50a7\u73a2\u8c73\u9554\u9b13\u6ba1\u6448\u8191\u9acc", "\u5e76\u5175\u51b0\u69df\u997c\u5c4f\u4e19\u67c4\u79c9\u70b3\u7980\u90b4\u5e76\u75c5\u6452", "\u822c\u6ce2\u64ad\u62e8\u5265\u73bb\u997d\u83e0\u94b5\u8db5\u767e\u535a\u4f2f\u52c3\u8584\u6cca\u67cf\u9a73\u9b44\u8116\u640f\u818a\u8236\u7934\u5e1b\u94c2\u7b94\u6e24\u94b9\u5b5b\u4eb3\u9e41\u8e23\u7c38\u8ddb\u8584\u67cf\u7c38\u63b0\u64d8\u6a97\u535c\u5575", 
            "\u900b\u6661\u94b8\u4e0d\u91ad\u8865\u6355\u5821\u535c\u54fa\u535f\u4e0d\u90e8\u5e03\u6b65\u6016\u7c3f\u57d4\u57e0\u74ff\u949a", "\u64e6\u62c6\u5693\u7924", "\u731c\u624d\u8d22\u6750\u88c1\u91c7\u5f69\u8e29\u776c\u91c7\u83dc\u8521", "\u53c2\u9910\u9a96\u6b8b\u60ed\u8695\u60e8\u9eea\u60e8\u707f\u63ba\u74a8\u5b71\u7cb2", "\u82cd\u4ed3\u6ca7\u8231\u4f27\u85cf", "\u64cd\u7cd9\u66f9\u69fd\u5608\u6f15\u87ac\u825a\u8349", "\u7b56\u6d4b\u4fa7\u5395\u518c\u607b", "\u53c2\u5c91\u6d94", "\u564c\u66fe\u5c42\u8e6d", 
            "\u5dee\u63d2\u53c9\u78b4\u55b3\u5693\u6748\u9987\u9538\u67e5\u5bdf\u8336\u53c9\u832c\u78b4\u6942\u7339\u643d\u69ce\u6aab\u53c9\u8869\u9572\u5dee\u5239\u53c9\u8be7\u5c94\u8869\u6748\u6c4a\u59f9", "\u5dee\u62c6\u9497\u67f4\u8c7a\u4faa\u867f\u7625", "\u6400\u63ba\u89c7\u5355\u7f20\u7985\u8749\u998b\u6f7a\u87fe\u5a75\u8c17\u5edb\u5b71\u9561\u6fb6\u8e94\u4ea7\u94f2\u9610\u8c04\u5181\u8487\u9aa3\u98a4\u5fcf\u7fbc", "\u660c\u5a3c\u7316\u4f25\u960a\u83d6\u9cb3\u957f\u573a\u5e38\u5c1d\u80a0\u507f\u5018\u88f3\u5ae6\u5f9c\u82cc\u573a\u5382\u655e\u6c05\u6636\u60dd\u5531\u7545\u5021\u6005\u9b2f", 
            "\u8d85\u6284\u5435\u949e\u7ef0\u527f\u712f\u600a\u671d\u6f6e\u5632\u5de2\u6641\u7092\u5435\u8016", "\u8f66\u7817\u5c3a\u626f\u5f7b\u64a4\u6f88\u63a3\u577c", "\u90f4\u741b\u55d4\u62bb\u9648\u6c89\u6668\u6c88\u5c18\u81e3\u8fb0\u6a59\u5ff1\u8c0c\u5bb8\u789c\u79f0\u8d81\u886c\u79e4\u8c36\u6987\u9f80\u4f27", "\u79f0\u6491\u79e4\u77a0\u564c\u94db\u67fd\u86cf\u6210\u57ce\u7a0b\u627f\u8bda\u76db\u4e58\u5448\u60e9\u6f84\u6a59\u4e1e\u57d5\u67a8\u584d\u94d6\u88ce\u9172\u901e\u9a8b\u88ce\u79f0\u79e4", "\u5403\u75f4\u54e7\u55e4\u86a9\u7b1e\u9e31\u5ab8\u87ad\u7735\u9b51\u6301\u8fdf\u6c60\u9a70\u5319\u5f1b\u8e1f\u5880\u830c\u7bea\u577b\u5c3a\u9f7f\u803b\u4f88\u892b\u8c49\u8d64\u65a5\u7fc5\u557b\u70bd\u6555\u53f1\u996c\u50ba\u5f73\u761b", 
            "\u51b2\u5145\u6d8c\u61a7\u5fe1\u825f\u8202\u833a\u79cd\u91cd\u5d07\u866b\u5ba0\u51b2\u94f3", "\u62bd\u7633\u6101\u4ec7\u7b79\u916c\u7ef8\u8e0c\u60c6\u7574\u7a20\u5e31\u4fe6\u96e0\u4e11\u7785\u81ed", "\u51fa\u521d\u6a17\u9664\u53a8\u8e87\u6a71\u96cf\u9504\u870d\u520d\u6ec1\u8e70\u5904\u695a\u50a8\u7840\u6775\u891a\u696e\u5904\u89e6\u755c\u77d7\u6035\u6410\u7ecc\u9edc\u4e8d\u61b7", "\u63e3\u640b\u63e3\u63e3\u555c\u8e39\u562c\u81aa", "\u7a7f\u5ddd\u5ddb\u6c1a\u4f20\u8239\u9044\u693d\u8221\u5598\u821b\u4e32\u948f", 
            "\u521b\u7a97\u75ae\u5e8a\u5e62\u95ef\u521b\u6006", "\u5439\u708a\u5782\u9524\u6376\u9672\u690e\u69cc\u68f0", "\u6625\u693f\u877d\u7eaf\u5507\u9187\u6df3\u9e51\u83bc\u8822", "\u6233\u8e14\u7ef0\u555c\u8f8d\u9f8a", "\u5dee\u523a\u75b5\u5472\u8bcd\u8f9e\u6148\u78c1\u74f7\u5179\u8328\u96cc\u7960\u8308\u9e5a\u7ccd\u6b64\u6b21\u523a\u8d50\u4f3a", "\u4ece\u5306\u806a\u8471\u56f1\u82c1\u9aa2\u7481\u679e\u4ece\u4e1b\u742e\u6dd9", "\u51d1\u6971\u8f8f\u8160", "\u7c97\u5f82\u6b82\u4fc3\u7c07\u918b\u5352\u731d\u8e74\u8e59\u851f\u9162", 
            "\u8e7f\u64ba\u6c46\u9569\u6512\u7a9c\u7be1\u7228", "\u8870\u50ac\u6467\u5d14\u96b9\u69b1\u7480\u8106\u7cb9\u8403\u7fe0\u7601\u60b4\u6dec\u6bf3\u5550", "\u6751\u76b4\u5b58\u8e72\u5fd6\u5bf8", "\u6413\u64ae\u78cb\u8e49\u5d6f\u77ec\u75e4\u7625\u9e7e\u64ae\u811e\u9519\u63aa\u632b\u539d\u9509", "\u7b54\u642d\u55d2\u8037\u8921\u54d2\u6253\u8fbe\u7b54\u7629\u6c93\u9791\u601b\u7b2a\u977c\u59b2\u6253\u5927\u5854\u75b8", "\u5f85\u5446\u5454\u902e\u6b79\u50a3\u5927\u4ee3\u5e26\u5f85\u6234\u888b\u8d37\u902e\u6b86\u9edb\u6020\u73b3\u5cb1\u8fe8\u9a80\u7ed0\u57ed\u7519", 
            "\u5355\u62c5\u4e39\u803d\u7708\u6b9a\u7baa\u510b\u7605\u8043\u90f8\u62c5\u80c6\u63b8\u8d55\u75b8\u7605\u4f46\u62c5\u77f3\u5f39\u6de1\u65e6\u86cb\u8bde\u60ee\u5556\u6fb9\u6c2e\u840f\u7605", "\u5f53\u88c6\u94db\u515a\u6321\u8c20\u5f53\u8361\u6863\u6321\u5b95\u83ea\u51fc\u7800", "\u5200\u53e8\u5fc9\u6c18\u53e8\u5bfc\u5012\u5c9b\u8e48\u6363\u7977\u5230\u9053\u5012\u60bc\u76d7\u7a3b\u7118\u5e31\u7e9b", "\u5f97\u5fb7\u951d\u7684\u5730\u5f97\u5e95", "\u5f97", "\u767b\u706f\u8e6c\u5654\u7c26\u7b49\u6225\u9093\u51f3\u77aa\u6f84\u8e6c\u78f4\u956b\u5d9d", 
            "\u63d0\u4f4e\u6ef4\u5824\u5600\u6c10\u955d\u7f9d\u7684\u654c\u8fea\u7b1b\u6da4\u5600\u72c4\u5ae1\u7fdf\u837b\u7c74\u89cc\u955d\u5e95\u62b5\u8bcb\u90b8\u7825\u577b\u67e2\u6c10\u9ab6\u7684\u5730\u7b2c\u5e1d\u5f1f\u9012\u8482\u7f14\u8c1b\u7747\u68e3\u5a23\u78b2\u7ee8", "\u55f2", "\u98a0\u6ec7\u6382\u766b\u5dc5\u70b9\u5178\u7898\u8e2e\u4e36\u7535\u5e97\u7538\u6dc0\u57ab\u6bbf\u5960\u60e6\u4f43\u73b7\u7c1f\u576b\u975b\u94bf\u765c\u963d", "\u96d5\u5201\u51cb\u53fc\u8c82\u7889\u9cb7\u9e1f\u8c03\u6389\u540a\u9493\u94eb\u94de", 
            "\u7239\u8dcc\u8e2e\u53e0\u8fed\u789f\u8c0d\u8776\u558b\u4f5a\u7252\u800b\u8e40\u581e\u74de\u63f2\u57a4\u9cbd", "\u4e01\u76ef\u9489\u53ee\u753a\u914a\u7594\u4ec3\u8035\u738e\u9876\u9f0e\u914a\u5b9a\u8ba2\u9489\u94e4\u815a\u952d\u7887\u5576", "\u4e22\u94e5", "\u4e1c\u51ac\u549a\u5cbd\u6c21\u9e2b\u61c2\u8463\u7850\u52a8\u6d1e\u51bb\u680b\u606b\u4f97\u578c\u5cd2\u80e8\u80f4\u7850", "\u90fd\u515c\u8538\u7bfc\u6597\u6296\u9661\u86aa\u8bfb\u6597\u8c46\u9017\u7aa6\u75d8", "\u90fd\u7763\u561f\u8bfb\u72ec\u987f\u6bd2\u6e0e\u724d\u728a\u9ee9\u9ad1\u691f\u809a\u7779\u5835\u8d4c\u7b03\u5ea6\u6e21\u809a\u675c\u5992\u9540\u828f\u8839", 
            "\u7aef\u77ed\u65ad\u6bb5\u953b\u7f0e\u7145\u6934\u7c16", "\u5806\u5bf9\u961f\u5151\u6566\u7893\u619d\u603c\u9566", "\u5428\u6566\u8e72\u58a9\u7905\u9566\u76f9\u8db8\u987f\u76fe\u949d\u7096\u9041\u6c8c\u56e4\u7818", "\u591a\u5484\u54c6\u6387\u88f0\u5ea6\u593a\u8e31\u94ce\u6735\u8eb2\u579b\u54da\u7f0d\u8235\u5815\u8dfa\u5241\u60f0\u579b\u9a6e\u6cb2\u67c1", "\u963f\u5a40\u5c59\u989d\u4fc4\u54e6\u9e45\u5a25\u5ce8\u86fe\u8bb9\u83aa\u9507\u6076\u6076\u997f\u627c\u6115\u904f\u5669\u5443\u5384\u9102\u8f6d\u989a\u9cc4\u8c14\u9537\u843c\u816d\u57a9\u9e57\u82ca\u960f\u5443", 
            "\u8bf6\u8bf6\u8bf6", "\u6069\u84bd\u6441", "\u800c\u513f\u9e38\u9c95\u5c14\u8033\u8fe9\u9975\u6d31\u73e5\u94d2\u4e8c\u8d30\u4f74", "\u53d1\u7f5a\u4e4f\u4f10\u9600\u7b4f\u57a1\u6cd5\u781d\u53d1\u73d0", "\u7ffb\u756a\u5e06\u85e9\u5e61\u8543\u51e1\u70e6\u7e41\u6cdb\u6a0a\u8543\u71d4\u77fe\u8629\u9492\u8e6f\u53cd\u8fd4\u996d\u72af\u8303\u8d29\u6cdb\u68b5\u7548", "\u65b9\u82b3\u59a8\u574a\u90a1\u678b\u94ab\u623f\u9632\u59a8\u574a\u80aa\u9c82\u8bbf\u4eff\u7eba\u5f77\u822b\u653e", "\u975e\u98de\u5561\u83f2\u6249\u970f\u5983\u7eef\u871a\u9cb1\u80a5\u8153\u6ddd\u83f2\u532a\u8bfd\u6590\u871a\u7fe1\u60b1\u7bda\u69a7\u8d39\u5e9f\u6cb8\u80ba\u5420\u75f1\u72d2\u9544\u82be", 
            "\u5206\u7eb7\u6c1b\u82ac\u5429\u915a\u73a2\u575f\u711a\u6c7e\u68fc\u9f22\u7c89\u5206\u4efd\u594b\u6124\u7caa\u5fff\u507e\u7035\u9cbc", "\u98ce\u5c01\u4e30\u5cf0\u75af\u950b\u8702\u67ab\u70fd\u9146\u8451\u6ca3\u781c\u9022\u7f1d\u51af\u8bbd\u552a\u5949\u7f1d\u51e4\u4ff8\u8451", "\u4f5b", "\u5426\u7f36", "\u592b\u80a4\u6577\u5b75\u544b\u7a03\u9eb8\u8dba\u8dd7\u592b\u670d\u798f\u4f5b\u5e45\u4f0f\u7b26\u6d6e\u6276\u5f17\u62c2\u88b1\u4fd8\u8299\u5b5a\u5310\u8f90\u6daa\u6c1f\u6874\u8709\u82fb\u832f\u83a9\u83d4\u5e5e\u602b\u8274\u90db\u7ec2\u7ecb\u51eb\u7953\u7829\u9efb\u7f58\u7a03\u86a8\u82be\u8760\u5e9c\u7236\u8150\u629a\u8f85\u752b\u4fef\u65a7\u812f\u91dc\u8151\u62ca\u6ecf\u9efc\u670d\u590d\u7236\u8d1f\u526f\u5bcc\u4ed8\u5987\u9644\u8d74\u8179\u8986\u8d4b\u5085\u7f1a\u5490\u961c\u8ba3\u9a78\u8d59\u99a5\u876e\u9c8b\u9cc6\u5490", 
            "\u5939\u5496\u560e\u80f3\u4f3d\u65ee\u560e\u5676\u8f67\u5c1c\u9486\u560e\u5c15\u5c2c", "\u8be5\u8d45\u5793\u9654\u6539\u6982\u76d6\u4e10\u9499\u82a5\u6e89\u6224", "\u5e72\u7518\u809d\u6746\u5c34\u4e7e\u7aff\u5769\u82f7\u67d1\u6cd4\u77f8\u75b3\u9150\u611f\u6562\u8d76\u6746\u6a44\u79c6\u64c0\u6f89\u5e72\u8d63\u6de6\u7ec0\u65f0", "\u521a\u94a2\u7eb2\u7f38\u625b\u6760\u5188\u809b\u7f61\u6e2f\u5c97\u94a2\u6760\u6206\u7b7b", "\u9ad8\u7cd5\u818f\u768b\u7f94\u777e\u7bd9\u69d4\u7a3f\u641e\u85c1\u69c1\u7f1f\u9550\u6772\u544a\u818f\u8bf0\u90dc\u9506", 
            "\u6b4c\u683c\u54e5\u6208\u5272\u80f3\u6401\u7599\u54af\u9e3d\u5c79\u4ee1\u572a\u7ea5\u88bc\u9769\u683c\u9694\u845b\u9601\u80f3\u6401\u86e4\u55dd\u9abc\u988c\u643f\u8188\u9549\u5865\u9b32\u4e2a\u5404\u5408\u76d6\u845b\u54ff\u8238\u4e2a\u5404\u94ec\u784c\u867c", "\u7ed9", "\u6839\u8ddf\u54cf\u826e\u4e98\u826e\u831b", "\u66f4\u8015\u5e9a\u7fb9\u8d53\u803f\u9888\u6897\u54fd\u9ca0\u57c2\u7ee0\u66f4", "\u5de5\u516c\u5171\u7ea2\u4f9b\u529f\u653b\u5bab\u606d\u8eac\u9f9a\u5f13\u80b1\u86a3\u89e5\u5de9\u62f1\u6c5e\u73d9\u5171\u4f9b\u8d21", 
            "\u53e5\u6c9f\u52fe\u94a9\u7bdd\u4f5d\u67b8\u7f11\u97b2\u72d7\u82df\u5ca3\u67b8\u7b31\u591f\u8d2d\u6784\u52fe\u89cf\u57a2\u8bdf\u5abe\u9058\u5f40", "\u59d1\u9aa8\u5b64\u4f30\u8f9c\u5495\u5471\u7b8d\u6cbd\u83c7\u8f71\u9e2a\u6bc2\u83f0\u86c4\u9164\u89da\u9aa8\u53e4\u80a1\u9f13\u9aa8\u8c37\u8d3e\u6c69\u86ca\u6bc2\u9e44\u726f\u81cc\u8bc2\u77bd\u7f5f\u94b4\u560f\u86c4\u9e58\u6545\u987e\u56fa\u4f30\u96c7\u9522\u688f\u727f\u5d2e\u75fc\u9cb4", "\u62ec\u74dc\u522e\u5471\u681d\u80cd\u9e39\u5be1\u5471\u5250\u6302\u8902\u5366\u8bd6", 
            "\u4e56\u63b4\u62d0\u602a", "\u5173\u89c2\u5b98\u51a0\u68fa\u77dc\u839e\u500c\u7eb6\u9ccf\u7ba1\u9986\u839e\u89c2\u60ef\u51a0\u8d2f\u7f50\u704c\u63bc\u76e5\u6dab\u9e73", "\u5149\u54a3\u80f1\u6844\u5e7f\u72b7\u901b\u6844", "\u89c4\u5f52\u7470\u9f9f\u7845\u95fa\u7688\u5080\u572d\u59ab\u9c91\u9b3c\u8f68\u8be1\u7678\u5326\u5e8b\u5b84\u6677\u7c0b\u8d35\u6842\u8dea\u67dc\u523d\u7094\u523f\u6867\u7085\u9cdc", "\u6eda\u9ca7\u886e\u7ef2\u78d9\u8f8a\u68cd", "\u8fc7\u9505\u90ed\u6da1\u8052\u8748\u5d1e\u57da\u5459\u56fd\u5e3c\u63b4\u9998\u8662\u679c\u88f9\u7313\u6901\u873e\u8fc7", 
            "\u54c8\u94ea\u867e\u86e4\u54c8\u54c8", "\u563f\u54b3\u55e8\u8fd8\u5b69\u9ab8\u6d77\u80f2\u91a2\u5bb3\u4ea5\u9a87\u6c26", "\u9163\u61a8\u9878\u9f3e\u86b6\u542b\u5bd2\u6c57\u97e9\u6db5\u51fd\u6657\u7113\u90af\u9097\u558a\u7f55\u961a\u6c49\u6c57\u61be\u7ff0\u64bc\u65f1\u634d\u608d\u701a\u710a\u9894\u83e1\u6496", "\u592f\u884c\u822a\u542d\u676d\u7ed7\u73e9\u9883\u884c\u5df7\u6c86", "\u84bf\u8585\u5686\u53f7\u6beb\u8c6a\u568e\u58d5\u8c89\u55e5\u6fe0\u869d\u597d\u90dd\u597d\u53f7\u6d69\u8017\u7693\u660a\u704f\u9550\u98a2", 
            "\u559d\u5475\u8bc3\u55ec\u548c\u4f55\u5408\u6cb3\u6838\u76d2\u79be\u8377\u9602\u6db8\u9616\u8c89\u66f7\u988c\u52be\u83cf\u76cd\u7ea5\u86b5\u7fee\u548c\u4f55\u559d\u8d6b\u5413\u8d3a\u8377\u9e64\u58d1\u8910", "\u9ed1\u563f\u55e8", "\u75d5\u5f88\u72e0\u6068", "\u54fc\u4ea8\u884c\u6a2a\u8861\u6052\u8605\u73e9\u6841\u6a2a", "\u54fc", "\u8f70\u54c4\u70d8\u85a8\u8a07\u7ea2\u6d2a\u9e3f\u5b8f\u8679\u5f18\u6cd3\u95f3\u857b\u9ec9\u836d\u54c4\u54c4\u8ba7\u857b", "\u4faf\u5589\u7334\u760a\u7bcc\u7cc7\u9aba\u543c\u540e\u5019\u5f8c\u539a\u4faf\u9005\u5820\u9c8e", 
            "\u4e4e\u547c\u620f\u5ffd\u7cca\u60da\u553f\u6ef9\u8f77\u70c0\u548c\u80e1\u6e56\u7cca\u6838\u58f6\u72d0\u846b\u5f27\u8774\u56eb\u745a\u659b\u9e44\u9190\u7322\u69f2\u9e55\u89f3\u7173\u9e58\u864e\u6d52\u552c\u7425\u62a4\u6237\u4e92\u7cca\u864e\u6caa\u795c\u6248\u623d\u7b0f\u5cb5\u6019\u74e0\u9e71\u51b1", "\u534e\u5316\u82b1\u54d7\u7809\u534e\u5212\u6ed1\u54d7\u8c41\u733e\u9a85\u94e7\u8bdd\u534e\u5316\u5212\u753b\u6866", "\u6000\u5f8a\u6dee\u69d0\u8e1d\u574f\u5212", "\u6b22\u737e\u8fd8\u73af\u5bf0\u9b1f\u6853\u571c\u6d39\u90c7\u7f33\u953e\u8411\u7f13\u6362\u60a3\u5e7b\u5524\u5ba6\u7115\u75ea\u6da3\u6d63\u5942\u64d0\u8c62\u6f36\u902d\u9ca9", 
            "\u8352\u614c\u8093\u9ec4\u7687\u714c\u60f6\u5fa8\u749c\u7c27\u51f0\u6f62\u8757\u87e5\u9051\u968d\u78fa\u7640\u6e5f\u7bc1\u9cc7\u6643\u604d\u8c0e\u5e4c\u6643", "\u6325\u8f89\u7070\u6062\u5fbd\u5815\u8bd9\u6656\u9ebe\u73f2\u54b4\u867a\u96b3\u56de\u5f8a\u86d4\u8334\u6d04\u6bc1\u6094\u867a\u4f1a\u6c47\u60e0\u6167\u6e83\u7ed8\u8bb3\u8d3f\u6666\u79fd\u8bf2\u5f57\u70e9\u835f\u5349\u5599\u605a\u6d4d\u54d5\u7f0b\u6867\u8559\u87ea", "\u5a5a\u660f\u8364\u960d\u6df7\u9b42\u6d51\u9984\u73f2\u6df7\u8be8\u6eb7", 
            "\u8c41\u5290\u6509\u952a\u8020\u548c\u6d3b\u706b\u4f19\u5925\u94ac\u548c\u6216\u83b7\u8d27\u7978\u60d1\u970d\u8c41\u85ff\u56af\u956c\u8816", "\u5176\u51e0\u671f\u673a\u57fa\u51fb\u5947\u6fc0\u79ef\u9e21\u8ff9\u7ee9\u9965\u7f09\u573e\u59ec\u77f6\u808c\u8ba5\u53fd\u7a3d\u7578\u8dfb\u7f81\u5d47\u5527\u757f\u9f51\u7b95\u5c50\u525e\u7391\u8d4d\u7284\u58bc\u82a8\u4e0c\u54ad\u7b04\u4e69\u9769\u53ca\u5373\u8f91\u7ea7\u6781\u96c6\u6025\u7c4d\u5409\u75be\u5ac9\u85c9\u810a\u68d8\u6c72\u5c8c\u7b08\u7620\u8bd8\u4e9f\u696b\u84ba\u6b9b\u4f76\u6222\u5d74\u857a\u51e0\u7ed9\u5df1\u9769\u6d4e\u7eaa\u6324\u810a\u621f\u866e\u638e\u9e82\u8bb0\u7cfb\u8ba1\u6d4e\u5bc4\u9645\u6280\u7eaa\u7ee7\u65e2\u9f50\u5b63\u5bc2\u796d\u5fcc\u5242\u5180\u5993\u9aa5\u84df\u60b8\u4f0e\u66a8\u9701\u7a37\u5048\u9cab\u9afb\u89ca\u8360\u8dfd\u54dc\u9c9a\u6d0e\u82b0", 
            "\u5bb6\u52a0\u4f73\u5939\u5609\u8304\u631f\u67b7\u73c8\u8fe6\u4f3d\u6d43\u75c2\u7b33\u846d\u9553\u8888\u8dcf\u5939\u988a\u621b\u835a\u90cf\u605d\u94d7\u88b7\u86f1\u5047\u89d2\u811a\u7532\u6405\u8d3e\u7f34\u7ede\u997a\u77eb\u4f7c\u72e1\u527f\u4fa5\u768e\u80db\u94f0\u6322\u5cac\u5fbc\u6e6b\u656b\u94be\u560f\u7615\u4ef7\u5047\u67b6\u9a7e\u5ac1\u7a3c\u5bb6", "\u95f4\u575a\u76d1\u6e10\u517c\u8270\u80a9\u6d45\u5c16\u5978\u6e85\u714e\u6b7c\u7f04\u7b3a\u83c5\u84b9\u641b\u6e54\u7f23\u620b\u728d\u9e63\u9ca3\u97af\u7b80\u51cf\u68c0\u526a\u6361\u62e3\u4fed\u78b1\u8327\u67ec\u8e47\u8b07\u7877\u7751\u950f\u67a7\u622c\u8c2b\u56dd\u88e5\u7b15\u7fe6\u8dbc\u89c1\u95f4\u4ef6\u5efa\u76d1\u6e10\u5065\u5251\u952e\u8350\u9274\u8df5\u8230\u7bad\u8d31\u6e85\u69db\u8c0f\u50ed\u6da7\u996f\u6bfd\u950f\u6957\u8171\u726e\u8e3a", 
            "\u5c06\u6c5f\u7586\u59dc\u6d46\u50f5\u7f30\u8333\u7913\u8c47\u8bb2\u5956\u848b\u6868\u8029\u5c06\u5f3a\u964d\u9171\u6d46\u8679\u5320\u729f\u7edb\u6d1a\u7ce8", "\u6559\u4ea4\u7126\u9a84\u90ca\u80f6\u6912\u5a07\u6d47\u59e3\u8de4\u8549\u7901\u9c9b\u50ec\u9e6a\u86df\u827d\u832d\u56bc\u77eb\u5ce4\u89d2\u811a\u6405\u7f34\u7ede\u997a\u77eb\u4f7c\u72e1\u527f\u4fa5\u768e\u6322\u5fbc\u6e6b\u656b\u94f0\u6559\u89c9\u6821\u53eb\u8f83\u8f7f\u56bc\u7a96\u9175\u564d\u5ce4\u5fbc\u91ae", "\u63a5\u7ed3\u8282\u8857\u9636\u7686\u63ed\u6977\u55df\u79f8\u7596\u5588\u7ed3\u8282\u6770\u6377\u622a\u6d01\u52ab\u7aed\u776b\u6854\u62ee\u5b51\u8bd8\u6840\u78a3\u5048\u9889\u8ba6\u5a55\u7faf\u9c92\u89e3\u59d0\u754c\u89e3\u4ef7\u4ecb\u501f\u6212\u5c4a\u85c9\u8beb\u82a5\u75a5\u86a7\u9ab1\u5bb6\u4ef7", 
            "\u4eca\u91d1\u7981\u6d25\u65a4\u7b4b\u5dfe\u895f\u77dc\u887f\u5c3d\u4ec5\u7d27\u8c28\u9526\u747e\u9991\u537a\u5ed1\u5807\u69ff\u8fdb\u8fd1\u5c3d\u4ec5\u7981\u52b2\u664b\u6d78\u9773\u7f19\u70ec\u5664\u89d0\u8369\u8d46\u5997", "\u7ecf\u4eac\u7cbe\u60ca\u775b\u6676\u8346\u5162\u9cb8\u6cfe\u65cc\u830e\u8148\u83c1\u7cb3\u8b66\u666f\u4e95\u9888\u61ac\u9631\u5106\u522d\u80bc\u7ecf\u5883\u7adf\u9759\u656c\u955c\u52b2\u7ade\u51c0\u5f84\u9756\u75c9\u8ff3\u80eb\u5f2a\u5a67\u734d\u9753", "\u6243\u7a98\u70af\u8fe5\u7085", 
            "\u7a76\u7ea0\u63ea\u9e20\u8d73\u557e\u9604\u9b0f\u4e5d\u9152\u4e45\u97ed\u7078\u7396\u5c31\u65e7\u6551\u759a\u8205\u548e\u81fc\u9e6b\u50e6\u53a9\u6855\u67e9", "\u8f66\u636e\u4e14\u5c45\u4ff1\u62d8\u9a79\u97a0\u952f\u8d84\u63ac\u75bd\u88fe\u82f4\u6910\u9514\u72d9\u741a\u96ce\u97ab\u5c40\u83ca\u6854\u6a58\u9514\u4e3e\u67dc\u77e9\u5480\u6cae\u8e3d\u9f83\u6989\u8392\u67b8\u636e\u53e5\u5177\u5267\u5de8\u805a\u62d2\u8ddd\u4ff1\u60e7\u6cae\u77bf\u952f\u70ac\u8d84\u98d3\u8e1e\u907d\u5028\u949c\u728b\u5c66\u6998\u7aad\u8bb5\u91b5\u82e3", 
            "\u6350\u5708\u5a1f\u9e43\u6d93\u954c\u8832\u5377\u9529\u5708\u5377\u4fca\u5026\u7737\u96bd\u7ee2\u72f7\u684a\u9104", "\u55df\u6485\u5658\u89c9\u7edd\u51b3\u89d2\u811a\u56bc\u6398\u8bc0\u5d1b\u7235\u6289\u5014\u7357\u53a5\u8e76\u652b\u8c32\u77cd\u5b53\u6a5b\u5671\u73cf\u6877\u5282\u721d\u9562\u8568\u89d6\u8e76\u5014", "\u519b\u5747\u541b\u94a7\u7b60\u9f9f\u83cc\u76b2\u9e87\u4fca\u5cfb\u96bd\u83cc\u90e1\u9a8f\u7ae3\u6343\u6d5a", "\u5496\u5580\u5494\u5361\u54af\u5494\u4f67\u80e9", "\u5f00\u63e9\u950e\u6168\u51ef\u94e0\u6977\u607a\u8488\u5240\u57b2\u9534\u5ffe", 
            "\u770b\u520a\u582a\u52d8\u9f9b\u6221\u4f83\u780d\u574e\u69db\u961a\u83b0\u770b\u5d4c\u77b0\u961a", "\u5eb7\u6177\u7ce0\u95f6\u625b\u6297\u7095\u4ea2\u4f09\u95f6\u94aa", "\u5c3b\u8003\u70e4\u62f7\u6832\u9760\u94d0\u7292", "\u79d1\u9897\u67ef\u5475\u68f5\u82db\u78d5\u5777\u55d1\u778c\u8f72\u7a1e\u75b4\u874c\u94b6\u7aa0\u988f\u73c2\u9ac1\u54b3\u58f3\u988f\u53ef\u6e34\u5777\u8f72\u5ca2\u53ef\u514b\u5ba2\u523b\u8bfe\u606a\u55d1\u6e98\u9a92\u7f02\u6c2a\u951e\u86b5", "\u80af\u6073\u5543\u57a6\u9f88\u88c9", 
            "\u5751\u542d\u94ff", "\u7a7a\u5025\u5d06\u7b9c\u6050\u5b54\u5025\u7a7a\u63a7", "\u62a0\u82a4\u770d\u53e3\u6263\u5bc7\u53e9\u853b\u7b58", "\u54ed\u67af\u7a9f\u9ab7\u5233\u5800\u82e6\u5e93\u88e4\u9177\u55be\u7ed4", "\u5938\u57ae\u4f89\u8de8\u630e\u80ef", "\u84af\u4f1a\u5feb\u5757\u7b77\u810d\u54d9\u4fa9\u72ef\u6d4d\u90d0", "\u5bbd\u9acb\u6b3e", "\u6846\u7b50\u5321\u54d0\u8bd3\u72c2\u8bf3\u593c\u51b5\u77ff\u6846\u65f7\u7736\u909d\u5739\u7ea9\u8d36", "\u4e8f\u7aa5\u76d4\u5cbf\u609d\u9b41\u777d\u9035\u8475\u594e\u9997\u5914\u55b9\u9697\u668c\u63c6\u8770\u5080\u8dec\u6127\u6e83\u9988\u532e\u559f\u8069\u7bd1\u8489\u6126", 
            "\u6606\u5764\u9cb2\u951f\u918c\u7428\u9ae1\u6346\u6083\u9603\u56f0", "\u62ec\u9002\u9614\u6269\u5ed3\u681d\u86de", "\u62c9\u5566\u5587\u5783\u908b\u62c9\u5587\u65ef\u782c\u62c9\u5587\u843d\u62c9\u8fa3\u814a\u8721\u524c\u760c\u84dd\u5566", "\u6765\u83b1\u5f95\u6d9e\u5d03\u94fc\u8d56\u7750\u765e\u7c41\u8d49\u6fd1", "\u5170\u84dd\u680f\u62e6\u7bee\u6f9c\u5a6a\u5c9a\u6593\u9611\u8934\u9567\u8c30\u61d2\u89c8\u63fd\u6984\u7f06\u6f24\u7f71\u70c2\u6ee5", "\u5577\u72fc\u90ce\u5eca\u7405\u8782\u6994\u9512\u7a02\u9606\u6717\u6d6a\u90ce\u83a8\u8497\u9606", 
            "\u635e\u52b3\u7262\u5520\u5d02\u94f9\u75e8\u91aa\u8001\u59e5\u4f6c\u6f66\u6833\u94d1\u843d\u7edc\u5520\u70d9\u916a\u6d9d\u8022", "\u808b\u4e50\u52d2\u4ec2\u53fb\u6cd0\u9cd3\u4e86", "\u52d2\u64c2\u7d2f\u96f7\u64c2\u7fb8\u956d\u5ad8\u7f27\u6a91\u7d2f\u857e\u5792\u78ca\u5121\u8bd4\u8012\u7c7b\u6cea\u7d2f\u64c2\u808b\u9179\u561e", "\u68f1\u695e\u68f1\u5844\u51b7\u6123", "\u54e9\u79bb\u4e3d\u9ece\u7483\u6f13\u72f8\u68a8\u7bf1\u7281\u5398\u7f79\u85dc\u9a8a\u870a\u9ee7\u7f21\u55b1\u9e42\u5ae0\u8821\u9ca1\u84e0\u91cc\u7406\u674e\u793c\u54e9\u9ca4\u4fda\u9026\u5a0c\u609d\u6fa7\u9502\u8821\u91b4\u9ce2\u529b\u5229\u7acb\u5386\u4f8b\u4e3d\u52b1\u5389\u8389\u7b20\u7c92\u4fd0\u6817\u96b6\u540f\u6ca5\u96f3\u8385\u623e\u4fea\u783a\u75e2\u90e6\u8a48\u8354\u67a5\u5456\u5533\u7301\u6ea7\u783e\u680e\u8f79\u5088\u575c\u82c8\u75a0\u75ac\u86ce\u9b32\u7be5\u7c9d\u8dde\u85d3\u7483\u54e9", 
            "\u4fe9", "\u8054\u8fde\u601c\u83b2\u5ec9\u5e18\u6d9f\u9570\u88e2\u6fc2\u81c1\u5941\u880a\u9ca2\u8138\u655b\u740f\u8539\u88e3\u7ec3\u604b\u70bc\u94fe\u6b93\u695d\u6f4b", "\u91cf\u826f\u6881\u51c9\u7cae\u7cb1\u8e09\u83a8\u690b\u589a\u4e24\u4fe9\u9b49\u91cf\u4eae\u8f86\u51c9\u8c05\u667e\u8e09\u9753", "\u64a9\u6482\u804a\u7597\u8fbd\u50da\u5be5\u64a9\u6482\u7f2d\u5bee\u71ce\u5639\u7360\u9e69\u4e86\u6f66\u71ce\u84fc\u948c\u4e86\u6599\u5ed6\u9563\u64a9\u6482\u5c25\u948c", "\u54a7\u88c2\u54a7\u5217\u70c8\u88c2\u52a3\u730e\u8d94\u51bd\u6d0c\u6369\u57d2\u8e90\u9b23\u54a7", 
            "\u6797\u4e34\u79d8\u90bb\u7433\u6dcb\u9716\u9e9f\u9cde\u78f7\u5d99\u8f9a\u7cbc\u9074\u5549\u77b5\u51db\u61d4\u6aa9\u5eea\u6dcb\u541d\u8e8f\u8d41\u853a\u81a6", "\u62ce\u4ee4\u7075\u96f6\u9f84\u51cc\u73b2\u94c3\u9675\u4f36\u8046\u56f9\u68f1\u83f1\u82d3\u7fce\u68c2\u74f4\u7eeb\u9143\u6ce0\u7f9a\u86c9\u67c3\u9cae\u9886\u4ee4\u5cad\u4ee4\u53e6\u5464", "\u6e9c\u7198\u7559\u6d41\u5218\u7624\u69b4\u6d4f\u786b\u7409\u905b\u998f\u954f\u65d2\u9a9d\u938f\u67f3\u7efa\u950d\u516d\u9646\u6e9c\u788c\u905b\u998f\u954f\u9e68", 
            "\u54af", "\u9686\u9f99\u9686\u7b3c\u80e7\u5499\u804b\u73d1\u7abf\u830f\u680a\u6cf7\u783b\u7643\u7b3c\u62e2\u5784\u9647\u5785\u5f04", "\u6402\u697c\u55bd\u507b\u5a04\u9ac5\u877c\u848c\u8027\u6402\u7bd3\u5d5d\u9732\u964b\u6f0f\u9542\u7618\u55bd", "\u565c\u64b8\u5362\u7089\u5e90\u82a6\u9885\u6cf8\u8f73\u9c88\u5786\u80ea\u9e2c\u823b\u680c\u9c81\u82a6\u5364\u864f\u63b3\u6a79\u9565\u516d\u8def\u9646\u5f55\u9732\u7eff\u9e7f\u788c\u7984\u8f98\u9e93\u8d42\u6f09\u622e\u7c0f\u9e6d\u6f5e\u7490\u8f82\u6e0c\u84fc\u902f\u8f73\u6c0734", 
            "\u5ce6\u631b\u5b6a\u683e\u92ae\u6ee6\u9e3e\u5a08\u8114\u5375\u4e71", "\u62a1\u8bba\u8f6e\u4f26\u6ca6\u4ed1\u62a1\u56f5\u7eb6\u8bba", "\u843d\u7f57\u634b\u7f57\u903b\u841d\u87ba\u9523\u7ba9\u9aa1\u7321\u6924\u8136\u9559\u88f8\u502e\u8803\u7630\u843d\u7edc\u6d1b\u9a86\u54af\u645e\u70d9\u73de\u6cfa\u6f2f\u8366\u784c\u96d2\u7f57", "\u7565\u63a0\u950a", "\u65c5\u5c65\u5c61\u4fa3\u7f15\u5415\u634b\u94dd\u507b\u891b\u8182\u7a06\u5f8b\u7eff\u7387\u8651\u6ee4\u6c2f\u9a74\u6988\u95fe", "\u5452", "\u5988\u9ebb\u6469\u62b9\u8682\u5b37\u5417\u9ebb\u87c6\u9a6c\u5417\u7801\u739b\u8682\u72b8\u9a82\u8682\u551b\u6769\u4e48\u5417\u561b", 
            "\u57cb\u973e\u4e70\u836c\u5356\u9ea6\u8fc8\u8109\u52a2", "\u989f\u57cb\u86ee\u9992\u7792\u8513\u8c29\u9cd7\u9794\u6ee1\u87a8\u6162\u6f2b\u66fc\u8513\u8c29\u5881\u5e54\u7f26\u71b3\u9558", "\u5fd9\u832b\u76f2\u8292\u6c13\u9099\u786d\u83bd\u87d2\u6f2d", "\u732b\u6bdb\u732b\u77db\u8305\u9ae6\u951a\u7266\u65c4\u8765\u87ca\u8306\u536f\u94c6\u5cc1\u6cd6\u6634\u5192\u8d38\u5e3d\u8c8c\u8302\u8004\u7441\u61cb\u88a4\u7780", "\u4e48\u9ebd", "\u6ca1\u7709\u6885\u5a92\u679a\u7164\u9709\u73ab\u7cdc\u9176\u8393\u5d4b\u6e44\u6963\u7338\u9545\u9e5b\u7f8e\u6bcf\u9541\u6d7c\u59b9\u9b45\u6627\u8c1c\u5a9a\u5bd0\u8882", 
            "\u95f7\u95e8\u626a\u9494\u95f7\u61d1\u7116\u4eec", "\u8499\u8499\u76df\u6726\u6c13\u840c\u6aac\u77a2\u750d\u791e\u867b\u8268\u8499\u731b\u52d0\u61f5\u8813\u8722\u9530\u824b\u68a6\u5b5f", "\u772f\u54aa\u8ff7\u5f25\u8c1c\u9761\u7cdc\u919a\u9e8b\u7315\u7962\u7e3b\u863c\u7c73\u772f\u9761\u5f2d\u6549\u8112\u8288\u5bc6\u79d8\u89c5\u871c\u8c27\u6ccc\u6c68\u5b93\u5e42\u5627\u7cf8", "\u68c9\u7720\u7ef5\u514d\u7f05\u52c9\u817c\u5195\u5a29\u6e11\u6e4e\u6c94\u7704\u9efe\u9762", "\u55b5\u63cf\u82d7\u7784\u9e4b\u79d2\u6e3a\u85d0\u7f08\u6dfc\u676a\u9088\u7707\u5999\u5e99\u7f2a", 
            "\u4e5c\u54a9\u706d\u8511\u7bfe\u881b", "\u6c11\u73c9\u5cb7\u7f17\u739f\u82e0\u654f\u60af\u95fd\u6cef\u76bf\u62bf\u95f5\u610d\u9efe\u9cd8", "\u540d\u660e\u9e23\u76df\u94ed\u51a5\u8317\u6e9f\u7791\u669d\u879f\u9169\u547d", "\u8c2c\u7f2a", "\u6478\u65e0\u6a21\u9ebd\u78e8\u6478\u6469\u9b54\u819c\u8611\u998d\u6479\u8c1f\u5aeb\u62b9\u6ca1\u4e07\u9ed8\u83ab\u672b\u5192\u78e8\u5bde\u6f20\u58a8\u62b9\u964c\u8109\u563f\u6cab\u84e6\u8309\u8c89\u79e3\u9546\u6b81\u763c\u8031\u8c8a\u8c98", "\u54de\u8c0b\u725f\u7738\u7f2a\u936a\u86d1\u4f94\u67d0", 
            "\u6a21\u6bea\u6bcd\u59c6\u59e5\u4ea9\u62c7\u7261\u76ee\u6728\u5e55\u6155\u7267\u5893\u52df\u66ae\u725f\u7a46\u7766\u6c90\u5776\u82dc\u4eeb\u94bc", "\u55ef\u5514\u55ef\u5514\u55ef", "\u90a3\u5357\u62ff\u954e\u90a3\u54ea\u90a3\u5462\u7eb3\u5a1c\u5450\u637a\u94a0\u80ad\u8872\u54ea\u5450", "\u54ea\u4e43\u5976\u6c16\u827f\u5948\u8010\u9f10\u4f74\u8418\u67f0", "\u56dd\u56e1\u96be\u5357\u7537\u6960\u5583\u8169\u877b\u8d67\u96be", "\u56ca\u56d4\u56ca\u9995\u9995\u652e\u66e9", "\u5b6c\u52aa\u6320\u5476\u7331\u94d9\u7847\u86f2\u8111\u607c\u7459\u57b4\u95f9\u6dd6", 
            "\u54ea\u5462\u5450\u8bb7\u5462\u5450", "\u54ea\u9981\u90a3\u5185", "\u5ae9\u6041", "\u80fd", "\u55ef\u5514\u55ef\u5514\u55ef", "\u59ae\u5462\u5c3c\u6ce5\u502a\u9713\u576d\u730a\u6029\u94cc\u9cb5\u4f60\u62df\u65ce\u7962\u6ce5\u5c3f\u9006\u533f\u817b\u6635\u6eba\u7768\u615d\u4f32", "\u852b\u62c8\u5e74\u7c98\u9ecf\u9c87\u9cb6\u78be\u637b\u64b5\u8f87\u5ff5\u5eff\u917f\u57dd", "\u5a18\u917f\u917f", "\u9e1f\u8885\u5b32\u8311\u5c3f\u6eba\u8132", "\u634f\u6d85\u8042\u5b7d\u8e51\u55eb\u556e\u954a\u954d\u4e5c\u9667\u989e\u81ec\u8616", 
            "\u60a8\u6041", "\u5b81\u51dd\u62e7\u549b\u72de\u67e0\u82ce\u752f\u804d\u62e7\u5b81\u62e7\u6cde\u4f5e", "\u599e\u725b\u7ebd\u626d\u94ae\u72c3\u5ff8\u62d7", "\u519c\u6d53\u4fac\u54dd\u8113\u5f04", "\u8028", "\u5974\u5b65\u9a7d\u52aa\u5f29\u80ec\u60124", "\u6696", "\u5a1c\u632a\u50a9\u8bfa\u61e6\u7cef\u558f\u6426\u9518", "\u8650\u759f", "\u5973\u9495\u6067\u8844", "\u5662\u5594\u54e6\u54e6", "\u533a\u6b27\u6bb4\u9e25\u8bb4\u74ef\u6ca4\u5076\u5455\u85d5\u8026\u5455\u6ca4\u6004", "\u6d3e\u6252\u8db4\u556a\u8469\u722c\u6252\u8019\u6777\u94af\u7b62\u6015\u5e15\u7436", 
            "\u62cd\u6392\u724c\u5f98\u4ff3\u6392\u8feb\u6d3e\u6e43\u848e\u54cc", "\u756a\u6500\u6f58\u6273\u822c\u76d8\u80d6\u78d0\u8e52\u723f\u87e0\u5224\u76fc\u53db\u7554\u62da\u897b\u88a2\u6cee", "\u4e53\u8180\u6ec2\u65c1\u5e9e\u8180\u78c5\u5f77\u8783\u9004\u802a\u80d6", "\u70ae\u629b\u6ce1\u812c\u8dd1\u70ae\u888d\u5228\u5486\u72cd\u530f\u5e96\u8dd1\u70ae\u6ce1\u75b1", "\u5478\u80da\u9185\u966a\u57f9\u8d54\u88f4\u952b\u914d\u4f69\u6c9b\u8f94\u5e14\u65c6\u9708", "\u55b7\u76c6\u6e53\u55b7", "\u70f9\u62a8\u7830\u6f8e\u6026\u562d\u670b\u9e4f\u5f6d\u68da\u84ec\u81a8\u7bf7\u6f8e\u787c\u580b\u87db\u6367\u78b0", 
            "\u6279\u574f\u62ab\u8f9f\u5288\u576f\u9739\u567c\u4e15\u7eb0\u7812\u90b3\u94cd\u76ae\u75b2\u5564\u813e\u7435\u6bd7\u90eb\u9f19\u88e8\u57e4\u9674\u8298\u6787\u7f74\u94cd\u9642\u868d\u8731\u8c94\u5426\u5339\u5288\u75de\u7656\u572e\u64d7\u5421\u5e80\u4ef3\u758b\u5c41\u8f9f\u50fb\u8b6c\u5ab2\u6de0\u7513\u7765", "\u7247\u7bc7\u504f\u7fe9\u6241\u728f\u4fbf\u8e41\u7f0f\u80fc\u9a88\u8c1d\u7247\u9a97", "\u6f02\u98d8\u527d\u7f25\u87b5\u6734\u74e2\u5ad6\u6f02\u779f\u7f25\u6b8d\u83a9\u7968\u6f02\u9aa0\u560c", 
            "\u6487\u77a5\u6c15\u6487\u4e3f\u82e4", "\u62fc\u62da\u59d8\u8d2b\u9891\u82f9\u5ad4\u98a6\u54c1\u6980\u8058\u725d", "\u4e52\u5a09\u4fdc\u5e73\u8bc4\u74f6\u51ed\u840d\u5c4f\u51af\u82f9\u576a\u67b0\u9c86", "\u9887\u5761\u6cca\u6734\u6cfc\u9642\u6cfa\u6534\u948b\u7e41\u5a46\u9131\u76a4\u53f5\u94b7\u7b38\u7834\u8feb\u6734\u9b44\u7c95\u73c0", "\u5256\u88d2\u638a\u638a", "\u94fa\u6251\u4ec6\u5657\u8461\u84b2\u4ec6\u812f\u83e9\u530d\u749e\u6fee\u8386\u9564\u666e\u5821\u6734\u8c31\u6d66\u6ea5\u57d4\u5703\u6c06\u9568\u8e7c\u66b4\u94fa\u5821\u66dd\u7011", 
            "\u671f\u4e03\u59bb\u6b3a\u7f09\u621a\u51c4\u6f06\u6816\u6c8f\u8e4a\u5601\u840b\u69ed\u67d2\u6b39\u6864\u5176\u5947\u68cb\u9f50\u65d7\u9a91\u6b67\u742a\u7948\u8110\u797a\u7941\u5d0e\u7426\u6dc7\u5c90\u8360\u4fdf\u8006\u82aa\u9880\u573b\u9a90\u7566\u4e93\u8401\u8572\u7566\u86f4\u871e\u7da6\u9ccd\u9e92\u8d77\u4f01\u542f\u5c82\u4e5e\u7a3d\u7eee\u675e\u8291\u5c7a\u7dae\u6c14\u59bb\u5668\u6c7d\u9f50\u5f03\u6ce3\u5951\u8fc4\u780c\u61a9\u6c54\u4e9f\u8bab\u847a\u789b", "\u6390\u4f3d\u845c\u88b7\u5361\u6070\u6d3d\u9ac2", 
            "\u5343\u7b7e\u7275\u8fc1\u8c26\u94c5\u9a9e\u60ad\u828a\u6106\u9621\u4edf\u5c8d\u6266\u4f65\u6434\u8930\u948e\u524d\u94b1\u6f5c\u4e7e\u8654\u94b3\u63ae\u9ed4\u8368\u94a4\u728d\u7b9d\u9b08\u6d45\u9063\u8c34\u7f31\u80b7\u6b20\u6b49\u7ea4\u5d4c\u5029\u5811\u831c\u82a1\u614a\u6920", "\u5c06\u67aa\u62a2\u8154\u545b\u9535\u8dc4\u7f8c\u6215\u6217\u956a\u8723\u9516\u5f3a\u5899\u8537\u6a2f\u5af1\u5f3a\u62a2\u8941\u956a\u7f9f\u545b\u8dc4\u709d\u6217", "\u6084\u6572\u96c0\u9539\u8df7\u6a47\u7f32\u7857\u5281\u6865\u4e54\u4fa8\u77a7\u7fd8\u8549\u6194\u6a35\u5ce4\u8c2f\u835e\u9792\u6084\u5de7\u96c0\u6100\u7fd8\u4fcf\u7a8d\u58f3\u5ced\u64ac\u9798\u8bee\u8c2f", 
            "\u5207\u8304\u4f3d\u4e14\u5207\u7a83\u602f\u8d84\u59be\u780c\u60ec\u9532\u6308\u90c4\u7ba7\u614a", "\u4eb2\u94a6\u4fb5\u887e\u7434\u79e6\u52e4\u82b9\u64d2\u77dc\u8983\u79bd\u5659\u5ed1\u6eb1\u6a8e\u9513\u55ea\u82a9\u8793\u5bdd\u6c81\u63ff\u5423", "\u9752\u6e05\u8f7b\u503e\u537f\u6c22\u873b\u570a\u9cad\u60c5\u6674\u64ce\u6c30\u6aa0\u9ee5\u8bf7\u9877\u8b26\u82d8\u4eb2\u5e86\u7f44\u78ec\u7b90\u7dae", "\u7a77\u743c\u7a79\u8315\u909b\u86e9\u7b47\u8deb\u928e", "\u79cb\u90b1\u4e18\u9f9f\u86af\u9cc5\u6978\u6e6b\u6c42\u7403\u4ec7\u56da\u914b\u88d8\u866c\u4fc5\u9052\u8d47\u6cc5\u9011\u72b0\u8764\u5def\u9f3d\u7cd7", 
            "\u533a\u66f2\u5c48\u8d8b\u9a71\u8eaf\u89d1\u5c96\u86d0\u795b\u86c6\u9eb4\u8bce\u9ee2\u6e20\u77bf\u8862\u766f\u52ac\u74a9\u6c0d\u6710\u78f2\u9e32\u8556\u883c\u8627\u53d6\u66f2\u5a36\u9f8b\u82e3\u53bb\u8da3\u89d1\u9612\u620c", "\u5708\u609b\u5168\u6743\u6cc9\u62f3\u8be0\u98a7\u8737\u8343\u94e8\u75ca\u919b\u8f81\u7b4c\u9b08\u72ac\u7efb\u754e\u529d\u5238", "\u7f3a\u9619\u7094\u7638\u5374\u786e\u96c0\u69b7\u9e4a\u9615\u9619\u60ab", "\u9021\u7fa4\u88d9\u9e87", "\u7136\u71c3\u9aef\u86ba\u67d3\u5189\u82d2", 
            "\u56b7\u74e4\u79b3\u7a70\u56b7\u6518\u58e4\u79b3\u8ba9", "\u9976\u5a06\u6861\u835b\u6270\u7ed5\u5a06\u7ed5", "\u82e5\u60f9\u558f\u70ed", "\u4eba\u4efb\u4ec1\u58ec\u5fcd\u7a14\u834f\u4efb\u8ba4\u97e7\u5203\u7eab\u996a\u4ede\u845a\u598a\u8f6b\u887d", "\u6254\u4ecd", "\u65e5", "\u5bb9\u8363\u878d\u84c9\u6eb6\u7ed2\u7194\u6995\u620e\u5d58\u8338\u72e8\u809c\u877e\u5197", "\u67d4\u63c9\u8e42\u7cc5\u97a3\u8089", "\u5982\u5112\u8339\u5685\u6fe1\u5b7a\u8815\u85b7\u94f7\u8966\u98a5\u8fb1\u4e73\u6c5d\u5165\u8925\u7f1b\u6d33\u6ebd\u84d0", 
            "\u8f6f\u962e\u670a", "\u8564\u854a\u745e\u9510\u82ae\u777f\u6798\u868b", "\u6da6\u95f0", "\u82e5\u5f31\u504c\u7bac", "\u6492\u4ee8\u6332\u6d12\u6492\u8428\u5345\u98d2\u810e", "\u601d\u585e\u816e\u9cc3\u567b\u8d5b\u585e", "\u4e09\u53c1\u6bf5\u6563\u4f1e\u9993\u7cc1\u9730\u6563", "\u4e27\u6851\u55d3\u6421\u78c9\u98a1\u4e27", "\u9a9a\u6414\u81ca\u7f32\u7f2b\u9ccb\u626b\u5ac2\u626b\u68a2\u81ca\u57fd\u7619", "\u8272\u585e\u6da9\u745f\u556c\u94ef\u7a51", "\u68ee", "\u50e7", "\u6740\u6c99\u5239\u7eb1\u6749\u838e\u715e\u7802\u6332\u9ca8\u75e7\u88df\u94e9\u50bb\u6c99\u5565\u53a6\u715e\u970e\u55c4\u6b43\u553c", 
            "\u7b5b\u917e\u8272\u6652", "\u5c71\u886b\u5220\u717d\u6247\u73ca\u6749\u6805\u8dda\u59d7\u6f78\u81bb\u829f\u57cf\u9490\u8222\u82eb\u9adf\u95ea\u9655\u63ba\u63b8\u5355\u5584\u6247\u7985\u64c5\u81b3\u8baa\u6c55\u8d61\u7f2e\u5b17\u63b8\u9a9f\u5261\u82eb\u912f\u9490\u759d\u87ee\u9cdd", "\u5546\u4f24\u6c64\u6b87\u89de\u71b5\u5892\u4e0a\u8d4f\u664c\u57a7\u4e0a\u5c1a\u7ef1\u88f3", "\u70e7\u7a0d\u68a2\u634e\u9798\u86f8\u7b72\u8244\u52fa\u97f6\u82d5\u6753\u828d\u5c11\u5c11\u7ecd\u53ec\u7a0d\u54e8\u90b5\u634e\u6f72\u52ad", 
            "\u5962\u8d4a\u731e\u7572\u6298\u820c\u86c7\u4f58\u820d\u793e\u8bbe\u820d\u6d89\u5c04\u6444\u8d66\u6151\u9e9d\u6ee0\u6b59\u538d", "\u8c01", "\u8eab\u6df1\u53c2\u7533\u4f38\u7ec5\u547b\u8398\u5a20\u8bdc\u7837\u7cc1\u4ec0\u795e\u751a\u5ba1\u6c88\u5a76\u8c02\u54c2\u6e16\u77e7\u751a\u614e\u6e17\u80be\u8703\u845a\u80c2\u6939", "\u751f\u58f0\u80dc\u5347\u7272\u7525\u7b19\u7ef3\u6e11\u7701\u771a\u80dc\u5723\u76db\u4e58\u5269\u5d4a\u665f", "\u5e08\u8bd7\u5931\u65bd\u5c38\u6e7f\u72ee\u5618\u8671\u84cd\u917e\u9cba\u65f6\u5341\u5b9e\u4ec0\u8bc6\u98df\u77f3\u62fe\u8680\u57d8\u83b3\u70bb\u9ca5\u4f7f\u59cb\u53f2\u9a76\u5c4e\u77e2\u8c55\u662f\u4e8b\u4e16\u5e02\u58eb\u5f0f\u89c6\u4f3c\u793a\u5ba4\u52bf\u8bd5\u91ca\u9002\u6c0f\u9970\u901d\u8a93\u55dc\u4f8d\u5cd9\u4ed5\u6043\u67ff\u8f7c\u62ed\u566c\u5f11\u8c25\u83b3\u8d33\u94c8\u87ab\u8210\u7b6e\u6b96\u5319", 
            "\u6536\u719f\u624b\u9996\u5b88\u824f\u53d7\u6388\u552e\u7626\u5bff\u517d\u72e9\u7ef6", "\u4e66\u8f93\u6b8a\u8212\u53d4\u758f\u6292\u6dd1\u68b3\u67a2\u852c\u500f\u83fd\u6445\u59dd\u7ebe\u6bf9\u6bb3\u758b\u719f\u5b70\u8d4e\u587e\u79eb\u6570\u5c5e\u7f72\u9f20\u85af\u6691\u8700\u9ecd\u66d9\u6570\u672f\u6811\u8ff0\u675f\u7ad6\u6055\u5885\u6f31\u620d\u5eb6\u6f8d\u6cad\u4e28\u8167", "\u5237\u5530\u800d\u5237", "\u8870\u6454\u7529\u7387\u5e05\u87c0", "\u6813\u62f4\u95e9\u6dae", "\u53cc\u971c\u5b40\u6cf7\u723d", 
            "\u8c01\u6c34\u8bf4\u7a0e\u7761", "\u542e\u987a\u821c\u77ac", "\u8bf4\u6570\u6714\u7855\u70c1\u94c4\u5981\u84b4\u69ca\u6420", "\u601d\u65af\u53f8\u79c1\u4e1d\u6495\u53ae\u5636\u9e36\u549d\u6f8c\u7f0c\u9536\u53b6\u86f3\u6b7b\u56db\u4f3c\u98df\u5bfa\u8086\u4f3a\u9972\u55e3\u5df3\u7940\u9a77\u6cd7\u4fdf\u6c5c\u5155\u59d2\u801c\u7b25\u5395", "\u677e\u5fea\u6dde\u5d27\u5d69\u51c7\u83d8\u8038\u609a\u6002\u7ae6\u9001\u5b8b\u8bf5\u9882\u8bbc", "\u641c\u8258\u998a\u55d6\u6eb2\u98d5\u953c\u878b\u64de\u53df\u85ae\u55fe\u778d\u55fd\u64de", 
            "\u82cf\u7a23\u9165\u4fd7\u8bc9\u901f\u7d20\u8083\u5bbf\u7f29\u5851\u6eaf\u7c9f\u7c0c\u5919\u55c9\u8c21\u50f3\u612b\u6d91\u850c\u89eb", "\u9178\u72fb\u7b97\u849c", "\u867d\u5c3f\u837d\u7762\u772d\u6fc9\u968f\u9042\u968b\u7ee5\u9ad3\u5c81\u788e\u9042\u795f\u96a7\u9083\u7a57\u71e7\u8c07", "\u5b59\u836a\u72f2\u98e7\u635f\u7b0b\u69ab\u96bc", "\u7f29\u838e\u68ad\u55e6\u5506\u6332\u5a11\u7743\u686b\u55cd\u84d1\u7fa7\u6240\u7d22\u9501\u7410\u5522", "\u4ed6\u5979\u5b83\u8e0f\u584c\u9062\u6ebb\u94ca\u8dbf\u5854\u9cce\u736d\u8e0f\u62d3\u69bb\u55d2\u8e4b\u6c93\u631e\u95fc\u6f2f", 
            "\u53f0\u80ce\u82d4\u53f0\u62ac\u82d4\u90b0\u85b9\u9a80\u70b1\u8dc6\u9c90\u5454\u592a\u6001\u6cf0\u6c70\u915e\u80bd\u949b", "\u644a\u8d2a\u6ee9\u762b\u574d\u8c08\u5f39\u575b\u8c2d\u6f6d\u8983\u75f0\u6fb9\u6a80\u6619\u952c\u9561\u90ef\u5766\u6bef\u5fd0\u8892\u94bd\u63a2\u53f9\u70ad\u78b3", "\u6c64\u8d9f\u94f4\u9557\u8025\u7fb0\u5802\u5510\u7cd6\u819b\u5858\u68e0\u642a\u6e8f\u87b3\u746d\u6a18\u9557\u8797\u9967\u91a3\u8eba\u5018\u6dcc\u50a5\u5e11\u8d9f\u70eb", "\u6d9b\u638f\u6ed4\u53e8\u7118\u97ec\u9955\u7ee6\u9003\u9676\u6843\u6dd8\u8404\u5555\u6d2e\u9f17\u8ba8\u5957", 
            "\u7279\u5fd1\u5fd2\u615d\u94fd", "\u5fd2", "\u817e\u75bc\u85e4\u8a8a\u6ed5", "\u4f53\u8e22\u68af\u5254\u9511\u63d0\u9898\u557c\u8e44\u918d\u7ee8\u7f07\u9e48\u8351\u4f53\u66ff\u6d95\u5243\u60d5\u5c49\u568f\u608c\u501c\u9016\u7ee8\u88fc", "\u5929\u6dfb\u7530\u586b\u751c\u606c\u4f43\u9617\u754b\u94bf\u8146\u8214\u5fdd\u6b84\u63ad", "\u6311\u4f7b\u7967\u6761\u8c03\u8fe2\u9ca6\u82d5\u9aeb\u9f86\u8729\u7b24\u6311\u7a95\u8df3\u773a\u7c9c", "\u8d34\u5e16\u841c\u94c1\u5e16\u5e16\u992e", "\u542c\u5385\u6c40\u70c3\u505c\u5ead\u4ead\u5a77\u5ef7\u9706\u8713\u8476\u839b\u633a\u8247\u753a\u94e4\u6883\u6883", 
            "\u901a\u606b\u55f5\u540c\u7ae5\u5f64\u94dc\u6850\u77b3\u4f5f\u916e\u4f97\u4edd\u578c\u833c\u5cd2\u6f7c\u783c\u7edf\u7b52\u6876\u6345\u4f97\u540c\u901a\u75db\u6078", "\u5077\u5934\u6295\u9ab0\u94ad\u900f", "\u7a81\u79c3\u51f8\u56fe\u9014\u5f92\u5c60\u6d82\u837c\u83df\u9174\u571f\u5410\u948d\u5410\u5154\u580d\u83df", "\u6e4d\u56e2\u629f\u7583\u5f56", "\u63a8\u5fd2\u9893\u817f\u9000\u892a\u8715\u717a", "\u541e\u66be\u5c6f\u9968\u81c0\u56e4\u8c5a\u6c3d\u892a", "\u6258\u8131\u62d6\u4e47\u9640\u8235\u9a7c\u7823\u9a6e\u6cb1\u8dce\u5768\u9e35\u6a50\u4f57\u94ca\u9161\u67c1\u9f0d\u59a5\u692d\u5eb9\u9b44\u62d3\u553e\u67dd\u7ba8", 
            "\u6316\u54c7\u51f9\u5a32\u86d9\u6d3c\u5a03\u74e6\u4f64\u74e6\u889c\u817d\u54c7", "\u6b6a\u5d34\u5916", "\u6e7e\u5f2f\u873f\u525c\u8c4c\u5b8c\u73a9\u987d\u4e38\u7ea8\u8284\u70f7\u665a\u7897\u633d\u5a49\u60cb\u5b9b\u839e\u5a29\u7579\u7696\u7efe\u742c\u8118\u83c0\u4e07\u8155\u8513", "\u6c6a\u5c22\u738b\u5fd8\u4ea1\u8292\u5f80\u7f51\u6789\u60d8\u7f54\u8f8b\u9b4d\u671b\u738b\u5f80\u5fd8\u65fa\u5984", "\u59d4\u5a01\u5fae\u5371\u5dcd\u840e\u504e\u8587\u9036\u7168\u5d34\u8473\u9688\u4e3a\u7ef4\u56f4\u552f\u8fdd\u97e6\u60df\u5e37\u5e0f\u5729\u56d7\u6f4d\u6845\u5d6c\u95f1\u6ca9\u6da0\u59d4\u4f1f\u552f\u5c3e\u73ae\u4f2a\u709c\u7eac\u840e\u5a13\u82c7\u7325\u75ff\u97ea\u6d27\u9697\u8bff\u8249\u9c94\u4e3a\u4f4d\u672a\u5473\u536b\u8c13\u9057\u6170\u9b4f\u851a\u754f\u80c3\u5582\u5c09\u6e2d\u732c\u8ece", 
            "\u6e29\u761f\u6587\u95fb\u7eb9\u868a\u96ef\u74ba\u960c\u7a33\u543b\u7d0a\u520e\u95ee\u7eb9\u6c76\u74ba", "\u7fc1\u55e1\u84ca\u74ee\u8579", "\u7a9d\u6da1\u8717\u5594\u502d\u631d\u83b4\u54e6\u6211\u63e1\u5367\u54e6\u6e25\u6c83\u65a1\u5e44\u809f\u786a\u9f8c", "\u65bc\u6076\u5c4b\u6c61\u4e4c\u5deb\u545c\u8bec\u5140\u94a8\u90ac\u572c\u65e0\u4ea1\u5434\u543e\u6342\u6bcb\u68a7\u5514\u829c\u6d6f\u8708\u9f2f\u4e94\u6b66\u5348\u821e\u4f0d\u4fae\u6342\u59a9\u5fe4\u9e49\u727e\u8fd5\u5e91\u6003\u4ef5\u7269\u52a1\u8bef\u6076\u609f\u4e4c\u96fe\u52ff\u575e\u620a\u5140\u6664\u9e5c\u75e6\u5be4\u9a9b\u82b4\u674c\u7110\u9622\u5a7a\u92c8", 
            "\u897f\u606f\u5e0c\u5438\u60dc\u7a00\u6089\u6790\u5915\u727a\u814a\u6614\u7199\u516e\u6eaa\u563b\u9521\u6670\u6a28\u7184\u819d\u6816\u90d7\u7280\u66e6\u595a\u7fb2\u550f\u8e4a\u6dc5\u7699\u6c50\u5b09\u831c\u71b9\u70ef\u7fd5\u87cb\u6b59\u6d60\u50d6\u7a78\u8725\u8785\u83e5\u823e\u77fd\u7c9e\u7852\u91af\u6b37\u9f37\u5e2d\u4e60\u88ad\u5ab3\u6a84\u96b0\u89cb\u559c\u6d17\u79a7\u5f99\u73ba\u5c63\u8478\u84f0\u94e3\u7cfb\u7ec6\u620f\u9699\u9969\u960b\u798a\u8204", "\u778e\u867e\u5477\u5ce1\u4fa0\u72ed\u971e\u6687\u8f96\u9050\u5323\u9ee0\u7455\u72ce\u7856\u7615\u67d9\u4e0b\u590f\u5413\u53a6\u552c\u7f45", 
            "\u5148\u9c9c\u4ed9\u6380\u7ea4\u66b9\u83b6\u9528\u6c19\u7946\u7c7c\u9170\u8df9\u95f2\u8d24\u5acc\u54b8\u5f26\u5a34\u8854\u6d8e\u8237\u9e47\u75eb\u663e\u9669\u9c9c\u6d17\u8de3\u7303\u85d3\u94e3\u71f9\u86ac\u7b45\u51bc\u73b0\u89c1\u7ebf\u9650\u53bf\u732e\u5baa\u9677\u7fa1\u9985\u817a\u5c98\u82cb\u9730", "\u76f8\u9999\u4e61\u7bb1\u53a2\u6e58\u9576\u8944\u9aa7\u8459\u8297\u7f03\u964d\u8be6\u7965\u7fd4\u5ea0\u60f3\u54cd\u4eab\u98e8\u9977\u9c9e\u76f8\u5411\u8c61\u50cf\u9879\u5df7\u6a61\u87d3", "\u6d88\u9500\u6f47\u8096\u8427\u5bb5\u524a\u56a3\u900d\u785d\u9704\u54ee\u67ad\u9a81\u7bab\u67b5\u54d3\u86f8\u7ee1\u9b48\u6dc6\u5d24\u5c0f\u6653\u7b71\u7b11\u6821\u6548\u8096\u5b5d\u5578", 
            "\u4e9b\u6b47\u6954\u874e\u53f6\u534f\u978b\u643a\u659c\u80c1\u8c10\u90aa\u631f\u5055\u64b7\u52f0\u9889\u7f2c\u5199\u8840\u5199\u89e3\u8c22\u6cc4\u5951\u68b0\u5c51\u5378\u61c8\u6cfb\u4eb5\u87f9\u9082\u69ad\u7023\u85a4\u71ee\u8e9e\u5ee8\u7ec1\u6e2b\u698d\u736c", "\u5fc3\u65b0\u6b23\u8f9b\u85aa\u99a8\u946b\u82af\u6615\u5ffb\u6b46\u950c\u5bfb\u9561\u4fe1\u82af\u8845\u56df", "\u5174\u661f\u8165\u60fa\u7329\u884c\u5f62\u578b\u5211\u90a2\u9649\u8365\u9967\u784e\u7701\u9192\u64e4\u6027\u5174\u59d3\u5e78\u674f\u60bb\u8347", 
            "\u5144\u80f8\u51f6\u5308\u6c79\u828e\u96c4\u718a", "\u4fee\u4f11\u7f9e\u54bb\u9990\u5ea5\u9e3a\u8c85\u9af9\u5bbf\u673d\u79c0\u8896\u5bbf\u81ed\u7ee3\u9508\u55c5\u5cab\u6eb4", "\u9700\u987b\u865a\u5401\u5618\u589f\u620c\u80e5\u7809\u5729\u76f1\u987c\u5f90\u8bb8\u6d52\u6829\u8be9\u7cc8\u9191\u7eed\u5e8f\u7eea\u84c4\u53d9\u755c\u6064\u7d6e\u65ed\u5a7f\u9157\u7166\u6d2b\u6e86\u52d6\u84ff", "\u5ba3\u55a7\u8f69\u8431\u6684\u8c16\u63ce\u5107\u714a\u65cb\u60ac\u7384\u6f29\u7487\u75c3\u9009\u7663\u65cb\u5238\u70ab\u6e32\u7eda\u7729\u94c9\u6ceb\u78b9\u6966\u955f", 
            "\u524a\u9774\u859b\u5b66\u7a74\u5671\u8e05\u6cf6\u96ea\u9cd5\u8840\u8c11", "\u718f\u52cb\u8364\u91ba\u85b0\u57d9\u66db\u7aa8\u736f\u5bfb\u8be2\u5de1\u5faa\u65ec\u9a6f\u8340\u5ccb\u6d35\u6042\u90c7\u6d54\u9c9f\u8bad\u8fc5\u8baf\u900a\u718f\u6b89\u5dfd\u5f87\u6c5b\u8548\u6d5a", "\u538b\u96c5\u5440\u62bc\u9e26\u54d1\u9e2d\u4e2b\u57ad\u6860\u7259\u6daf\u5d16\u82bd\u8859\u775a\u4f22\u5c88\u740a\u869c\u96c5\u77a7\u5339\u75d6\u758b\u4e9a\u538b\u8bb6\u8f67\u5a05\u8fd3\u63e0\u6c29\u7811\u5440", "\u70df\u71d5\u54bd\u6bb7\u7109\u6df9\u9609\u814c\u5ae3\u80ed\u6e6e\u960f\u9122\u83f8\u5d26\u6079\u8a00\u4e25\u7814\u5ef6\u6cbf\u989c\u708e\u960e\u76d0\u5ca9\u94c5\u8712\u6a90\u598d\u7b75\u82ab\u95eb\u963d\u773c\u6f14\u63a9\u884d\u5944\u4fe8\u5043\u9b47\u9f39\u5156\u90fe\u7430\u7f68\u53a3\u5261\u9f3d\u7814\u9a8c\u6cbf\u538c\u71d5\u5bb4\u54bd\u96c1\u7130\u8273\u8c1a\u5f66\u7131\u664f\u5501\u781a\u5830\u8d5d\u990d\u6edf\u917d\u8c33", 
            "\u592e\u6cf1\u79e7\u9e2f\u6b83\u9785\u6d0b\u9633\u6768\u626c\u7f8a\u75a1\u4f6f\u70ca\u5f89\u7080\u86d8\u517b\u4ef0\u75d2\u6c27\u6837\u6f3e\u6059\u70ca\u600f\u9785", "\u8981\u7ea6\u9080\u8170\u592d\u5996\u5406\u5e7a\u6447\u9065\u59da\u9676\u5c27\u8c23\u7476\u7a91\u80b4\u4fa5\u94eb\u73e7\u8f7a\u723b\u5fad\u7e47\u9cd0\u54ac\u6773\u7a88\u8200\u5d3e\u8981\u836f\u8000\u94a5\u9e5e\u66dc\u759f", "\u8036\u564e\u6930\u6396\u7237\u8036\u90aa\u63f6\u94d8\u4e5f\u91ce\u51b6\u4e1a\u591c\u53f6\u9875\u6db2\u54bd\u54d7\u66f3\u62fd\u70e8\u6396\u814b\u8c12\u90ba\u9765\u6654", 
            "\u4e00\u533b\u8863\u4f9d\u6905\u4f0a\u6f2a\u54bf\u63d6\u566b\u7317\u58f9\u94f1\u6b39\u9edf\u79fb\u7591\u9057\u5b9c\u4eea\u86c7\u59e8\u5937\u6021\u9890\u5f5d\u54a6\u8d3b\u8fe4\u75cd\u80f0\u6c82\u9974\u572f\u8351\u8bd2\u7719\u5db7\u4ee5\u5df2\u8863\u5c3e\u6905\u77e3\u4e59\u8681\u501a\u8fe4\u86fe\u65d6\u82e1\u9487\u8223\u914f\u610f\u4e49\u8bae\u6613\u8863\u827a\u8bd1\u5f02\u76ca\u4ea6\u4ebf\u5fc6\u8c0a\u6291\u7ffc\u5f79\u827e\u6ea2\u6bc5\u88d4\u9038\u8f76\u5f08\u7fcc\u75ab\u7ece\u4f5a\u5955\u71a0\u8be3\u5f0b\u9a7f\u61ff\u5453\u5c79\u858f\u566b\u9552\u7f22\u9091\u81c6\u5208\u7fbf\u4ee1\u5cc4\u603f\u6092\u8084\u4f7e\u6baa\u6339\u57f8\u5293\u9571\u7617\u7654\u7fca\u8734\u55cc\u7ff3", 
            "\u56e0\u97f3\u70df\u9634\u59fb\u6bb7\u8335\u836b\u5591\u6e6e\u6c24\u5819\u6d07\u94df\u94f6\u541f\u5bc5\u6deb\u57a0\u911e\u972a\u72fa\u5924\u573b\u9f88\u5f15\u9690\u996e\u763e\u6bb7\u5c39\u8693\u5432\u5370\u996e\u836b\u80e4\u831a\u7aa8", "\u5e94\u82f1\u9e70\u5a74\u6a31\u81ba\u83ba\u7f42\u9e66\u7f28\u745b\u748e\u6484\u5624\u8425\u8fce\u8d62\u76c8\u8747\u83b9\u8367\u8424\u8426\u701b\u6979\u5b34\u8314\u6ee2\u6f46\u8365\u84e5\u5f71\u9896\u988d\u763f\u90e2\u5e94\u786c\u6620\u5ab5", "\u80b2\u54df\u5537\u54df", 
            "\u62e5\u5eb8\u4f63\u96cd\u81c3\u9095\u955b\u5889\u6175\u75c8\u58c5\u9cd9\u9954\u5581\u6c38\u52c7\u6d8c\u8e0a\u6cf3\u548f\u4fd1\u607f\u752c\u86f9\u7528\u4f63", "\u4f18\u5e7d\u5fe7\u60a0\u6538\u5466\u7531\u6e38\u6cb9\u90ae\u5c24\u72b9\u67da\u9c7f\u83b8\u5c22\u94c0\u7337\u75a3\u86b0\u8763\u8764\u7e47\u839c\u6709\u53cb\u9edd\u9149\u83a0\u7256\u94d5\u5363\u6709\u53c8\u53f3\u5e7c\u8bf1\u4f51\u67da\u56ff\u9f2c\u5ba5\u4f91\u86b4\u91c9", "\u65bc\u5401\u8fc2\u6de4\u7ea1\u7600\u4e8e\u4e0e\u4f59\u4e88\u9c7c\u611a\u8206\u5a31\u4fde\u6109\u9980\u903e\u6e14\u6e1d\u4fde\u8438\u745c\u9685\u63c4\u6986\u865e\u79ba\u8c00\u8174\u7afd\u59a4\u81fe\u6b24\u89ce\u76c2\u7aac\u8753\u5d5b\u72f3\u8201\u96e9\u4e0e\u8bed\u96e8\u4e88\u5b87\u7fbd\u79b9\u5704\u5c7f\u9f89\u4f1b\u5709\u5ebe\u7610\u7ab3\u4fe3\u4e0e\u8bed\u80b2\u9047\u72f1\u96e8\u6b32\u9884\u7389\u6108\u8c37\u57df\u8a89\u5401\u851a\u5bd3\u8c6b\u7ca5\u90c1\u55bb\u88d5\u6d74\u5fa1\u9a6d\u5c09\u8c15\u6bd3\u59aa\u5cea\u828b\u6631\u715c\u71a8\u71e0\u83c0\u84e3\u996b\u9608\u9b3b\u807f\u94b0\u9e46\u9e6c\u872e", 
            "\u51a4\u6e0a\u9e33\u7722\u9e22\u7ba2\u5458\u5143\u539f\u56ed\u6e90\u5706\u7f18\u63f4\u8881\u733f\u57a3\u8f95\u6c85\u5a9b\u82ab\u6a7c\u571c\u586c\u7230\u8788\u9f0b\u8fdc\u9662\u613f\u6028\u82d1\u5a9b\u63be\u57b8\u7457", "\u7ea6\u66f0\u8bf4\u6708\u4e50\u8d8a\u9605\u8dc3\u60a6\u5cb3\u7ca4\u94a5\u5216\u7039\u680e\u6a3e\u9fa0\u94ba", "\u6655\u6c32\u5458\u4e91\u5300\u7b60\u82b8\u8018\u7ead\u6600\u90e7\u5141\u9668\u6b92\u72c1\u5458\u8fd0\u5747\u97f5\u6655\u5b55\u8574\u915d\u6120\u71a8\u90d3\u97eb\u607d", 
            "\u624e\u5482\u531d\u62f6\u6742\u54b1\u7838\u548b", "\u707e\u54c9\u683d\u753e\u8f7d\u4ed4\u5bb0\u5d3d\u5728\u518d\u8f7d", "\u7c2a\u7ccc\u54b1\u6512\u62f6\u661d\u8db1\u8d5e\u6682\u74d2\u933e\u54b1", "\u8d43\u81e7\u9517\u9a75\u85cf\u810f\u846c\u5958", "\u906d\u7cdf\u51ff\u65e9\u6fa1\u67a3\u86a4\u85fb\u7f32\u9020\u7076\u8e81\u566a\u7682\u71e5\u5523", "\u5219\u8d23\u6cfd\u62e9\u548b\u5567\u8fee\u5e3b\u8d5c\u7b2e\u7ba6\u8234\u4fa7\u4ec4\u6603", "\u8d3c", "\u600e\u8c2e", "\u66fe\u589e\u618e\u7f2f\u7f7e\u8d60\u7efc\u7f2f\u7511\u9503", 
            "\u67e5\u624e\u548b\u6e23\u55b3\u63f8\u6942\u54f3\u5412\u9f44\u70b8\u624e\u672d\u558b\u8f67\u95f8\u94e1\u7728\u781f\u70b8\u548b\u8bc8\u4e4d\u8721\u6805\u69a8\u67de\u5412\u54a4\u75c4\u86b1", "\u6458\u4fa7\u658b\u62e9\u5b85\u7fdf\u7a84\u503a\u796d\u5be8\u7826\u7635", "\u5360\u6cbe\u7c98\u77bb\u8a79\u6be1\u8c35\u65c3\u5c55\u65a9\u8f97\u76cf\u5d2d\u640c\u6218\u7ad9\u5360\u98a4\u7efd\u6e5b\u8638\u6808", "\u5f20\u7ae0\u5f70\u748b\u87d1\u6a1f\u6f33\u5adc\u9123\u7350\u957f\u638c\u6da8\u4ec9\u4e08\u6da8\u5e10\u969c\u8d26\u80c0\u4ed7\u6756\u7634\u5d82\u5e5b", 
            "\u7740\u62db\u671d\u5632\u662d\u948a\u5541\u7740\u627e\u722a\u6cbc\u7167\u8d75\u53ec\u7f69\u5146\u8087\u8bcf\u68f9\u7b0a", "\u6298\u906e\u8707\u6298\u54f2\u8f99\u8f84\u8c2a\u86f0\u647a\u78d4\u8707\u8005\u8936\u9517\u8d6d\u8fd9\u6d59\u8517\u9e67\u67d8\u7740", "\u8fd9", "\u771f\u9488\u73cd\u659f\u8d1e\u4fa6\u7504\u81fb\u7bb4\u7827\u6862\u6eb1\u84c1\u6939\u699b\u80d7\u796f\u6d48\u8bca\u6795\u75b9\u7f1c\u755b\u8f78\u7a39\u9635\u9547\u9707\u5733\u632f\u8d48\u6715\u9e29", "\u6b63\u4e89\u5f81\u4e01\u6323\u75c7\u7741\u5fb5\u84b8\u6014\u7b5d\u94ee\u5ce5\u72f0\u94b2\u9cad\u6574\u62ef\u653f\u6b63\u8bc1\u6323\u90d1\u75c7\u6014\u94ee\u8be4\u5e27", 
            "\u4e4b\u53ea\u77e5\u6307\u652f\u7ec7\u6c0f\u679d\u6c41\u63b7\u829d\u5431\u80a2\u8102\u8718\u6800\u536e\u80dd\u7957\u76f4\u6307\u804c\u503c\u6267\u690d\u6b96\u4f84\u8e2f\u646d\u7d77\u8dd6\u57f4\u53ea\u6307\u7eb8\u6b62\u5740\u65e8\u5fb5\u8dbe\u54ab\u82b7\u67b3\u7949\u8f75\u9ef9\u916f\u77e5\u81f3\u5236\u8bc6\u6cbb\u5fd7\u81f4\u8d28\u667a\u7f6e\u79e9\u6ede\u5e1c\u7a1a\u631a\u63b7\u5cd9\u7a92\u7099\u75d4\u6809\u684e\u5e19\u8f7e\u8d3d\u75e3\u8c78\u965f\u5fee\u5f58\u81a3\u96c9\u9e37\u9a98\u86ed\u8e2c\u90c5\u89ef", 
            "\u4e2d\u7ec8\u949f\u5fe0\u8877\u953a\u76c5\u5fea\u87bd\u822f\u79cd\u80bf\u8e35\u51a2\u4e2d\u79cd\u91cd\u4f17\u4ef2", "\u5468\u5dde\u6d32\u7ca5\u821f\u8bcc\u5541\u8f74\u59af\u78a1\u8098\u5e1a\u76b1\u9aa4\u8f74\u5b99\u5492\u663c\u80c4\u7ea3\u7ec9\u836e\u7c40\u7e47\u914e", "\u8bf8\u6731\u73e0\u732a\u682a\u86db\u6d19\u8bdb\u94e2\u8331\u90be\u6f74\u69e0\u6a65\u4f8f\u672f\u9010\u7b51\u7af9\u70db\u8e85\u7afa\u8233\u7603\u4e3b\u5c5e\u716e\u5631\u77a9\u62c4\u891a\u6e1a\u9e88\u4f4f\u6ce8\u52a9\u8457\u9a7b\u795d\u7b51\u67f1\u94f8\u4f2b\u8d2e\u7bb8\u70b7\u86c0\u677c\u7fe5\u82ce\u75b0", 
            "\u6293\u631d\u722a", "\u62fd\u8f6c\u66f3\u62fd\u562c", "\u4e13\u7816\u989b\u8f6c\u4f20\u8f6c\u8d5a\u64b0\u6c8c\u7bc6\u556d\u9994", "\u88c5\u5e84\u5986\u6869\u5958\u72b6\u58ee\u649e\u5e62\u50ee\u6206", "\u8ffd\u9525\u96b9\u690e\u9a93\u5760\u7f00\u8d58\u60f4\u7f12", "\u5c6f\u8c06\u80ab\u7a80\u51c6", "\u684c\u6349\u5353\u62d9\u6dbf\u712f\u502c\u7740\u8457\u7422\u7f34\u707c\u914c\u6d4a\u6fef\u8301\u5544\u65ab\u956f\u8bfc\u799a\u64e2\u6d5e", "\u8d44\u54a8\u6ecb\u4ed4\u59ff\u5431\u5179\u5b5c\u8c18\u5472\u9f87\u9531\u8f8e\u6dc4\u9aed\u8d40\u5b73\u7ca2\u8d91\u89dc\u8a3e\u7f01\u9cbb\u5d6b\u5b50\u7d2b\u4ed4\u6893\u59ca\u7c7d\u6ed3\u79ed\u7b2b\u8014\u8308\u8a3e\u81ea\u5b57\u6e0d\u6063\u7726", 
            "\u5b97\u8e2a\u7efc\u68d5\u9b03\u679e\u8159\u603b\u506c\u7eb5\u7cbd", "\u90b9\u8bf9\u966c\u9139\u9a7a\u9cb0\u8d70\u594f\u63cd", "\u79df\u83f9\u8db3\u65cf\u5352\u955e\u7ec4\u7956\u963b\u8bc5\u4fce", "\u94bb\u8e9c\u7e82\u7f35\u8d5a\u94bb\u6525", "\u5806\u5634\u5480\u89dc\u6700\u7f6a\u9189\u855e", "\u5c0a\u9075\u6a3d\u9cdf\u6499", "\u4f5c\u562c\u4f5c\u6628\u7422\u7b2e\u5de6\u4f50\u64ae\u4f5c\u505a\u5750\u5ea7\u51ff\u67de\u600d\u80d9\u963c\u5511\u795a\u9162"],convertPY: function(g) {
            if (g == null || g.length == 0)
                return "";
            var i = g.charAt(0);
            if (g.charCodeAt(0) <= 255)
                return i;
            for (g = 0; g < this._pystr.length; g++)
                if (this._pystr[g].indexOf(i) >= 0)
                    return this._pyvalue[g];
            return ""
        },convertPYs: function(g) {
            if (g) {
                g = (g + "").split("");
                for (var i = [], c = [], t, w = 0; w < g.length; w++)
                    if (t = this.convertPY(g[w])) {
                        i.push(t);
                        c.push(t.charAt(0))
                    }
                return [i.join(""), c.join("")]
            }
        }}
});
Jx().$package("share.net", function(g) {
    var i = share.CONST, c = this, t = g.http, w = g.event, k = {pageview: 10557,sign: 10558,share2qq: 10559,share2qzone: 10560,share2txweibo: 10561,selectall: 10562,more: 10563,select: 10564,search: 10565,closesuccess: 10566,write: 10567,apply: 10664,create: 10665,website: 10752,contacts: 10789,groups: 10790,discussions: 10791,sharenothing: 10977,shareempty: 10978,clickFeedback: 11198,to3rd: 11403,bannerclick: 11506}, n = {onload: 259677,error_getInfo: 259678,error_login: 259679,error_loginCookie: 259680,
        error_getFriends: 259681,error_js: 259682,error_share: 259683,succ_share: 259684}, B = {get_nick: {},get_urlinfo: {},get_buddyList: {},get_openAccount: {},sendShare: {},get_userType: {},createDisgroup: {}}, j = function(b) {
        if (B[b].t1 && B[b].t2)
            return B[b].t2 - B[b].t1
    };
    this.reportIsdStart = mytracker.reportIsdStart;
    this.reportIsdEnd = mytracker.reportIsdEnd;
    this.request = function(b, h, l) {
        h = h || {};
        if (!h.method)
            h.method = "POST";
        if (!h.timeout)
            h.timeout = 3E4;
        var r = h.onSuccess;
        if (r) {
            var q = function() {
                var y = arguments;
                if (h.reportKey) {
                    B[h.reportKey].t2 = 
                    +new Date;
                    MM.report(b, y[0].retcode, j(h.reportKey))
                }
                setTimeout(function() {
                    r.apply(this, y)
                }, 0)
            };
            h.onSuccess = q;
            h.onError = q;
            h.onTimeout = q
        }
        if (h.reportKey)
            B[h.reportKey].t1 = +new Date;
        l = l || i.DEFAULT_CGI_PROXY_URL;
        qservice.proxySend(b, h, l)
    };
    this.getBuddyList = function(b, h) {
        console.log("start requestBuddyList");
        c.reportIsdStart("get_buddy_list");
        var l = i.CGI_HOST + "/qqconnectopen/openapi/get_user_friends";
        b = b || {};
        c.request(l, {data: b,method: "GET",onSuccess: h,onError: h,onTimeout: h,reportKey: "get_buddyList"});
        console.log("end requestBuddyList")
    };
    this.getOpenAccount = function(b, h) {
        console.log("getOpenAccount");
        c.reportIsdStart("get_open_account");
        this.request(i.CGI_HOST + "/qqconnectopen/openapi/get_open_account", {data: b,method: "GET",onSuccess: h,onError: h,onTimeout: h,reportKey: "get_openAccount"})
    };
    this.sendShare = function(b, h) {
        console.log("shareWithPic");
        c.reportIsdStart("sns_send");
        this.request(b.msg_type == 6 ? i.CGI_HOST + "/qqconnectopen/openapi/send_share_for_media" : i.CGI_HOST + "/qqconnectopen/openapi/send_share", {data: b,method: "POST",onSuccess: h,
            onError: h,onTimeout: h,reportKey: "sendShare"})
    };
    this.track = function(b, h, l) {
        l = l || "";
        h = h || appId;
        (new Image).src = "http://cgi.qplus.com/report/report?tag=" + b + "&appid=" + h + "&info=" + l + "&t=" + Math.random()
    };
    var e = [];
    this.report = function(b) {
        if (b.name) {
            var h = k[b.name];
            if (h)
                b.obj ? Q.bernoulli(h, b.obj) : Q.bernoulli(h)
        }
    };
    this.reportOnce = function(b) {
        if (e[b.name])
            e[b.name]++;
        else
            e[b.name] = 1;
        e[b.name] > 1 || this.report(b)
    };
    this.monite = function(b) {
        (b = n[b]) && Q.monitor(b)
    };
    this.speed = function() {
    };
    this.smartTrack = function(b, 
    h, l) {
        (new Image).src = 'http://cgi.qplus.com/report/report?strValue={"action":"' + b + '","name":"' + l + '","opername":"module","obj":"' + h + '"}&tag=0'
    };
    this.requestUrlInfo = function(b, h) {
        console.log("start requestUrlInfo");
        B.get_urlinfo.t1 = +new Date;
        var l = "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_rich_url_forqq?loginuin=" + (share.utils.getSelfUin() || "840652236") + "&url=" + encodeURIComponent(b) + "&linktype=" + h + "&ispc=1&xmlout=0", r = this;
        _Callback = function(q) {
            B.get_urlinfo.t2 = +new Date;
            MM.report("http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_rich_url_forqq", 
            q.result.code, j("get_urlinfo"));
            share.net.requestUrlInfoCallback(q)
        };
        t.loadScript(l, {onTimeout: function() {
                console.log("requestUrlInfo timeout");
                r.monite("error_getInfo");
                w.notifyObservers(c, "GetUrlInfoSuccess", {retcode: 1,result: {}})
            },timeout: 3E3})
    };
    this.requestUrlInfoCallback = function(b) {
        console.log("requestUrlInfoCallback");
        w.notifyObservers(c, "GetUrlInfoSuccess", b)
    };
    this.requestUserName = function() {
        console.log("start requestUserName");
        var b = i.CGI_HOST + "/qqconnectopen/openapi/get_nick?retype=2&callback=share.net.requestUserNameCallback&t=" + 
        (new Date).valueOf();
        B.get_nick.t1 = +new Date;
        t.loadScript(b, {onTimeout: function() {
                console.log("requestUserName timeout");
                w.notifyObservers(c, "GetUserNameSuccess", {retcode: 1,result: {}})
            },timeout: 3E3})
    };
    this.requestUserNameCallback = function(b) {
        console.log("requestUserNameCallback");
        B.get_nick.t2 = +new Date;
        MM.report(i.CGI_HOST + "/qqconnectopen/openapi/get_nick", b.retcode, j("get_nick"));
        w.notifyObservers(c, "GetUserNameSuccess", b)
    };
    this.requestUserType = function(b) {
        this.request("http://cgi.connect.qq.com/qqconnectopen/is_first", 
        {data: {},method: "GET",onSuccess: b,onError: b,onTimeout: b,reportKey: "get_userType"})
    };
    this.createDisGroup = function(b) {
        console.log("Create DisGroup Start");
        for (var h = this.createDisGroupCallback, l = [], r = 0, q = b.uinArray.length; r < q; r++)
            l.push({uin: b.uinArray[r],type: 0});
        l = g.json.stringify(l);
        var y = this;
        this.request("http://cgi.connect.qq.com/qqconnectopen/openapi/create_discuss", {data: {name: b.name || "\u65b0\u5efa\u8ba8\u8bba\u7ec4",ulist: l,t: b.t},method: "POST",onSuccess: h,onError: h,onTimeout: function() {
                console.log("Create DG Timeout");
                y.createDisGroupCallback({retcode: 1,result: {}})
            },reportKey: "createDisgroup"})
    };
    this.createDisGroupCallback = function(b) {
        w.notifyObservers(c, "CreateDisGroupSuccess", b)
    }
});
var appId = 200002118, DATA = {};
Jx().$package("share.ui", function(g) {
    this.Masker = new g.Class({init: function(i) {
            var c = i.container || document.body;
            this._container = c;
            this._el = i.element;
            if (!this._el) {
                var t = this._el = document.createElement("div");
                t.setAttribute("class", "masker " + (i.className || ""));
                t.innerHTML = '<div class="masker-tips center"></div>';
                c.appendChild(t)
            }
            this._tips = g.dom.mini(".masker-tips")[0];
            this._loadingTips = g.dom.mini(".loading-tips", this._tips)[0]
        },setTips: function(i, c) {
            c ? g.dom.removeClass(this._tips, "center") : g.dom.addClass(this._tips, 
            "center");
            this._loadingTips.innerHTML = i
        },show: function(i) {
            (i = i || this._container) && i !== this._el.parentNode && i.appendChild(this._el);
            g.dom.show(this._el)
        },hide: function() {
            g.dom.hide(this._el)
        }});
    this.maskerSingleton = {el: g.dom.id("mask"),bind: function() {
            window.onresize = function() {
                if (g.dom.id("mask").style.display == "block") {
                    var i = document.body.clientHeight, c = document.body.scrollHeight;
                    i = i > c ? i : c;
                    g.dom.id("mask").style.height = i + "px"
                }
            }
        },show: function() {
            this.el.style.display = "block";
            var i = document.body.clientHeight, 
            c = document.body.scrollHeight;
            this.el.style.height = (i > c ? i : c) + "px";
            if (window.location.pathname == "/widget/shareqq/iframe_index.html")
                this.el.style.height = "511px";
            g.dom.id("innerMasker").style.display = "block";
            g.dom.addClass(g.dom.id("wrapper"), "upIndex");
            g.dom.addClass(g.dom.id("header"), "forMaskerBg");
            g.dom.addClass(g.dom.id("footer"), "forMaskerBg");
            this.bind()
        },hide: function() {
            this.el.style.display = "none";
            g.dom.id("innerMasker").style.display = "none";
            g.dom.removeClass(g.dom.id("wrapper"), "upIndex");
            g.dom.removeClass(g.dom.id("header"), "forMaskerBg");
            g.dom.removeClass(g.dom.id("footer"), "forMaskerBg")
        }}
});
Jx().$package("share.model", function(g) {
    var i = this, c = g.dom, t = g.event, w = g.array, k = share.utils, n = share.net, B = {share: [{id: "qq",name: "QQ\u597d\u53cb",visible: 0,show: 1,channel: 2,shareFlag: 1,validFlag: 1,regUrl: "",error: 0,checked: 1}, {id: "qzone",name: "QQ\u7a7a\u95f4",visible: 1,channel: 2,shareFlag: 1,validFlag: 1,regUrl: "",error: 0,checked: 0}, {id: "wblog",name: "\u817e\u8baf\u5fae\u535a",visible: 1,channel: 2,shareFlag: 1,validFlag: 1,regAction: 1,regUrl: "http://t.qq.com/reg/index.php",error: 0,checked: 0}, {id: "sina",
                name: "\u65b0\u6d6a\u5fae\u535a",visible: 0,channel: 2,shareFlag: 0,validFlag: 0,regAction: 2,regUrl: "",error: 0,checked: 0}],buddyList: 0,groupList: {},maxChar: 120}, j, e = {}, b, h = {total: 5,selected: [],selectedInfo: [],maxToGroup: 3,maxToDisGroup: 3,maxToG: 3}, l = [], r = {length: 0,data: {}}, q = {length: 0,data: {}}, y = {length: 0,data: {}}, A = {data: {},length: 0}, D, C = false, o = [], G = [], H = {ls: {index: 1E5,sort: -100,key: "ls",visible: 1,name: "\u6700\u8fd1\u53d1\u9001"},recent: {index: 100001,sort: -99,key: "recent",autoSort: 0,visible: 1,name: "\u6700\u8fd1\u8054\u7cfb\u4eba"},
        group: {index: 100002,sort: -98,key: "group",visible: 1,name: "\u6211\u7684\u7fa4"},discu: {index: 100003,sort: -97,key: "discu",visible: 1,name: "\u6211\u7684\u8ba8\u8bba\u7ec4"},online: {index: 100004,sort: -96,key: "online",visible: 0,name: "\u5728\u7ebf\u597d\u53cb"},installed: {index: 100005,sort: -95,visible: 0,key: "installed",name: "\u5df2\u5b89\u88c5\u597d\u53cb"},notInstalled: {index: 100006,sort: -94,visible: 0,key: "notInstalled",name: "\u672a\u5b89\u88c5\u597d\u53cb"},"new": {index: 100007,sort: -93,visible: 0,key: "new",
            name: "\u65b0\u589e\u7528\u6237"},active: {index: 100008,sort: -92,visible: 0,key: "active",name: "\u6d3b\u8dc3\u7528\u6237"},lost: {index: 100009,sort: -91,visible: 0,key: "lost",name: "\u6d41\u5931\u7528\u6237"}}, L = [], s = {uin: "",uname: "",type: "1",appId: "",openId: "",url: "",msg: "",getMsgLib: false,title: "",summary: "",site: "",pushParam: "",shareBtnText: "\u53d1\u9001",qqBtnText: "\u6253\u5f00\u5e94\u7528",pic: "",pics: "",appPicSize: 1,picUrl: "",targetUrl: "",flash: "",scale: false,iframe: false,client: false,commonClient: false,
        APPID: "",linktype: 0,appInfo: "",customGroup: [],moreConfig: true,uinSetting: false,gridType: "gridShare",infoTmpl: "default",recBuddy: true,recBuddyVisible: 1,recBuddyWordTmpl: "share",buddyTreeMarkname: "markname",vfcode: "",t: "",noPic: false}, I = {friend: [],group: [],discuss: []}, E = {onRequestBuddyListSuccess: function(a) {
            if (a.retcode == 0) {
                s.t = a.result.t;
                j = i.parseBuddyList(a.result)
            } else {
                j = null;
                console.log("onRequestBuddyList error:" + a.retcode)
            }
            t.notifyObservers(i, "GetBuddyListReady", a);
            n.reportIsdEnd("get_buddy_list")
        },
        onOpenAccountSuccess: function(a) {
            if (a.retcode == 0)
                for (var d in a.result)
                    if (a.result.hasOwnProperty(d)) {
                        var f = a.result[d];
                        f[0].share_flag = 1;
                        e[d].shareFlag = f[0].share_flag;
                        e[d].validFlag = f[0].valid_flag;
                        if (e[d].checked && !e[d].validFlag)
                            e[d].checked = 0
                    }
            t.notifyObservers(i, "GetOpenAccountSuccess", a);
            n.reportIsdEnd("get_open_account")
        },onRequestUserTypeSuccess: function(a) {
            t.notifyObservers(i, "GetUserTypeSuccess", a)
        },onGetUrlInfoSuccess: function(a) {
            if (a.result.code == 0) {
                var d = a.image, f = "", m;
                for (m in d)
                    if (d[m].oriurl && 
                    d[m].oriurl != "http://") {
                        f = d[m].oriurl;
                        break
                    }
                if (f.split("|").length > 1)
                    f = f.split("|")[0];
                s.title = s.title == "" ? a.title : decodeURIComponent(s.title);
                s.pics = s.pics == "" ? decodeURIComponent(f) : decodeURIComponent(s.pics);
                s.summary = s.summary == "" ? a["abstract"] : decodeURIComponent(s.summary);
                s.flash = s.flash == "" ? decodeURIComponent(a.flash) : decodeURIComponent(s.flash);
                s.site = s.site == "" ? decodeURIComponent(a.site) : s.site;
                s.noPic = s.noPic
            }
            if (s.noPic == "true")
                s.pics = "";
            t.notifyObservers(i, "GetUrlInfoSuccess", a)
        },onGetUserNameSuccess: function(a) {
            if (a.retcode == 
            0)
                s.uname = a.result.nick;
            t.notifyObservers(i, "GetUserNameSuccess", a)
        },onCreateDisGroupSuccess: function(a) {
            if (a.retcode == 0) {
                for (var d = [s.uname], f = 0, m = D.uinArray.length; f < m; f++)
                    d.push(j.uinMap[D.uinArray[f]].nick);
                a = {conf_id: a.result.discussid,conf_name: D.name,conf_seq: 3,mls_name: d.join(" ")};
                i.addDisGroup(a);
                a.retcode = 0
            }
            t.notifyObservers(i, "CreateDisGroupSuccess", a)
        }};
    this.init = function() {
        console.log("share app model init");
        k.getSelfUin();
        this.initShareSetting();
        this.parseShareOption();
        t.addObserver(n, 
        "GetUrlInfoSuccess", E.onGetUrlInfoSuccess);
        t.addObserver(n, "GetUserNameSuccess", E.onGetUserNameSuccess);
        t.addObserver(n, "CreateDisGroupSuccess", E.onCreateDisGroupSuccess)
    };
    this.initShareSetting = function() {
        g.array.forEach(B.share, function(a) {
            e[a.id] = a
        });
        this.checkHideWeibo()
    };
    this.checkHideWeibo = function() {
        if (this.getAppParams().data.shareToWeibo === "0")
            B.share[2].visible = 0
    };
    this.getUserSetting = function() {
        return B
    };
    this.getShareSetting = function(a) {
        return e[a] || {}
    };
    this.getVisibleShare = function() {
        var a = 
        this._filterBuddyInfo(B.share, "visible", 1), d = g.cookie.get("visibleShare"), f = {};
        if (d && !s.isFromQZ) {
            f.qzone = parseInt(d.substr(0, 1));
            f.wblog = parseInt(d.substr(2, 1));
            for (d = 0; d < a.length; d++)
                a[d].checked = f[a[d].id]
        }
        return a
    };
    this.requestBuddyList = function(a) {
        g.array.forEach(L, function(d) {
            switch (d.key) {
                case "online":
                    option.show_stats = 1;
                    break;
                case "installed":
                case "notInstalled":
                    option.install = 1;
                    break;
                case "new":
                    option["new"] = 1;
                    break;
                case "active":
                    option.active = 1;
                    break;
                case "lost":
                    option.lost = 1
            }
        });
        n.getBuddyList({}, 
        a || E.onRequestBuddyListSuccess)
    };
    this.createDisGroup = function(a) {
        D = a;
        n.createDisGroup(a)
    };
    this.onCreateDisGroupOnView = function(a) {
        console.log("onCreateDisGroupOnView.......");
        for (var d = [], f = 0, m = a.uinArray.length; f < m; f++)
            d.push(a.uinArray[f]);
        d = {name: a.name || "\u65b0\u5efa\u8ba8\u8bba\u7ec4",ulist: d};
        D = a;
        a = [s.uname];
        f = 0;
        for (m = D.uinArray.length; f < m; f++)
            a.push(j.uinMap[D.uinArray[f]].nick);
        a = {conf_id: (new Date).getTime(),conf_name: D.name,conf_seq: 3,mls_name: a.join(" ")};
        i.addDisGroup(a);
        a.retcode = 0;
        t.notifyObservers(i, 
        "CreateDisGroupSuccess", a);
        d.conf_id = a.conf_id;
        o.push(d);
        G.push(a.conf_id)
    };
    this.parseDisgroup = function() {
        for (var a in o)
            o[a].conf_id = undefined;
        return o
    };
    this.addDisGroup = function(a) {
        a = {uuid: "d_" + a.conf_id,type: 2,uin: a.conf_id,nick: a.conf_name || "\u8ba8\u8bba\u7ec4",extra: "\u6210\u5458:" + a.mls_name,avatar: "http://pub.idqqimg.com/qconn/widget/shareqq/images/discu_avatar.gif"};
        j.list.push(a);
        j.uuidMap[a.uuid] = a;
        j.group[H.discu.index].push(a)
    };
    this.getBuddyList = function() {
        j ? t.notifyObservers(i, "GetBuddyListReady", 
        {retcode: 0,result: j}) : this.requestBuddyList()
    };
    this.getOpenAccount = function(a) {
        n.getOpenAccount({scope: "all"}, a || E.onOpenAccountSuccess)
    };
    this.sortGroupMembers = function(a) {
        a = g.array.bubbleSort(a, function(d, f) {
            return String(d.markname || d.nick || d.uin).localeCompare(String(f.markname || f.nick || f.uin))
        });
        return a = g.array.bubbleSort(a, function(d, f) {
            return d.online > f.online ? -1 : 1
        })
    };
    this.parseBuddyList = function(a) {
        j = {};
        j._srcData = a;
        j.categories = [];
        j.list = [];
        j.group = {};
        j.recent = [];
        j.uuidMap = {};
        j.uinMap = {};
        j.categoryCount = {recentCount: {},lsCount: {}};
        a.info = a.info || [];
        a.categories = a.categories || [];
        a.groups = a.groups || [];
        a.discus = a.discus || [];
        a.recent = a.recent || [];
        a.ls = a.ls || [];
        var d = [], f = [], m = [];
        g.array.forEach(a.info, function(x) {
            x.avatar = k.getAvatar(x.uin);
            x.uuid = "b_" + x.uin;
            x.type = 0;
            x.online = 0;
            j.group[x.categories] || (j.group[x.categories] = []);
            j.group[x.categories].push(x);
            j.list.push(x);
            j.uinMap[x.uin] = x;
            j.uuidMap[x.uuid] = x
        });
        g.array.forEach(a.groups, function(x) {
            x = {uuid: "g_" + x.code,gid: x.gid,type: 1,
                uin: x.code,nick: x.name,markname: x.name,avatar: k.getAvatar(x.code, 4)};
            j.list.push(x);
            j.uuidMap[x.uuid] = x;
            d.push(x)
        });
        g.array.forEach(a.discus, function(x) {
            x = {uuid: "d_" + x.conf_id,type: 2,uin: x.conf_id,nick: x.conf_name || "\u8ba8\u8bba\u7ec4",extra: "\u6210\u5458:" + x.mls_name,avatar: "http://pub.idqqimg.com/qconn/widget/shareqq/images/discu_avatar.gif"};
            j.list.push(x);
            j.uuidMap[x.uuid] = x;
            f.push(x)
        });
        this._filterBuddyInfo(a.categories, "index", 0)[0] || a.categories.push({index: 0,sort: 0,name: "\u6211\u7684\u597d\u53cb"});
        a.categories = a.categories.concat(L);
        j.categories = a.categories;
        var p = [], u = [], v = [], z = [];
        g.array.forEach(a.recent, function(x) {
            if (x.type == 0)
                p.push(x);
            else
                x.type == 1 && u.push(x)
        });
        a.recent = p.concat(u);
        g.array.forEach(a.ls, function(x) {
            if (x.type == 0)
                v.push(x);
            else
                x.type == 1 && z.push(x)
        });
        a.ls = v.concat(z);
        j.categoryCount.lsCount = {friend: v.length,groupDiscuss: z.length};
        g.array.forEach(a.categories, function(x) {
            x.key = x.key || "normal";
            x.autoSort = g.isUndefined(x.autoSort) ? false : x.autoSort;
            var T = [], N = [];
            if (x.key == 
            "online")
                N = m;
            else if (x.key == "group")
                N = d;
            else if (x.key == "discu")
                N = f;
            else if (x.key == "recent")
                g.array.forEach(a.recent, function(M) {
                    (M = j.uuidMap[i.object2UUID(M)]) && N.push(M)
                });
            else if (x.key == "ls")
                g.array.forEach(a.ls, function(M) {
                    (M = j.uuidMap[i.object2UUID(M)]) && N.push(M)
                });
            else {
                switch (x.key) {
                    case "installed":
                        T = a.install || [];
                    case "notInstalled":
                        T = a.unuse || [];
                    case "new":
                        T = a["new"] || [];
                    case "active":
                        T = a.active || [];
                    case "lost":
                        T = a.lost || []
                }
                g.array.forEach(T, function(M) {
                    (M = j.uinMap[M]) && N.push(M)
                })
            }
            if (x.autoSort)
                N = 
                i.sortGroupMembers(N);
            if (x.key == "normal")
                if (j.group[x.index]) {
                    if (x.autoSort)
                        j.group[x.index] = i.sortGroupMembers(j.group[x.index])
                } else
                    j.group[x.index] = [];
            else
                j.group[x.index] = N
        });
        if (s.recBuddy) {
            a.recent = a.ls.concat(a.recent);
            var F = [];
            g.array.forEach(a.recent, function(x) {
                F.push(i.object2UUID(x))
            });
            F = g.array.uniquelize(F);
            var J = k.randomize(j.list.concat([]), true);
            if (F.length < h.total)
                for (var K = 0, P = J.length; K < P; K++) {
                    var U = J[K];
                    if (F.length < h.total)
                        g.array.contains(F, U.uuid) || F.push(U.uuid);
                    else
                        break
                }
            g.array.forEach(F, 
            function(x) {
                (x = j.uuidMap[x]) && j.recent.push(x)
            })
        } else {
            h.selected = [];
            j.recent = []
        }
        return j
    };
    this.getMyBuddyList = function() {
        return j
    };
    this.setRecentCount = function(a) {
        var d = 0, f = 0;
        g.array.forEach(a, function(m) {
            if (m)
                if (m.type == 0)
                    d++;
                else
                    f++
        });
        j.categoryCount.recentCount = {friend: d,groupDiscuss: f}
    };
    this.getCategoryCount = function() {
        return j.categoryCount
    };
    this.parseBuddyPinyin = function() {
        console.log("parseBuddyPinyin");
        var a;
        g.array.forEach(j.list, function(d) {
            if (d.nick) {
                a = k.pinyin.convertPYs(d.nick);
                d.nickPinYin = 
                a[0];
                d.nickPinYinFL = a[1]
            }
            if (d.markname) {
                a = k.pinyin.convertPYs(d.markname);
                d.marknamePinYin = a[0];
                d.marknamePinYinFL = a[1]
            }
        })
    };
    this.getBuddyByUin = function(a) {
        return this._filterBuddyInfo(j.list, "uin", a)[0]
    };
    this.getInfoByUUID = function(a) {
        return this._filterBuddyInfo(j.list, "uuid", a)[0]
    };
    this.getAllGroup = function() {
        var a = [];
        g.array.forEach(j.categories, function(d) {
            j.group[d.index].length > 0 && a.push(d)
        });
        return g.array.bubbleSort(a, function(d, f) {
            return d.sort - f.sort
        })
    };
    this.getBuddyGroup = function() {
        var a = 
        [], d = this;
        g.array.forEach(j.categories, function(f) {
            if (f.key == "ls" || f.key == "recent") {
                for (var m = d.getGroupBuddy(f.index), p = 0, u = 0, v = m.length; u < v; u++)
                    m[u].type == 0 && p++;
                p > 0 && a.push(f)
            }
            f.key == "normal" && j.group[f.index].length > 0 && a.push(f)
        });
        return g.array.bubbleSort(a, function(f, m) {
            return f.sort - m.sort
        })
    };
    this.getGroup = function(a) {
        return g.array.filter(j.categories, function(d) {
            return !g.isUndefined(d.index) && d.index == a ? true : false
        })[0]
    };
    this.parseCustomGroups = function() {
        L = [];
        g.array.forEach(s.customGroup, 
        function(a) {
            if (a = H[a]) {
                a.visible = 1;
                L.push(a)
            }
        });
        return L
    };
    this.getRencentBuddy = function() {
        var a = this, d = [], f = [];
        g.array.forEach(j.recent, function(m) {
            if (m.type == 0 && d.length < 2) {
                d.push(m);
                a.addSelected(m.uuid)
            }
            if (m.type != 0 && f.length < 1) {
                f.push(m);
                a.addSelected(m.uuid)
            }
        });
        return d.concat(f)
    };
    this.getGroupBuddy = function(a) {
        return j.group[a]
    };
    this.getGroupBuddyNormal = function(a) {
        a = j.group[a];
        for (var d = [], f = 0, m = a.length; f < m; f++)
            a[f].type == 0 && d.push(a[f]);
        return d
    };
    this.getBuddy = function() {
        return j.list
    };
    this._filterBuddyInfo = 
    function(a, d, f) {
        return g.array.filter(a, function(m) {
            return !g.isUndefined(m[d]) && m[d] == f ? true : false
        })
    };
    this.addSelected = function(a, d) {
        d && !this.isSelected(a) && l.push(a);
        if (!this.isSelected(a)) {
            h.selected.push(a);
            t.notifyObservers(i, "uinSelectedChanged", {action: "add",uin: a,selected: h.selected})
        }
    };
    this.sortSelected = function() {
        for (var a = h.selected, d = 0; d < a.length; d++)
            for (var f = 0; f < l.length; f++)
                a[d] == l[f] && g.array.remove(a, a[d]);
        h.selected = a.concat(l)
    };
    var R = 0, O = 0;
    g.event.on(c.id("disGroup"), "selectstart", 
    function(a) {
        window.event.returnValue = false;
        a.preventDefault();
        return false
    });
    g.event.on(document.body, "keydown", function(a) {
        if (a.keyCode == 17)
            R = 1;
        if (a.keyCode == 16) {
            a.preventDefault();
            O = 1;
            return false
        }
    });
    g.event.on(document.body, "keyup", function(a) {
        if (a.keyCode == 17)
            R = 0;
        if (a.keyCode == 16) {
            a.preventDefault();
            O = 0;
            return false
        }
    });
    this.addTempDisSelectedFromDBL_d = function(a, d) {
        var f = q, m = 0;
        if (d.parentNode.parentNode.className == "right") {
            f = y;
            m = 1
        }
        for (var p in f.data)
            this.removeCurrentBg_d(f.data[p]);
        f.length = 
        1;
        f.data = {};
        f.data[a] = d;
        this.addCurrentBg_d(d);
        if (m)
            this.removeDisItems_d();
        else
            r.data[a] || this.addDisItems_d()
    };
    this.addTempDisSelected_d = function(a, d) {
        var f = q;
        if (d.parentNode.parentNode.className == "right")
            f = y;
        if (f.data[a])
            if (R) {
                if (f.data[a] == d)
                    if (f.length != 1) {
                        delete f.data[a];
                        f.length--;
                        this.removeCurrentBg_d(d)
                    }
            } else {
                for (v in f.data)
                    this.removeCurrentBg_d(f.data[v]);
                if (C) {
                    this.removeCurrentBg_d(c.id("selfItem"));
                    C = false
                }
                f.length = 1;
                f.data = {};
                f.data[a] = d;
                k.testIpad || this.addCurrentBg_d(d);
                if (k.testIpad && 
                d.parentNode.parentNode.className == "buddyTree")
                    this.addDisItems_d();
                else
                    k.testIpad && d.parentNode.parentNode.className == "right" && this.removeDisItems_d()
            }
        else {
            var m = {data: {},length: 0};
            if (R) {
                f.data[a] = d;
                f.length++;
                this.addCurrentBg_d(d)
            } else if (O) {
                var p = [], u = [];
                A.data[a] = d;
                A.length++;
                for (var v in A.data)
                    A.data.hasOwnProperty(v) && p.push(A.data[v]);
                if (d.id == "selfItem") {
                    C = true;
                    d = c.mini(".buddyItem", c.id("right"))[1]
                } else if (p[0].id == "selfItem") {
                    C = true;
                    p[0] = c.mini(".buddyItem", c.id("right"))[1]
                } else if (C) {
                    this.removeCurrentBg_d(c.id("selfItem"));
                    C = false
                }
                var z = d.parentNode.childNodes;
                for (v = 0; v < z.length; v++)
                    z[v].id && u.push(z[v]);
                z = w.indexOf(u, p.pop());
                p = w.indexOf(u, p[0]);
                if (z - p > 0 ? true : false)
                    for (v = p; v <= z; v++) {
                        a = u && u[v].id.substring(0, 15) == "r_listBuddy_ls_" || u[v].id.substring(0, 13) == "listBuddy_ls_" ? d.parentNode.parentNode.className == "right" ? u[v].id.substring(15) : u[v].id.substring(13) : d.parentNode.parentNode.className == "right" ? u[v].id.substring(19) : u[v].id.substring(17);
                        m.data[a] = u[v];
                        m.length++
                    }
                else
                    for (v = z; v <= p; v++) {
                        a = u[v].id.substring(0, 15) == 
                        "r_listBuddy_ls_" || u[v].id.substring(0, 13) == "listBuddy_ls_" ? d.parentNode.parentNode.className == "right" ? u[v].id.substring(15) : u[v].id.substring(13) : d.parentNode.parentNode.className == "right" ? u[v].id.substring(19) : u[v].id.substring(17);
                        m.data[a] = u[v];
                        m.length++
                    }
            } else {
                for (v in f.data)
                    this.removeCurrentBg_d(f.data[v]);
                if (C) {
                    this.removeCurrentBg_d(c.id("selfItem"));
                    C = false
                }
                f.length = 1;
                f.data = {};
                f.data[a] = d;
                A.length = 1;
                A.data = {};
                A.data[a] = d;
                k.testIpad || this.addCurrentBg_d(d);
                if (k.testIpad && d.parentNode.parentNode.className == 
                "buddyTree")
                    this.addDisItems_d();
                else
                    k.testIpad && d.parentNode.parentNode.className == "right" && this.removeDisItems_d()
            }
        }
        if (m && m.length) {
            for (v in f.data)
                this.removeCurrentBg_d(f.data[v]);
            C && this.addCurrentBg_d(c.id("selfItem"));
            f.data = {};
            for (v in m.data) {
                f.data[v] = m.data[v];
                f.length++;
                this.addCurrentBg_d(m.data[v])
            }
        }
        this.checkAdd_d();
        this.checkDel_d()
    };
    this.addDisItems_d = function() {
        for (var a in q.data) {
            if (r.length == 19) {
                share.view.showInfoTips({text: "\u4eba\u6570\u5df2\u8fbe\u5230\u6700\u5927",type: "error"});
                break
            }
            if (!r.data[a]) {
                var d = q.data[a], f = d.cloneNode();
                f.innerHTML = d.innerHTML;
                f.id = "r_" + f.id;
                f.style.background = "none";
                f.setAttribute("style", "");
                this.removeCurrentBg_d(f);
                r.data[a] = f;
                r.length++;
                this.addItemView_d(f)
            }
        }
        share.view.updateCount_d(r.length);
        g.dom.addClass(g.dom.id("addDisBtn"), "addDisAbled");
        d = q;
        for (a in d.data)
            this.removeCurrentBg_d(d.data[a]);
        d.length = 1;
        d.data = {};
        this.checkAdd_d();
        this.checkDel_d()
    };
    this.removeDisItems_d = function() {
        var a = 0, d, f;
        for (f in y.data)
            if (f == "self") {
                a = 1;
                d = y.data[f]
            } else if (r.data[f]) {
                this.removeItemView_d(r.data[f]);
                delete r.data[f];
                r.length--
            }
        y = {length: 0,data: {}};
        if (a)
            y = {length: 1,data: {self: d}};
        if (C) {
            this.removeCurrentBg_d(c.id("selfItem"));
            C = false
        }
        share.view.updateCount_d(r.length);
        this.checkAdd_d();
        this.checkDel_d()
    };
    this.checkAdd_d = function() {
        g.dom.addClass(g.dom.id("addDisBtn"), "addDisAbled");
        g.dom.id("addDisBtn").setAttribute("cmd", "");
        if (this.getSelectedLength_d() != 19)
            for (var a in q.data)
                if (!r.data[a]) {
                    g.dom.removeClass(g.dom.id("addDisBtn"), "addDisAbled");
                    g.dom.id("addDisBtn").setAttribute("cmd", "addDisBtnClick");
                    break
                }
    };
    this.checkDel_d = function() {
        g.dom.addClass(g.dom.id("delDisBtn"), "addDisAbled");
        g.dom.id("delDisBtn").setAttribute("cmd", "");
        for (var a in y.data)
            if (a != "self") {
                g.dom.removeClass(g.dom.id("delDisBtn"), "addDisAbled");
                g.dom.id("delDisBtn").setAttribute("cmd", "delDisBtnClick");
                break
            }
    };
    this.checkButtonStatus_d = function(a) {
        if (a == "add")
            return g.dom.id("addDisBtn").className.indexOf("addDisAbled") > -1;
        else if (a == "del")
            return g.dom.id("delDisBtn").className.indexOf("addDisAbled") > -1
    };
    this.addCurrentBg_d = 
    function(a) {
        g.dom.addClass(a, "buddyItemClick")
    };
    this.removeCurrentBg_d = function(a) {
        g.dom.removeClass(a, "buddyItemClick")
    };
    this.removeCurrentBgAll_d = function(a) {
        for (var d in a.data)
            this.removeCurrentBg_d(a.data[d])
    };
    this.addItemView_d = function(a) {
        g.dom.id("disSelectedBuddyTree").appendChild(a);
        a.onmouseover = function() {
            if (!k.testIpad)
                this.style.background = "rgb(48,178,228)"
        };
        a.onmouseout = function() {
            if (!k.testIpad)
                this.style.background = "none"
        }
    };
    this.removeItemView_d = function(a) {
        g.dom.id("disSelectedBuddyTree").removeChild(a)
    };
    this.removeItemViewAll_d = function(a) {
        for (var d in a.data)
            this.removeItemView_d(a.data[d])
    };
    this.getSelectedLength_d = function() {
        return r.length
    };
    this.getSelectedItems_d = function() {
        var a = [], d;
        for (d in r.data)
            a.push(+d.replace("b_", ""));
        return a
    };
    this.initDisGroup = function() {
        this.removeCurrentBgAll_d(q);
        this.removeCurrentBgAll_d(y);
        this.removeItemViewAll_d(r);
        q = {length: 0,data: {}};
        y = {length: 0,data: {}};
        r = {length: 0,data: {}};
        share.view.updateCount_d(r.length)
    };
    this.removeSelected = function(a) {
        for (var d in o)
            if ("d_" + 
            o[d].conf_id == a) {
                g.array.remove(o, o[d]);
                g.array.remove(G, G[d])
            }
        if (this.isSelected(a)) {
            g.array.remove(h.selected, a);
            g.array.remove(l, a);
            t.notifyObservers(i, "uinSelectedChanged", {action: "remove",uin: a,selected: h.selected})
        }
    };
    this.isSelected = function(a) {
        return g.array.indexOf(h.selected, a) >= 0 ? true : false
    };
    this.getSelectedStatus = function() {
        return h
    };
    this.getSelected = function() {
        return h.selected
    };
    this.getSelectedNum = function(a) {
        var d = "b", f = 0;
        if (a == "group")
            d = "g";
        else if (a == "disGroup")
            d = "d";
        var m = RegExp("^" + 
        d + "_");
        g.array.forEach(h.selected, function(p) {
            m.test(p) && f++
        });
        return f
    };
    this.getUinType = function(a) {
        a = /^([bgd])_\d+/.exec(a)[1] || "";
        return a == "g" ? "group" : a == "d" ? "disGroup" : "buddy"
    };
    this.getAppParams = function() {
        return b
    };
    this.searchBuddy = function(a, d) {
        a = String(a).toLowerCase();
        d = d || 50;
        var f = [], m = [], p = j.list;
        if (a.length > 0)
            for (var u = 0; u < p.length; u++) {
                var v = p[u];
                if (String(v.nick).toLowerCase().indexOf(a) > -1 && String(v.nick) != "undefined" || String(v.markname).toLowerCase().indexOf(a) > -1 && String(v.markname) != 
                "undefined" || String(v.nickPinYin).toLowerCase().indexOf(a) > -1 && String(v.nickPinYin) != "undefined" || String(v.nickPinYinFL).toLowerCase().indexOf(a) > -1 && String(v.nickPinYinFL) != "undefined" || String(v.marknamePinYin).toLowerCase().indexOf(a) > -1 && String(v.marknamePinYin) != "undefined" || String(v.marknamePinYinFL).toLowerCase().indexOf(a) > -1 && String(v.marknamePinYinFL) != "undefined") {
                    v.isSelected = g.array.contains(h.selected, v.uin) ? true : false;
                    String(v.nick).toLowerCase() == a || String(v.markname).toLowerCase() == 
                    a ? m.push(v) : f.push(v)
                }
                if (f.length + m.length >= d)
                    break
            }
        Array.prototype.push.apply(m, f);
        return m
    };
    this.getCheckShareItem = function() {
        return g.array.filter(B.share, function(a) {
            return a.checked == 1 && a.validFlag == 1
        })
    };
    this.isShareItemChecked = function(a) {
        return e[a].visible && e[a].checked
    };
    this.getChannelDest = function(a, d) {
        var f = [], m = this.getCheckShareItem();
        g.array.forEach(m, function(p) {
            if (p.channel == a)
                if (p.checked)
                    if (d && p.id != d && d != "qq" || !d || d && d == "qq" && p.id == "qq")
                        f.push(p.id)
        });
        return f
    };
    this.parseShareOption = 
    function() {
        var a = this.getAppParams();
        s.appId = appId;
        s.type = 5;
        s.msg = a.data.msg || s.msg;
        s.site = a.data.site || s.site;
        s.callback = a.data.callback || s.callback;
        s.title = a.data.title || s.title;
        s.summary = a.data.summary || s.summary;
        s.url = a.data.url || s.url;
        s.pics = a.data.pics.split("|")[0] || s.pics;
        s.flash = a.data.flash || s.flash;
        s.iframe = a.data.iframe || s.iframe;
        s.client = a.data.client || s.client;
        s.scale = a.data.scale || s.scale;
        s.APPID = a.data.APPID || s.APPID;
        s.linktype = a.data.linktype || s.linktype;
        s.isFromQZ = a.data.isFromQZ || 
        s.isFromQZ;
        s.commonClient = a.data.commonClient || s.commonClient;
        s.customGroup = ["ls", "recent", "group", "discu"];
        s.album = a.data.album || s.album;
        s.singer = a.data.singer || s.singer;
        s.appid = a.data.appid || s.appid;
        s.msg_type = a.data.msg_type || s.msg_type;
        s.noPic = a.data.noPic || s.noPic;
        if (s.noPic)
            s.pics = "";
        i.parseCustomGroups()
    };
    this.getShareOption = function() {
        return s
    };
    this.getShareSettingMap = function() {
        return e
    };
    this.updateShareMsg = function(a) {
        s.msg = a
    };
    this.setVfCode = function(a) {
        s.vfcode = a
    };
    this.getTCode = function() {
        return s.t
    };
    this.setAppParam = function(a) {
        b = a
    };
    this.getUrlInfo = function(a) {
        a = a || s.url;
        n.requestUrlInfo(a, s.linktype || 13)
    };
    this.getUserName = function() {
        n.requestUserName()
    };
    this.getUserType = function() {
        n.requestUserType(E.onRequestUserTypeSuccess)
    };
    this.resetData = function() {
        h.selected = [];
        h.selectedInfo = [];
        j = null
    };
    this.setSelectedUins = function(a) {
        h.selectedUins = a
    };
    this.getSelectedUins = function() {
        return h.selectedUins
    };
    this.getShareUins = function() {
        var a = [];
        g.array.forEach(h.selected, function(d) {
            a.push(i.uuid2Object(d))
        });
        return a
    };
    this.setSharetoOption = function(a) {
        a = a.list[0].data.result.uins;
        h.selectedUins = a;
        for (var d = 0; d < a.length; d++)
            if (a[d].type == "1")
                h.selectedUins[d] = {id: j.uuidMap[h.selected[d]].gid,type: 1};
        g.array.forEach(a, function(f) {
            if (f.type === 0)
                I.friend.push(f.id);
            else
                f.type === 2 && I.discuss.push(f.id)
        });
        g.array.forEach(h.selected, function(f) {
            i.getUuidType(f) === "g" && I.group.push(j.uuidMap[f].gid)
        })
    };
    this.getSharetoOption = function() {
        return I
    };
    this.getdisGroupArrayKey = function() {
        return G
    };
    this.getFromUin = function() {
        return g.cookie.get("uin").replace(/^[o0]+/i, 
        "")
    };
    var S = {b: 0,g: 1,d: 2}, V = {0: "b",1: "g",2: "d"};
    this.getUuidType = function(a) {
        return a.split("_")[0]
    };
    this.uuid2Object = function(a) {
        var d = a.split("_");
        a = d[0];
        d = parseInt(d[1]);
        return {type: S[a],id: d}
    };
    this.object2UUID = function(a) {
        return V[a.type] + "_" + (a.id || a.uin)
    };
    this.setQQCollect = function(a) {
        s.qqCollect = a
    }
});
Jx().$package("share.view", function(g) {
    var i = this, c = g.dom, t = g.event, w = g.string, k = share.model, n = share.utils, B = share.api, j = share.ui;
    $NET = share.net;
    var e, b = {}, h = {}, l = {}, r, q, y, A, D = k.getUserSetting();
    k.getShareSettingMap();
    var C = D.groupList, o = k.getShareOption(), G = false, H = false, L = false, s = 0, I = false, E = {onGetOpenAccountSuccess: function(a) {
            console.log("onGetOpenAccountSuccess");
            a.retcode == 0 && i.renderShareCom()
        },onGetBuddyListReady: function(a) {
            console.log("onGetBuddyListReady");
            mtaReport.setEndTime();
            mtaReport.report("ShareQQUserList", 
            {Time: mtaReport.getInterval(),Ext1: a.retcode});
            if (a.retcode == 0) {
                i.renderRencentBuddy();
                i.openBuddyList()
            } else {
                b.recentBuddyEl.innerHTML = i.wrapErrorText("\u83b7\u53d6\u8054\u7cfb\u4eba\u8d44\u6599\u5931\u8d25\uff01");
                $NET.monite("error_getFriends");
                console.log(a.retcode)
            }
        },onInitProcessCompleted: function() {
            console.log("onInitProcessCompleted");
            e.hide();
            i.renderInfo();
            i.setShareBtnText();
            $NET.reportIsdEnd("system_load", true)
        },onShareProcessCompleted: function(a) {
            console.log("onShareProcessCompleted");
            if (o.client && b.loginNavEl.innerHTML != "")
                b.loginNavEl.innerHTML = "";
            var d = 0, f, m = q.getCallback("sendShare");
            if (m) {
                var p = m.data.result, u;
                for (u in p)
                    if (p.hasOwnProperty(u)) {
                        f = p[u];
                        if (f.code && f.code != 0)
                            f.code == 110101 && f.desc.indexOf("code=58") || d++
                    }
            }
            f = m.data.retcode == 102222 ? true : false;
            if (m.data.retcode == 100222 ? true : false) {
                document.getElementById("checkFrame").src = "http://captcha.qq.com/getimage?aid=716027615&t=" + Date.parse(new Date);
                c.id("mask").style.display = "block";
                c.id("checkBox").style.display = "block";
                i.hideShareProcess()
            } else if (f) {
                c.id("errorTip").style.display = "inline";
                b.shareProcessEl.innerHTML = ""
            } else if (a.errors > 0 || d > 0) {
                console.log("shareError");
                L = true;
                i.hideCheckBox();
                i.showShareError(a.list);
                i.hideShareProcess();
                mtaReport.setEndTime();
                mtaReport.report("ShareQQFailed", {Ext1: m.data.retcode});
                $NET.monite("error_share")
            } else {
                console.log("shareSuccess");
                H = true;
                i.adaptQQNews("sendSuccess");
                if (!o.isFromQZ) {
                    i.hideCheckBox();
                    i.showShareSuccess(m.data);
                    mtaReport.setEndTime();
                    mtaReport.report("ShareQQSuccess", 
                    {Time: mtaReport.getInterval()});
                    $NET.monite("succ_share");
                    A.mark();
                    A.report();
                    t.notifyObservers(i, "closeSuccessWin", a)
                }
            }
        },onSendShareSuccess: function(a) {
            console.log("onShareWithPicSuccess");
            t.notifyObservers(i, "initBanner", "");
            if (a.retcode == 0) {
                if (a.result.qzone && !a.result.qzone.code && a.result.wblog && !a.result.wblog.code)
                    l.partialRetry = "qq";
                else if (a.result.qzone && !a.result.qzone.code)
                    l.partialRetry = "qzone";
                else if (a.result.wblog && !a.result.wblog.code)
                    l.partialRetry = "wblog";
                q.success("sendShare", a)
            } else
                q.error("sendShare", 
                a);
            $NET.reportIsdEnd("sns_send", true)
        },onCreateDisGroupSuccess: function(a) {
            if (a.retcode == 0) {
                c.hide(c.id("disGroup"));
                j.maskerSingleton.hide();
                try {
                    i.renderGroupMember(100003)
                } catch (d) {
                }
                i.clickListBuddy("d_" + a.conf_id)
            } else {
                a = a.retcode == 99999 ? {text: "\u60a8\u64cd\u4f5c\u592a\u9891\u7e41\u4e86\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5",type: "error"} : {text: "\u521b\u5efa\u8ba8\u8bba\u7ec4\u5931\u8d25!",type: "error"};
                j.maskerSingleton.hide();
                i.showInfoTips(a)
            }
        },onDocumentBodyClick: function(a) {
            if (!s) {
                var d = n.getActionTarget(a, 
                5, "cmd");
                E.executeAction(d, a);
                if (o.iframe || o.isFromQZ)
                    i.adaptQQNews("resize")
            }
        },onDocumentBodyDblClick: function(a) {
            if ((a = n.getActionTarget(a, 5, "cmd")) && a.getAttribute("cmd") == "clickDisListBuddy") {
                var d = a.getAttribute("param");
                k.addTempDisSelectedFromDBL_d(d, a)
            }
        },onDocumentBodyTouchstart: function() {
            s = 0
        },onDocumentBodyTouchmove: function() {
            s = 1
        },onSearchInputFocus: function(a) {
            a.stopPropagation();
            if (a.target.id == "searchInput" && g.string.trim(b.searchInputEl.value) == "\u641c\u7d22\u597d\u53cb/\u7fa4")
                b.searchInputEl.value = 
                "";
            else if (a.target.id == "disSearchInput" && g.string.trim(b.disSearchInputEl.value) == "\u8f93\u5165\u67e5\u627e\u5173\u952e\u5b57")
                b.disSearchInputEl.value = "";
            c.addClass(a.target, "focusStyle")
        },onSearchInputBlur: function(a) {
            a.stopPropagation();
            if (a.target.id == "searchInput" && g.string.trim(b.searchInputEl.value) == "")
                b.searchInputEl.value = "\u641c\u7d22\u597d\u53cb/\u7fa4";
            else if (a.target.id == "disSearchInput" && g.string.trim(b.disSearchInputEl.value) == "")
                b.disSearchInputEl.value = "\u8f93\u5165\u67e5\u627e\u5173\u952e\u5b57";
            c.removeClass(a.target, "focusStyle")
        },onSearchInputKeyUp: function(a) {
            a.stopPropagation();
            if (a.target.id == "searchInput" && !b.searchInputEl.value) {
                i.hideSearchResult();
                c.replaceClass(c.id("searchInputIcon"), "searchInputClearIcon", "searchInputIcon")
            } else if (a.target.id == "disSearchInput" && !b.disSearchInputEl.value) {
                i.hideSearchResult();
                c.replaceClass(c.id("disSearchInputIcon"), "searchInputClearIcon", "searchInputIcon")
            } else {
                var d = a.target.id == "searchInput" ? c.id("searchInputIcon") : c.id("disSearchInputIcon"), 
                f = a.target.id == "searchInput" ? c.id("searchInput") : c.id("disSearchInput"), m = a.target.id == "searchInput" ? "\u641c\u7d22\u597d\u53cb/\u7fa4" : "\u8f93\u5165\u67e5\u627e\u5173\u952e\u5b57";
                c.replaceClass(d, "searchInputIcon", "searchInputClearIcon");
                d.onclick = function() {
                    f.value = m;
                    i.hideSearchResult();
                    c.replaceClass(d, "searchInputClearIcon", "searchInputIcon")
                };
                a.keyCode != 38 && a.keyCode != 40 && a.keyCode != 13 && a.keyCode != 37 && a.keyCode != 39 && n.debounce(200, i.startSearch, true)()
            }
        },onSearchInputKeyDown: function(a) {
            a.stopPropagation();
            switch (a.keyCode) {
                case 13:
                    a.preventDefault();
                    break;
                case 38:
                    a.preventDefault();
                    a = --l.searchResultCurIndex;
                    if (a >= 0 && a < l.searchCache.length)
                        i.selectSearchBuddy(a);
                    else
                        l.searchResultCurIndex = 0
            }
        },onSearchInput: function(a) {
            n.testIpad && this.onSearchInputKeyUp(a)
        },onGetUrlInfoSuccess: function(a) {
            console.log("onGetUrlInfoSuccess");
            a.result.code == 0 ? r.success("getUrlInfo", a) : r.error("getUrlInfo", a)
        },onGetUserNameSuccess: function(a) {
            console.log("onGetUserNameSuccess - view");
            if (a.retcode == 0) {
                b.loginNavEl.innerHTML = 
                o.client ? "" : '<span class="spanWhite">' + w.encodeHtml(o.uname) + '</span>[<a id="logout" cmd="logoutAccount">\u9000\u51fa</a>]  |  <a href="###" cmd="changeLoginAccount">\u6362\u4e2a\u5e10\u53f7</a>';
                l.isPtLoggedIn = true;
                share.isPtLoggedIn = true;
                l.isSend = true;
                k.getOpenAccount();
                t.notifyObservers(i, "getUserType", "");
                $NET.reportOnce({name: "pageview",obj: "signed"})
            } else if (a.retcode == 1E5) {
                g.cookie.remove("skey", share.MAIN_DOMAIN);
                l.isPtLoggedIn = false;
                share.isPtLoggedIn = false;
                share.login.openLoginBox();
                i.renderLoginRecnentArea();
                $NET.reportOnce({name: "pageview",obj: "nosigned"});
                $NET.monite("error_login")
            }
            i.showRecentBuddy()
        },onLoginSuccess: function() {
            if (l.changeLoginAccount) {
                O = 1;
                l = {};
                i.updateCounter();
                k.resetData()
            }
            k.getUserName();
            b.loginNavEl.innerHTML.indexOf("\u767b\u5f55") > -1 ? $NET.report({name: "sign",obj: "sign"}) : $NET.report({name: "sign",obj: "change"});
            l.isPtLoggedIn = true;
            share.isPtLoggedIn = true;
            l.isSend = true;
            var a = g.cookie.get("uin").replace(/^[o0]+/i, "");
            MM.init(1000128, a, "QC_WEB")
        },executeAction: function(a, d) {
            if (a) {
                var f = 
                a.getAttribute("cmd"), m = a.getAttribute("param");
                if (!a.getAttribute("remove")) {
                    (f = E.runAction(f, m, a, d)) && f.preventDefault && d.preventDefault();
                    f && f.stopPropagation && d.stopPropagation()
                }
            }
        },removeAction: function(a) {
            a.setAttribute("remove", "1")
        },runAction: function(a, d, f, m) {
            var p = true;
            console.log(a + " trigger, param:" + d);
            switch (a) {
                case "toggleShare":
                    i.toggleShare(d);
                    break;
                case "toggleShareQQCollect":
                    i.toggleShareQQCollect(d);
                    break;
                case "openList":
                    i.toggleBuddyList();
                    break;
                case "toggleGroup":
                    i.toggleGroup(d);
                    break;
                case "toggleDisGroup":
                    i.toggleDisGroup(d);
                    break;
                case "clickRecentBuddy":
                    i.clickRecentBuddy(d);
                    break;
                case "delSelectedBuddy":
                    i.delSelectedBuddy(d);
                    break;
                case "clickListBuddy":
                    i.clickListBuddy(d, m, f);
                    break;
                case "share":
                    i.share();
                    break;
                case "choiceAll":
                    p = false;
                    i.toggleSelectAllBuddy();
                    break;
                case "clickSearchBuddy":
                    i.selectSearchBuddy(d);
                    i.clickListBuddy(l.searchCache[d].uuid, m, f);
                    break;
                case "clickDisSearchBuddy":
                    i.clickDisListBuddy(l.searchCache[d].uuid);
                    break;
                case "resultTipsBtnClick":
                    if (l.isShareError) {
                        L = 
                        false;
                        i.hideShareError()
                    } else {
                        $NET.report({name: "closesuccess",obj: 9 - void 0});
                        if (o.iframe)
                            i.adaptQQNews("close");
                        else {
                            window.opener = null;
                            window.open("", "_self");
                            o.client ? window.external.ShareWindowClose() : window.close()
                        }
                    }
                    break;
                case "closeErrorWin":
                    i.hideShareError();
                    break;
                case "clickLoginTipsText":
                    share.login.openLoginBox();
                    break;
                case "changeLoginAccount":
                    l.changeLoginAccount = true;
                    document.getElementById("login_div").style.right = "-1px";
                    share.login.openLoginBox();
                    break;
                case "login":
                    share.login.openLoginBox();
                    break;
                case "logoutAccount":
                    i.logoutAccount();
                    break;
                case "clickDisListBuddy":
                    i.clickDisListBuddy(d, f);
                    break;
                case "clickDelBuddy":
                    i.clickDelBuddy(d);
                    break;
                case "addDisBtnClick":
                    i.addDisBtnClick();
                    break;
                case "delDisBtnClick":
                    i.delDisBtnClick();
                    break;
                case "createDisgroup":
                    $NET.report({name: "apply"});
                    i.renderDisGroup();
                    i.adaptQQNews("renderDisGroup");
                    break;
                case "createDisBtnClick":
                    i.createDisBtnClick();
                    i.adaptQQNews("createDisBtnClick");
                    break;
                case "cancelCreateDisBtnClick":
                    i.cancelCreateDisBtnClick();
                    i.adaptQQNews("cancelCreateDisBtnClick");
                    break;
                case "clickAioBuddy":
                    t.notifyObservers(i, "clickAioBuddy", d)
            }
            return {preventDefault: p,stopPropagation: true}
        }};
    this.logoutAccount = function() {
        g.cookie.remove("uin", share.MAIN_DOMAIN);
        g.cookie.remove("skey", share.MAIN_DOMAIN);
        l = {};
        i.updateCounter();
        k.resetData();
        O = 1;
        i.renderLoginRecnentArea();
        i.renderRencentBuddy();
        i.reRenderAppText();
        b.loginNavEl.innerHTML = ' <a href="#" id="login" cmd="login">\u767b\u5f55</a> | <a href="http://zc.qq.com/chs/index.html" target="_blank">\u6ce8\u518c</a>'
    };
    this.renderInfo = function() {
        i.adaptQQNews("init");
        var a = Math.ceil(g.string.byteLength(o.msg, 2) / 2), d = D.maxChar - a;
        a = 110;
        if (!o.pics && o.msg_type != 6)
            a = 144;
        if (o.msg_type == 6) {
            var f = [];
            o.album && f.push("\u6b4c\u624b: " + o.album);
            o.singer && f.push("\u6b4c\u624b: " + o.singer);
            o.summary = f.join("\n");
            if (!o.pics)
                o.pics = "http://pub.idqqimg.com/qconn/widget/shareqq/images/album.png"
        }
        var m = o.summary, p = o.title;
        if (n.lenReg(o.summary) > a)
            o.summary = n.sub_str(o.summary, a) + "...";
        if (n.lenReg(o.title) > a / 2)
            o.title = n.sub_str(o.title, 
            parseInt(a / 2)) + "...";
        if (d < 0)
            o.msg = n.sub_str_msg(o.msg, D.maxChar * 2 - 3) + "...";
        o.summary = o.summary.replace(/\n/g, " ");
        if (!w.isURL(o.pics))
            o.pics = "";
        d = {shareMsg: w.encodeHtml(o.msg) || "\u52a0\u70b9\u8bc4\u8bba\u5427...",title: w.encodeHtml(o.title),summary: w.encodeHtml(o.summary),picUrl: w.encodeHtmlAttribute(o.pics),fullSummary: w.encodeHtmlAttribute(m)};
        y = d.shareMsg;
        b.mainInfoEl.innerHTML = w.template(h.appInfoTmpl, d);
        b.overflowHintEl = c.id("overflowHint");
        b.appTextEl = c.id("appText");
        o.msg_type == 6 && (c.id("shareSiteInfo").style.fontSize = 
        "16px");
        var u = c.id("appImg"), v = a - 4;
        u.onerror = function() {
            if (o.msg_type == 6) {
                this.src = "http://pub.idqqimg.com/qconn/widget/shareqq/images/album.png";
                this.style.width = "82px"
            } else
                c.hide(c.id("imgWrapper"))
        };
        u.onload = function() {
            if (o.msg_type == 6)
                this.style.height = "82px";
            var z = parseInt(this.width);
            z = z > 96 ? parseInt(v - (z - 96) / 5.4 * 2) : parseInt(v - (z - 96) / 8 * 2);
            var F = m, J = p;
            if (p != "" || o.msg_type == 6) {
                if (o.msg_type == 6) {
                    var K = "\u4e13\u8f91\uff1a" + o.album, P = "\u6b4c\u624b\uff1a" + o.singer;
                    F = K;
                    var U = P;
                    if (n.lenReg(K) > z / 2)
                        F = 
                        n.sub_str(K, parseInt(z / 2)) + "...";
                    if (n.lenReg(P) > z / 2)
                        U = n.sub_str(P, parseInt(z / 2)) + "...";
                    K = [];
                    o.album && K.push(w.encodeHtml(F));
                    o.singer && K.push(w.encodeHtml(U));
                    F = K.join("<br />");
                    if (n.lenReg(p) > z / 2 * 12 / 16)
                        J = n.sub_str(p, parseInt(z / 2 * 12 / 16)) + "..."
                } else {
                    if (n.lenReg(m) > z)
                        F = n.sub_str(m, z) + "...";
                    if (n.lenReg(p) > z / 2)
                        J = n.sub_str(p, parseInt(z / 2)) + "...";
                    F = w.encodeHtml(F)
                }
                m = w.encodeHtmlAttribute(m);
                J = w.encodeHtml(J);
                z = J != "" ? J + "<br /><span title='" + m + "' class='appIntroSummary' id='appIntroSummary'>" + F + "</span>" : 
                "<span title='" + m + "' class='appIntroSummary' id='appIntroSummary'>" + F + "</span>"
            } else {
                z = parseInt(z / 2 * 3);
                if (n.lenReg(m) > z)
                    F = n.sub_str(m, z) + "...";
                m = w.encodeHtmlAttribute(m);
                F = w.encodeHtml(F);
                z = "<span title='" + m + "' class='appIntroSummary' id='appIntroSummary'>" + F + "</span>"
            }
            c.id("shareSiteInfo").getElementsByTagName("span")[0].innerHTML = z;
            u.onload = null
        };
        if (b.appTextEl.value == "\u52a0\u70b9\u8bc4\u8bba\u5427...")
            b.appTextEl.style.color = "#ccc";
        if (!o.pics)
            if (o.msg_type != 6) {
                c.hide(c.id("imgWrapper"));
                c.setStyle(c.id("appIntroSummary"), 
                "width", "480px")
            }
        o.pics || o.summary || o.title || (document.getElementById("appText").className += " emptySummary");
        this.renderMsgCounter();
        this.renderVfCode()
    };
    this.reRenderAppText = function() {
        var a = k.getAppParams().data.msg;
        c.id("appText").innerHTML = w.encodeHtml(a) || "\u52a0\u70b9\u8bc4\u8bba\u5427..."
    };
    this.renderMsgCounter = function() {
        var a = this, d = c.id("appText");
        if (d.innerText && d.innerText == "\u52a0\u70b9\u8bc4\u8bba\u5427..." || d.innerHtml && text.innerHTML == "\u52a0\u70b9\u8bc4\u8bba\u5427..." || d.textContent && 
        d.textContent == "\u52a0\u70b9\u8bc4\u8bba\u5427...")
            d.style.color = "#ccc";
        g.event.on(b.appTextEl, "keyup", function() {
            n.delay("updateMsgCounter", 200, function() {
                a.updateCounter()
            });
            if (!l.customMsgTracker)
                l.customMsgTracker = 1
        });
        g.event.on(b.appTextEl, "paste", function() {
            setTimeout(function() {
                var f = b.appTextEl.innerHTML.replace(/^<br>/, "");
                f = f.replace(/<[^>]+>/g, "");
                b.appTextEl.innerHTML = f;
                k.updateShareMsg(f.replace(/&nbsp;/g, ""))
            }, 500)
        });
        g.event.on(b.appTextEl, "dragenter", function(f) {
            f.preventDefault();
            f.stopPropagation();
            return false
        });
        g.event.on(b.appTextEl, "drop", function(f) {
            f.preventDefault();
            f.stopPropagation();
            return false
        });
        g.event.on(b.appTextEl, "focus", function(f) {
            f = f.target;
            if (f.innerText) {
                if (f.innerText == "\u52a0\u70b9\u8bc4\u8bba\u5427...") {
                    this.innerText = "";
                    this.style.color = "#000"
                }
            } else if (f.innerHTML == "\u52a0\u70b9\u8bc4\u8bba\u5427...") {
                this.innerHTML = "";
                this.style.color = "#000"
            }
            c.addClass(f, "focusStyle")
        });
        g.event.on(b.appTextEl, "blur", function(f) {
            f = f.target;
            if (f.innerText) {
                if (f.innerText.charCodeAt() < 
                30 || f.innerText.length == 0) {
                    f.innerText = "\u52a0\u70b9\u8bc4\u8bba\u5427...";
                    this.style.color = "#ccc"
                }
            } else if (f.innerHTML.charCodeAt() < 30 || f.innerHTML.length == 0 || f.innerHTML == "<br>") {
                f.innerHTML = "\u52a0\u70b9\u8bc4\u8bba\u5427...";
                this.style.color = "#ccc"
            }
            c.removeClass(f, "focusStyle")
        });
        this.updateCounter()
    };
    this.getInputMsg = function() {
        var a = b.appTextEl.innerText && b.appTextEl.innerText.replace(/^<br>/, "") || b.appTextEl.textContent && b.appTextEl.textContent.replace(/^<br>/, "");
        a = a.replace(/&nbsp;/g, " ").replace(/<br *\/?>/g, 
        " ");
        return a == "\u52a0\u70b9\u8bc4\u8bba\u5427..." ? "" : a
    };
    this.updateCounter = function() {
        var a = this.getInputMsg(), d = Math.ceil(g.string.byteLength(a, 2) / 2);
        d = D.maxChar - d;
        var f = c.id("appText");
        if (d < 0) {
            l.msgOverflow = true;
            d = '\u8d85\u51fa<span class="red">' + Math.abs(d) + "</span>\u5b57";
            c.addClass(f, "appTextOverflowIe6")
        } else {
            d = "";
            l.msgOverflow = false;
            c.removeClass(f, "appTextOverflowIe6")
        }
        k.updateShareMsg(a);
        b.overflowHintEl.innerHTML = d;
        this.checkSendBtnStatus();
        i.adaptQQNews("resize")
    };
    this.hideCheckBox = function() {
        b.vfTextEl.value = 
        "";
        this.setVfCode();
        c.id("sendCheck").style.color = "#A0A0A0";
        c.id("errorTip").style.display = "none";
        c.id("mask").style.display = "none";
        c.id("checkBox").style.display = "none"
    };
    this.renderVfCode = function() {
        var a = this;
        b.vfTextEl = c.id("vfText");
        g.event.on(b.vfTextEl, "keyup", function() {
            if (b.vfTextEl.value == "" || b.vfTextEl.value == null)
                c.id("sendCheck").style.color = "#A0A0A0";
            else
                c.id("sendCheck").style.color = "black";
            a.setVfCode()
        });
        g.event.on(b.vfTextEl, "focus", function() {
            c.id("errorTip").style.display = "none"
        });
        g.event.on(b.vfTextEl, "keydown", function(d) {
            if (d.keyCode == 13) {
                d.preventDefault();
                i.doShare()
            }
        });
        this.setVfCode();
        g.event.on(c.id("sendCheck"), "click", function() {
            i.doShare()
        });
        g.event.on(c.id("changeVf"), "click", function() {
            document.getElementById("checkFrame").src = "http://captcha.qq.com/getimage?aid=716027615&t=" + Date.parse(new Date);
            b.vfTextEl.value = "";
            a.setVfCode();
            c.id("sendCheck").style.color = "#A0A0A0";
            c.id("errorTip").style.display = "none"
        });
        g.event.on(c.id("checkCloseBtn"), "click", function() {
            a.hideCheckBox()
        });
        g.event.on(c.id("cancelCheck"), "click", function() {
            a.hideCheckBox()
        })
    };
    this.getInputCode = function() {
        return c.id("vfText").value
    };
    this.setVfCode = function() {
        var a = this.getInputCode();
        k.setVfCode(a)
    };
    this.setShareBtnText = function() {
        b.shareMsgBtnEl.innerHTML = o.shareBtnText;
        b.shareMsgBtnEl.title = o.shareBtnText
    };
    this.renderShareCom = function() {
        var a = k.getVisibleShare(), d = {list: a,isPad: n.testIpad,isQQCollectSelect: g.cookie.get("qqCollect") == "true" ? "selected" : "",isQQCollectChecked: g.cookie.get("qqCollect") == 
            "true" ? "checked" : ""};
        b.shareComListEl.innerHTML = w.template(h.shareComTmpl, d);
        g.array.forEach(a, function(f) {
            f.checked && i.selectShare(f.id)
        });
        g.cookie.get("qqCollect") && k.setQQCollect(true);
        if (a.length <= 0) {
            c.hide(b.shareComListEl);
            c.hide(b.shareTextEl)
        }
    };
    this.initViewForQQNews = function() {
        if (!(L || H)) {
            var a = c.id("mainContent").scrollHeight;
            top.window.share2qq.resizePopup({height: a});
            top.window.share2qq.iframe.style.height = a + "px"
        }
    };
    this.adaptQQNews = function(a) {
        if (o.iframe)
            switch (a) {
                case "renderDisGroup":
                    c.setStyle(c.id("disGroup"), 
                    "top", "2px");
                    break;
                case "init":
                    c.id("wrapper").removeChild(c.id("header"));
                    c.id("wrapper").removeChild(c.id("footer"));
                    c.setStyle(c.id("content"), "border-radius", "0px");
                    if (top.window.share2qq) {
                        top.window.share2qq.resizePopup({width: 720});
                        top.window.share2qq.resizePopup({height: 470});
                        top.window.share2qq.iframe.style.width = "720px";
                        top.window.share2qq.iframe.style.height = "470px"
                    }
                    break;
                case "resize":
                    i.initViewForQQNews();
                    break;
                case "buddyTree":
                    c.addClass(c.id("buddyTree"), "hackFor6");
                    break;
                case "close":
                    top.window.share2qq && 
                    top.window.share2qq.closePopup();
                    break;
                case "showTips":
                    c.setStyle(c.id("infoConfirmTips"), "top", "30%");
                    c.setStyle(b.infoTipsEl, "top", "30%");
                    break;
                case "sendSuccess":
                    top.window.share2qq && o.isFromQZ && top.window.share2qq.onSendSuccess();
                    break;
                case "successView":
                    c.setStyle(c.id("resultTips"), "top", "0px");
                    c.setStyle(c.id("resultTips"), "border-radius", "0px");
                    a = c.mini(".aioTipsMain", c.id("resultTips"))[0];
                    c.setStyle(a, "border-radius", "0px")
            }
    };
    this.showRecentBuddy = function() {
        if (l.isPtLoggedIn) {
            if (!l.rencentBuddy) {
                mtaReport.setStartTime();
                k.getBuddyList();
                l.rencentBuddy = 1
            }
        } else
            this.renderLoginRecnentArea()
    };
    this.renderRencentBuddy = function() {
        document.getElementById("recentBuddy").innerHTML = '<div id="recentBuddyForB"></div><div id="recentBuddyForG"></div>';
        c.addClass(c.id("mainContent"), "startWording")
    };
    this.renderPreSelectedBuddy = function() {
        var a = k.getSelectedStatus();
        g.array.forEach(a.selected, function(d) {
            d = c.id("recentBuddy_" + d);
            c.addClass(d, "selected")
        })
    };
    this.renderPreSelectedDis = function(a, d) {
        a.innerHTML = w.template(h.disBuddySelectedTmpl, 
        {user: d,encodeHtml: w.encodeHtml})
    };
    this.renderDisBuddyList = function(a) {
        console.log("renderDisBuddyList");
        a.innerHTML = w.template(h.buddyListComTmplDis, {});
        b.disBuddyTreeEl = c.id("disBuddyTree");
        b.disSearchResultEl = c.id("disSearchResult");
        b.disSearchInputEl = c.id("disSearchInput");
        t.on(b.disSearchInputEl, "focus", E.onSearchInputFocus);
        t.on(b.disSearchInputEl, "blur", E.onSearchInputBlur);
        t.on(b.disSearchInputEl, "keyup", E.onSearchInputKeyUp);
        t.on(b.disSearchInputEl, "keydown", E.onSearchInputKeyDown);
        a = {list: k.getBuddyGroup(),
            encodeHtml: w.encodeHtml,padFlag: n.testIpad};
        b.disBuddyTreeEl.innerHTML = w.template(h.disBuddyTreeTmpl, a);
        a = document.getElementById("disBuddyTree").getElementsByTagName("div");
        _this = this;
        for (var d = 0, f = a.length; d < f; d++) {
            var m = a[d];
            m.onmouseover = function() {
                if (!n.testIpad)
                    this.style.background = "rgb(48,178,228)"
            };
            m.onmouseout = function() {
                if (!n.testIpad)
                    this.style.background = "none"
            };
            m.ontouchstart = function(p) {
                p = p.target;
                p.style.background = "rgb(48,178,228)";
                p.style.color = "#fff"
            };
            m.ontouchend = function(p) {
                var u = 
                p.target;
                u.style.background = "none";
                u.style.color = "#000";
                p.preventDefault();
                _this.toggleDisGroup(p.target.getAttribute("param"))
            }
        }
    };
    this.renderBuddyList = function(a) {
        console.log("renderBuddyList");
        a.innerHTML = w.template(h.buddyListComTmpl, {});
        this.adaptQQNews("buddyTree");
        b.buddyTreeEl = c.id("buddyTree");
        b.searchResultEl = c.id("searchResult");
        b.searchInputEl = c.id("searchInput");
        t.on(b.searchInputEl, "focus", E.onSearchInputFocus);
        t.on(b.searchInputEl, "blur", E.onSearchInputBlur);
        t.on(b.searchInputEl, "keyup", 
        E.onSearchInputKeyUp);
        t.on(b.searchInputEl, "keydown", E.onSearchInputKeyDown);
        b.searchInputEl.oninput = function(p) {
            E.onSearchInput(p)
        };
        a = {list: k.getAllGroup(),encodeHtml: w.encodeHtml,padFlag: n.testIpad};
        b.buddyTreeEl.innerHTML = w.template(h.buddyTreeTmpl, a);
        a = k.getMyBuddyList().group["100000"];
        var d = k.getMyBuddyList().group["100001"];
        if (a && a.length)
            this.openGroup("100000");
        else
            d && d.length && this.openGroup("100001");
        a = document.getElementById("buddyTree").getElementsByTagName("div");
        d = 0;
        for (var f = a.length; d < 
        f; d++) {
            var m = a[d];
            m.onmouseover = function() {
                if (!/categoryTag/.test(this.className))
                    if (!n.testIpad)
                        this.style.background = "rgb(48,178,228)"
            };
            m.onmouseout = function() {
                if (!/categoryTag/.test(this.className))
                    if (!n.testIpad)
                        this.style.background = "none"
            };
            m.ontouchstart = function(p) {
                if (!/categoryTag/.test(this.className)) {
                    p = p.target;
                    p.style.background = "rgb(48,178,228)";
                    p.style.color = "#fff"
                }
            };
            m.ontouchend = function(p) {
                if (!/categoryTag/.test(this.className)) {
                    var u = p.target;
                    u.style.background = "none";
                    u.style.color = 
                    "#000"
                }
                p.preventDefault()
            };
            m.ontouchmove = function(p) {
                if (!/categoryTag/.test(this.className)) {
                    p = p.target;
                    p.style.background = "none";
                    p.style.color = "#000"
                }
            }
        }
    };
    this.renderGroupMember = function(a) {
        var d = c.id("groupMember_" + a), f = k.getGroup(a).key, m = {list: k.getGroupBuddy(a),markname: o.buddyTreeMarkname,groupKey: f,encodeHtml: w.encodeHtml,padFlag: n.testIpad};
        if (f == "ls" || f == "recent") {
            if (f == "ls")
                var p = k.getCategoryCount().lsCount.friend, u = k.getCategoryCount().lsCount.groupDiscuss;
            else if (f == "recent") {
                k.setRecentCount(k.getGroupBuddy(a));
                p = k.getCategoryCount().recentCount.friend;
                u = k.getCategoryCount().recentCount.groupDiscuss
            }
            a = p == 0 ? "" : "<div class='categoryTag' onmouseover='margin:0;'>\u597d\u53cb</div>";
            u = u == 0 ? "" : "<div class='categoryTag' onmouseover='margin:0;'>\u7fa4</div>";
            var v = {markname: o.buddyTreeMarkname,groupKey: f,encodeHtml: w.encodeHtml,padFlag: n.testIpad,list: m.list.slice(0, p)};
            f = {markname: o.buddyTreeMarkname,groupKey: f,encodeHtml: w.encodeHtml,padFlag: n.testIpad,list: m.list.slice(p)};
            f = a + w.template(h.buddyTmpl, v) + u + w.template(h.buddyTmpl, 
            f);
            d.innerHTML = f
        } else
            d.innerHTML = w.template(h.buddyTmpl, m);
        d = document.getElementById("buddyTree").getElementsByTagName("li");
        f = 0;
        for (m = d.length; f < m; f++) {
            p = d[f];
            p.onmouseover = function() {
                if (!n.testIpad)
                    this.style.background = "rgb(48,178,228)"
            };
            p.onmouseout = function() {
                if (!n.testIpad)
                    this.style.background = "none"
            };
            p.ontouchstart = function(F) {
                z = 0;
                F.stopPropagation();
                this.style.background = "rgb(48,178,228)";
                this.style.color = "#fff";
                this.style.marginLeft = "3px"
            };
            var z = 0;
            p.ontouchend = function(F) {
                this.style.background = 
                "none";
                this.style.color = "#000";
                this.style.marginLeft = "10px";
                var J = this.getAttribute("param");
                z || i.clickListBuddy(J, F, n.getActionTarget(F, 5, "cmd"));
                F.preventDefault();
                F.stopPropagation()
            };
            p.ontouchmove = function() {
                z = 1;
                this.style.background = "none";
                this.style.color = "#000";
                this.style.marginLeft = "10px"
            }
        }
    };
    this.renderDisGroupMember = function(a) {
        var d = c.id("disGroupMember_" + a), f = k.getGroup(a).key;
        a = {list: k.getGroupBuddyNormal(a),markname: o.buddyTreeMarkname,groupKey: f,encodeHtml: w.encodeHtml};
        d.innerHTML = 
        w.template(h.disBuddyTmpl, a);
        d = document.getElementById("disBuddyTree").getElementsByTagName("li");
        a = 0;
        for (f = d.length; a < f; a++) {
            var m = d[a];
            m.onmouseover = function() {
                if (!n.testIpad)
                    this.style.background = "rgb(48,178,228)"
            };
            m.onmouseout = function() {
                if (!n.testIpad)
                    this.style.background = "none"
            };
            var p = 0;
            m.ontouchstart = function(u) {
                p = 0;
                u.stopPropagation();
                this.style.background = "rgb(48,178,228)";
                this.style.color = "#fff";
                this.style.marginLeft = "3px"
            };
            p = 0;
            m.ontouchend = function(u) {
                this.style.background = "none";
                this.style.color = 
                "#000";
                this.style.marginLeft = "10px";
                var v = this.getAttribute("param");
                p || i.clickDisListBuddy(v);
                u.preventDefault();
                u.stopPropagation()
            };
            m.ontouchmove = function() {
                p = 1
            }
        }
    };
    this.addGridStyleClass = function() {
        var a = window.document.body;
        o.type == "11" ? c.addClass(a, "gridInvite") : c.addClass(a, "gridShare")
    };
    this.addEffectsForIe6 = function() {
        for (var a = ["choiceAll", "openList"], d = 0; d < a.length; d++) {
            var f = document.getElementById(a[d]);
            f.onmouseover = function() {
                this.style.border = "1px solid #adb3b5"
            };
            f.onmouseout = function() {
                this.style.border = 
                "1px solid #fff"
            }
        }
        try {
            document.createElement("canvas").getContext("2d")
        } catch (m) {
            a = document.getElementById("recentBuddy");
            n.addEvent(a, "li", "mouseover", function() {
                this.className += " showBorder"
            });
            n.addEvent(a, "li", "mouseout", function() {
                this.className = this.className.replace(" showBorder", "")
            })
        }
    };
    var R = 0, O = 0;
    this.renderDisGroup = function() {
        if (k.getSelected().length == 10) {
            var a = {text: "\u5bf9\u8c61\u6700\u591a\u4e3a10\u4e2a",type: "error"};
            i.showInfoTips(a)
        } else if (k.getSelectedNum("disGroup") >= k.getSelectedStatus().maxToDisGroup) {
            a = 
            {text: "\u6700\u591a\u53d1\u9001\u7ed93\u4e2a\u8ba8\u8bba\u7ec4",type: "error"};
            i.showInfoTips(a)
        } else {
            var d = g.cookie.get("uin").replace(/^[o0]+/i, "");
            a = k.getShareOption().uname;
            d = n.getAvatar(d);
            j.maskerSingleton.show();
            if (!R || O) {
                this.renderDisBuddyList(c.id("left"));
                this.renderPreSelectedDis(c.id("right"), {nick: a,avatar: d})
            } else
                this.initDisGroup();
            if (O)
                O = 0;
            a = (parseInt(g.dom.id("wrapper").offsetWidth || 567) - 567) / 2;
            c.id("disGroup").style.left = a + "px";
            c.show(c.id("disGroup"));
            if (n.testIpad) {
                c.hide(c.id("addDisBtn"));
                c.hide(c.id("delDisBtn"))
            }
            R = 1;
            G = true
        }
    };
    this.initDisGroup = function() {
        for (var a = document.getElementById("disBuddyTree").getElementsByTagName("div"), d = 0, f = a.length; d < f; d++) {
            g.dom.removeClass(a[d], "groupOpen");
            var m = /_(\d+$)/.exec(a[d].id) || [0];
            if (m[0])
                g.dom.id("disGroupMember_" + m[1]).style.display = "none"
        }
        g.dom.addClass(g.dom.id("addDisBtn"), "addDisAbled");
        g.dom.addClass(g.dom.id("delDisBtn"), "addDisAbled");
        g.dom.hide(g.dom.id("disSearchResult"));
        g.dom.show(g.dom.id("disBuddyTree"));
        g.dom.id("disSearchInput").value = 
        "\u8f93\u5165\u67e5\u627e\u5173\u952e\u5b57";
        k.initDisGroup()
    };
    this.doCreateDisGroup = function(a, d) {
        a = o.msg;
        a = n.sub_str_create(a, 20);
        var f = {name: a,uinArray: d,t: o.t};
        I = true;
        k.onCreateDisGroupOnView(f);
        I = false
    };
    this.init = function() {
        console.log("share app view init");
        var a = n.getSelfUin() || 0;
        MM.init(1000128, a, "QC_WEB");
        o = k.getShareOption();
        if (o.client)
            c.id("loginNav").innerHTML = "";
        this.addGridStyleClass();
        b.wrapperEl = c.id("wrapper");
        b.loadingEl = c.id("loading");
        b.mainInfoEl = c.id("mainInfo");
        b.contentEl = 
        c.id("content");
        b.shareComEl = c.id("shareCom");
        b.shareMsgBtnEl = c.mini(".sendShareMsg", b.shareComEl)[0];
        b.shareTextEl = c.mini(".shareText", b.shareComEl)[0];
        b.shareProcessEl = c.id("shareProcess");
        b.shareComListEl = c.id("shareComList");
        b.recentBuddyEl = c.id("recentBuddy");
        b.recentBuddyEl = c.id("recentBuddy");
        b.sitebarEl = c.id("sitebar");
        b.infoTipsEl = c.id("infoTips");
        b.infoConfirmTipsEl = c.id("infoConfirmTips");
        b.infoTipsTextEl = c.mini(".tipsText", c.id("infoTips"))[0];
        b.infoConfirmTipsTextEl = c.mini(".tipsText", 
        c.id("infoConfirmTips"))[0];
        b.tipsInfoEl = c.id("tipsInfo");
        b.loginNavEl = c.id("loginNav");
        b.disBuddyTreeEl = c.id("disBuddyTree");
        b.disSearchInputEl = c.id("disSearchInput");
        b.searchResultEl = c.id("disSearchResult");
        b.disSearchResultEl = c.id("disSearchResult");
        b.searchInputIcon = c.id("searchInputIcon");
        b.disSearchInputIcon = c.id("disSearchInputIcon");
        h.appInfoTmpl = n.getTemplate("appInfoTmpl");
        h.recentBuddyTmpl = n.getTemplate("recentBuddyTmpl");
        h.buddyTreeTmpl = n.getTemplate("buddyTreeTmpl");
        h.buddyTmpl = n.getTemplate("buddyTmpl");
        h.searchResultTmpl = n.getTemplate("searchResultTmpl");
        h.shareComTmpl = n.getTemplate("shareComTmpl");
        h.buddyListComTmpl = n.getTemplate("buddyListComTmpl");
        h.buddyListComTmplDis = n.getTemplate("buddyListComTmplDis");
        h.disBuddySelectedTmpl = n.getTemplate("disBuddySelectedTmpl");
        h.disBuddyTreeTmpl = n.getTemplate("disBuddyTreeTmpl");
        h.disBuddyTmpl = n.getTemplate("disBuddyTmpl");
        e = new share.ui.Masker({container: b.wrapperEl,element: c.id("wrapperMasker")});
        t.addObserver(k, "GetOpenAccountSuccess", E.onGetOpenAccountSuccess);
        t.addObserver(k, "GetBuddyListReady", E.onGetBuddyListReady);
        t.addObserver(k, "uinSelectedChanged", E.onUinSelectedChanged);
        t.addObserver(k, "GetUrlInfoSuccess", E.onGetUrlInfoSuccess);
        t.addObserver(k, "GetUserNameSuccess", E.onGetUserNameSuccess);
        t.addObserver(B, "ShareBuddySuccess", E.onShareBuddySuccess);
        t.addObserver(share.login, "LoginSuccess", E.onLoginSuccess);
        t.on(document.body, "click", E.onDocumentBodyClick);
        n.testIpad && t.on(document.body, "touchend", E.onDocumentBodyClick);
        n.testIpad && t.on(document.body, 
        "touchmove", E.onDocumentBodyTouchmove);
        n.testIpad && t.on(document.body, "touchstart", E.onDocumentBodyTouchstart);
        t.on(document.body, "dblclick", E.onDocumentBodyDblClick);
        t.addObserver(k, "CreateDisGroupSuccess", E.onCreateDisGroupSuccess);
        this.initProcessRun();
        l.isSend = true;
        b.sitebarEl.innerHTML = '<div class="loading_css3"></div>';
        var d = this, f = c.id("flyEle");
        g.event.on(f, "webkitTransitionEnd", function() {
            f.style.display = "none";
            c.removeClass(d.animateParam.node, "opacityEle");
            d.animateParam.node.style.filter = 
            "alpha(opacity=0)";
            d.animateParam.node.style.opacity = 1;
            d.animateParam.actionFlag = 0
        });
        c.id("feedback") && g.event.on(c.id("feedback"), "click", function() {
            $NET.report({name: "clickFeedback"})
        });
        n.testIpad && (f.style.webkitTransition = "all ease 0.5s");
        $NET.monite("onload");
        $NET.reportOnce({name: "website",obj: w.parseURL(o.url).host});
        Q.error(259682)
    };
    this.initProcessRun = function() {
        r = new n.BatchProcess;
        if (o.url) {
            t.addObserver(r, "BatchProcessCompleted", E.onInitProcessCompleted);
            if (!o.title || !o.summary || !o.pics)
                r.add("getUrlInfo", 
                g.bind(k.getUrlInfo, this));
            r.run();
            k.getUserName();
            if (!o.client && !o.isFromQZ)
                i.renderShareCom();
            else {
                c.hide(b.shareTextEl);
                c.hide(b.shareComListEl)
            }
            i.renderShareCom()
        } else
            e.setTips("\u975e\u6cd5\u8bf7\u6c42\uff01")
    };
    this.testcase = function() {
        var a = E.runAction;
        t.addObserver(k, "GetBuddyListReady", function() {
            n.delay(50, function() {
                a("openList")
            });
            n.delay(1E3, function() {
                a("toggleGroup", 1)
            })
        })
    };
    this.selectShare = function(a) {
        var d = k.getShareSetting(a);
        if (d.shareFlag || d.validFlag) {
            d.checked = 1;
            a = c.id("shareTo_" + 
            a);
            c.addClass(a, "selected");
            var f = a.childNodes[0];
            if (d.shareFlag && d.validFlag) {
                c.addClass(f, "checked");
                n.testIpad && (a.style.opacity = "1")
            }
            this.checkSendBtnStatus()
        }
    };
    this.unSelectShare = function(a) {
        var d = k.getShareSetting(a);
        a = c.id("shareTo_" + a);
        c.removeClass(a, "selected");
        d.checked = 0;
        a.onmouseover = function(f) {
            f.preventDefault()
        };
        a.onmouseout = function() {
        };
        c.removeClass(a.childNodes[0], "checked");
        n.testIpad && (a.style.opacity = "0.5");
        this.checkSendBtnStatus()
    };
    this.toggleShare = function(a) {
        var d = k.getShareSetting(a);
        if (d.shareFlag && d.validFlag)
            d.checked ? this.unSelectShare(a) : this.selectShare(a);
        else
            switch (d.regAction) {
                case 1:
                    a = "";
                    switch (d.id) {
                        case "qzone":
                            a = "http://imgcache.qq.com/qzone/reg/reg1.html";
                            break;
                        case "wblog":
                            a = "http://reg.t.qq.com/";
                            break;
                        default:
                            a = "about:blank"
                    }
                    window.open(a);
                    break;
                case 2:
                    n.hasRpcChannel() && B.runAuthApp(a)
            }
    };
    this.toggleShareQQCollect = function() {
        if (c.hasClass(c.id("shareTo_qq_collect"), "selected")) {
            c.removeClass(c.id("shareTo_qq_collect"), "selected");
            c.removeClass(c.id("qqCollectSpan"), 
            "checked");
            k.setQQCollect(false)
        } else {
            c.addClass(c.id("shareTo_qq_collect"), "selected");
            c.addClass(c.id("qqCollectSpan"), "checked");
            k.setQQCollect(true)
        }
    };
    this.enableShareItem = function(a) {
        var d = k.getShareSetting(a), f = c.id("shareTo_" + a);
        c.removeClass(f, "disable2");
        this.selectShare(a);
        f.setAttribute("title", "\u70b9\u51fb\u56fe\u6807\uff0c\u53d1\u9001\u5230" + d.name)
    };
    this.checkSendBtnStatus = function() {
        if (l.msgOverflow) {
            l.isSend = false;
            c.replaceClass(b.shareMsgBtnEl, "enable", "disable");
            b.shareMsgBtnEl.title = 
            "\u53d1\u9001\u5b57\u6570\u8fc7\u591a"
        } else {
            l.isSend = true;
            c.replaceClass(b.shareMsgBtnEl, "disable", "enable");
            b.shareMsgBtnEl.title = "\u53d1\u9001"
        }
    };
    this.wrapErrorText = function(a) {
        return '<div class="masker-tips center">' + a + "</div>"
    };
    this.renderLoginRecnentArea = function() {
        b.sitebarEl.innerHTML = '<div class="loginTipsText"><a href="###" id="loginTipsText" cmd="clickLoginTipsText" title="\u70b9\u51fb\u767b\u5f55">\u8bf7\u5148\u767b\u5f55\uff0c\u518d\u9009\u62e9\u597d\u53cb</a></div>'
    };
    this.renderNoBuddyRecnentArea = 
    function() {
        b.sitebarEl.innerHTML = '<div class="loginTipsText"><a href="http://id.qq.com" target="_blank" id="loginTipsText" title="\u70b9\u51fb\u6dfb\u52a0">\u60a8\u5c1a\u672a\u6dfb\u52a0\u4efb\u4f55\u597d\u53cb/\u7fa4/\u8ba8\u8bba\u7ec4\uff0c\u8bf7\u5148\u6dfb\u52a0</a></div>'
    };
    this.openBuddyList = function() {
        if (!l.buddyList) {
            i.renderBuddyList(b.sitebarEl);
            l.buddyList = 1;
            g.browser.ie && g.browser.ie == 6 || n.delay(10, function() {
                k.parseBuddyPinyin()
            })
        }
    };
    this.closeBuddyList = function() {
        b.sitebarEl.style.display = 
        "none";
        document.getElementById("wrapper").style.width = "560px";
        document.getElementById("mainContent").style.width = "100%";
        D.buddyList = 0;
        b.openListEl.innerHTML = "\u66f4\u591a \u203a\u203a";
        c.removeClass(b.openListEl, "listOpened")
    };
    this.toggleBuddyList = function() {
        D.buddyList ? this.closeBuddyList() : this.openBuddyList();
        $NET.report({name: "more"})
    };
    this.openGroup = function(a) {
        var d = "groupMember_" + a, f = c.id(d), m = c.id("buddyGroup_" + a);
        c.show(f);
        c.addClass(m, "groupOpen");
        if (!l[d]) {
            i.renderGroupMember(a);
            l[d] = 1
        }
        C[d] = 
        1
    };
    this.openDisGroup = function(a) {
        var d = "disGroupMember_" + a, f = c.id(d), m = c.id("disBuddyGroup_" + a);
        c.show(f);
        c.addClass(m, "groupOpen");
        if (!l[d]) {
            i.renderDisGroupMember(a);
            l[d] = 1
        }
        C[d] = 1
    };
    this.closeGroup = function(a) {
        var d = "groupMember_" + a, f = c.id(d);
        a = c.id("buddyGroup_" + a);
        c.removeClass(a, "groupOpen");
        c.hide(f);
        C[d] = 0
    };
    this.closeDisGroup = function(a) {
        var d = "disGroupMember_" + a, f = c.id(d);
        a = c.id("disBuddyGroup_" + a);
        c.removeClass(a, "groupOpen");
        c.hide(f);
        C[d] = 0
    };
    this.toggleGroup = function(a) {
        C["groupMember_" + 
        a] ? this.closeGroup(a) : this.openGroup(a)
    };
    this.toggleDisGroup = function(a) {
        var d = "disGroupMember_" + a;
        k.getUserSetting().groupList[d] ? this.closeDisGroup(a) : this.openDisGroup(a)
    };
    this.hightLightTreeItem = function(a) {
        console.log("hightLightTreeItem");
        a = c.id(a);
        l.hightLightEl && c.removeClass(l.hightLightEl, "selected");
        c.addClass(a, "selected");
        l.hightLightEl = a
    };
    this.clickRecentBuddy = function(a) {
        this.insertSelectBuddy(a)
    };
    this.addDisBtnClick = function() {
        k.addDisItems_d()
    };
    this.delDisBtnClick = function() {
        k.removeDisItems_d()
    };
    this.clickDisListBuddy = function(a, d) {
        k.addTempDisSelected_d(a, d)
    };
    this.updateCount_d = function(a) {
        g.dom.id("disChoiceText").innerHTML = "\u5df2\u9009\u8054\u7cfb\u4eba(" + (a + 1) + "/20)";
        var d = g.dom.id("createDisBtn");
        a == 0 ? g.dom.addClass(d, "addDisAbled") : g.dom.removeClass(d, "addDisAbled")
    };
    this.createDisBtnClick = function() {
        if (k.getSelectedLength_d() != 0) {
            this.doCreateDisGroup("", k.getSelectedItems_d());
            G = false;
            c.hide(c.id("disGroup"));
            j.maskerSingleton.hide();
            $NET.report({name: "create"})
        }
    };
    this.cancelCreateDisBtnClick = 
    function() {
        G = false;
        if (k.getSelectedLength_d() > 0)
            i.showInfoConfirmTips({text: "\u60a8\u786e\u5b9a\u8981\u653e\u5f03\u672c\u6b21\u521b\u5efa\u64cd\u4f5c\uff1f",type: "error"});
        else {
            c.hide(c.id("disGroup"));
            j.maskerSingleton.hide()
        }
    };
    this.clickListBuddy = function(a, d, f) {
        if (!(n.testIpad && this.animateParam.actionFlag)) {
            var m = 1;
            if (i.checkSelectedCount(a)) {
                this.animateParam.actionFlag = 1;
                var p = c.id("recentBuddy_" + a), u;
                if (!S) {
                    if (!p) {
                        var v = c.mini(".recentBuddyItem", b.recentBuddyEl), z = c.mini(".rencentList", b.recentBuddyEl)[0];
                        p = null;
                        for (var F = 0, J = v.length; F < J; F++) {
                            u = v[F];
                            if (!c.hasClass(u, "selected")) {
                                p = u;
                                break
                            }
                        }
                        v = k.getInfoByUUID(a);
                        J = F = w.encodeHtml(v.markname || v.nick || v.uin);
                        if (v.extra)
                            J += "&#xd" + w.encodeHtml(v.extra);
                        u = c.node("li", {id: "recentBuddy_" + a,"class": "recentBuddyItem"});
                        var K;
                        K = n.lenReg(F) < 7 ? "text-align:center" : "";
                        u.innerHTML = '<div style="' + K + '" title="' + J + '" class="buddyName">' + F + '</div><div class="deleteItem" cmd="delSelectedBuddy" param="' + v.uuid + '"></div>';
                        if (p) {
                            z.insertBefore(u, p);
                            z.removeChild(p)
                        } else {
                            if (k.getUinType(a) == 
                            "buddy") {
                                z = c.id("recentBuddyForB");
                                if (k.getSelectedNum("buddy") == 0)
                                    z.innerHTML = w.template(h.recentBuddyTmpl, {})
                            } else {
                                m = 2;
                                z = c.id("recentBuddyForG");
                                if (k.getSelectedNum("group") + k.getSelectedNum("disGroup") == 0)
                                    z.innerHTML = w.template(h.recentBuddyTmpl, {})
                            }
                            p = n.lenReg(v.markname || v.nick || v.uin);
                            u.style.minWidth = p * 4 + 8 + "px";
                            if (g.browser.ie == 6 && p >= 48)
                                u.style.width = p * 4 + 18 + "px";
                            c.addClass(u, "opacityEle");
                            z.getElementsByTagName("ul")[0].appendChild(u);
                            var P = this;
                            u.ontouchend = function() {
                                P.delSelectedBuddy(a)
                            };
                            this.flyToRecent(u, d, f);
                            u.ontouchstart = function() {
                            };
                            if (k.getUinType(a) == "buddy" && k.getSelectedNum("buddy") == 0 || k.getUinType(a) != "buddy" && k.getSelectedNum("group") + k.getSelectedNum("disGroup") == 0) {
                                z.style.overflow = "hidden";
                                z.style.height = 0;
                                n.animate(z, {height: "60px"}, 300, function() {
                                    z.style.height = "auto"
                                })
                            }
                        }
                        l.searchResultCurEl && c.removeClass(l.searchResultCurEl, "current")
                    }
                    this.insertSelectBuddy(a, true);
                    mtaReport.report("ShareQQSelectUser", {Ext1: m});
                    $NET.report({name: "select"})
                }
            }
        }
    };
    this.animateParam = 
    {node: "",actionFlag: 0};
    this.flyToRecent = function(a, d, f) {
        if (d && f) {
            this.animateParam.node = a;
            var m = c.id("flyEle");
            m.innerHTML = f.outerHTML;
            m.style.display = "none";
            d = n.getElementPos(f);
            m.style.left = d.x + "px";
            m.style.top = d.y + "px";
            m.style.opacity = 1;
            m.style.display = "block";
            d = n.getElementPos(a);
            n.lastAnimationEnd("fly", "fast");
            n.lastAnimationEnd("fly2", "fast");
            m.style.display = "block";
            if (n.testIpad) {
                m.style.opacity = 0;
                m.style.left = d.x + "px";
                m.style.top = d.y + "px"
            } else
                n.animate(m, {left: d.x + "px",top: d.y + "px",opacity: "0"}, 
                400, function() {
                    m.style.display = "none";
                    c.removeClass(a, "opacityEle");
                    a.style.filter = "alpha(opacity=0)";
                    a.style.opacity = 0;
                    n.animate(a, {opacity: 1}, 200)
                }, "fly")
        } else {
            c.removeClass(a, "opacityEle");
            a.style.filter = "alpha(opacity=0)";
            a.style.opacity = 0;
            n.animate(a, {opacity: 1}, 200);
            n.testIpad && (this.animateParam.actionFlag = 0)
        }
        return 1
    };
    this.selectAllBuddy = function() {
        var a = c.mini("li", b.recentBuddyEl);
        g.array.forEach(a, function(d) {
            c.hasClass(d, "selected") || i.insertSelectBuddy(d.getAttribute("param"))
        });
        $NET.report({name: "selectall"})
    };
    this.unSelectAllBuddy = function() {
        this.selectAllBuddy()
    };
    this.toggleSelectAllBuddy = function() {
        this.selectAllBuddy()
    };
    this.checkSelectedCount = function(a) {
        var d = k.getSelectedStatus(), f = k.getUinType(a), m = f == "buddy" ? k.getSelectedNum(f) : k.getSelectedNum("group") + k.getSelectedNum("disGroup");
        if (!k.isSelected(a) && m >= d.total && f == "buddy") {
            console.log("over selected buddy limit");
            a = {text: "\u6700\u591a\u53d1\u9001\u7ed9 " + d.total + " \u4e2a\u597d\u53cb",type: "error"};
            i.showInfoTips(a);
            return false
        } else if (!k.isSelected(a) && 
        m >= d.maxToG && f != "buddy") {
            console.log("over selected limit_group");
            a = {text: "\u6700\u591a\u53d1\u9001\u7ed9" + d.maxToG + "\u4e2a\u7fa4\u7ec4",type: "error"};
            i.showInfoTips(a);
            return false
        }
        return true
    };
    this.toggleBuddyTreeDom = function(a, d) {
        var f = (d = d == undefined ? false : d) ? c.addClass : c.removeClass, m, p;
        (m = c.id("searchBuddy_" + a)) && f(m, "selected");
        g.array.forEach(k.getAllGroup(), function(u) {
            (p = c.id("listBuddy_" + u.key + "_" + a)) && f(p, "selected")
        })
    };
    this.insertSelectBuddy = function(a, d) {
        var f = c.id("recentBuddy_" + a);
        d = g.isUndefined(d) ? false : true;
        if (k.isSelected(a))
            n.testIpad && (this.animateParam.actionFlag = 0);
        else {
            if (!i.checkSelectedCount(a))
                return;
            k.addSelected(a, I);
            c.addClass(f, "selected");
            i.toggleBuddyTreeDom(a, true);
            c.removeClass(c.id("mainContent"), "startWording");
            if (d) {
                n.delay(100, function() {
                    c.removeClass(f, "padUnhover");
                    c.addClass(f, "hightlight")
                });
                n.delay(200, function() {
                    c.removeClass(f, "hightlight")
                })
            }
        }
        this.renderSelectedText(a);
        this.checkSendBtnStatus()
    };
    this.renderSelectedText = function(a) {
        var d = k.getSelectedStatus();
        if (k.getUinType(a) == "buddy") {
            if (a = c.id("recentBuddyForB").getElementsByTagName("span")[0])
                if (a.className == "choiceText")
                    a.innerHTML = "\u597d\u53cb(" + k.getSelectedNum("buddy") + "/" + d.total + ")"
        } else if (a = c.id("recentBuddyForG").getElementsByTagName("span")[0])
            if (a.className == "choiceText")
                a.innerHTML = "\u7fa4\u7ec4(" + (k.getSelectedNum("group") + k.getSelectedNum("disGroup")) + "/" + d.maxToG + ")"
    };
    var S = 0, V;
    this.delSelectedBuddy = function(a) {
        var d = this;
        if (k.isSelected(a)) {
            k.removeSelected(a);
            var f = c.id("recentBuddy_" + 
            a);
            f.style.opacity = 1;
            f.style.overflow = "hidden";
            f.style.width = "50px";
            f.style.padding = "0";
            V = function(m) {
                f.parentNode.removeChild(f);
                d.renderSelectedText(a);
                var p = k.getUinType(a);
                if (p == "buddy")
                    if (k.getSelectedNum(p) == 0) {
                        var u = c.id("recentBuddyForB");
                        u.style.height = "30px";
                        u.style.overflow = "hidden";
                        if (m == "fast")
                            u.innerHTML = "";
                        else
                            n.animate(u, {height: 0}, 100, function() {
                                u.innerHTML = "";
                                S = 0
                            })
                    } else
                        S = 0;
                else {
                    if (k.getSelectedNum("group") + k.getSelectedNum("disGroup") == 0)
                        c.id("recentBuddyForG").innerHTML = "";
                    S = 
                    0
                }
                k.getSelected().length || c.addClass(c.id("mainContent"), "startWording");
                n.testIpad && (d.animateParam.actionFlag = 0)
            };
            if (n.testIpad) {
                f.style.webkitTransition = "all ease .2s";
                f.style.overflow = "hidden";
                f.style.width = 0;
                f.style.opacity = 0;
                g.event.on(f, "webkitTransitionEnd", V)
            } else {
                S = 1;
                n.animate(f, {opacity: 0,width: 0}, 200, V, "fly2")
            }
        }
        i.adaptQQNews("resize")
    };
    this.share = function() {
        console.log("share");
        if (!l.msgOverflow)
            if (l.isSend) {
                k.getSelectedStatus();
                if (l.msgOverflow) {
                    var a = {text: "\u53d1\u9001\u5b57\u6570\u8fc7\u591a",
                        type: "error"};
                    i.showInfoTips(a)
                } else if (l.isPtLoggedIn)
                    if (k.getSelected().length <= 0) {
                        a = {text: "\u8bf7\u5148\u9009\u62e9\u81f3\u5c111\u4e2a\u597d\u53cb/\u7fa4",type: "error"};
                        i.showInfoTips(a)
                    } else {
                        this.showShareProcess();
                        mtaReport.report("ShareQQClick", {});
                        this.doShare()
                    }
                else
                    share.login.openLoginBox()
            } else
                this.showShareProcss()
    };
    this.doShare = function() {
        console.log("doShare");
        A = Q.speed(7721, 123, 15);
        A.mark();
        mtaReport.setStartTime();
        k.getChannelDest(1, l.partialRetry);
        var a = k.getChannelDest(2, l.partialRetry);
        k.getChannelDest(3, l.partialRetry);
        var d = k.getSelected().length;
        q = new n.BatchProcess;
        t.addObserver(q, "BatchProcessCompleted", E.onShareProcessCompleted);
        var f = k.getShareUins(), m = [], p;
        for (p in f)
            g.array.indexOf(k.getdisGroupArrayKey(), f[p].id) >= 0 || m.push(f[p]);
        k.sortSelected();
        f = o.qqCollect ? true : false;
        g.cookie.set("qqCollect", f);
        f && a.push("weiyun");
        if (a.length > 0) {
            m = {content: w.decodeHtmlSimple(o.msg),dest: a,targetUrl: o.url,uins: JSON.stringify(m),dmList: JSON.stringify(k.parseDisgroup()),ldw: n.getCSRFToken(),
                t: o.t};
            if (o.pics && o.pics !== "" && o.pics !== "undefined")
                m.imageUrl = o.pics;
            if (o.flash && o.flash !== "" && o.flash !== "undefined")
                m.flash = o.flash;
            if (o.APPID && o.APPID !== "" && o.APPID !== "undefined")
                m.APPID = o.APPID;
            if (o.title && o.title !== "" && o.title !== "undefined")
                m.title = o.title;
            if (o.site && o.site !== "" && o.site !== "undefined")
                m.site = o.site;
            if (o.summary && o.summary !== "" && o.summary !== "undefined")
                m.summary = o.summary;
            if (o.callback && o.callback !== "" && o.callback !== "undefined")
                m.appCallback = o.callback;
            if (o.vfcode && o.vfcode !== 
            "" && o.vfcode !== "undefined")
                m.vfcode = o.vfcode;
            if (o.msg_type == 6) {
                o.album && (m.album = o.album);
                o.singer && (m.singer = o.singer);
                m.appid = o.appid
            }
            if (o.msg_type)
                m.msg_type = o.msg_type;
            if (o.site == "qqcom")
                m.site = "\u817e\u8baf\u7f51";
            q.add("sendShare", g.bind($NET.sendShare, $NET, m, E.onSendShareSuccess));
            f = [];
            var u = {};
            g.array.forEach(m.dest, function(v) {
                u[v] = 1
            });
            f[0] = u.qzone || 0;
            f[1] = u.wblog || 0;
            f = f.join(",");
            g.cookie.set("visibleShare", f, "connect.qq.com", "/", 2160);
            $NET.report({name: "share2qq",obj: d});
            a.toString().indexOf("qzone") > 
            -1 && $NET.report({name: "share2qzone"});
            a.toString().indexOf("wblog") > -1 && $NET.report({name: "share2txweibo"});
            y = y.replace(/&#38;/g, "&").replace("\u52a0\u70b9\u8bc4\u8bba\u5427...", "");
            y != o.msg && $NET.report({name: "write"});
            if (o.msg == "")
                if (y != "")
                    $NET.report({name: "sharenothing"});
                else
                    y == "" && $NET.report({name: "shareempty"})
        }
        q.run()
    };
    this.showShareProcess = function() {
        b.shareProcessEl.innerHTML = '<div class="loading_css3"></div>';
        c.replaceClass(b.shareMsgBtnEl, "enable", "disable");
        l.isSend = false
    };
    this.hideShareProcess = 
    function() {
        b.shareProcessEl.innerHTML = "";
        c.replaceClass(b.shareMsgBtnEl, "disable", "enable");
        l.isSend = true
    };
    this.showSearchResult = function() {
        if (G) {
            b.disSearchResultEl.style.display = "block";
            b.disBuddyTreeEl.style.display = "none"
        } else {
            b.searchResultEl.style.display = "block";
            b.buddyTreeEl.style.display = "none"
        }
    };
    this.hideSearchResult = function() {
        if (G) {
            b.disSearchResultEl.style.display = "none";
            b.disBuddyTreeEl.style.display = "block"
        } else {
            b.searchResultEl.style.display = "none";
            b.buddyTreeEl.style.display = "block"
        }
    };
    this.startSearch = function() {
        console.log("startSearch");
        var a = G ? k.searchBuddy(g.string.trim(b.disSearchInputEl.value), 50) : k.searchBuddy(g.string.trim(b.searchInputEl.value), 50);
        l.searchCache = a;
        if (a.length > 0) {
            a = {cmd: "clickSearchBuddy",list: a,encodeHtml: w.encodeHtml,disFlag: 0};
            if (G) {
                a.cmd = "clickDisListBuddy";
                a.disFlag = 1;
                b.disSearchResultEl.innerHTML = w.template(h.searchResultTmpl, a)
            } else
                b.searchResultEl.innerHTML = w.template(h.searchResultTmpl, a);
            a = G ? document.getElementById("disSearchResult").getElementsByTagName("li") : 
            document.getElementById("searchResult").getElementsByTagName("li");
            for (var d = 0, f = a.length; d < f; d++) {
                var m = a[d];
                m.onmouseover = function() {
                    if (!n.testIpad)
                        this.style.background = "rgb(48,178,228)"
                };
                m.onmouseout = function() {
                    if (!n.testIpad)
                        this.style.background = "none"
                };
                m.ontouchstart = function(u) {
                    p = 0;
                    u.stopPropagation();
                    this.style.background = "rgb(48,178,228)";
                    this.style.color = "#fff"
                };
                var p = 0;
                m.ontouchend = function(u) {
                    this.style.background = "none";
                    this.style.color = "#000";
                    var v = this.getAttribute("param");
                    p || i.clickListBuddy(v, 
                    u, n.getActionTarget(u, 5, "cmd"));
                    u.preventDefault();
                    u.stopPropagation()
                };
                m.ontouchmove = function() {
                    p = 1
                }
            }
        } else if (G)
            b.disSearchResultEl.innerHTML = "\u6ca1\u627e\u5230\u76f8\u5173\u597d\u53cb";
        else
            b.searchResultEl.innerHTML = "\u6ca1\u627e\u5230\u76f8\u5173\u597d\u53cb/\u7fa4";
        i.showSearchResult();
        if (!G && b.searchInputEl.value.length == 1 || G && b.disSearchInputEl.value.length == 1)
            $NET.report({name: "search"})
    };
    this.selectSearchBuddy = function(a) {
        console.log("selectSearchBuddy:" + a);
        var d = l.searchCache[a].uuid;
        l.searchResultCurEl && 
        c.removeClass(l.searchResultCurEl, "current");
        d = c.id("searchBuddy_" + d);
        l.searchResultCurEl = d;
        l.searchResultCurIndex = a;
        c.addClass(d, "current")
    };
    this.showShareSuccess = function(a) {
        l.isShareError = false;
        t.notifyObservers(i, "showShareSuccess", a)
    };
    this.showShareError = function(a) {
        l.isShareError = true;
        t.notifyObservers(i, "showShareError", a)
    };
    this.hideShareError = function() {
        b.resultTipsEl = c.id("resultTips");
        c.show(b.contentEl);
        c.hide(b.resultTipsEl)
    };
    this.showInfoTips = function(a) {
        a = a || {};
        a.text = a.text || "";
        a.type = 
        a.type || "success";
        a.callback = a.callback || function() {
        };
        a.timeout = a.timeout || 2E3;
        if (a.text.toLowerCase().indexOf("<br/>") > -1)
            c.id("tipsIcon").style.marginTop = "10px";
        else if (!H)
            b.infoTipsEl.style.lineHeight = "50px";
        H && c.hide(c.id("tipsIcon"));
        c.show(b.infoTipsEl);
        b.infoTipsEl.className = "tipsWrapper " + a.type;
        b.infoTipsTextEl.innerHTML = a.text;
        n.delay("INFO_TIPS", a.timeout, function() {
            c.hide(b.infoTipsEl);
            a.callback.call(i)
        });
        i.adaptQQNews("showTips")
    };
    this.showInfoConfirmTips = function(a) {
        a = a || {};
        a.text = 
        a.text || "";
        a.type = a.type;
        a.callback = a.callback || function() {
        };
        a.timeout = a.timeout || 1500;
        c.show(b.infoConfirmTipsEl);
        b.infoConfirmTipsEl.className = "tipsConfirmWrapper " + a.type;
        b.infoConfirmTipsTextEl.innerHTML = a.text;
        c.id("cfmYesBtn").onclick = function() {
            c.hide(b.infoConfirmTipsEl);
            c.hide(c.id("disGroup"));
            j.maskerSingleton.hide()
        };
        c.id("cfmNoBtn").onclick = function() {
            c.hide(b.infoConfirmTipsEl)
        };
        i.adaptQQNews("showTips")
    }
});
Jx().$package("share.normal.view", function(g) {
    var i = this, c = g.dom, t = g.event, w = g.string, k = share.model, n = share.utils, B = share.ui;
    $C = share.view;
    var j = {}, e = {}, b = k.getShareSettingMap(), h = k.getShareOption(), l = {10001: "\u8c8c\u4f3c\u51fa\u4e86\u4e9b\u6545\u969c\uff0c\u9ebb\u70e6\u91cd\u8bd5\u4e00\u4e0b",1E5: "\u8c8c\u4f3c\u51fa\u4e86\u4e9b\u6545\u969c\uff0c\u9ebb\u70e6\u91cd\u8bd5\u4e00\u4e0b",100001: "\u8c8c\u4f3c\u51fa\u4e86\u4e9b\u6545\u969c\uff0c\u9ebb\u70e6\u91cd\u8bd5\u4e00\u4e0b",100003: "\u8c8c\u4f3c\u51fa\u4e86\u4e9b\u6545\u969c\uff0c\u9ebb\u70e6\u91cd\u8bd5\u4e00\u4e0b",
        100004: "\u60a8\u7684\u6d88\u606f\u5305\u542b\u975e\u6cd5\u5185\u5bb9\uff0c\u8bf7\u4fee\u6539\u540e\u91cd\u8bd5",100100: "\u8c8c\u4f3c\u51fa\u4e86\u4e9b\u6545\u969c\uff0c\u9ebb\u70e6\u91cd\u8bd5\u4e00\u4e0b",100101: "\u8c8c\u4f3c\u51fa\u4e86\u4e9b\u6545\u969c\uff0c\u9ebb\u70e6\u91cd\u8bd5\u4e00\u4e0b",100012: "\u8c8c\u4f3c\u51fa\u4e86\u4e9b\u6545\u969c\uff0c\u9ebb\u70e6\u91cd\u8bd5\u4e00\u4e0b",111111: "\u8c8c\u4f3c\u51fa\u4e86\u4e9b\u6545\u969c\uff0c\u9ebb\u70e6\u91cd\u8bd5\u4e00\u4e0b",99999: "\u60a8\u7684\u64cd\u4f5c\u592a\u5feb\u4e86\uff0c\u8ba9\u6d88\u606f\u98de\u4e00\u4f1a\u513f\uff0c\u518d\u91cd\u8bd5\u5427",
        103199: "\u8c8c\u4f3c\u51fa\u4e86\u4e9b\u6545\u969c\uff0c\u9ebb\u70e6\u91cd\u8bd5\u4e00\u4e0b",103104: "\u8c8c\u4f3c\u51fa\u4e86\u4e9b\u6545\u969c\uff0c\u9ebb\u70e6\u91cd\u8bd5\u4e00\u4e0b",103101: "\u53d1\u9001url\u4e0d\u5728\u767d\u540d\u5355",103111: "\u53d1\u9001url\u4e0d\u7b26\u5408\u5b89\u5168\u7b49\u7ea7",103101: "\u7ec4\u4ef6\u8fd8\u5728\u5185\u6d4b\u9636\u6bb5\uff0c\u656c\u8bf7\u671f\u5f85\u53d1\u5e03",103111: "\u60a8\u53d1\u9001\u7684\u7f51\u9875\u6709\u5371\u9669\u4fe1\u606f",100222: "\u9700\u8981\u9a8c\u8bc1\u7801",
        102222: "\u9a8c\u8bc1\u7801\u670d\u52a1\u5f02\u5e38",103111: "\u6b64\u7f51\u7ad9\u7ecf\u7535\u8111\u7ba1\u5bb6\u9274\u5b9a\uff0c\u5b58\u5728\u98ce\u9669\uff0c\u8bf7\u52ff\u53d1\u9001",110040: "\u53d1\u9001\u8bed\u4e2d\u8bf7\u52ff\u586b\u5199\u7f51\u5740\uff0c\u9ebb\u70e6\u8c03\u6574\u540e\u91cd\u8bd5"}, r = {onGetUserTypeSuccess: function(q) {
            q.retcode == 0 && !q.result.isFirst && !k.getShareOption().iframe && !k.getShareOption().client && i.renderGuide()
        },onCloseSuccessWin: function() {
            timeCounter = 9;
            i.timer = setInterval(function() {
                if (timeCounter == 
                0) {
                    clearInterval(i.timer);
                    j.resultTipsInfoEl.innerHTML = "<p>\u82e5\u7a97\u53e3\u65e0\u6cd5\u81ea\u52a8\u5173\u95ed\uff0c\u8bf7\u624b\u52a8\u5173\u95ed</p>"
                } else
                    j.resultTipsInfoEl.innerHTML = "<p>" + timeCounter + "\u79d2\u540e\u7a97\u53e3\u81ea\u52a8\u5173\u95ed</p>";
                if (timeCounter-- == 0) {
                    $NET.report({name: "closesuccess",obj: 9 - timeCounter});
                    if (h.iframe)
                        i.adaptQQNews("close");
                    else {
                        window.opener = null;
                        window.open("", "_self");
                        h.client ? window.external.ShareWindowClose() : window.close()
                    }
                }
            }, 1E3)
        }};
    this.init = function() {
        j.resultTipsInfoEl = 
        c.id("resultTipsInfo");
        j.sitebarEl = c.id("sitebar");
        j.infoTipsEl = c.id("infoTips");
        j.infoConfirmTipsEl = c.id("infoConfirmTips");
        j.infoTipsTextEl = c.mini(".tipsText", c.id("infoTips"))[0];
        j.infoConfirmTipsTextEl = c.mini(".tipsText", c.id("infoConfirmTips"))[0];
        j.resultTipsEl = c.id("resultTips");
        j.resultTipsIconEl = c.id("resultTipsIcon");
        j.contentEl = c.id("content");
        j.resultTipsBtnEl = c.id("resultTipsBtn");
        j.tipsInfoEl = c.id("tipsInfo");
        j.banner = c.id("banner");
        e.bannerTmpl = n.getTemplate("bannerTmpl");
        e.aioBuddyTmpl = 
        n.getTemplate("aioBuddyTmpl");
        e.aioInfoTmpl = n.getTemplate("aioInfoTmpl");
        h = k.getShareOption();
        t.addObserver($C, "getUserType", i.getUserType);
        t.addObserver(k, "GetUserTypeSuccess", r.onGetUserTypeSuccess);
        t.addObserver($C, "closeSuccessWin", r.onCloseSuccessWin);
        t.addObserver($C, "showShareSuccess", i.showShareSuccess);
        t.addObserver($C, "showShareError", i.showShareError);
        t.addObserver($C, "initBanner", i.initBanner);
        t.addObserver($C, "initAIO", i.initAIO);
        t.addObserver($C, "clickAioBuddy", i.clickAioBuddy)
    };
    this.getUserType = 
    function() {
        k.getUserType()
    };
    this.renderGuide = function() {
        B.maskerSingleton.show();
        c.setStyle(c.id("mask"), "opacity", "0.9");
        c.show(c.id("guide"));
        c.id("guideClose").onclick = function() {
            c.setStyle(c.id("mask"), "opacity", "0.5");
            B.maskerSingleton.hide();
            c.hide(c.id("guide"))
        }
    };
    this.showShareSuccess = function(q) {
        c.show(j.resultTipsEl);
        c.hide(j.contentEl);
        c.addClass(c.id("tipsMainRow1"), "succ");
        j.tipsInfoEl.innerHTML = "\u6d88\u606f\u5df2\u6210\u529f\u9001\u8fbe";
        document.getElementById("resultTipsBtn").title = 
        "\u70b9\u51fb\u5173\u95ed";
        j.resultTipsIconEl.className = "tipsIconError success";
        j.resultTipsInfoEl.innerHTML = "<p>10\u79d2\u540e\u7a97\u53e3\u81ea\u52a8\u5173\u95ed</p>";
        j.resultTipsBtnEl.innerHTML = "\u70b9\u51fb\u5173\u95ed";
        h.iframe && i.initSuccessView();
        if (q.result.activityPage) {
            c.setStyle(j.resultTipsBtnEl, "margin-left", "110px");
            c.addClass(j.resultTipsBtnEl, "resultTipsBtnIE6");
            var y = c.id("activityLink");
            y.setAttribute("href", q.result.activityPage);
            y.innerText = q.result.activityName;
            if (q.result.activityName.length > 
            8)
                y.style.width = 110 + (q.result.activityName.length - 8) * 10 + "px";
            c.show(y);
            y.onmouseover = i.bindClearTimer;
            y.onclick = function() {
                $NET.report({name: "to3rd"})
            }
        }
        if (!k.getShareOption().iframe) {
            c.addClass(c.id("tipsMain"), "guide_result");
            c.addClass(c.id("tipsMain_div"), "guide_result");
            c.addClass(c.id("tipsMainRow3"), "guide_result");
            c.show(c.id("result_guide"));
            c.show(c.id("bannerContent"))
        }
    };
    this.showShareError = function(q) {
        console.log(q);
        c.hide(j.contentEl);
        c.show(j.resultTipsEl);
        c.removeClass(c.id("tipsMainRow1"), 
        "succ");
        j.tipsInfoEl.innerHTML = "\u53d1\u9001\u5931\u8d25";
        j.resultTipsIconEl.className = "tipsIconError";
        j.resultTipsBtnEl.innerHTML = "\u7acb\u5373\u91cd\u8bd5";
        var y = "";
        g.array.forEach(q, function(A) {
            if (A.id == "sendShare") {
                var D = A.data.result, C = 0;
                if (D)
                    for (var o in D) {
                        if (D.hasOwnProperty(o)) {
                            A = D[o];
                            if (A.code && A.code != 0) {
                                C++;
                                b[o].error = 1;
                                y += "<p>" + b[o].name + "\uff1a" + A.desc + "</p>"
                            }
                        }
                    }
                else
                    y += l[A.data.retcode] || "\u8bf7\u7a0d\u5019\u91cd\u8bd5"
            }
        });
        j.resultTipsInfoEl.innerHTML = y;
        h.iframe && i.initSuccessView()
    };
    this.bindClearTimer = function() {
        if (!n.testIpad) {
            if (g.browser.name == "firefox")
                j.resultTipsInfoEl.childNodes[0].textContent = "";
            else
                j.resultTipsInfoEl.childNodes[0].innerText = "";
            window.clearInterval(i.timer)
        }
    };
    this.initAIO = function(q) {
        k.setSharetoOption(q);
        n.initCphelper();
        i.renderAioBuddy();
        i.initSuccessView()
    };
    this.renderAioBuddy = function() {
        if (!n.testIpad) {
            var q = k.getSelected(), y = [], A = [];
            for (y = 0; y < q.length; y++) {
                A[y] = k.getInfoByUUID(q[y]);
                if (A[y].type == "1")
                    A[y].avatar = "http://face.qun.qq.com/cgi/svr/face/getface?cache=1&type=4";
                A[y].uin = k.getSelectedUins()[y].type + "_" + k.getSelectedUins()[y].id
            }
            y = n.bubbleSort(A);
            if (y.length > 0) {
                y = {uins: k.getSelectedUins(),list: y.slice(0, 10),encodeHtml: w.encodeHtml,padFlag: n.testIpad};
                j.aioBuddyEl.innerHTML = w.template(e.aioBuddyTmpl, y)
            }
            q = document.getElementById("aioBuddyList").getElementsByTagName("li");
            y = 0;
            for (A = q.length; y < A; y++) {
                var D = q[y];
                D.onmouseover = function() {
                    if (!n.testIpad) {
                        if (g.browser.name == "firefox")
                            j.resultTipsInfoEl.childNodes[0].textContent = "";
                        else
                            j.resultTipsInfoEl.childNodes[0].innerText = 
                            "";
                        window.clearInterval(i.timer);
                        this.childNodes[1].style.color = "#fff";
                        this.style.background = "rgb(48,178,228)"
                    }
                };
                D.onmouseout = function() {
                    if (!n.testIpad) {
                        this.childNodes[1].style.color = "black";
                        this.style.background = "none"
                    }
                };
                D.ontouchstart = function(o) {
                    C = 0;
                    o.stopPropagation();
                    this.style.background = "rgb(48,178,228)";
                    this.style.color = "#fff";
                    this.style.marginLeft = "3px"
                };
                var C = 0;
                D.ontouchend = function(o) {
                    this.style.background = "none";
                    this.style.color = "#000";
                    this.style.marginLeft = "10px";
                    var G = this.getAttribute("param");
                    C || i.clickListBuddy(G);
                    o.preventDefault();
                    o.stopPropagation()
                };
                D.ontouchmove = function() {
                    C = 1
                }
            }
        }
    };
    this.clickAioBuddy = function(q) {
        if (!k.getFromUin() || k.getFromUin() == "")
            share.login.openLoginBox();
        else {
            var y = q.split("_")[0];
            q = q.split("_")[1];
            var A = {text: "\u4e0e\u7fa4/\u8ba8\u8bba\u7ec4\u53d1\u8d77\u4f1a\u8bdd\u529f\u80fd\u5c06\u5728QQ\u4e0b\u4e00\u7248\u672c\u63a8\u51fa\uff0c<br/>\u656c\u8bf7\u671f\u5f85",type: "error"};
            switch (y) {
                case "0":
                    n.startAio({uin: q,fuin: k.getFromUin()});
                    $NET.report({name: "contacts"});
                    break;
                case "1":
                    if (n.isGroupAioAble())
                        n.startGroupAio({cmd: "opengroup",id: q,fuin: k.getFromUin()});
                    else {
                        i.showInfoTips(A);
                        c.addClass(c.id("infoTips"), "aioTips")
                    }
                    $NET.report({name: "groups"});
                    break;
                case "2":
                    if (n.isGroupAioAble())
                        n.startGroupAio({cmd: "opendiscuss",id: q,fuin: k.getFromUin()});
                    else {
                        i.showInfoTips(A);
                        c.addClass(c.id("infoTips"), "aioTips")
                    }
                    $NET.report({name: "discussions"})
            }
        }
    };
    this.openAioBuddy = function() {
        c.hide(c.id("openAioBuddy"));
        c.setStyle(c.id("aioBuddyList"), "overflow", "visible");
        c.replaceClass(c.id("aioBuddyList"), 
        "aioBuddyLong", "aioBuddyShort")
    };
    this.initSuccessView = function() {
        if (!n.testIpad) {
            isSendSuccess = true;
            i.adaptQQNews("successView");
            i.adaptQQNews("resize")
        }
    };
    this.initViewForQQNews = function() {
        var q = isSendSuccess ? c.id("resultTips").scrollHeight : c.id("mainContent").scrollHeight;
        top.window.share2qq.resizePopup({height: q});
        top.window.share2qq.iframe.style.height = q + "px"
    };
    this.adaptQQNews = function(q) {
        if (!(!h.iframe && top.location.host !== "ent.qq.com"))
            switch (q) {
                case "renderDisGroup":
                    c.setStyle(c.id("disGroup"), 
                    "top", "2px");
                    break;
                case "init":
                    c.id("wrapper").removeChild(c.id("header"));
                    c.id("wrapper").removeChild(c.id("footer"));
                    c.setStyle(c.id("content"), "border-radius", "0px");
                    if (top.window.share2qq) {
                        top.window.share2qq.resizePopup({width: 720});
                        top.window.share2qq.resizePopup({height: 470});
                        top.window.share2qq.iframe.style.width = "720px";
                        top.window.share2qq.iframe.style.height = "470px"
                    }
                    break;
                case "resize":
                    i.initViewForQQNews();
                    break;
                case "buddyTree":
                    c.addClass(c.id("buddyTree"), "hackFor6");
                    break;
                case "close":
                    top.window.share2qq && 
                    top.window.share2qq.closePopup();
                    break;
                case "showTips":
                    c.setStyle(c.id("infoConfirmTips"), "top", "30%");
                    c.setStyle(j.infoTipsEl, "top", "30%");
                    break;
                case "sendSuccess":
                    top.window.share2qq && h.isFromQZ && top.window.share2qq.onSendSuccess();
                    break;
                case "successView":
                    c.setStyle(c.id("resultTips"), "top", "0px");
                    c.setStyle(c.id("resultTips"), "border-radius", "0px");
                    q = c.mini(".aioTipsMain", c.id("resultTips"))[0];
                    c.setStyle(q, "border-radius", "0px")
            }
    };
    this.initBanner = function() {
        var q = "http://pub.idqqimg.com/pc/misc/connect/website/share-ad.js?t=" + 
        Date.parse(new Date);
        g.http.loadScript(q, {onSuccess: function() {
                j.banner.innerHTML = w.template(e.bannerTmpl, {list: cdnData,encodeHtml: w.encodeHtml});
                i.bindBanner()
            },onError: function() {
            }})
    };
    this.bindBanner = function() {
        for (var q = document.getElementById("banner").getElementsByTagName("li"), y = 0, A = q.length; y < A; y++) {
            var D = q[y];
            D.onmouseover = i.bindClearTimer;
            D.onclick = function() {
                var C = this.getAttribute("param");
                C = parseInt(C) + 1;
                $NET.report({name: "bannerclick",obj: C})
            }
        }
    }
});
Jx().$package("share.app", function() {
    var g = share.utils, i = this;
    this.init = function() {
        console.log("=== share app init  ===");
        share.net.reportIsdStart("system_load");
        var c = {url: decodeURIComponent(g.getParameter("url")) || "",msg: decodeURIComponent(g.getParameter("desc").replace(/\+/g, " ")) || "",site: decodeURIComponent(g.getParameter("site")) || "",pics: decodeURIComponent(g.getParameter("pics")) || "",summary: decodeURIComponent(g.getParameter("summary").replace(/\+/g, " ")) || "",title: decodeURIComponent(g.getParameter("title").replace(/\+/g, 
            " ")) || "",flash: decodeURIComponent(g.getParameter("flash")) || "",noPic: decodeURIComponent(g.getParameter("noPic")) || "",iframe: decodeURIComponent(g.getParameter("iframe")) || "",callback: decodeURIComponent(g.getParameter("callback")) || "",client: decodeURIComponent(g.getParameter("client")) || "",scale: decodeURIComponent(g.getParameter("scale")) || "",commonClient: decodeURIComponent(g.getParameter("commonClient")) || "",isFromQZ: decodeURIComponent(g.getParameter("isFromQZ")) || "",APPID: decodeURIComponent(g.getParameter("APPID")) || 
            "",linktype: decodeURIComponent(g.getParameter("linktype")) || "",album: decodeURIComponent(g.getParameter("album")) || "",singer: decodeURIComponent(g.getParameter("singer")) || "",appid: decodeURIComponent(g.getParameter("appid")) || "",msg_type: decodeURIComponent(g.getParameter("msg_type")) || "",shareToWeibo: g.getParameter("weibo") || ""};
        if (c.appid)
            if (!c.msg_type)
                c.msg_type = 6;
        share.model.setAppParam({appId: appId,type: 5,data: c});
        i.run()
    };
    this.run = function() {
        share.model.init();
        share.CONST.DEBUG && share.view.testcase();
        share.view.init();
        window.location.pathname == "/widget/shareqq/index.html" ? share.normal.view.init() : share.iframe.view.init()
    }
});
(new Jx).event.onDomReady(function() {
    console.log("share app dom ready and start");
    share.app.init()
});
Jx().$package("share.login", function(g) {
    var i = g.event;
    packageContext = this;
    var c = g.cookie.get, t = document.getElementById("login_div"), w = function() {
        var k = "http://ui.ptlogin2.qq.com/cgi-bin/login?link_target=blank&appid=716027601&target=self&style=11&s_url=" + escape("http://connect.qq.com/widget/shareqq/success.html");
        document.getElementById("login_frame").src = k;
        t.style.display = "block";
        share.ui.maskerSingleton.show()
    };
    document.getElementById("login").onclick = function() {
        w()
    };
    window.loginCallback = function() {
        var k = 
        c("uin") || 0;
        k && /^o([0-9]+)$/.test(k) && parseFloat(RegExp.$1);
        t.style.display = "none";
        share.ui.maskerSingleton.hide();
        i.notifyObservers(packageContext, "LoginSuccess")
    };
    window.ptlogin2_onClose = function() {
        document.getElementById("login_div").style.display = "none";
        share.ui.maskerSingleton.hide()
    };
    this.openLoginBox = w
});
