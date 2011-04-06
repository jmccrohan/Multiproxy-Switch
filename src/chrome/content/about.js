
function open_tab(UrlToGoTo) {
    if( MPS_isThunderBird() ) {
        var messenger = Components.classes["@mozilla.org/messenger;1"].createInstance()
                                  .QueryInterface(Components.interfaces.nsIMessenger);
                                  
        messenger.launchExternalURL(UrlToGoTo);
    } else {        
        var navWindow;
        
        // Try to get the most recently used browser window
        try {
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                               .getService(Components.interfaces.nsIWindowMediator);
            navWindow = wm.getMostRecentWindow("navigator:browser");
        } catch(ex) {}
        
        if (navWindow) {  // Open the URL in most recently used browser window
            if ("delayedOpenTab" in navWindow) {
                navWindow.delayedOpenTab(UrlToGoTo);
            } else if ("loadURI" in navWindow) {
                navWindow.loadURI(UrlToGoTo);
            } else {
                navWindow._content.location.href = UrlToGoTo;
            }
        } else {  // If there is no recently used browser window open new browser window with the URL
            var ass = Components.classes["@mozilla.org/appshell/appShellService;1"]
                                .getService(Components.interfaces.nsIAppShellService);
            var win = ass.hiddenDOMWindow;
            
            win.openDialog("chrome://navigator/content/navigator.xul", "",
                           "chrome,all, dialog=no", UrlToGoTo );
        }
    }	
 /*
    var uri = Components.classes["@mozilla.org/network/standard-url;1"].createInstance(Components.interfaces.nsIURI);
    uri.spec = aURL;
    var protocolSvc = Components.classes["@mozilla.org/uriloader/external-protocol-service;1"].getService(Components.interfaces.nsIExternalProtocolService);
    protocolSvc.loadUrl(uri);
    */
}


const SEAMONKEY_ID = "{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}";
const THUNDERBIRD_ID = "{3550f703-e582-4d05-9a08-453d09bdfdc6}";
function MPS_isThunderBird() {
	var id;
	  if("@mozilla.org/xre/app-info;1" in Components.classes) {
	    // running under Mozilla 1.8 or later
	    id = Components.classes["@mozilla.org/xre/app-info;1"]
	                   .getService(Components.interfaces.nsIXULAppInfo).ID;
	  } else {
	    try {
	      id = Components.classes["@mozilla.org/preferences-service;1"]
	                     .getService(Components.interfaces.nsIPrefBranch)
	                     .getCharPref("app.id");
	    } catch(e) {
	    }
	  }
 	if ( id != null && id == THUNDERBIRD_ID ) {
		return true;
	}
	else { 
		return false;
	}
}

function MPS_isSunbirdOrLightning() {
	var id;
	  if("@mozilla.org/xre/app-info;1" in Components.classes) {
	    // running under Mozilla 1.8 or later
	    id = Components.classes["@mozilla.org/xre/app-info;1"]
	                   .getService(Components.interfaces.nsIXULAppInfo).ID;
	  } else {
	    try {
	      id = Components.classes["@mozilla.org/preferences-service;1"]
	                     .getService(Components.interfaces.nsIPrefBranch)
	                     .getCharPref("app.id");
	    } catch(e) {
	    }
	  }
	  
	// check if this is Sunbird
 	if ( id != null && id == "{718e30fb-e89b-41dd-9da7-e25a45638b28}" ) {
		return true;
	}
	else 	if ( id != null && id == THUNDERBIRD_ID ) {
		var em = Components.classes["@mozilla.org/extensions/manager;1"]
                   .getService(Components.interfaces.nsIExtensionManager);
		var addon = em.getItemForID("{e2fda1a4-762b-4020-b5ad-a41df1933103}");
		// check to see if the version attribute exists (if not, then the addon doesn't exist)
		if ( addon != null && (addon.version != null && addon.version != "" )) {
			return true;
		}		
	}
	return false;
}
