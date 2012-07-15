/*
* 2008
* Copyright Steve McFred and Jeremy Gillick (author of SwitchProxy)
*/

/*
*
* 	ERROR CODES
*	100 - 149: mproxy_setProxy()
*	150 - 199: mproxy_removeProxy()
*	200 - 249: mproxy_clearCookies()
*	250 - 299: mproxy_editProxyDialog()
*	300	- 349: mproxy_manualUpgradCheck()
*
*/

var gSwitchP_List;
var gSwitchP_ListPopup;
var gSwitchP_ContextList;
var gSwitchP_StatusBar;
var gSwitchP_MenuList;
var gSwitchP_ManageList;
var gSwitchP_ElementList;
var gSwitchP_ElementButton;
var gSwitchP_LastItem;
var gSwitchP_ProxyCount		= 0;
var gSwitchP_InManager		= false;
var gSwitchP_Loaded			= false;
var gSwitchP_Cycle			= null;
var gSwitchP_CommandEnd		= true;
var gSwitchP_Prefs			= null;
var gSwitchP_NoneLabel		= "None";

var gSwitchPTabMgr	= null;

function mproxy_initProxy(event){
	
	window.removeEventListener("load", mproxy_initProxy, true);

	if(!gSwitchP_Loaded){

		gSwitchP_List			= document.getElementById('proxy-list')
		gSwitchP_ListPopup		= document.getElementById('proxy-list-popup');
		gSwitchP_ManageList		= document.getElementById('manage-proxy-list');
		gSwitchP_ContextList	= document.getElementById('context-proxy-list');
		gSwitchP_StatusBar		= document.getElementById('mproxy-status');
		gSwitchP_MenuList		= document.getElementById('mproxy-menu-list');
		gSwitchP_ElementList	= document.getElementById('mproxy-element-list');
		gSwitchP_ElementButton	= document.getElementById('mproxy-element-button');
		gSwitchP_Prefs			= Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
		
		gSwitchP_NoneLabel		= mproxy_getString("common.proxy.none");
		
		//Is in Proxy Manager
		if(gSwitchP_ManageList != null){
			gSwitchP_InManager = true;
			gSwitchP_List = gSwitchP_ManageList;
		}
		
		mproxy_showMenus(true);
						
		//Cleanup RDF File
		mproxy_cleanupRdf();
		
		//Populate Proxy List
		mproxy_populateList();
		
	    	//Set Last Proxy Selected
	    	if (gSwitchP_List != null) {
	        	gSwitchP_List.selectedItem.value = gSwitchP_Prefs.getCharPref("mproxy.proxy.current");
	        	gSwitchP_LastItem = gSwitchP_List.selectedItem;
	    	}
		
		//Add Preferences Listener
		var oProxyObserver = {
			observe : function(subject, topic, data){ mproxy_populateList(); }
		};
		var oMenuObserver = {
			observe : function(subject, topic, data){ mproxy_showMenus(false); }
		};
		//var oPrefBranch	= Components.classes["@mozilla.org/preferences-service;1"].createInstance(Components.interfaces.nsIPrefBranchInternal);
			////oPrefBranch.addObserver("network.proxy", oPrefObserver, false);
			//oPrefBranch.addObserver("mproxy.proxy.rdf.lastupdate", oProxyObserver, false);
		 //oPrefBranch.addObserver("mproxy.display", oMenuObserver, false);

  //if(navigator.userAgent.search(/Thunderbird/gi) > -1){
  //	oPrefBranch	= Components.classes["@mozilla.org/preferences-service;1"].createInstance(Components.interfaces.nsIPrefBranchInternal);
	//}
  //Else{		
oPrefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);		
//}
oPrefBranch.addObserver("mproxy.proxy.rdf.lastupdate", oProxyObserver, false);	
//oPrefBranch.addObserver("mproxy.display", oMenuObserver, false);	
//oPrefBranch.addObserver("network.proxy", oPrefObserver, false);

		//Auto-Update Anonymous Proxy Lists (after 10 minutes)
		//gAnonUpdateTimout = setTimeout("mproxy_anon_autoUpdateLists()", 600000);
		
		// Start Anon Rotation
		//setTimeout("mproxy_anon_nextProxy()", 1000);
		mproxy_setProxy(true);
		gSwitchP_Loaded = true;
	}
}

// Return Tab Manager
function mproxy_getTabManager(){
	return gSwitchPTabMgr;
}

//Used for debugging removed


//Displays the context menu based on what 
// the user selects in the options
function mproxy_showMenus(onStartup){
	try{	
		//Show/Hide menus
		var oPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
					
		// Status Bar
		var isHidden = (oPrefs.prefHasUserValue("mproxy.display.statusbar") && !oPrefs.getBoolPref("mproxy.display.statusbar"))
		document.getElementById("mproxy-status").setAttribute("collapsed", isHidden);
		
		// If not thunderbird
		if(navigator.userAgent.search(/Thunderbird/gi) < 0){
		
			//Context
			var isHidden = (oPrefs.prefHasUserValue("mproxy.display.context") && !oPrefs.getBoolPref("mproxy.display.context"))
			document.getElementById("mproxy-context-menu").setAttribute("collapsed", isHidden);
			document.getElementById("mproxy-context-separator").setAttribute("hidden", isHidden);
		
			//Toolbar
			if(onStartup){
				oPrefs.setBoolPref("mproxy.display.toolbar", (!document.getElementById("proxy-toolbar").getAttribute("collapsed")));
			}
			else{
				var isHidden = (oPrefs.prefHasUserValue("mproxy.display.toolbar") && !oPrefs.getBoolPref("mproxy.display.toolbar"))
				document.getElementById("proxy-toolbar").setAttribute("collapsed", isHidden);
			}
		}
				
	}catch(err){}
}

// Show Element List
function mproxy_showElementList(event){
 
	var oContext	= document.getElementById('context-proxy-list');
	if(oContext == null){
		return;
	}
	
}

//Returns is the entered menu is currently showing
//	values are 'context' or 'toolbar'
function mproxy_menuShowing(sMenu){
	var oObj = null;
	
	if(sMenu == "context"){
		oObj = document.getElementById("mproxy-context-menu");
	}
	else if(sMenu == "toolbar"){
		oObj = document.getElementById("proxy-toolbar");
	}
	
	if(oObj == null)
		return false;
	
	return !eval(oObj.getAttribute("collapsed"));
}


//Clears current Proxy List
function mproxy_clearList(){
	
	gSwitchP_ProxyCount = 0;
	
	//Toolbar List
	if(!gSwitchP_InManager && gSwitchP_List != null && gSwitchP_List.removeAllItems && !gSwitchP_List.open){
		gSwitchP_List.removeAllItems();
	}
	//Manage Proxy Box
	if(gSwitchP_InManager && gSwitchP_List != null){
		aNodes = gSwitchP_List.childNodes;
		for(var i = aNodes.length-1; i >= 0; i--){
			gSwitchP_List.removeChild(aNodes[i]);
		}
	}
	//Context List
	if(gSwitchP_ContextList != null){
		aNodes = gSwitchP_ContextList.childNodes;
		for(var i = aNodes.length-1; i >= 0; i--){
			gSwitchP_ContextList.removeChild(aNodes[i]);
		}
	}
	//Toolbar Element List
	if(gSwitchP_ElementList != null){
		aNodes = gSwitchP_ElementList.childNodes;
		for(var i = aNodes.length-1; i >= 0; i--){
			if(aNodes[i].getAttribute("class") == "proxy-menu-item")
				gSwitchP_ElementList.removeChild(aNodes[i]);
		}
	}
	// Tools Menu List
	if(gSwitchP_MenuList != null){
		aNodes = gSwitchP_MenuList.childNodes;
		for(var i = aNodes.length-1; i >= 0; i--){
			if(aNodes[i].getAttribute("class") == "proxy-menu-item")
				gSwitchP_MenuList.removeChild(aNodes[i]);
		}
	}
}

//Add Item to lists
function mproxy_appendToList(sLabel, sValue, isSelected, iType){
	var oItem = null;
	
	gSwitchP_ProxyCount++;
	
	try{
	
		//Toolbar List
		if(!gSwitchP_InManager && gSwitchP_List != null && !gSwitchP_List.open){
			oItem = gSwitchP_List.appendItem(sLabel, sValue);
			oItem.setAttribute("oncommand", "mproxy_selectProxy();");	//mproxy_anon_stopRotation(); 
			oItem.setAttribute("proxyType", iType);	
		}
		
		//Manage Proxy Box
		if(gSwitchP_InManager && gSwitchP_List != null && sLabel != gSwitchP_NoneLabel){
			oItem = gSwitchP_List.appendItem(sLabel, sValue);
			oItem.setAttribute("proxyType", iType);	
		}
		
		//Context List
		if(gSwitchP_ContextList != null){
			oItem = document.createElement("menuitem");
			oItem.setAttribute("label", sLabel);
			oItem.setAttribute("value", sValue);
			oItem.setAttribute("type", "checkbox");
			oItem.setAttribute("autocheck", "false");
			oItem.setAttribute("proxyType", iType);	
			oItem.setAttribute("oncommand", "mproxy_queueSetProxy(this);");
			gSwitchP_ContextList.appendChild(oItem);
		}
		
		//Toolbar Element List
		if(gSwitchP_ElementList != null){
			//Get separator, which is after proxy list
			var oSeparator = document.getElementById("mproxy-element-list-separator");
			oItem = document.createElement("menuitem");
			oItem.setAttribute("id", sValue);
			oItem.setAttribute("label", sLabel);
			oItem.setAttribute("value", sValue);
			oItem.setAttribute("type", "checkbox");
			oItem.setAttribute("autocheck", "false");
			oItem.setAttribute("proxyType", iType);	
			oItem.setAttribute("class", "proxy-menu-item");
			oItem.setAttribute("oncommand", "mproxy_queueSetProxy(this);");
			gSwitchP_ElementList.insertBefore(oItem, oSeparator);
		}
		
		// Tools Menu List
		if(gSwitchP_MenuList != null){
			//Get separator, which is after proxy list
			var oSeparator = document.getElementById("mproxy-menu-list-separator");
			oItem = document.createElement("menuitem");
			oItem.setAttribute("id", sValue);
			oItem.setAttribute("label", sLabel);
			oItem.setAttribute("value", sValue);
			oItem.setAttribute("type", "checkbox");
			oItem.setAttribute("autocheck", "false");
			oItem.setAttribute("proxyType", iType);	
			oItem.setAttribute("class", "proxy-menu-item");
			oItem.setAttribute("oncommand", "mproxy_queueSetProxy(this);");
			gSwitchP_MenuList.insertBefore(oItem, oSeparator);
		}
	
		//Select
		if(isSelected)
			mproxy_selectItem(sLabel);
		
	}catch(err){}
}

//Sets List item with labe sLabel, to be selected/checked
function mproxy_selectItem(sLabel){

	try{
	
		//Toolbar List
		if(!gSwitchP_InManager && gSwitchP_List != null){
			oItem = gSwitchP_List.getElementsByAttribute("label", sLabel);
			if(oItem != null){
				oItem = oItem[0];
				gSwitchP_List.selectedItem = oItem;
				oItem.setAttribute("selected", true);
			}
		}
		
		//Context
		if(gSwitchP_ContextList != null){
			oItem = gSwitchP_ContextList.getElementsByAttribute("label", sLabel);
			if(oItem != null){
				//Uncheck Other
				var aChecked = gSwitchP_ContextList.getElementsByAttribute("checked", "true");
				for(var c = 0; c < aChecked.length; c++){
					aChecked[c].setAttribute("checked", false);
				}
			
				//Select
				oItem = oItem[0];
				gSwitchP_ContextList.selectedItem = oItem;
				oItem.setAttribute("checked", true);
			}
		}
		
		//Toolbar Element List
		if(gSwitchP_ElementList != null){
			oItem = gSwitchP_ElementList.getElementsByAttribute("label", sLabel);
			if(oItem != null && oItem.length > 0){
				
				//Uncheck Other
				var aChecked = gSwitchP_ElementList.getElementsByAttribute("checked", "true");
				for(var c = 0; c < aChecked.length; c++){
					aChecked[c].setAttribute("checked", false);
				}
				
				//Check Selected
				oItem = oItem[0];
				gSwitchP_ElementList.selectedItem = oItem;
				oItem.setAttribute("selected", true);
				oItem.setAttribute("checked", true);
				
				//Change Button Label
				gSwitchP_ElementButton = document.getElementById('mproxy-element-button');	
				if(gSwitchP_ElementButton != null){
					gSwitchP_ElementButton.setAttribute("label", sLabel);
				}
			}
		}
		
		// Tools Menu List
		if(gSwitchP_MenuList != null){
			oItem = gSwitchP_MenuList.getElementsByAttribute("label", sLabel);
			if(oItem != null && oItem.length > 0){
			
				//Uncheck Other
				var aChecked = gSwitchP_MenuList.getElementsByAttribute("checked", "true");
				for(var c = 0; c < aChecked.length; c++){
					aChecked[c].setAttribute("checked", false);
				}
				
				//Check Selected
				oItem = oItem[0];
				gSwitchP_MenuList.selectedItem = oItem;
				oItem.setAttribute("selected", true);
				oItem.setAttribute("checked", true);
			}
		}
		
		// Status Bar
		if(gSwitchP_StatusBar != null){
			gSwitchP_StatusBar.setAttribute("label", mproxy_getString("common.label.proxy")+" "+sLabel);
		}
		mproxy_clearTimeout(gSwitchP_Cycle);
		
	}catch(err){
		mproxy_debug(err);
	}
}

//Return menuitem for the given sUri
function mproxy_getMenuItem(sUri){
	var oItem = null;
	
	//Toolbar
	oItem = (gSwitchP_List != null) ? gSwitchP_List.getElementsByAttribute("value", sUri) : null;
	if(oItem != null && oItem[0] != null)
		return oItem[0];
	
	//Context
	oItem = (gSwitchP_List != null) ? gSwitchP_ContextList.getElementsByAttribute("value", sUri) : null;
	if(oItem != null && oItem[0] != null)
		return oItem[0];
	
	//Toolbar Element
	oItem = (gSwitchP_List != null) ? gSwitchP_ElementList.getElementsByAttribute("value", sUri) : null;
	if(oItem != null && oItem[0] != null)
		return oItem[0];
	
	
	//Default
	return null;
}

function mproxy_cycle(sAction){
	if(gSwitchP_Cycle != null){
	
		mproxy_clearTimeout(gSwitchP_Cycle);
		gSwitchP_CommandEnd = true;

		if(sAction == 'change' && gSwitchP_LastItem != null && gSwitchP_List != null && gSwitchP_List.selectedItem.label != gSwitchP_LastItem.label && gSwitchP_List.selectedIndex > 0){
			gSwitchP_List.label					= gSwitchP_LastItem.label;
			gSwitchP_List.selectedItem			= gSwitchP_LastItem;
			gSwitchP_List.selectedItem.value	 = gSwitchP_LastItem.value;
			
			mproxy_setProxy();
		}
		else if(sAction == 'select' && gSwitchP_List != null && gSwitchP_List.selectedIndex > -1){
			mproxy_setStatus(mproxy_getString("toolbar.notApplied"), "#F00");
			setTimeout("mproxy_setStatus(mproxy_getString('toolbar.loading'))", 3000);
			setTimeout("mproxy_populateList('"+ gSwitchP_LastItem.label +"');", 4000);
			setTimeout("mproxy_setProxy();", 4500);
		}
		
	}
}

//When user selects a Proxy from the menu list
function mproxy_selectProxy(){

	mproxy_clearTimeout(gSwitchP_Cycle);
	if(gSwitchP_List == null || gSwitchP_List.selectedItem == null || gSwitchP_InManager)
		return;
		
	//if(gSwitchP_List.selectedItem.label != gSwitchP_NoneLabel){
		//document.getElementById('edit-button').disabled = false;
		//document.getElementById('remove-button').disabled = false;
		//document.getElementById('edit-button').image = "chrome://mproxy/content/icons/pencil.png";
		//document.getElementById('remove-button').image = "chrome://mproxy/content/icons/cross.png";
	
	//}
	//else{
		//document.getElementById('edit-button').disabled = true;
		//document.getElementById('remove-button').disabled = true;
		//document.getElementById('edit-button').image = "chrome://mproxy/content/icons/pencil_disabled.png";
		//document.getElementById('remove-button').image = "chrome://mproxy/content/icons/cross_disabled.png";
	//}
	
	if(typeof(gSwitchP_List.selectedItem.value) != 'undefined'){
		//If this item is not being used by the browser, 
		//	show a helpful message and cycle
		var oPrefs	= Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
		if((!oPrefs.prefHasUserValue("mproxy.proxy.current") || oPrefs.getCharPref("mproxy.proxy.current") != gSwitchP_List.selectedItem.value) && gSwitchP_LastItem != null && gSwitchP_LastItem != gSwitchP_List.selectedItem){
			mproxy_setStatus(mproxy_getString("toolbar.clickApply"), "#060");
		
			//Cycle if user doesn't click 'Apply'
			//if(gSwitchP_Cycle == null)
			//	gSwitchP_Cycle = setTimeout("mproxy_cycle('select')", 10000);
		}
		//If it is being used by the browser
		else if(oPrefs.prefHasUserValue("mproxy.proxy.current") && oPrefs.getCharPref("mproxy.proxy.current") == gSwitchP_List.selectedItem.value){
			mproxy_clearTimeout(gSwitchP_Cycle);
			
			//Anonomous
			if(gSwitchP_List.selectedItem.getAttribute("proxyType") == "3"){
			//	if(mproxy_anon_getCurrent() == "unknown")
			//		mproxy_setProxy(false);
			//		
			//	mproxy_setStatus(mproxy_getString("toolbar.using") +" "+ gSwitchP_List.selectedItem.label +" ["+ mproxy_anon_getCurrent() +"] ("+ mproxy_anon_getCurrentCount() +")");
			}
			//Standard
			else{
				mproxy_setStatus(mproxy_getString("toolbar.using") +" "+ gSwitchP_List.selectedItem.label);
			}
		}
		else{
			mproxy_clearTimeout(gSwitchP_Cycle);
			mproxy_setStatus(mproxy_getString("toolbar.using.none"));
		}
	}
	
	return true;
}

//Queue Set Proxy
function mproxy_queueSetProxy(oMenuItem){
	mproxy_clearTimeout(gSwitchP_Cycle);
	setTimeout("mproxy_setProxy(true, true, null, '"+ oMenuItem.label +"', '"+ oMenuItem.getAttribute("value") +"', '"+ oMenuItem.getAttribute("proxyType") +"')", 10);
}

//Set Proxy
function mproxy_setProxy(bClean, fromContextMenu, oMenuItem, sLabel, sUri, sType){

	//Start Command
	gSwitchP_CommandEnd = false;	
	mproxy_clearTimeout(gSwitchP_Cycle);
	//mproxy_anon_stopRotation();
	
	//If in Proxy Manager, do nothing
	if(gSwitchP_InManager){
		gSwitchP_CommandEnd = true;
		return;
	}
	
	var hasError	= false;
	
	//Set fromContextMenu
	if(fromContextMenu == null)
		fromContextMenu = false;
	
	//Get Proxy URI & Label
	var sProxyUri	= "";
	var sProxyLabel	= "";
	var sProxyType	= 0;
	if(sUri != null && sLabel != null){
		sProxyUri = sUri;
		sProxyLabel = sLabel;
		
		if(sType) sProxyType = sType;
	}
	else if(oMenuItem != null){
		sProxyUri	= oMenuItem.getAttribute("value");
		sProxyLabel	= oMenuItem.getAttribute("label");
		sProxyType	= oMenuItem.getAttribute("proxyType");
	}
	else{
		if(fromContextMenu == true){
			sProxyUri	= gSwitchP_ContextList.selectedItem.value;
			sProxyLabel	= gSwitchP_ContextList.selectedItem.label;
			sProxyType	= gSwitchP_ContextList.selectedItem.getAttribute("proxyType");
		}
		else if(gSwitchP_List != null){
			sProxyUri	= gSwitchP_List.selectedItem.value;
			sProxyLabel	= gSwitchP_List.selectedItem.label;
			sProxyType	= gSwitchP_List.selectedItem.getAttribute("proxyType");
		}
	}
	
	//Branch if Anonomous
	if(sProxyType == "3"){
		//mproxy_setStatus(mproxy_getString("toolbar.loading"));
		//mproxy_anon_loadProxy(sProxyUri, true);
	}
	else if(sProxyUri != ""){
		mproxy_setStatus(mproxy_getString("toolbar.loading"));
		try{
			//Always clear proxy settings first - this may mess up with selection...
			//gSwitchP_Prefs.setIntPref("network.proxy.type", 0);

			//Change Browser Preferences
			var aProps	= mproxy_ds_getPropertyValuesFor(sProxyUri);
			
			for(key in gmproxy_options){
				
				//Get pref type and update preference
				var sPrefVal = "";
				if(typeof(gmproxy_options_defaults[key]) == "number"){
					gSwitchP_Prefs.setIntPref(gmproxy_options[key], parseInt(aProps[gSProxyRdfNodeUriRoot +"#"+ key]));
				}
				else if(typeof(gmproxy_options_defaults[key]) == "boolean"){
					gSwitchP_Prefs.setBoolPref(gmproxy_options[key], eval(aProps[gSProxyRdfNodeUriRoot +"#"+ key]));
				}
				else{ //String
					gSwitchP_Prefs.setCharPref(gmproxy_options[key], aProps[gSProxyRdfNodeUriRoot +"#"+ key]);
				}
			}
			
			//Get Proxy Label
			sProxyLabel = aProps[gSProxyRdfNodeName];
			
			//Update Status
			mproxy_setStatus(mproxy_getString("toolbar.using") +" "+ sProxyLabel);
			
			//Update Preference
			gSwitchP_Prefs.setCharPref("mproxy.proxy.current", sProxyUri);	
		}
		catch(err){
			alert("100: "+ mproxy_getString("error.unknown")+ "\n("+ err +")");
			hasError = true;
			
			//Cycle back to 'None'
			//if(gSwitchP_Cycle == null && !fromContextMenu)
			//	gSwitchP_Cycle = setTimeout("mproxy_cycle('change')", 500);
		}
	}
	else{
		//Turn off proxy pref
		try{
			gSwitchP_Prefs.setIntPref("network.proxy.type", 0);
			
			//Update Status
			mproxy_setStatus(mproxy_getString("toolbar.using.none"));
			
			
			//Update Preference
			gSwitchP_Prefs.setCharPref("mproxy.proxy.current", "");
			
		}catch(e){
			alert("101: "+ mproxy_getString("error.unknown"));
			hasError = true;
		}
	}
	
	// Finalize
	if(hasError){
		//Update Status
		mproxy_setStatus(mproxy_getString("error.proxy.load") +" " + sProxyLabel, "#F00");
	}
	else{
	
		//mproxy_tab_notify(sProxyUri);
	
		//Select this proxy in all lists
		mproxy_selectItem(sProxyLabel);
		
		//Set Last Proxy
		gSwitchP_LastItem = mproxy_getMenuItem(sProxyUri);
		
		//Options
		try{
			if(bClean){
				// Clear Cookies
				if(typeof(gBrowser) != 'undefined' && gSwitchP_Prefs.prefHasUserValue("mproxy.clear.cookies") && gSwitchP_Prefs.getBoolPref("mproxy.clear.cookies")){
					mproxy_clearCookies();
				}
				
				// Reload Page
				if((typeof(gBrowser) != 'undefined' && (!gSwitchP_Prefs.prefHasUserValue("mproxy.reload.tab") || gSwitchP_Prefs.getBoolPref("mproxy.reload.tab")))){
					try{
						var oTab = gBrowser.mCurrentBrowser;
							oTab.webNavigation.reload(nsIWebNavigation.LOAD_FLAGS_BYPASS_PROXY | nsIWebNavigation.LOAD_FLAGS_BYPASS_CACHE);
					} catch(err) {	}
				}
				
				// Set Update Pref
				gSwitchP_Prefs.setIntPref("mproxy.proxy.rdf.lastupdate", (new Date()).getTime());
			}
			
		}catch(err){alert("102: "+ mproxy_getString("error.unknown") + "\n("+err+")");}
	}

	//End Command
	gSwitchP_CommandEnd = true;
	
}

//Test if the RDF Element, oRef, is the current proxy being used
function mproxy_isSelected(oRef){
	
	try{
		var oPrefs		 = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
		var aProps		= mproxy_ds_getPropertyValuesFor(oRef.Value);
		var sCurrUri	= "";
		var iType		= parseInt(aProps[gSProxyRdfNodeUriRoot + "#networkProxyType"]);
		
		if(oPrefs.prefHasUserValue("mproxy.proxy.current") && (sCurrUri = oPrefs.getCharPref("mproxy.proxy.current")) == oRef.Value){
					
			//Verify this is really what's being used in the browser
			if(iType == oPrefs.getIntPref("network.proxy.type")){
				if(iType == 1){
					for(key in gmproxy_options){
						
						//Skip These Keys
						if(key == "networkProxyType" || key == "networkProxyAutoconfigURL" || key == "networkProxyHTTPShare" )
							continue;
						
						//Skip if RDF has Default Values
						if( (key == "networkProxySOCKSVersion" && (aProps[gSProxyRdfNodeUriRoot +"#"+ key] == "5" || aProps[gSProxyRdfNodeUriRoot +"#"+ key] == ""))
							|| (key == "networkProxyNone" && aProps[gSProxyRdfNodeUriRoot +"#"+ key] == "localhost, 127.0.0.1")){
							continue;								
						}
						
						//If Pref and RDF doesn't have a value for this
						if(!oPrefs.prefHasUserValue(gmproxy_options[key]) 
							&& (aProps[gSProxyRdfNodeUriRoot +"#"+ key] == "" || aProps[gSProxyRdfNodeUriRoot +"#"+ key] == "0")){
							continue;
						}
						
						// If pref doesn't have this and the RDF record does
						//	return false
						if(!oPrefs.prefHasUserValue(gmproxy_options[key]) 
							&& (aProps[gSProxyRdfNodeUriRoot +"#"+ key] != "" && aProps[gSProxyRdfNodeUriRoot +"#"+ key] != "0")){
							return false;
						}
						
						
						//Get pref and convert to string
						var sPrefVal = "";
						if(oPrefs.getPrefType(gmproxy_options[key]) == Components.interfaces.nsIPrefBranch.PREF_INT)
							sPrefVal = oPrefs.getIntPref(gmproxy_options[key]) + "";
						if(oPrefs.getPrefType(gmproxy_options[key]) == Components.interfaces.nsIPrefBranch.PREF_BOOL)
							sPrefVal = oPrefs.getBoolPref(gmproxy_options[key]) + "";
						if(oPrefs.getPrefType(gmproxy_options[key]) == Components.interfaces.nsIPrefBranch.PREF_STRING)
							sPrefVal = oPrefs.getCharPref(gmproxy_options[key]);
												
						//Return false if isn't equal
						if(sPrefVal != aProps[gSProxyRdfNodeUriRoot +"#"+ key]){
							return false;
						}
					}
					return true;
				}
				//If type is 2 and the PAC url is the same
				else if(iType == 2 && oPrefs.prefHasUserValue("mproxy.proxy.current") 
							&& oPrefs.getCharPref("network.proxy.autoconfig_url") == aProps[gSProxyRdfNodeUriRoot + "#networkProxyAutoconfigURL"]){
						return true;
				}	
			}
			//Anonomous
			else if(iType == 3 && oPrefs.prefHasUserValue("network.proxy.http") && oPrefs.prefHasUserValue("network.proxy.http_port")){
				//var sProxy = oPrefs.getCharPref("network.proxy.http") +":"+ oPrefs.getIntPref("network.proxy.http_port");
				
				//is sProxy in proxy list
				//oTestRes = mproxy_ds_getElementForValue(gSProxyRdfNodeUriRoot +"#proxy", sProxy);
				
				//if(oTestRes instanceof Components.interfaces.nsIRDFResource && oTestRes.Value == oRes.Value){
					//mproxy_anon_loadProxy(oRef.Value, true);
					//return true;
				//}
				
				return false;
			}
		}
		
	}catch(err){}
	
	
	return false;
}

function mproxy_removeProxy(){	
	mproxy_clearTimeout(gSwitchP_Cycle);
	var oItem	= gSwitchP_List.selectedItem;
	
	//Can't delete 'None'
	if((gSwitchP_List.selectedItem != null) && 
		(gSwitchP_List.selectedItem.label == gSwitchP_NoneLabel) ){
		alert("150: "+ mproxy_getString("error.remove.forbidden"));
		return;
	}
	
	if(!confirm(mproxy_getString("confirm.remove")))
		return;
	
	try{
		//RDF
			//Remove
			mproxy_ds_removeElement(oItem.value);
			
			//Cleanup
			mproxy_cleanupRdf();
		
		//Update List
			mproxy_populateList();
			mproxy_ds_save();
			setTimeout("mproxy_setProxy();", 300);
	}
	catch(err){
		alert("151: "+ mproxy_getString("error.remove") + "\n("+ err +")");
	}
}

function mproxy_clearCookies(){
	try{
		var oCookies	= Components.classes["@mozilla.org/cookiemanager;1"].createInstance(Components.interfaces.nsICookieManager);
			oCookies.removeAll();
	}catch(err){
		alert("200: "+ mproxy_getString("error.cookie"));
	}
	return true;
}

function mproxy_add_proxy(sName, sPort, issocks, toset){
	try{ 

        var oTestProxy = mproxy_ds_getElementForValue(gSProxyRdfNodeName, sName);
        if(oTestProxy != null){
          return false;
        }
        
        var sProxyUri   = mproxy_getUniqueProxyUri();
        var oProxy    = mproxy_ds_getResource(sProxyUri);
        mproxy_ds_addElement(sProxyUri);
        
        if (issocks) { //socks
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxyType"), "1", true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxyHTTP"), "", true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxyHTTP_Port"), "", true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxyHTTPShare"), false, true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxySSL"), "", true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxySSL_Port"), "", true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxyFTP"), "", true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxyFTP_Port"), "", true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxyGopher"), "", true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxyGopher_Port"), "", true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxySOCKS"), "127.0.0.1", true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxySOCKS_Port"), sPort, true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxySOCKSVersion"), "5", true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxyNone"), "localhost, 127.0.0.1", true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxyAutoconfigURL"), "", true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#name"), sName, true);
        }
		else { //regular http for all
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxyType"), "1", true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxyHTTP"), "127.0.0.1", true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxyHTTP_Port"), sPort, true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxyHTTPShare"), true, true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxySSL"), "127.0.0.1", true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxySSL_Port"), sPort, true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxyFTP"), "127.0.0.1", true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxyFTP_Port"), sPort, true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxyGopher"), "127.0.0.1", true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxyGopher_Port"), sPort, true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxySOCKS"), "", true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxySOCKS_Port"), "", true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxySOCKSVersion"), "5", true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxyNone"), "localhost, 127.0.0.1", true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#networkProxyAutoconfigURL"), "", true);
          mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+"#name"), sName, true);
        }
		if (toset) {
          mproxy_setProxy(true, null, null, sName, sProxyUri, 1);
  		  mproxy_selectItem(sName);
		}
        return true;
    }catch(e){
      alert(mproxy_getString("error.unknown") +"\n("+ e +")");
      return false;
    }
}

function mproxy_populateList(sSelectedLabel){
	mproxy_clearTimeout(gSwitchP_Cycle);
	
	var sProxyUri	= "";
	var iSelected	= (gSwitchP_List != null) ? gSwitchP_List.selectedIndex : -1;
	var aProxies	= new Array();
		
	//Don't populate if a local command has not finished or if list is open
	if(!gSwitchP_CommandEnd){
		gSwitchP_CommandEnd = true; //reset
		return;
	}
	else{ //Start Command
		gSwitchP_CommandEnd = false;
	}
	
	//Load Elements
	try{
		
		//Remove List Items & Add 'None'
		mproxy_clearList();
		mproxy_appendToList(gSwitchP_NoneLabel, "", true, 0);
		mproxy_selectItem(gSwitchP_NoneLabel);
		
		//Add Tor as default proxy, and set proxy to it
        //mproxy_add_proxy(mproxy_getString("common.proxy.tor"), "9050", true, true);

		//Get and Sort Elements
		var aProxies	= mproxy_ds_getAllElements();
			aProxies.sort(mproxy_sortProxies);
		
		//Add to list
		for(i = 0; i < aProxies.length; i++){
		
			if(typeof(aProxies[i]) == 'undefined')
				continue; 
			
			try{
			
				oRes		= mproxy_ds_getResource(aProxies[i]);
				sProxyName	= mproxy_ds_getValueFor(oRes, mproxy_ds_getResource(gSProxyRdfNodeName));
				sProxyType	= mproxy_ds_getValueFor(oRes, mproxy_ds_getResource(gSProxyRdfNodeUriRoot+ "#networkProxyType"));
				
				if(sProxyName != null){
					oItem = mproxy_appendToList(sProxyName, aProxies[i], false, sProxyType);

					//Select Item
					if((sSelectedLabel != null && sSelectedLabel == sProxyName) || (sSelectedLabel == null && mproxy_isSelected(oRes))){
						mproxy_selectItem(sProxyName);
					}
				}
				
			} catch(err) {}
		}
		
		//Finish
		gSwitchP_CommandEnd = true;
		setTimeout("mproxy_selectProxy();", 300);
		
	}catch(err){}
}

/*	
* Sort Proxy List
*	+ oResA and oResB are RDF URIs
*/
function mproxy_sortProxies(oResA, oResB){
	try{
		//Get Proxy Names
		sValA = mproxy_ds_getValueFor(mproxy_ds_getResource(oResA), mproxy_ds_getResource(gSProxyRdfNodeName));
		sValB = mproxy_ds_getValueFor(mproxy_ds_getResource(oResB), mproxy_ds_getResource(gSProxyRdfNodeName));
		
		
		if (sValA < sValB)
			return -1;
		if (sValA == sValB)
			return 0;
		if (sValA > sValB)
			return 1;
	}
	catch(e){ return 0; }
}

/* Cleanup unused mproxy data in RDF
*	 + Remove resources that have not been applied or used
*/
function mproxy_cleanupRdf(){
		
	try{

		var aElements	= mproxy_ds_getAllElements();
		for(var e = 0; e < aElements.length; e++){
			oRes	 = mproxy_ds_getResource(aElements[e]);
			aProps	= mproxy_ds_getPropertyValuesFor(aElements[e]);
			
			//If does not have a name property, 
			//	then it is not listed -- so it's junk
			if(aProps[gSProxyRdfNodeName] == null){
				mproxy_ds_removeElement(aElements[e]);
			}
		}
	}catch(err){}
}

// Automatic Upgrade
/*
*	From Version 0.4
*	 + Add preference 'mproxy.version'
*	+ Add preference 'mproxy.proxy.current'
*	+ Change proxy's URI to random number
*	+ Convert #proxy to networkProxyAutoconfigURL
*	+ Add elements for full manual proxy configuration
*		+ view the globals.js gmproxy_options array for full list
*/


//Generates random number for proxy URI
function mproxy_getUniqueProxyUri(){
	var sUri = gSProxyRdfRoot + "/mproxy_" + Math.round((Math.random() * 200000));
	
	if(mproxy_ds_doesProxyElementExist(sUri))
		return mproxy_getUniqueProxyUri();
	
	return sUri;
}

function mproxy_setStatus(sMsg, sColor){
	if(!sColor)
		sColor = "#000";
	
	oStatus = document.getElementById('status-text');
	
	if(oStatus != null){
		document.getElementById('status-text').style.color = sColor;
		document.getElementById('status-text').value = sMsg;
	}
}

//Clear Timeout
function mproxy_clearTimeout(){
	clearTimeout(gSwitchP_Cycle);
	gSwitchP_Cycle = null;
}

//Execute a command when system is ready
//	iCurrCount is for internal use, do not
//	pass this argument
function mproxy_doCommand(sCommand, iLimitCount){
	
	if(iLimitCount == null)
		iLimitCount = 0;
	
	//Wait for current command to end
	if(!gSwitchP_CommandEnd && iLimitCount < 10){
		iLimitCount++
		setTimeout("mproxy_doCommand('"+ sCommand +"', "+ iCurrCount +")", 100);
	}
	else{
		gSwitchP_CommandEnd = true;
		setTimeout(sCommand, 100);
	}
}

/*
* Launch Dialogs
*/
	
	//Edit Proxy Dialog
	function mproxy_editProxyDialog(isNew){
		mproxy_clearTimeout(gSwitchP_Cycle);
		
		var sAction = null;
		
		//Nothing Selected
		var oEditItem = null
		if(!isNew && (oEditItem = gSwitchP_List.selectedItem) == null){
			alert("250: "+ mproxy_getString("error.edit.select"));
			return;
		}
		
		//Can't edit 'None'
		if(!gSwitchP_InManager && !isNew && gSwitchP_List != null && gSwitchP_List.selectedItem != null && gSwitchP_List.selectedItem.label == gSwitchP_NoneLabel){
			alert("251: "+ mproxy_getString("error.edit.forbidden"));
			return;
		}
		
		//Edit
		if(!isNew){
			
			//Anon
			//if(oEditItem.getAttribute("proxyType") == "3"){
			//	window.openDialog("chrome://mproxy/content/dialogs/editanon.xul","editproxy","centerscreen, chrome", "edit", oEditItem.value);
			//}
			//Standard
			//else{
			window.openDialog("chrome://mproxy/content/dialogs/editproxy.xul","editproxy","centerscreen, chrome", "edit", oEditItem.value);
			//}
		}
		//Add
		else{
			//window.openDialog("chrome://mproxy/content/dialogs/addproxytype.xul","editproxy","centerscreen, chrome", "add");
			 window.openDialog("chrome://mproxy/content/dialogs/editproxy.xul","addproxy","centerscreen, chrome", "add", gSwitchP_InManager);
		}
	}
	
	//Manage Proxy Dialog
	function mproxy_openProxyManager(){
		window.openDialog("chrome://mproxy/content/dialogs/manager.xul","manageproxies","centerscreen, chrome, resizable");
	}

/*
* Options
*/
	function mproxy_openmproxyPrefs(){		
		window.openDialog("chrome://mproxy/content/options/options.xul","mproxyPrefs","centerscreen, chrome");
	}
	
	function mproxy_goTomproxySite(fromDialog){
		
		// If Thunderbird
		if(navigator.userAgent.search(/Thunderbird/gi) > -1){
			var messenger = Components.classes["@mozilla.org/messenger;1"].createInstance();         
				messenger = messenger.QueryInterface(Components.interfaces.nsIMessenger);
				messenger.launchExternalURL(gmproxy_DownloadSite +"?r=mproxy");  
		}
		else{
			opener.gBrowser.selectedTab = opener.getBrowser().addTab(gmproxy_DownloadSite +"?r=mproxy");
		}
		self.close();
	}
	
	function mproxy_goTomproxyAbout(){
		window.openDialog("chrome://mproxy/content/dialogs/about.xul","mproxyAbout","centerscreen, chrome, modal");
	}

/*
* Automatic Updator
*/
	
	//If there is a new version, returns the XPI url, else returns false

	//The user selects to check for updates

/*
* UNINSTALL
*/
	function mproxy_uninstall(oLogger){
		try{
			var oPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
				oPrefs.deleteBranch("mproxy");
		
			oLogger.addLog(new window.ExtuninstallLogItem(oLogger.REMOVE_ACTION, oLogger.SUCCESS_STATUS, "Preferences Branch 'mproxy'", null, null));
		}catch(err){
			oLogger.addLog(new window.ExtuninstallLogItem(oLogger.REMOVE_ACTION, oLogger.WARN_STATUS, "Preferences Branch 'mproxy'", 1001, err));
			throw 1001;
		}
	}

