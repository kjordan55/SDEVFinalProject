var dtjava = function() {
    function notNull(o) {
        return (o != undefined && o != null);
    }

    function isDef(fn) {
        return (fn != null && typeof fn != "undefined");
    }

    function containsAny(lst, str) {
        for (var q = 0; q < lst.length; q++) {
            if (str.indexOf(lst[q]) != -1) {
                return true;
            }
        }
        return false;
    }

    var jscodebase =  (function () {
        var scripts = document.getElementsByTagName("script");
        var src = scripts[scripts.length - 1].getAttribute("src");
        return src ? src.substring(0, src.lastIndexOf('/') + 1) : "";
    })();

    var noFXAutoInstall = false;

    postponeNativePluginInstallation = false;

    var minJRECobundleVersion = "1.7.0_06";

    //aliases
    var d = document;
    var w = window;

    var cbDone = false;  
    var domInternalCb = []; 
    var domCb = [];      
    var ua = null;


    function addOnDomReadyInternal(fn) {
        if (cbDone) {
            fn();
        } else {
            domInternalCb[domInternalCb.length] = fn;
        }
    }
    function addOnDomReady(fn) {
        if (cbDone) {
            fn();
        } else {
            domCb[domCb.length] = fn;
        }
    }

    function invokeCallbacks() {
        if (!cbDone) {
            try {
                var t = d.getElementsByTagName("body")[0].appendChild(
                    d.createElement("div"));
                t.parentNode.removeChild(t);
            } catch (e) {
                return;
            }
            cbDone = true;
            for (var i = 0; i < domInternalCb.length; i++) {
                domInternalCb[i]();
            }
            for (var i = 0; i < domCb.length; i++) {
                domCb[i]();
            }
        }
    }

    function addOnload(fn) {
        if (isDef(w.addEventListener)) {
            w.addEventListener("load", fn, false);
        } else if (isDef(d.addEventListener)) {
            d.addEventListener("load", fn, false);
        } else if (isDef(w.attachEvent)) {
            w.attachEvent("onload", fn);
        } else if (typeof w.onload == "function") {
            var fnOld = w.onload;
            w.onload = function() {
                fnOld();
                fn();
            };
        } else {
            w.onload = fn;
        }
    }

    function detectEnv() {
        var dom = isDef(d.getElementById) && isDef(d.getElementsByTagName) && isDef(d.createElement);
        var u = navigator.userAgent.toLowerCase(),
            p = navigator.platform.toLowerCase();

        var windows = p ? /win/.test(p) : /win/.test(u),
            mac = p ? /mac/.test(p) : /mac/.test(u),
            linux = p ? /linux/.test(p) : /linux/.test(u),
            chrome = /chrome/.test(u),
            webkit = !chrome && /webkit/.test(u) ?
                parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false,
            opera = /opera/.test(u),
            cputype = null,
            osVersion = null;

        var ie = false;
        try {
            ie = isDef(window.execScript);
            if (!ie) {
                ie = (navigator.userAgent.match(/Trident/i) != null);
            }
        } catch (ee) {
            ie = false;
        }

        var edge = false;
        var noActiveX = false;
        edge = (navigator.userAgent.match(/Edge/i) != null);
        if(ie && navigator.userAgent.match(/Windows NT 6\.[23]/i) != null) {
            try {
                new ActiveXObject("htmlfile");
            } catch(e) {
                noActiveX = true;
            } 
        }

        if(edge || noActiveX) {
            ie = false;
	}

	var noPluginWebBrowser = edge || chrome || noActiveX
        if (mac) {
            if ((p && /intel/.test(p)) || /intel/.test(u)) {
                cputype = "intel";
            }
            var t = u.match(/mac os x (10[0-9_\.]+)/);
            osVersion = notNull(t) ? t[0].replace("mac os x ","").replace(/_/g, ".") : null;
        }

        if(typeof String.prototype.trim !== 'function') {
           String.prototype.trim = function() {
               return this.replace(/^\s+|\s+$/g, ''); 
           }
        }

        if(typeof String.prototype.startsWith !== 'function') {
           String.prototype.startsWith = function(searchString, position) {
               position = position || 0;
               return this.indexOf(searchString, position) === position;
           }
        }


        var mm = navigator.mimeTypes;
        var jre = null;
        var deploy = null;
        var fx = null;
        var override = false;

        if (typeof __dtjavaTestHook__ !== 'undefined' &&
            __dtjavaTestHook__ != null &&
            __dtjavaTestHook__.jre != null &&
            __dtjavaTestHook__.jfx != null &&
            __dtjavaTestHook__.deploy != null) {
            jre = __dtjavaTestHook__.jre;
            deploy = __dtjavaTestHook__.deploy;
            fx = __dtjavaTestHook__.jfx;
            override = true;
        }
        else {
            for (var t = 0; t < mm.length; t++) {
                var m = navigator.mimeTypes[t].type;
                if (m.indexOf("application/x-java-applet;version") != -1 && m.indexOf('=') != -1) {
                    var v = m.substring(m.indexOf('=') + 1);
                    if(jre == null || versionCheck(jre + "+", v)){
			jre = v;
	            }
                }
                if (m.indexOf("application/x-java-applet;deploy") != -1 && m.indexOf('=') != -1) {
                    deploy = m.substring(m.indexOf('=') + 1);
                }
                if (m.indexOf("application/x-java-applet;javafx") != -1 && m.indexOf('=') != -1) {
                    fx = m.substring(m.indexOf('=') + 1);
                }
            }
        }
		
        return {haveDom:dom, wk:webkit, ie:ie, win:windows,
                linux:linux, mac:mac, op: opera, chrome:chrome, edge:edge,
                jre:jre, deploy:deploy, fx:fx, noPluginWebBrowser:noPluginWebBrowser,
                cputype: cputype, osVersion: osVersion, override: override};
    }

   function showMessageBox() {
        var message = 'Java Plug-in is not supported by this browser. <a href="https://java.com/dt-redirect">More info</a>';
        var mbStyle = 'background-color: #ffffce;text-align: left;border: solid 1px #f0c000; padding: 1.65em 1.65em .75em 0.5em; font-family: Helvetica, Arial, sans-serif; font-size: 75%; top:5;left:5;position:absolute; opacity:0.9; width:600px;';
        var messageStyle = "border: .85px; margin:-2.2em 0 0.55em 2.5em;";

        var messageBox = '<img src="https://java.com/js/alert_16.png"><div style="'+ messageStyle +'"><p>'+ message + '</p>';


        var divTag = document.createElement("div");
        divTag.id = "messagebox";
        divTag.setAttribute('style', mbStyle);
        divTag.innerHTML = messageBox;
        document.body.appendChild(divTag);              

    }
    var initDone = false;

    function init() {
        if (typeof __dtjavaTestHook__ !== 'undefined') {
          jre = null;
          jfx = null;
          deploy = null;

          if ((__dtjavaTestHook__ != null) && (__dtjavaTestHook__.args != null)) {
              jre = __dtjavaTestHook__.args.jre;
              jfx = __dtjavaTestHook__.args.jfx;
              deploy = __dtjavaTestHook__.args.deploy;
          }

          if ((window.location.href.indexOf('http://localhost') == 0) ||
             (window.location.href.indexOf('file:///') == 0)) {
             __dtjavaTestHook__ = {
                detectEnv: detectEnv,
                Version: Version,
                checkFXSupport: checkFXSupport,
                versionCheck: versionCheck,
                versionCheckFX: versionCheckFX,
                jre: jre,
                jfx: jfx,
                deploy: deploy
             };
          }
        }

        if (initDone) return;

        ua = detectEnv();
        if (!ua.haveDom) {
            return;
        }

        if (( isDef(d.readyState) && d.readyState == "complete") ||
            (!isDef(d.readyState) &&
                (d.getElementsByTagName("body")[0] || d.body))) {
            invokeCallbacks();
        }

        if (!cbDone) {
            if (isDef(d.addEventListener)) {
                d.addEventListener("DOMContentLoaded",
                    invokeCallbacks, false);
            }
            if (ua.ie && ua.win) {
                if (isDef(d.addEventListener)) {
                    d.addEventListener("onreadystatechange", function() {
                        if (d.readyState == "complete") {
                            d.removeEventListener("onreadystatechange", arguments.callee, false);
                            invokeCallbacks();
                        }
                    }, false);
                } else {
                    d.attachEvent("onreadystatechange", function() {
                        if (d.readyState == "complete") {
                            d.detachEvent("onreadystatechange", arguments.callee);
                            invokeCallbacks();
                        }
                    });
                }
                if (w == top) { 
                    (function() {
                        if (cbDone) {
                            return;
                        }
                        try {
                            d.documentElement.doScroll("left");
                        } catch(e) {
                            setTimeout(arguments.callee, 0);
                            return;
                        }
                        invokeCallbacks();
                    })();
                }
            }
            if (ua.wk) {
                (function() {
                    if (cbDone) {
                        return;
                    }
                    if (!/loaded|complete/.test(d.readyState)) {
                        setTimeout(arguments.callee, 0);
                        return;
                    }
                    invokeCallbacks();
                })();
            }
            addOnload(invokeCallbacks);
        }
        if (!haveDTLite()) {
            installNativePlugin();
        }
    }
    
   function getAbsoluteUrl(jnlp){
        var absoluteUrl;
        if(isAbsoluteUrl(jnlp)) {
            absoluteUrl = jnlp;
        } else {
            var location = window.location.href;
            var pos = location.lastIndexOf('/');
            var docbase =  pos > -1 ? location.substring(0, pos + 1) : location + '/';
	    absoluteUrl = docbase + jnlp;
        }
        return absoluteUrl;
    }

    function launchWithJnlpProtocol(jnlp) {
        document.location="jnlp:"+ getAbsoluteUrl(jnlp);
    }
  

    function isAbsoluteUrl(url){
       var protocols = ["http://", "https://", "file://"];
       for (var i=0; i < protocols.length; i++){
         if(url.toLowerCase().startsWith(protocols[i])){
         	return true;;
	 }
       }
       return false;
     }

    function PlatformMismatchEvent(a) {

        for (var p in a) {
            this[p] = a[p];
        }

        this.toString = function() {
            return "MISMATCH [os=" + this.os + ", browser=" + this.browser
                + ", jre=" + this.jre + ", fx=" + this.fx
                + ", relaunch=" + this.relaunch + ", platform="
                + this.platform + "]";
        };

        this.isUnsupportedPlatform = function() {
            return this.os;
        };

        this.isUnsupportedBrowser = function() {
            return this.browser;
        };

        this.jreStatus = function() {
            return this.jre;
        };

        this.jreInstallerURL = function(locale) {
            if (!this.os && (this.jre == "old" || this.jre == "none")) {
                return getJreUrl(locale);
            }
            return null;
        };

        this.javafxStatus = function() {
            return this.fx;
        };

        this.javafxInstallerURL = function(locale) {
            if (!this.os && (this.fx == "old" || this.fx == "none")) {
                return getFxUrl(locale);
            }
            return null;
        };

        this.canAutoInstall = function() {
            return isAutoInstallEnabled(this.platform, this.jre, this.fx);
        };

        this.isRelaunchNeeded = function() {
            return this.relaunch;
        };
    }

    function getInstalledFXVersion(requestedVersion) {
        if (ua.fx != null && versionCheckFX(requestedVersion, ua.fx)) {
            return ua.fx;
        }
        var p = getPlugin();
        if (notNull(p)) {
            try {
                return p.getInstalledFXVersion(requestedVersion);
            } catch(e) {}
        }
        return null;
    }

    function listToString(lst) {
      if (lst != null) {
          return lst.join(" ");
      } else {
          return null;
      }
    }

    function addArgToList(lst, arg) {
        if (notNull(lst)) {
           lst.push(arg);
           return lst;
        } else {
            var res = [arg];
            return res;
        }
    }

    function doLaunch(ld, platform, cb) {
        var app = normalizeApp(ld, true);
        if(ua.noPluginWebBrowser){
            launchWithJnlpProtocol(app.url);
            return;
	}

        if (!(notNull(app) && notNull(app.url))) {
            throw "Required attribute missing! (application url need to be specified)";
        }

        platform = new dtjava.Platform(platform);

        cb = new dtjava.Callbacks(cb);

        var launchFunc = function() {
            var jvmArgs = notNull(platform.jvmargs) ? platform.jvmargs : null;
            if (notNull(platform.javafx)) {
                var v = getInstalledFXVersion(platform.javafx);
                jvmArgs = addArgToList(jvmArgs, " -Djnlp.fx=" + v);
                if (!notNull(ld.toolkit) || ld.toolkit == "fx") {
                    jvmArgs = addArgToList(jvmArgs, " -Djnlp.tk=jfx");
                }

            }

            if (haveDTLite() && !(ua.linux && ua.chrome)) {
                if (doLaunchUsingDTLite(app, jvmArgs, cb)) {
                    return;
                }
            }
            var p =  getPlugin();
            if (notNull(p)) {
                try {
                    try {
                        if (versionCheck("10.6+", ua.deploy, false)) {
                            var callArgs = {"url":app.url};
                            if (notNull(jvmArgs)) {
                                callArgs["vmargs"] = jvmArgs;
                            }
                            if (notNull(app.params)) {
                                var ptmp = {};
                                for (var k in app.params) {
                                    ptmp[k] = String(app.params[k]);
                                }
                                callArgs["params"] = ptmp;
                            }
                            if (notNull(app.jnlp_content)) {
                                callArgs["jnlp_content"] = app.jnlp_content;
                            }
                            var err = p.launchApp(callArgs);
                            if (err == 0) { //0 - error
                                if (isDef(cb.onRuntimeError)) {
                                    cb.onRuntimeError(app.id);
                                }
                            }
                        } else { 
                            if (!p.launchApp(app.url, app.jnlp_content, listToString(jvmArgs))) {
                                if (isDef(cb.onRuntimeError)) {
                                    cb.onRuntimeError(app.id);
                                }
                            }
                        }
                        return;
                    } catch (ee) { 
                        if (!p.launchApp(app.url, app.jnlp_content)) {
                           if (isDef(cb.onRuntimeError)) {
                              cb.onRuntimeError(app.id);
                           }
                        }
                        return;
                    }
                } catch (e) {
                }
            } 

            var o = getWebstartObject(app.url);
            if (notNull(d.body)) {
                d.body.appendChild(o);
            } else {
                d.write(o.innerHTML);
            }
        }

        var r = doValidateRelaxed(platform);
        if (r != null) {
            resolveAndLaunch(app, platform, r, cb, launchFunc);
        } else {
            launchFunc();
        }
    }

    function reportPlatformError(app, r, cb) {
        if (isDef(cb.onDeployError)) {
            cb.onDeployError(app, r);
        }
    }

    function isDTInitialized(p) {
        return p != null && isDef(p.version);
    }

    function runUsingDT(label, f) {

        var p = getPlugin();
        if (p == null) {
            return; 
        }

        if (isDTInitialized(p)) {
            f(p);
        } else {
            var waitAndUse = null;
            if (!isDef(dtjava.dtPendingCnt) || dtjava.dtPendingCnt == 0) {
                waitAndUse = function () {
                    if (isDTInitialized(p)) {
                        if (notNull(dtjava.dtPending)) {
                            for (var i in dtjava.dtPending) {
                                dtjava.dtPending[i]();
                            }
                        }
                        return;
                    }
                    if (dtjava.dtPendingCnt > 0) {
                        dtjava.dtPendingCnt--;
                        setTimeout(waitAndUse, 500);
                    }
                }
            }
            if (!notNull(dtjava.dtPending) || dtjava.dtPendingCnt == 0) {
                dtjava.dtPending = {};
            }
            dtjava.dtPending[label] = f; 
            dtjava.dtPendingCnt = 1000; 
            if (waitAndUse != null) waitAndUse();
        }
    }

    function resolveAndLaunch(app, platform, v, cb, launchFunction) {
        var p = getPlugin();
        if( p == null && ua.noPluginWebBrowser){
            var readyStateCheck = setInterval(function() {
                    if(document.readyState  == "complete"){
                        clearInterval(readyStateCheck);
                        showMessageBox();
                    }
                }, 15);
            return;
        }
        if (ua.chrome && ua.win && p != null && !isDTInitialized(p)) {
            var actionLabel;
            if (notNull(app.placeholder)) {
                var onClickFunc = function() {w.open("https://www.java.com/en/download/faq/chrome.xml"); return false;};
                var msg1 = "Please give Java permission to run on this browser web page.";
                var msg2 = "Click for more information.";
                var altText = "";
                doShowMessageInTheArea(app, msg1, msg2, altText, "javafx-chrome.png", onClickFunc);
                actionLabel = app.id + "-embed";
            } else {
                v.jre = "blocked";
                reportPlatformError(app, v, cb);
                actionLabel = "launch"; 
            }
            var retryFunc = function() {
                var vnew = doValidateRelaxed(platform);
                if (vnew == null) { 
                    launchFunction();
                } else {
                    resolveAndLaunch(app, platform, vnew, cb, launchFunction);
                }
            };
            runUsingDT(actionLabel, retryFunc);

            return;
        }

        if (!v.isUnsupportedPlatform() && !v.isUnsupportedBrowser()) {  
            if (isMissingComponent(v) && isDef(cb.onInstallNeeded)) {
                var resolveFunc= function() {
                    var vnew = doValidateRelaxed(platform);
                    if (vnew == null) { 
                        launchFunction();
                    } else { 
                        reportPlatformError(app, vnew, cb);

                    }
                };

                cb.onInstallNeeded(app, platform, cb,
                            v.canAutoInstall(), v.isRelaunchNeeded(), resolveFunc);
                return;
            }
        }
        reportPlatformError(app, v, cb);
    }

    function haveDTLite() {
        if (ua.deploy != null && !ua.ie) {
            return versionCheck("10.6+", ua.deploy, false);
        }
        return false;
    }

    function isDTLiteInitialized(p) {
        return p != null && isDef(p.version);
    }

    function getDTLitePlugin() {
        return document.getElementById("dtlite");
    }

    function doInjectDTLite() {
        if (getDTLitePlugin() != null) return;

        var p = document.createElement('embed');
        p.width = '10px';
        p.height = '10px';
        p.id = "dtlite";
        p.type = "application/x-java-applet";  

        var div = document.createElement("div");
        div.style.position = "relative";
        div.style.left = "-10000px";
        div.appendChild(p);

        var e = document.getElementsByTagName("body");
        e[0].appendChild(div);
    }

    function runUsingDTLite(f) {
        var p = getDTLitePlugin();
        if (p == null) {
            doInjectDTLite();
            p = getDTLitePlugin();
        }

        if (isDTLiteInitialized(p)) {
            f(p);
        } else {
            var waitAndUse = null;
            if (!isDef(dtjava.dtlitePendingCnt) || dtjava.dtlitePendingCnt == 0) {
                waitAndUse = function () {
                    if (isDef(p.version)) {
                        if (dtjava.pendingLaunch != null) {
                            dtjava.pendingLaunch(p);
                        }
                        dtjava.pendingLaunch = null;
                        return;
                    }
                    if (dtjava.dtlitePendingCnt > 0) {
                        dtjava.dtlitePendingCnt--;
                        setTimeout(waitAndUse, 500);
                    }
                }
            }
            dtjava.pendingLaunch = f;
            dtjava.dtlitePendingCnt = 1000; 
            if (waitAndUse != null) {
                waitAndUse();
            }
        }
    }

    function doLaunchUsingDTLite(app, jvmargs, cb) {
        var launchIt = function() {
            var pp = getDTLitePlugin();
            if (pp == null) {
                if (isDef(cb.onRuntimeError)) {
                    cb.onRuntimeError(app.id);
                }
            }

            var callArgs = {"url" : app.url};
            if (notNull(jvmargs)) {
               callArgs["vmargs"] = jvmargs;
            }
            if (notNull(app.params)) {
                var ptmp = {};
                for (var k in app.params) {
                    ptmp[k] = String(app.params[k]);
                }
                callArgs["params"] = ptmp;
            }
            if (notNull(app.jnlp_content)) {
               callArgs["jnlp_content"] = app.jnlp_content;
            }
            var err = pp.launchApp(callArgs);
            if (err == 0) { 
                if (isDef(cb.onRuntimeError)) {
                    cb.onRuntimeError(app.id);
                }
            }
        };

        if (versionCheck("10.4+", ua.deploy, false)) {
            runUsingDTLite(launchIt);
            return true;
        }
        return false;
    }

    function getWebstartObject(jnlp) {
        var wo = null;
        if (ua.ie) { 
            wo = d.createElement('object');
            wo.width = '1px'; 
            wo.height = '1px'; 
            var p = d.createElement('param');
            p.name = 'launchjnlp';
            p.value = jnlp;
            wo.appendChild(p);
            p = d.createElement('param');
            p.name = 'docbase';
            p.value = notNull(d.documentURI) ? d.documentURI : d.URL;
            wo.appendChild(p);

            if (!ua.ie) {
                wo.type = "application/x-java-applet;version=1.7";
            } else {
                wo.classid = "clsid:8AD9C840-044E-11D1-B3E9-00805F499D93";
            }
        } else { 
            wo = d.createElement('embed');
            wo.width = '0px';
            wo.height = '0px';
            wo.setAttribute('launchjnlp', jnlp);
            wo.setAttribute('docbase', (notNull(d.documentURI) ? d.documentURI : d.URL));
            wo.type = "application/x-java-applet;version=1.7";
        }

        var div = d.createElement("div");
        div.style.position = "relative";
        div.style.left = "-10000px";
        div.appendChild(wo);
        return div;
    }

    var Match = {
        Exact: {value: 0}, 
        Family: {value: 1},
        Above: {value: 2}  
    };

    var Token = {
        Uninitialized: {value: -2},
        Unknown: {value: -1},
        Identifier: {value: 0},
        Alpha: {value: 1},
        Digits: {value: 2},
        Plus: {value: 3},
        Minus: {value: 4},
        Underbar: {value: 5},
        Star: {value: 6},
        Dot: {value: 7},
        End: {value: 8}
    };

    var Version = function(VersionString, UpgradeFromOldJavaVersion) {
        if (typeof UpgradeFromOldJavaVersion === 'undefined') {
            var UpgradeFromOldJavaVersion = true;
        }

        // Constants
        var MAX_DIGITS = 4;

        // Private
        var FVersionString = null;
        var FOld = false;
        var FVersion = null;
        var FBuild = null;
        var FPre = null;
        var FMatch = null;
        var FMajor = null;
        var FMinor = null;
        var FSecurity = null;
        var FPatch = null;

        // Class constructor
        if (!VersionString) {
            return null;
        }
        else {
            FVersionString = VersionString;
            var v = parseAndSplitVersionString(VersionString, UpgradeFromOldJavaVersion)
            FOld = v.old;
            FVersion = v.version;
            FBuild = v.build;
            FMatch = v.match;
            FPre = v.pre;

            var parts = splitVersion(v.version);
            FMajor = parts.major;
            FMinor = parts.minor;
            FSecurity = parts.security;
            FPatch = parts.patch;
        }

        // Public
        return {
            VersionString: VersionString,
            old: FOld,
            major: FMajor,
            minor: FMinor,
            security: FSecurity,
            patch: FPatch,
            version: FVersion,
            build: FBuild,
            pre: FPre,
            match: FMatch,

            check: function(query) {
                return check(query, this);
            },

            equals: function(query) {
                return equals(query, this);
            }
        };

        function splitVersion(version) {
            var lmajor = null;
            var lminor = null;
            var lsecurity = null;
            var lpatch = null;

            if (version.length >= 1) {
                lmajor = version[0];
            }

            if (version.length >= 2) {
                lminor = version[1];
            }

            if (version.length >= 3) {
                lsecurity = version[2];
            }

            if (version.length >= 4) {
                lpatch = version[3];
            }

            return {
                major: lmajor,
                minor: lminor,
                security: lsecurity,
                patch: lpatch
          };
        }

        function VersionStringTokenizer(versionString) {

            var FVersionString = versionString.toLowerCase().trim();
            var FIndex;
            var FCurrentToken = null;
            var FStack = Array();

            function isDigit(c) {
                var result = false;

                switch(c) {
                    case '0':
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                    case '9':
                        result = true;
                        break;
                }

                return result;
            }

            function isLetter(c) {

                var result = false;
                var lowerBoundLower = "a".charCodeAt(0);
                var upperBoundLower = "z".charCodeAt(0);
                var bound = c.charCodeAt(0);

                if (lowerBoundLower <= bound && bound <= upperBoundLower) {
                    result = true;
                }

                return result;
            }

            function start() {
                FIndex = 0;
            }

            function currentToken() {
                return FCurrentToken;
            }

            function pushToken(Token) {
                if (FCurrentToken != null) {
                    FStack.unshift(FCurrentToken);
                }

                FCurrentToken = Token;
            }

            function nextToken() {
                var tokenID = Token.Uninitialized;
                var token = '';

                if (FStack.length > 0) {
                    tokenID = FStack[0].tokenID;
                    token = FStack[0].token;
                    FStack.shift();
                }
                else {
                    if (FIndex >= FVersionString.length) {
                        tokenID = Token.End;
                    }
                    else {
                        while (FIndex < FVersionString.length) {
                            var c = FVersionString.charAt(FIndex);

                            if ((tokenID == Token.Uninitialized || tokenID == Token.Alpha) &&
                                isLetter(c) == true) {
                                tokenID = Token.Alpha;
                                FIndex++;
                                token += c;
                            }
                            else if ((tokenID == Token.Uninitialized || tokenID == Token.Digits) &&
                                     isDigit(c) == true) {
                                if (parseInt(c) == 0 && parseInt(token) == 0) {
                                    tokenID = Token.Unknown;
                                    token += c;
                                    FIndex++;
                                    break;
                                }
                                else {
                                    tokenID = Token.Digits;
                                    token += c;
                                    FIndex++;
                                }
                            }
                            else if ((tokenID == Token.Alpha || tokenID == Token.Identifier) &&
                                     isDigit(c) == true &&
                                     isLetter(c) == false) {
                                tokenID = Token.Identifier;
                                FIndex++;
                                token += c;
                            }
                            else if (tokenID == Token.Uninitialized) {
                                switch(c) {
                                    case '-':
                                      tokenID = Token.Minus;
                                      FIndex++;
                                      token = c;
                                      break;
                                    case '+':
                                      tokenID = Token.Plus;
                                      FIndex++;
                                      token = c;
                                      break;
                                    case '*':
                                      tokenID = Token.Star;
                                      FIndex++;
                                      token = c;
                                      break;
                                    case '.':
                                      tokenID = Token.Dot;
                                      FIndex++;
                                      token = c;
                                      break;
                                    case '_':
                                      tokenID = Token.Underbar;
                                      FIndex++;
                                      token = c;
                                      break;
                                    default:
                                        tokenID = Token.Unknown;
                                        FIndex++;
                                        break;
                                }

                                break;
                            }
                            else {
                              break;
                            }
                        }
                    }
                }

                FCurrentToken = {
                    token: token,
                    tokenID: tokenID
                }

                return FCurrentToken;
            }

            return {
                start: start,
                nextToken: nextToken,
                pushToken: pushToken,
                currentToken: currentToken,
                isDigit: isDigit,
                isLetter: isLetter
            }
        }

        function VersionStringParser() {
            function readDigits(Tokenizer) {
                var result = new Array();
                var token = Tokenizer.currentToken();

                if (token.tokenID == Token.Digits) {
                    result.push(parseInt(token.token));
                    token = Tokenizer.nextToken();

                    for (var index = 0; index < (MAX_DIGITS - 1); index++) {
                        if (token.tokenID == Token.Dot) {
                            token = Tokenizer.nextToken();

                            if (token.tokenID == Token.Digits) {
                                result.push(parseInt(token.token));
                                token = Tokenizer.nextToken();
                            }
                            else if (token.tokenID == Token.Star ||
                                     token.tokenID == Token.Plus) {
                                break;
                            }
                            else {
                                result = null;
                                break;
                            }
                        }
                        else if (token.tokenID == Token.Star ||
                                 token.tokenID == Token.Plus ||
                                 token.tokenID == Token.End ||
                                 token.tokenID == Token.Minus ||
                                 token.tokenID == Token.Underbar ||
                                 token.tokenID == Token.Identifier ||
                                 (token.tokenID == Token.Alpha && token.token == 'u')) {
                            break;
                        }
                        else {
                            result = null;
                            break;
                        }
                    }
                }

                return result;
            }

            function readMatch(Tokenizer, Old) {
                var result = Match.Exact;
                var token = Tokenizer.currentToken();

                if (token.tokenID == Token.Dot) {
                    token = Tokenizer.nextToken();

                    if (token.tokenID == Token.Star) {
                        result = Match.Family;
                        Tokenizer.nextToken();
                    }
                    else if (token.tokenID == Token.Plus) {
                        result = Match.Above;
                        Tokenizer.nextToken();
                    }
                }
                else if (token.tokenID == Token.Star) {
                    result = Match.Family;
                    Tokenizer.nextToken();
                }
                else if (token.tokenID == Token.Plus) {
                    result = Match.Above;
                    Tokenizer.nextToken();
                }

                return result;
            }

            function readPre(Tokenizer) {
                var result = null;
                var token = Tokenizer.currentToken();

                if (token.tokenID == Token.Minus) {
                    var savedToken = token;
                    var token = Tokenizer.nextToken();

                    if (token.tokenID == Token.Alpha) {
                        result = token.token;
                        Tokenizer.nextToken();
                    }
                    else {
                        Tokenizer.pushToken(savedToken);
                    }
                }

                return result;
            }

            function readBuild(Tokenizer, Old) {
                var result = null;
                var token = Tokenizer.currentToken();

                if (token.tokenID == Token.Plus) {
                    var savedToken = token;
                    var token = Tokenizer.nextToken();

                    if (token.tokenID == Token.Digits) {
                        result = parseInt(token.token);
                        Tokenizer.nextToken();
                    }
                    else {
                        Tokenizer.pushToken(savedToken);
                    }
                }
                else if (Old == true) {
                    if (token.tokenID == Token.Minus || token.tokenID == Token.Underbar) {
                        var savedToken = token;
                        token = Tokenizer.nextToken();

                        if (token.tokenID == Token.Identifier && token.token[0] == 'b') {
                            var builderNumber = parseInt(token.token.substr(1));

                            if (builderNumber != null && isNaN(builderNumber) == false) {
                                Tokenizer.nextToken();
                                result = builderNumber;
                            }
                        }
                        else {
                            Tokenizer.pushToken(savedToken);
                        }
                    }
                }

                return result;
            }

            function isOldUpdate(version, token) {
                var result = false;

                if (version.length == 1 &&
                    parseInt(version[0]) <= 8 &&
                    token.tokenID == Token.Identifier &&
                    token.token.length > 0 &&
                    token.token.charAt(0) == "u") {
                    result = true;
                }

                return result;
            }

            function readOldUpdate(Tokenizer) {
                var result = null;
                var token = Tokenizer.currentToken();

                if (token.tokenID == Token.Identifier) {
                    result = parseInt(token.token.substr(1));
                    Tokenizer.nextToken();
                }
                else if (token.tokenID == Token.Star) {
                    lmatch = Match.Family;
                    Tokenizer.nextToken();
                }
                else if (token.tokenID == Token.Plus) {
                    lmatch = Match.Above;
                    Tokenizer.nextToken();
                }

                return result;
            }

            function readOpt(Tokenizer) {
                var result = null;
                var token = Tokenizer.currentToken();

                if (token.tokenID == Token.Alpha) {
                    result = token.token;
                    Tokenizer.nextToken();
                }

                return result;
            }

            function parse(Tokenizer) {
                var result = null;
                var success = false;

                var lold = false;
                var lversion = null;
                var lbuild = null;
                var lmatch = Match.Exact;
                var lpre = false;
                var lopt = null;

                Tokenizer.start();
                var token = Tokenizer.nextToken();

                if (token.tokenID == Token.Digits) {
                    lversion = readDigits(Tokenizer);

                    if (lversion != null && lversion.length > 0) {
                        token = Tokenizer.currentToken();

                        if (lversion[0] == 1) {
                            if (lversion.length >= 2 && lversion[1] == 9) {
                                return null;
                            }

                            lold = true;
                        }
                        else if (token.token == "u") {
                            token = Tokenizer.nextToken();
                        }

                        if (isOldUpdate(lversion, token) == true) {
                            lold = true;
                            var value = readOldUpdate(Tokenizer);

                            if (value != null) {
                                token = Tokenizer.currentToken();
                                lversion.push(parseInt(value));
                                lold = true;

                                if (token.tokenID == Token.End) {
                                    success = true;
                                }
                                else {
                                    lmatch = readMatch(Tokenizer);
                                    token = Tokenizer.currentToken();

                                    if (token.tokenID == Token.End) {
                                        success = true;
                                    }
                                }
                            }
                        }
                        else {
                            token = Tokenizer.currentToken();

                            if (lold == true && token.tokenID == Token.Underbar) {
                                token = Tokenizer.nextToken();

                                if (token.tokenID == Token.Digits && lversion.length < MAX_DIGITS) {
                                    lversion.push(parseInt(token.token));
                                    Tokenizer.nextToken();
                                }
                            }

                            lpre = readPre(Tokenizer);
                            token = Tokenizer.currentToken();

                            lbuild = readBuild(Tokenizer, lold);
                            lopt = readOpt(Tokenizer);
                            lmatch = readMatch(Tokenizer, lold);
                            token = Tokenizer.currentToken();

                            if (token.tokenID == Token.End) {
                                success = true;
                            }
                        }

                        if (success == true) {
                            result = {
                                old: lold,
                                version: lversion,
                                build: lbuild,
                                match: lmatch,
                                pre: lpre,
                                opt: lopt
                            };
                        }
                    }
                }

                return result;
            }

            return {
                parse: parse
            }
        }

        function parseAndSplitVersionString(versionString, UpgradeFromOldJavaVersion) {
            var lold = false;
            var lversion = new Array;
            var lbuild = null;
            var lmatch = null;
            var lpre = false;
            var lopt = null;

            if (versionString == null || versionString.length == 0) {
                lversion = [0, 0, 0, 0];
            }
            else {
                var tokenizer = VersionStringTokenizer(versionString);
                var parser = VersionStringParser();
                var result = parser.parse(tokenizer);

                if (result != null) {
                    if (UpgradeFromOldJavaVersion == true &&
                        result.old == true) {
                        if (result.version.length > 0 &&
                            result.version[0] == 1) {
                            lversion = result.version.splice(1, result.version.length - 1);
                        }
                        else {
                            lversion = result.version;
                        }

                        lold = true;
                    }
                    else {
                        lversion = result.version;
                    }

                    lbuild = result.build;
                    lmatch = result.match;
                    lpre = result.pre;
                }
            }

            return {
                old: lold,
                version: lversion,
                build: lbuild,
                match: lmatch,
                pre: lpre,
                opt: lopt
            };
        }

        function sameVersion(query, version) {
            var result = false;
            var lquery = query;

            if (lquery == null)
                lquery = 0;

            if (parseInt(lquery) == parseInt(version)) {
                result = true;
            }

            return result;
        }

        function compareVersionExact(query, version) {
            var result = false;

            if ((query.major != null) &&
                (version.major != null) &&
                sameVersion(query.major, version.major) &&
                sameVersion(query.minor, version.minor) &&
                sameVersion(query.security, version.security) &&
                sameVersion(query.patch, version.patch) &&
                (query.old == version.old) &&
                (query.pre == version.pre) &&
                ((parseInt(query.build) == parseInt(version.build)) || (query.build == null && version.build == null))) {
                result = true;
            }

            return result;
        }

        function compareVersionFamily(query, version) {
            var result = false;

            if (query.old == true && query.version.length == 0 && version.old == true) {
                result = true;
            }
            else {
                for (index = 0 ;index < query.version.length && index < version.version.length;
                     index++) {
                    var q = query.version[index];
                    var v = version.version[index];

                    if (parseInt(q) == parseInt(v)) {
                        result = true;
                    }
                    else {
                        result = false;
                        break;
                    }
                }
            }

            return result;
        }

        function compareVersionAbove(query, version) {
            var result = false;

            if (query.old == true && query.version.length == 0) {
                result = true;
            }
            else if (query.old == true && version.old == false) {
                result = true;
            }
            else if (query.major == 0) {
                result = true;
            }
            else if ((query.major != null) &&
                (version.major != null) &&
                ((parseInt(query.build) == parseInt(version.build)) || (query.build == null && version.build == null))) {

                for (var index = 0; index < query.version.length; index++) {
                    var q = query.version[index];
                    var v = version.version[index];

                    if (parseInt(q) == parseInt(v)) {
                        result = true;
                    }
                    else if (parseInt(q) < parseInt(v)) {
                        if ((query.old == true && version.old == true) ||
                            (query.old == false && version.old == false)) {
                            result = true;
                        }

                        break;
                    }
                    else {
                        result = false;
                        break;
                    }
                }
            }

            return result;
        }

        function cloneAndCompleteVersionInfo(version) {
            var clone_version = version.version.slice(0);

            for (var index = clone_version.length; index < 4 ; index++) {
                clone_version.push(0);
            }

            var parts = splitVersion(clone_version);

            return {
                old: version.old,
                major: parts.major,
                minor: parts.minor,
                security: parts.security,
                patch: parts.patch,
                version: clone_version,
                build: version.build,
                pre: version.pre
            };
        }

        function check(query, version) {
            var result = false;

            if (query.VersionString == null || query.VersionString.length == 0) {
                result = true;
            }
            else {
                if (query.build == null && version.build == null) {
                    var lversion = cloneAndCompleteVersionInfo(version);

                    if (query.match == Match.Exact) {
                        result = compareVersionExact(query, lversion);
                    }
                    else if (query.match == Match.Family) {
                        result = compareVersionFamily(query, lversion);
                    }
                    else if (query.match == Match.Above) {
                        result = compareVersionAbove(query, lversion);
                    }
                }
            }

            return result;
        }
        function equals(value, version) {
            var result = false;

            if (query.VersionString == null || query.VersionString.length == 0) {
                result = true;
            }
            else {
                var lversion = cloneAndCompleteVersionInfo(version);
                var lquery = cloneAndCompleteVersionInfo(query);
                result = compareVersionExact(lquery, lversion);
            }

            return result;
        }
    };

    function versionCheck(query, version, UpgradeFromOldJavaVersion) {
        var q = new Version(query, UpgradeFromOldJavaVersion);
        var v = new Version(version, UpgradeFromOldJavaVersion);
        return v.check(q);
    }

    function versionCheckFX(query, version) {
        var q = new Version(query, false);

        if (parseInt(q.major) >= 3 && parseInt(q.major) <= 7 && query.substr(-1) !== "+") {
            return false;
        }

        if (q.match == Match.Exact) {
            q = new Version(query + "+", false);
        }

        var v = new Version(version, false);

        return v.check(q);
    }

    function doublecheckJrePresence() {
        if (!haveDTLite()) { 
          if (postponeNativePluginInstallation && notNull(d.body)) {
              installNativePlugin();
              postponeNativePluginInstallation = false;
          }
          var p = getPlugin();
          if (p != null) {
            return true;
          }

          return false;
        }

        return true;
    }

    function jreCheck(jre) {
        if (ua.jre != null) {
            if (versionCheck(jre, ua.jre)) {
               return "ok";
            }
        }

        var p = getPlugin();
        if (p != null) {
            var VMs = p.jvms;
            for (var i = 0; VMs != null && i < VMs.getLength(); i++) {
                if (versionCheck(jre, VMs.get(i).version)) {
                    if (!ua.ie && notNull(navigator.mimeTypes)) {
                        if (!notNull(navigator.mimeTypes["application/x-java-applet"])) {
                            return "disabled";
                        }
                    }
                    return "ok";
                }
            }
            return "none";
        }

        if (ua.ie) {
            var lst = ["1.8.0", "1.7.0", "1.6.0", "1.5.0"];
            for (var v = 0; v < lst.length; v++) {
                if (versionCheck(jre, lst[v])) {
                    try {
                        var axo = new ActiveXObject("JavaWebStart.isInstalled." + lst[v] + ".0");
                        return "ok";
                    } catch (ignored) {
                    }
                }
            }
        }


        return "none";
    }

    function checkJRESupport() {
        var osProblem = ['iPhone', 'iPod'];
        var os = containsAny(osProblem, navigator.userAgent);

        var browser = (ua.mac && ua.chrome && ua.cputype == "intel");

        auto = os || (getPlugin() != null);

        return {os: os, browser: browser, auto: auto};
    }

    function isUnsupportedVersionOfIE() {
        if (ua.ie) {
            try {
              var v = 10*ScriptEngineMajorVersion() + ScriptEngineMinorVersion();
              if (v < 57) return true;
            } catch (err) {
                return true;
            }
        }
        return false;
    }

    function checkFXSupport() {
        var browser;
        if (ua.win) {
            browser = ua.op || ua.wk || isUnsupportedVersionOfIE();

            return {os: false, browser: browser};
        } else if (ua.mac && ua.cputype == "intel") { 
            var os = !versionCheck("10.7.3+", ua.osVersion, false); 
            browser = ua.op ||
                (ua.mac && ua.chrome);

            return {os: os, browser: browser};
        } else if (ua.linux) {
            browser = ua.op; 
            return {os: false, browser: browser};
        } else {
            return {os: true, browser: false};
        }
    }

    function relaxVersion(v) {
        if (notNull(v) && v.length > 0) {
            var c = v.charAt(v.length - 1);
            if (c == '*') {
              v = v.substring(0, v.length - 1)+"+";
            } else if (c != '+') { 
                v = v + "+";
            }
        }
        return v;
    }

    function doValidateRelaxed(platform) {
        var p = new dtjava.Platform(platform);

        p.jvm = relaxVersion(p.jvm);

        return doValidate(p);
    }

    function doValidate(platform, noPluginWebBrowser) {
        platform = new dtjava.Platform(platform);

        var fx = "ok", jre = "ok", restart = false, os = false, browser = false,
            p, details;

        if (notNull(platform.jvm) && jreCheck(platform.jvm) != "ok") {
            var res = jreCheck("1+");
            if (res == "ok") {
                jre = "old";
            } else {
                jre = res;
            }

            details = checkJRESupport();
            if (details.os) {
                jre = "unsupported";
                os = true;
            } else if(noPluginWebBrowser) {
		jre = "ok";
	    } else {
                browser = details.browser;
            }
        }

        if (notNull(platform.javafx)) {
            details = checkFXSupport();
            if (details.os) { 
                fx = "unsupported";
                os = os || details.os;
            } else if(noPluginWebBrowser) {
                fx = "ok";
	    } else if( details.browser) {
                browser = browser || details.browser;
            } else {

                if (ua.fx != null) {
                  if (versionCheckFX(platform.javafx, ua.fx)) {
                        fx = "ok";
                  } else if (versionCheckFX("2.0+", ua.fx)) {
                        fx = "old";
                  }
                } else if (ua.win) {
                  try {
                    p = getPlugin();
                    var v = p.getInstalledFXVersion(platform.javafx);
                    if (v == "" || v == null) {
                        v = p.getInstalledFXVersion(platform.javafx + '+');
                    }
                    if (v == "" || v == null) {
                        v = p.getInstalledFXVersion("2.0+"); 
                        if (v == null || v == "") {
                            fx = "none";
                        } else {
                            fx = "old";
                        }
                    }
                  } catch(err) {
                    fx = "none";
                  }
                } else if (ua.mac || ua.linux) {
                    fx = "none";
                }
            }
        }

        restart = restart || (!os && browser);

        if (fx != "ok" || jre != "ok" || restart || os || browser) {
            return new PlatformMismatchEvent(
                {fx: fx, jre: jre, relaunch: restart, os: os, browser: browser,
                    platform: platform});
        } else {
            if (ua.override == false && !noPluginWebBrowser && !doublecheckJrePresence()) {
               return new PlatformMismatchEvent(
                 {fx: fx, jre: "none", relaunch: restart, os: os,
                     browser: browser, platform: platform});
            }
        }

        return null;
    }

    function guessLocale() {
        var loc = null;

        loc = navigator.userLanguage;
        if (loc == null)
            loc = navigator.systemLanguage;
        if (loc == null)
            loc = navigator.language;

        if (loc != null) {
            loc = loc.replace("-", "_")
        }
        return loc;
    }

    function getJreUrl(loc) {
        if (!notNull(loc)) {
            loc = guessLocale();
        }
        return 'https://java.com/dt-redirect?' +
            ((notNull(window.location) && notNull(window.location.href)) ?
                ('&returnPage=' + window.location.href) : '') +
            (notNull(loc) ? ('&locale=' + loc) : '');
    }

    function getFxUrl(locale) {
        return "http://www.oracle.com/technetwork/java/javafx/downloads/index.html";
    }

    function isMissingComponent(v) {
        if (v != null) {
            var jre = v.jreStatus();
            var fx = v.javafxStatus();
            return (jre == "none" || fx == "none" || jre == "old" || fx == "old")
               && (fx != "disabled" && jre != "disabled");
        }
        return false;
    }

    function showClickToInstall(ld, isJRE, isUpgrade, isAutoinstall, isRelaunchNeeded, actionFunc) {
        var productName, productLabel;
        if (isJRE) {
            productName = "Java";
            productLabel = "java";
        } else {
            productName = "JavaFX";
            productLabel = "javafx";
        }

        var msg1, msg2, imgName;
        if (isUpgrade) {
            msg1 = "A newer version of " + productName + "is required to view the content on this page.";
            msg2 = "Please click here to update " + productName;
            imgName = "upgrade_"+productLabel+".png";
        } else {
            msg1 = "View the content on this page.";
            msg2 = "Please click here to install " + productName;
            imgName = "get_"+productLabel+".png";
        }
        var altText = "Click to install "+productName;

        doShowMessageInTheArea(ld, msg1, msg2, altText, imgName, actionFunc);
    }

    function doShowMessageInTheArea(ld, msg1, msg2, altText, imgName, actionFunc) {
        var r = d.createElement("div");
        r.width = normalizeDimension(ld.width);
        r.height = normalizeDimension(ld.height);

        var lnk = d.createElement("a");
        lnk.href="";
        lnk.onclick = function() {actionFunc(); return false;};
        if (ld.width < 250 || ld.height < 160) { 
            r.appendChild(
               d.createElement("p").appendChild(
                  d.createTextNode(msg1)));
            lnk.appendChild(d.createTextNode(msg2));
            r.appendChild(lnk);
        } else {
            var img = d.createElement("img");
            img.src = jscodebase + imgName;
            img.alt = altText;
            img.style.borderWidth="0px";
            img.style.borderStyle="none";
            lnk.appendChild(img);
            r.appendChild(lnk);
        }
        wipe(ld.placeholder);
        ld.placeholder.appendChild(r);
    }

    function canJavaFXCoBundleSatisfy(platform) {
        if (versionCheck(platform.jvm, minJRECobundleVersion, false) &&
            versionCheckFX(platform.javafx, "2.2.0")) {
            return true;
        }
        return false;
    }

    function defaultInstallHandler(app, platform, cb,
                                   isAutoinstall, needRelaunch, launchFunc) {
        var installFunc = function() {
            doInstall(app, platform, cb, launchFunc);
        };

        var s = doValidate(platform);
        if (!notNull(s)) { 
            if (notNull(launchFunc)) {
                launchFunc();
            }
        }

        var isUpgrade = notNull(s) && (s.javafxStatus() == "old" || s.jreStatus() == "old");
        if (notNull(app.placeholder)) { 
            if (canJavaFXCoBundleSatisfy(platform)) { 
               showClickToInstall(app, true, isUpgrade, isAutoinstall, needRelaunch, installFunc);
            } else {
               showClickToInstall(app, (s.jreStatus() != "ok"), isUpgrade, isAutoinstall, needRelaunch, installFunc);
            }
        } else { 
          var r = isAutoinstall;
          var msg = null;
          if (!r) {
             if (canJavaFXCoBundleSatisfy(platform)) { 
                 if (isUpgrade) {
                     msg = "A newer version of Java is required to view the content on this page. Please click here to update Java.";
                 } else {
                     msg = "To view the content on this page, please click here to install Java.";
                 }
                 r = confirm(msg);
             } else {
                 if (isUpgrade) {
                     msg = "A newer version of JavaFX is required to view the content on this page. Please click here to update JavaFX.";
                 } else {
                     msg = "To view the content on this page, please click here to install JavaFX.";
                 }
                 r = confirm(msg);
             }
          }
          if (r)
             installFunc();
        }
    }

    function enableWithoutCertMisMatchWorkaround(requestedJREVersion) {

       if (!ua.ie) return true;

       if (versionCheck("10.0.0+", getPlugin().version, false)) {
          return true;
       }


       if (requestedJREVersion  == null) {
          return false;
       }

       return !versionCheck("1.6.0_33+", requestedJREVersion);
    }

    function isAutoInstallEnabled(platform, jre, fx) {
       if (!ua.win) return false;

       var p = getPlugin();
       if (p == null || !isDef(p.version)) return false;

       if (jre != "ok") {
           if (!enableWithoutCertMisMatchWorkaround(platform.jvm)) {
               return false;
           }
       }

       if (fx != "ok") {
            if (!canJavaFXCoBundleSatisfy(platform)) {
                if (!versionCheck("10.0.0+", getPlugin().version, false)) {
                    return false;
                }
            } else {
                if (!enableWithoutCertMisMatchWorkaround(minJRECobundleVersion)) {
                    return false;
                }
            }
        }
        return true;
    }

    function doInstall(app, platform, cb, postInstallFunc) {
        var s = doValidate(platform);

        cb = new dtjava.Callbacks(cb);

        if (notNull(s) && s.isUnsupportedPlatform()) {
            reportPlatformError(app, s, cb);
            return false; //no install
        }

        var placeholder = (app != null) ? app.placeholder : null;

        var codes, status;
        if (isMissingComponent(s)) { 
            if (s.jre != "ok") {
                if (isDef(cb.onInstallStarted)) {
                    cb.onInstallStarted(placeholder, "Java",
                                        false, getPlugin() != null);
                }
                startManualJREInstall();
            } else { 
              reportPlatformError(app, s, cb);
            }
        } else {
            if (postInstallFunc != null) {
                postInstallFunc();
            }
            return true;
        }
        return false;
    }

    function startManualJREInstall() {
        w.open(getJreUrl());
    }

    function startManualFXInstall() {
        w.open(javafxURL);
    }

    function defaultGetSplashHandler(ld) {
        if (ld.placeholder != null) {
            var _w = ld.width, _h = ld.height;
            var isBig = !(_w < 100 && _h < 100);
            var iU = isBig ? 'javafx-loading-100x100.gif' : 'javafx-loading-25x25.gif';
            var iW = isBig ? 80 : 25;
            var iH = isBig ? 80 : 25;

            var img = d.createElement("img");
            img.src = jscodebase + iU;
            img.alt = "";
            img.style.position = "relative";
            img.style.top = "50%";
            img.style.left = "50%";
            img.style.marginTop =  normalizeDimension(-iH/2);
            img.style.marginLeft = normalizeDimension(-iW/2);

            return img;
        } else {
            return null;
        }
    }

    function defaultGetNoPluginMessageHandler(app) {
        if (app.placeholder != null) {
            var p = d.createElement("p");
            p.appendChild(d.createTextNode("FIXME - add real message!"));
            return p;
        } 
        return null;
    }

    function wipe(c) {
        while(c.hasChildNodes()) c.removeChild(c.firstChild);
    }

    function defaultInstallStartedHandler(placeholder, component, isAuto, restartNeeded) {
        if (placeholder != null) {
            var code = null;
            if (isAuto) {
                code = (component == "JavaFX") ?
                    "install:inprogress:javafx": "install:inprogress:jre";
            } else {
                code = (component == "JavaFX") ?
                    "install:inprogress:javafx:manual" : "install:inprogress:jre:manual";
            }

            appletInfoMsg(code);
        }
    }

    function defaultInstallFinishedHandler(placeholder, component, status, relaunch) {
        var t;
        if (status != "success") {
            var msg = null;
            if (component == "javafx") {
                if (!doublecheckJrePresence()) { 
                    msg = "install:fx:error:nojre";
                } else {
                    msg = "install:fx:"+status;
                }
            } else { 
                msg = "install:jre:"+status;
            }
            if (placeholder != null) {
                t = appletErrorMsg(msg, null);

                wipe(placeholder);
                placeholder.appendChild(t);
            } else {
                w.alert(webstartErrorMsg(msg));
            }
        } else { 
            if (relaunch) {
                t = appletInfoMsg("install:fx:restart");

                wipe(placeholder);
                placeholder.appendChild(t);
            }
        }
    }

    function defaultDeployErrorHandler(app, r) {
        if (r == null) {
            code = "success";
        } else if (r.isUnsupportedBrowser()) {
            code = "browser";
        } else if (r.jreStatus() != "ok") {
            code = "jre:" + r.jreStatus();
        } else if (r.javafxStatus() != "ok") {
            code = "javafx:" + r.javafxStatus();
        } else if (r.isRelaunchNeeded()) {
            code = "relaunch";
        } else {
            code = "unknown " + r.toString();
        }

        if (app.placeholder != null) {
            showAppletError(app.id, code, null);
        } else { 
            w.alert(webstartErrorMsg(code));
        }
    }

    function defaultRuntimeErrorHandler(id) {
        var el_applet = findAppletDiv(id);

        if (getErrorDiv(id) != null) {
            showAppletError(id, "launch:fx:generic:embedded",
                function() {showHideApplet(findAppletDiv(id), false); return false;});
        } else {
            w.alert(webstartErrorMsg("launch:fx:generic"));
        }
    }

    function getPlugin() {
        var result = null;

        if (ua.override == false) {
            navigator.plugins.refresh(false);
            result = document.getElementById('dtjavaPlugin');
        }

        return result;
    }

    function installNativePlugin() {
        if (getPlugin() != null) return;

        if (!notNull(d.body) && !cbDone) {
            addOnDomReadyInternal(function() {
                installNativePlugin();
            });
            postponeNativePluginInstallation = true;
            return;
        }

        var p = null;
        if (ua.ie) {
            p = d.createElement('object');
            p.width  = '1px';
            p.height = '1px';
            p.classid = 'clsid:CAFEEFAC-DEC7-0000-0001-ABCDEFFEDCBA';
        } else {
            if (!ua.wk && !ua.op && navigator.mimeTypes != null) {
                var mimeType = 'application/java-deployment-toolkit';
                var newDT = false;
                for (var i = 0; i < navigator.mimeTypes.length; i++) {
                    var mt = navigator.mimeTypes[i];
                    newDT = newDT || ((mt.type == mimeType) && mt.enabledPlugin);
                }
                if (newDT) {
                    p = d.createElement('embed');
                    p.setAttribute('type', newDT ? mimeType : oldMimeType);
                    p.setAttribute('hidden', 'true');
                }
            }
        }
        if (p != null) {
            p.setAttribute('id', 'dtjavaPlugin');
            d.body.appendChild(p);

            if (ua.deploy == null && isDef(p.version)) {
                ua.deploy = p.version;
            }
        }
    }

    var appletCounter = 0;

    function prepareAppletID(ld) {
        if (notNull(ld.id)) {
            return ld.id;
        } else {
            appletCounter++;
            return ("dtjava-app-" + appletCounter);
        }
    }

    function getAppletSnippet(ld, platform, cb) {
        var wrapper = d.createElement("div");
        wrapper.width = normalizeDimension(ld.width);
        wrapper.height = normalizeDimension(ld.height);
        wrapper.id = ld.id + "-app";
        wrapper.style.position = "relative";

        var r = d.createElement("applet");

        r.code = "dummy.class";
        r.id = ld.id;
        r.width = normalizeDimension(ld.width);
        r.height = normalizeDimension(ld.height);

        var sparams = {"jnlp_href" : ld.url,
            "java_status_events" : true,
            "type" : "application/x-java-applet"};

        if (notNull(ld.jnlp_content)) {
            sparams['jnlp_embedded'] = ld.jnlp_content;
        }
        if (notNull(platform.javafx)) {
            if (!notNull(ld.toolkit) || ld.toolkit == "fx") {
               sparams["javafx_version"] = ((platform.javafx == "*") ? "2.0+" : platform.javafx);
            }
            sparams["separate_jvm"] = true;
            sparams["javafx_applet_id"] = r.id;
            sparams["scriptable"] = true;
        } else {
            if (ld.scriptable) {
                sparams["scriptable"] = true;
            }
            if (ld.sharedjvm) {
                sparams["separate_jvm"] = true;
            }
        }
        if (notNull(platform.jvmargs)) {
            sparams["java_arguments"] = platform.jvmargs;
        }

        var key, p;
        for (key in ld.params) {
            if (!notNull(sparams[key])) {
                p = d.createElement("param");
                p.name = key;
                p.value = ld.params[key];
                r.appendChild(p);
            }
        }
        for (key in sparams) {
            p = d.createElement("param");
            p.name = key;
            p.value = sparams[key];
            r.appendChild(p);
        }

        if (isDef(cb.onGetNoPluginMessage)) {
            p = d.createElement("noapplet");
            var t = cb.onGetNoPluginMessage(ld);
            p.appendChild(t);
        }

        wrapper.appendChild(r);
        return wrapper;
    }

    function findAppletDiv(id) {
        var el = d.getElementById(id + "-app");
        if (el == null) { 
            el = d.getElementById(id);
        }
        return el;
    }

    function showHideApplet(div, hide) {
        if (!notNull(div)) return;
        if (hide) {
            div.style.left = -10000;
        } else {
            div.style.left = "0px";
        }
    }

    function showHideDiv(div, hide) {
        if (!notNull(div)) return;
        if (hide) {
            div.style.visibility = "hidden";
        } else {
            div.style.visibility = "visible";
        }
    }

    function doHideSplash(id) {
        try {
            var errPane = getErrorDiv(id);
            if (errPane != null && errPane.style != null && errPane.style.visibility == "visible") {
                return;
            }

            var el = findAppletDiv(id);
            showHideApplet(el, false);

            showHideDiv(d.getElementById(id + "-splash"), true);
        } catch(err) {}
    }

    var javafxURL = "https://java.com/javafx";

    var errorMessages = {
        "launch:fx:generic" : ["JavaFX application could not launch due to system configuration.",
            " See ", "a", "https://java.com/javafx", "java.com/javafx",
            " for troubleshooting information."],
        "launch:fx:generic:embedded" : ["JavaFX application could not launch due to system configuration ",
            "(", "onclick", "show error details", ").",
            " See ", "a", "https://java.com/javafx", "java.com/javafx",
            " for troubleshooting information."],
        "install:fx:restart" : ["Restart your browser to complete the JavaFX installation,",
            " then return to this page."],
        "install:fx:error:generic" : ["JavaFX install not completed.",
            " See ", "a", "https://java.com/javafx", "java.com/javafx",
            " for troubleshooting information."],
        "install:fx:error:download" : ["JavaFX install could not start because of a download error.",
            " See ", "a", "https://java.com/javafx", "java.com/javafx",
            " for troubleshooting information."],
        "install:fx:error:cancelled" : ["JavaFX install was cancelled.",
            " Reload the page and click on the download button to try again."],
        "install:jre:error:cancelled" : ["Java install was cancelled.",
            " Reload the page and click on the download button to try again."],
        "install:jre:error:generic" : ["Java install not completed.",
            " See ", "a", "https://java.com/", "java.com",
            " for troubleshooting information."],
        "install:jre:error:download" : ["Java install could not start because of a download error.",
            " See ", "a", "https://java.com/", "java.com/",
            " for troubleshooting information."],
        "install:inprogress:jre" : ["Java install in progress."],
        "install:inprogress:javafx" : ["JavaFX install in progress."],
        "install:inprogress:javafx:manual" : ["Please download and run JavaFX Setup from ",
            "a", getFxUrl(null), "java.com/javafx",
            ". When complete, restart your browser to finish the installation,",
            " then return to this page."],
        "install:inprogress:jre:manual" : ["Please download and run Java Setup from ",
            "a", getJreUrl(), "java.com/download",
            ". When complete, reload the page."],
        "install:fx:error:nojre" : ["b", "Installation failed.", "br",
            "Java Runtime is required to install JavaFX and view this content. ",
            "a", getJreUrl(), "Download Java Runtime",
            " and run the installer. Then reload the page to install JavaFX."],
        "browser":    [ 'Content can not be displayed using your Web browser. Please open this page using another browser.'],
        "jre:none":    [ 'JavaFX application requires a recent Java runtime. Please download and install the latest JRE from ',
            'a', 'https://java.com', "java.com", '.'],
        "jre:old" :    [ 'JavaFX application requires a recent Java runtime. Please download and install the latest JRE from ',
            'a', 'https://java.com', "java.com", '.'],
        "jre:plugin":  ['b', "A Java plugin is required to view this content.", 'br',
            "Make sure that ", "a", 'https://java.com', "a recent Java runtime",
            " is installed, and the Java plugin is enabled."],
        "jre:blocked": ["Please give Java permission to run. This will allow Java to present content provided on this page."],
        "jre:unsupported": ["b", "Java is required to view this content but Java is currently unsupported on this platform.",
            "br", "Please consult ", "a", "https://java.com", "the Java documentation",
            " for list of supported platforms."],
        "jre:browser" : ["b", "Java plugin is required to view this content but Java plugin is currently unsupported in this browser.",
            "br", "Please try to launch this application using other browser. Please consult ",
            "a", "https://java.com", "the Java documentation",
            " for list of supported browsers for your OS."],
        "javafx:unsupported" : ["b", "JavaFX 2.0 is required to view this content but JavaFX is currently unsupported on this platform.",
            "br", "Please consult ", "a", javafxURL, "the JavaFX documentation",
            " for list of supported platforms."],
        "javafx:old" :    [ 'This application requires newer version of JavaFX runtime. ',
            'Please download and install the latest JavaFX Runtime from ',
            'a', javafxURL, "java.com/javafx", '.'],
        "javafx:none" : ["b", "JavaFX 2.0 is required to view this content.",
            "br", "a", javafxURL, "Get the JavaFX runtime from java.com/javafx",
            " and run the installer. Then restart the browser."],
        "javafx:disabled" : ["JavaFX is disabled. Please open Java Control Panel, switch to Advanced tab and enable it. ",
            "Then restart the browser."],
        "jre:oldplugin" : ["New generation Java plugin is required to view this content." +
                " Please open Java Control Panel and enable New Generation Java Plugin."],
        "jre:disabled" : ["Java plugin appear to be disabled in your browser. ",
                " Please enable Java in the browser options."]
    };

    function msgAsDOM(lst, extra, onClickFunc) {
        var i = 0;
        var root = d.createElement("p");

        if (extra != null) {
            root.appendChild(extra);
        }
        var el;
        while (i < lst.length) {
            switch (lst[i]) {
                case "a":
                    el = d.createElement(lst[i]);
                    el.href = lst[i + 1];
                    el.appendChild(d.createTextNode(lst[i + 2]));
                    i = i + 2;
                    break;
                case "br":
                    el = d.createElement(lst[i]);
                    break;
                case "b":
                    el = d.createElement(lst[i]);
                    el.appendChild(d.createTextNode(lst[i + 1]));
                    i++;
                    break;
                case "onclick":
                    el = d.createElement("a");
                    el.href = "";
                    if (onClickFunc == null) {
                       onClickFunc = function() {return false;}
                    }
                    el.onclick = onClickFunc;
                    el.appendChild(d.createTextNode(lst[i + 1]));
                    i = i + 1;
                    break;
                default:
                    el = d.createTextNode(lst[i]);
                    break;
            }
            root.appendChild(el);
            i++;
        }
        return root;
    }

    function webstartErrorMsg(code) {
        var m = "";
        var lst = errorMessages[code];
        var i = 0;
        if (notNull(lst)) {
          while (i < lst.length) {
              if (lst[i] != 'a' && lst[i] != 'br' && lst[i] != 'b') {
                  m += lst[i];
              } else if (lst[i] == 'a') { 
                  i++;
              }
              i++;
          }
        } else {
            m = "Unknown error: ["+code+"]";
        }
        return m;
    }

    function getErrorDiv(id) {
        return d.getElementById(id + "-error");
    }

    function showAppletError(id, code, onclickFunc) {
        var pane = getErrorDiv(id);

        if (!notNull(pane)) { 
            return;
        }
        wipe(pane);

        pane.appendChild(appletErrorMsg(code, onclickFunc));
        pane.style.visibility = "visible";

        showHideDiv(d.getElementById(id+"-splash"), true);
        showHideApplet(findAppletDiv(id), true);
    }

    function appletErrorMsg(code, onclickFunc) {
        var out = d.createElement("div");
        var img = d.createElement("img");
        img.src = jscodebase + 'error.png';
        img.width = '16px';
        img.height = '16px';
        img.alt = "";
        img.style.cssFloat = "left";
        img.style.styleFloat = "left"; 
        img.style.margin = "0px 10px 60px 10px";
        img.style.verticalAlign="text-top";

        var m = errorMessages[code];
        if (!notNull(m)) {
            m = [code];
        }

        var hideFunc = null;

        if (isDef(onclickFunc)) {
            hideFunc = function() {
                if (notNull(out.parentNode)) {
                  out.parentNode.removeChild(out);
                }
                try {
                    onclickFunc();
                } catch (e) {}
                return false;
            }
        }

        out.appendChild(msgAsDOM(m, img, hideFunc));
        return out;
    }

    function appletInfoMsg(code) {
        var out = d.createElement("div");

        var m = errorMessages[code];
        if (!notNull(m)) {
            m = [code];
        }

        out.appendChild(msgAsDOM(m, null, null));
        return out;
    }

    function normalizeApp(ld, acceptString) {
        var app = null;
        if (notNull(ld)) {
            if (acceptString && typeof ld === 'string') {
                app = new dtjava.App(ld, null);
            } else if (ld instanceof dtjava.App) {
                app = ld;
            } else {
                app = new dtjava.App(ld.url, ld);
            }
        }
        return app;
    }

    function setupAppletCallbacks(platform, callbacks) {
        var cb = new dtjava.Callbacks(callbacks);

        if (platform.javafx == null && cb.onGetSplash === defaultGetSplashHandler) {
            cb.onGetSplash = null;
        }
        return cb;
    }

    function normalizeDimension(v) {
        if (isFinite(v)) {
            return v + 'px';
        } else {
            return v;
        }
    }

    function wrapInDiv(ld, s, suffix) {
        var sid = ld.id + "-" + suffix;
        var div = d.createElement("div");
        div.id = sid;
        div.style.width = normalizeDimension(ld.width);
        div.style.height = normalizeDimension(ld.height);
        div.style.position = "absolute";
        div.style.backgroundColor = "white";
        if (s != null) {
            div.appendChild(s);
        }
        return div;
    }

    var pendingCallbacks = {};

    function doInstallCallbacks(id, cb) {
        if (cb == null) {
            cb = pendingCallbacks[id];
            if (notNull(cb)) {
              pendingCallbacks[id] = null;
            } else {
                return;
            }
        }
        var a = document.getElementById(id);
        if (!notNull(a)) return;

        if (isDef(cb.onJavascriptReady)) {
            var onReady = cb.onJavascriptReady;
            if (a.status < 2) { 
              a.onLoad = function() {
                  onReady(id);
                  a.onLoad = null; 
              }
            }
        }

        if (isDef(cb.onRuntimeError)) {
            if (a.status < 3) { 
               a.onError = function() {
                  cb.onRuntimeError(id);
                
              }
            } else if (a.status == 3) {
               cb.onRuntimeError(id);
            }
        }
    }

    function getSnippetToInstallCallbacks(id, cb) {
        if (!notNull(cb) || !(isDef(cb.onDeployError) || isDef(cb.onJavascriptReady))) {
            return null;
        }

        var s = d.createElement("script");
        pendingCallbacks[id] = cb;
        s.text = "dtjava.installCallbacks('"+id+"')";
        return s;
    }

    function getErrorPaneSnippet(app) {
        var paneDiv = wrapInDiv(app, null, "error");
        paneDiv.style.visibility = "hidden";
        return paneDiv;
    }

    function doEmbed(ld, platform, callbacks) {
        var app = normalizeApp(ld, false);
        if (!(notNull(app) && notNull(app.url) &&
              notNull(app.width) && notNull(app.height) && notNull(app.placeholder))) {
            throw "Required attributes are missing! (url, width, height and placeholder are required)";
        }

        app.id = prepareAppletID(app);

        if ((typeof app.placeholder == "string")) {
           var p = d.getElementById(app.placeholder);
           if (p == null) {
               throw "Application placeholder [id="+app.placeholder+"] not found.";
           }
            app.placeholder = p;
        }

        app.placeholder.appendChild(getErrorPaneSnippet(app));

        platform = new dtjava.Platform(platform);

        var cb = setupAppletCallbacks(platform, callbacks);

        var v = doValidateRelaxed(platform);
        var launchFunction = function() {
            var appSnippet = getAppletSnippet(app, platform, cb);
            var splashSnippet = (cb.onGetSplash == null) ? null : cb.onGetSplash(ld);

            app.placeholder.style.position = "relative";
            if (splashSnippet != null) {
                var ss = wrapInDiv(app, splashSnippet, "splash");
                showHideDiv(ss, false);
                showHideApplet(appSnippet, true);

                wipe(app.placeholder);
                app.placeholder.appendChild(getErrorPaneSnippet(app));
                app.placeholder.appendChild(ss);
                app.placeholder.appendChild(appSnippet);
            } else {
                wipe(app.placeholder);
                app.placeholder.appendChild(getErrorPaneSnippet(app));
                app.placeholder.appendChild(appSnippet);
            }
            setTimeout(function() {doInstallCallbacks(app.id, cb)}, 0);
        };

        if (v != null) {
            resolveAndLaunch(app, platform, v, cb, launchFunction);
        } else {
            launchFunction();
        }
    }

    function extractApp(e) {
        if (notNull(e)) {
            var w = e.width;    
            var h = e.height;
            var jnlp = "dummy"; 
            return new dtjava.App(jnlp, {
                id: e.id,
                width: w,
                height: h,
                placeholder: e.parentNode
            });
        } else {
            throw "Can not find applet with null id";
        }
    }

    function processStaticObject(id, platform, callbacks) {
        var a = d.getElementById(id);
        var app = extractApp(a);

        var cb = setupAppletCallbacks(platform, callbacks);
        platform = new dtjava.Platform(platform);

        var launchFunc = function() {
            app.placeholder.insertBefore(getErrorPaneSnippet(app), a);

            if (cb.onGetSplash != null) {
                var splashSnippet = cb.onGetSplash(app);
                if (notNull(splashSnippet)) {
                    var ss = wrapInDiv(app, splashSnippet, "splash");
                    if (notNull(ss)) {
                        app.placeholder.style.position = "relative";
                        app.placeholder.insertBefore(ss, a);
                        showHideApplet(a, true);
                    }
                }
            }

        }

        var v = doValidateRelaxed(platform);
        if (v != null) {

            resolveAndLaunch(app, platform, v, cb, launchFunc);
        } else {
            launchFunc();
        }
    }

    function doRegister(id, platform, cb) {
        addOnDomReady(function() {
            processStaticObject(id, platform, cb);
        });
    }

    init();

    return {
        version: "20150817",

        validate: function(platform) {
            return doValidate(platform, ua.noPluginWebBrowser);
        },

        install: function(platform, callbacks) {
            return doInstall(null, platform, callbacks, null);
        },

        launch: function(ld, platform, callbacks) {
            return doLaunch(ld, platform, callbacks);
        },

        embed: function(ld, platform, cb) {
            return doEmbed(ld, platform, cb);
        },

        register: function(id, platform, callbacks) {
            return doRegister(id, platform, callbacks);
        },


        hideSplash: function(id) {
            return doHideSplash(id);
        },

        addOnloadCallback: function(fn, strictMode) {
            if (strictMode || (ua.chrome && !ua.win)) {
                addOnload(fn);
            } else {
                addOnDomReady(fn);
            }
        },

        installCallbacks: function(id, cb) {
            doInstallCallbacks(id, cb);
        },

        Platform: function(r) {
            this.jvm = "1.6+";
           
            this.javafx = null;
            
            this.plugin = "*";
           
            this.jvmargs = null;

            for (var v in r) {
                this[v] = r[v];
                if (this["jvmargs"] != null && typeof this.jvmargs == "string") {
                    this["jvmargs"] = this["jvmargs"].split(" ");
                }
            }

            this.toString = function() {
                return "Platform [jvm=" + this.jvm + ", javafx=" + this.javafx
                + ", plugin=" + this.plugin + ", jvmargs=" + this.jvmargs + "]";
            };
        },

       
        App: function(url, details) {
            
            this.url = url;

            this.scriptable = true;
            this.sharedjvm = true;

            if (details != undefined && details != null) {
            
                this.id = details.id;
            
                this.jnlp_content = details.jnlp_content;
                
                this.width = details.width;
             
                this.height = details.height;

               
                this.params = details.params;

                this.scriptable = details.scriptable;

               
                this.sharedjvm = details.sharedjvm;

               
                this.placeholder = details.placeholder;

              
                this.toolkit = details.toolkit;
            }

            this.toString = function() {
                var pstr = "null";
                var first = true;
                if (notNull(this.params)) {
                    pstr = "{";
                    for (p in this.params) {
                        pstr += ((first) ? "" : ", ") + p + " => " + this.params[p];
                        first = false;
                    }
                    pstr += "}";
                }
                return "dtjava.App: [url=" + this.url + ", id=" + this.id + ", dimensions=(" + this.width + "," + this.height + ")"
                    + ", toolkit=" + this.toolkit
                    + ", embedded_jnlp=" + (notNull(this.jnlp_content) ? (this.jnlp_content.length + " bytes") : "NO")
                    + ", params=" + pstr + "]";
            }
        },


        Callbacks: function(cb) {
          
            this.onGetSplash = defaultGetSplashHandler;

            this.onInstallNeeded = defaultInstallHandler;

            this.onInstallStarted = defaultInstallStartedHandler;

          
            this.onInstallFinished = defaultInstallFinishedHandler;

        
            this.onDeployError = defaultDeployErrorHandler;

            this.onGetNoPluginMessage = defaultGetNoPluginMessageHandler;

            this.onJavascriptReady = null;

         
            this.onRuntimeError = defaultRuntimeErrorHandler;

            for (c in cb) {
                this[c] = cb[c];
            }
        }
    };
}();
