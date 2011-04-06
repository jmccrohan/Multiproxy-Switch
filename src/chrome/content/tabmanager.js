
/* 
* Tab Manager Object
*/
function mproxy_TabManager(){
	this.manage	= false;
	this.tabs 	= new Array();
	
	// Read Preferences (toggle manager on/off)
	try{
		var	oPrefs	= Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
			manage	= (oPrefs.prefHasUserValue("mproxy.tabs.manager") && oPrefs.getBoolPref("mproxy.tabs.manager") == true);
		
		// Add Pref Observer
		var oTabManagerPrefObserver = {
			observe : function(subject, topic, data){ if(data == true && manage == false) { manage = true; /*mproxy_setProxy(false)*/; } }
		};
		oPrefs	= Components.classes["@mozilla.org/preferences-service;1"].createInstance(Components.interfaces.nsIPrefBranchInternal);
		oPrefs.addObserver("mproxy.tabs.manager", oTabManagerPrefObserver, false);
	} catch(err){}
	
	
	this.getTabForBrowser	= mproxy_tab_getTabForBrowser;
	this.getTabForDocument	= mproxy_tab_getTabForDocument;
	this.tabLoading 		= mproxy_tab_tabLoading;
}

// Called on new Window/Tab 
function mproxy_tab_tabLoading(){
	
	try{
		// Verify all tabs are in list
		var aBrowsers 	= gBrowser.browsers;
		for(var i = 0; i < aBrowsers.length; i++){
			if(this.getTabForBrowser(aBrowsers[i]) == null){
				var index = this.tabs.length;
				this.tabs[index] = new mproxy_Tab(aBrowsers[i], null, index);
			}
		}
	} catch(err) {alert(err)}

}

// Return mproxy_Tab object for oBrowser
function mproxy_tab_getTabForBrowser(oBrowser){
	for(var t = 0; t < this.tabs.length; t++){
		if(this.tabs[t].browser == oBrowser)
			return this.tabs[t];
	}	
	return null;
}

// Return mproxy_Tab object for oDocument
function mproxy_tab_getTabForDocument(oDocument){
	for(var t = 0; t < this.tabs.length; t++){
		if(this.tabs[t].browser.contentDocument == oDocument)
			return this.tabs[t];
	}	
	return null;
}

/*
* Tab Object
*/
function mproxy_Tab(browser, proxy, index){
	this.browser 	= browser;
	this.proxy		= proxy;
	this.title		= "";
	this.index		= index;
	
	//alert(this.browser.contentDocument)
	
	if(this.browser != null){
		try{
			this.browser.addEventListener("focus", mproxy_tab_onfocus, true);
			this.browser.addEventListener("unload", mproxy_tab_onunload, true);
			this.browser.addEventListener("load", mproxy_tab_onloaded, true);
		} catch(err) { alert(err); }
	}
	
	this.updateTitle = function(){
		
		if(this.proxy != null && this.proxy != ""){
			
			// Get label for proxy uri
			var	oRes		= mproxy_ds_getResource(aProxies[i]);
			var sProxyName	= mproxy_ds_getValueFor(oRes, mproxy_ds_getResource(gSProxyRdfNodeName));
			
			// Set title
			if(sProxyName != null){
				this.browser.contentDocument.title = "["+ sProxyName +"] " +this.title;
			}
		}		
	}
}


/*
* Utilities
*/
	// Notify current tab of proxy change
	function mproxy_tab_notify(sUri){
		var oTab = mproxy_getTabManager().getTabForBrowser(gBrowser.selectedBrowser);
		
		oTab.proxyUri = sUri;
		oTab.updateTitle();
	}

/*
* Event Handlers
*/

	// On Tab Focus
	function mproxy_tab_onfocus(event){
		try{
			var oTab = mproxy_getTabManager().getTabForBrowser(gBrowser.selectedBrowser)
			//oTab.browser.contentDocument.title = oTab.index;
			
			//mproxy_setProxy();
		}catch(err) { }
	}
	
	// On Window Focus
	function mproxy_tab_windowFocus(event){
		try{
			if(event.target.nodeName = "tabbrowser"){
				
			}
		}catch(err) { }
	}
	
	// On tab unload
	function mproxy_tab_onunload(event){
		try{
			var oTab = mproxy_getTabManager().getTabForDocument(event.target);
			//oTab.browser.contentDocument.title = "Refreshing...";
		}catch(err) { }
	}
	
	// On tab load
	function mproxy_tab_onloaded(event){
		try{
			var oTab = mproxy_getTabManager().getTabForDocument(event.target);
			//oTab.browser.contentDocument.title = "Loaded";
		}catch(err) { }
	}