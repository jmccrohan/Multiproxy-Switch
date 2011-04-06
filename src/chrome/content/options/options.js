
var oMain			= null;
var inMozOptions	= false;

function initOptions(){
	try{
	
		//Prefs
		var oPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
		
		//Get Opener
		if(opener.mproxy_menuShowing){
			oMain = opener;
		}
		else if(opener.parent.opener && opener.parent.opener.mproxy_menuShowing){
			oMain			 = opener.parent.opener
			inMozOptions	= true;
		}
		
		//Prefill
		if(oPrefs.prefHasUserValue("mproxy.clear.cookies"))
				document.getElementById("mproxy.clear.cookies").checked = oPrefs.getBoolPref("mproxy.clear.cookies");
		if(oPrefs.prefHasUserValue("mproxy.reload.tab"))
				document.getElementById("mproxy.reload.tab").checked = oPrefs.getBoolPref("mproxy.reload.tab");
		if(oPrefs.prefHasUserValue("mproxy.display.context"))
				document.getElementById("mproxy.display.context").checked = oPrefs.getBoolPref("mproxy.display.context");
		if(oPrefs.prefHasUserValue("mproxy.display.statusbar"))
				document.getElementById("mproxy.display.statusbar").checked = oPrefs.getBoolPref("mproxy.display.statusbar");
					
		/*if(oPrefs.prefHasUserValue("mproxy.tabs.manager"))
				document.getElementById("mproxy.tabs.manager").checked = oPrefs.getBoolPref("mproxy.tabs.manager");*/
		
		//Set menushowing options
		if(oMain != null){
			document.getElementById("mproxy.display.toolbar").checked = oMain.mproxy_menuShowing("toolbar");
		}
		else{
			document.getElementById("mproxy.display.toolbar").style.display = "none";
		}
		
		// Thunderbird
		if(navigator.userAgent.search(/Thunderbird/gi) > -1){
			document.getElementById("mproxy.display.context").style.display = "none";
			document.getElementById("mproxy.display.toolbar").style.display = "none";
		}
			
	}catch(err){ alert(mproxy_getString("error.unknown") +"\n"+ err); }
}

function saveOptions(){
	
	try{
		
		//Save
		var oPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
		
		oPrefs.setBoolPref("mproxy.clear.cookies", document.getElementById("mproxy.clear.cookies").checked);
		oPrefs.setBoolPref("mproxy.reload.tab", document.getElementById("mproxy.reload.tab").checked);
		oPrefs.setBoolPref("mproxy.display.statusbar", document.getElementById("mproxy.display.statusbar").checked);
		
		// Not Thunderbird
		if(navigator.userAgent.search(/Thunderbird/gi) < 0){
			oPrefs.setBoolPref("mproxy.display.context", document.getElementById("mproxy.display.context").checked);
			 
			if(oMain != null){
				oPrefs.setBoolPref("mproxy.display.toolbar", document.getElementById("mproxy.display.toolbar").checked);
			}
		}
		
		
		if(oMain != null)
			oMain.mproxy_showMenus();
		
	}catch(err){ alert(mproxy_getString("error.unknown") +"\n"+err); }
	
	if(oMain != null && !inMozOptions)
		oMain.focus();
		
	return true;	
}
