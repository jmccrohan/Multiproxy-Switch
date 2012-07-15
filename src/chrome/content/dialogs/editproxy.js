
var gIsEdit   = false;
var gList;
var mproxyURI;
var mproxy;
var mproxyConfig;
var mproxyNameField;
var gFromProxyManager;

function mproxy_initVals(){
  
  
  //Set Globals
  mproxyNameField  = document.getElementById("proxy-name");
  
  //Edit
  if(window.arguments.length > 1 && window.arguments[0] == "edit" && !mproxy_isEmpty(window.arguments[1])){
    
    //Proxy URI
    mproxyURI = window.arguments[1];    
    
    gIsEdit  = true;
    try{
      mproxy = mproxy_ds_getResource(mproxyURI);
    
      //Load Fields
      var mproxyConfig = mproxy_ds_getPropertyValuesFor(mproxyURI);
      for(key in gmproxy_options){
        var oField  = document.getElementById(key);
        var sValue  = mproxyConfig[gSProxyRdfNodeUriRoot + "#" + key];
        
        oField.value = sValue;
      }
      
      //Label
      mproxyNameField.value = mproxyConfig[gSProxyRdfNodeName];
      
      //Set Socks Radio
      oSocks = document.getElementById("networkProxySOCKSVersion");
      if(oSocks.value == "4")
        oSocks.selectedItem = document.getElementById("networkProxySOCKSVersion4");
      else
        oSocks.selectedItem = document.getElementById("networkProxySOCKSVersion5");
        
       //Share one proxy
       oShare = document.getElementById("networkProxyHTTPShare");
       if (oShare.value == "true")
         //oShare.checked = true;
          document.getElementById("networkProxyHTTPShare").checked = oShare.value;

        else  
         oShare.checked = false;

      //Sharing box
     //if (document.getElementById("networkProxyHTTPShare").value == "true");
       


    }catch(err){ alert(mproxy_getString("error.unknown")); self.close(); }
  }
  
  //Enable Fields
  
  mproxy_enableShareSettingOnStart();
  mproxy_enableOptions();
  
  // Thunderbird
  if(navigator.userAgent.search(/Thunderbird/gi) > -1){
  	document.getElementById("ftp_row").style.display = "none";
  	document.getElementById("gopher_row").style.display = "none";
  	document.getElementById("none_row").style.display = "none";
  	document.getElementById("none_example_row").style.display = "none";	
  }
}

function mproxy_saveProxy(){
  
  try{
    
    /*
    * Validation
    */
      //Empty
      if(mproxyNameField.value == ""){
        alert(mproxy_getString("error.add.empty"));
        
        mproxyNameField.focus();
        mproxyNameField.setSelectionRange(0, mproxyNameField.textLength);
        
        return false;
      }
      //Special Chars
      else if(!mproxy_allowedChars(mproxyNameField.value)){
        alert(mproxy_getString("error.add.invalid"));
        return false;
      }
      //Can't be named 'None' or 'tor'
      else if(mproxy_simplify(mproxyNameField.value) == mproxy_simplify(mproxy_getString("common.proxy.none"))){
        alert(mproxy_getString("error.add.duplicate"));
        return false;
      }
      //else if((!gIsEdit) && (mproxy_simplify(mproxyNameField.value) == mproxy_simplify("tor"))){
      //  alert(mproxy_getString("error.add.duplicate"));
      //  return false;
     // }
     // else if((!gIsEdit) && (mproxy_simplify(mproxyNameField.value) == mproxy_simplify(mproxy_getString("common.proxy.tor")))){
     //   alert(mproxy_getString("error.add.duplicate"));
     //   return false;
     // }
        
      //Is This a Duplicate Label?
      var oTestProxy = mproxy_ds_getElementForValue(gSProxyRdfNodeName, mproxyNameField.value);
      if(oTestProxy != null && (!gIsEdit  || oTestProxy.Value != mproxy.Value)){
        alert(mproxy_getString("error.add.duplicate"));
        return false;
      }
    
         //save share setting
      document.getElementById("networkProxyHTTPShare").value = document.getElementById("networkProxyHTTPShare").checked;
    
    /*
    * Edit
    */
      if(gIsEdit){
        //Update RDF Properties
        for(key in gmproxy_options){
          mproxy_ds_changePropertyValue(mproxy, (gSProxyRdfNodeUriRoot + "#" + key), document.getElementById(key).value);
        }
        
        //Update Name
        mproxy_ds_changePropertyValue(mproxy, gSProxyRdfNodeName, mproxyNameField.value);
      }
    /*
    * Add
    */
      else{
        var sProxyUri   = opener.mproxy_getUniqueProxyUri();
        var oProxy    = mproxy_ds_getResource(sProxyUri);
        
        //Add Element
        mproxy_ds_addElement(sProxyUri);
        
        //Add Properties
        for(key in gmproxy_options){
          var oProp = mproxy_ds_getResource(gSProxyRdfNodeUriRoot + "#" + key);
          mproxy_ds_addProperty(oProxy, oProp, document.getElementById(key).value, true);
        }
        
        //Add Name
        mproxy_ds_addProperty(oProxy, mproxy_ds_getResource(gSProxyRdfNodeName), mproxyNameField.value, true);
      }
    /*
    * Finish
    */      
      opener.mproxy_populateList();
      mproxy_ds_save();

	  if(gIsEdit){
        
        //Is this proxy is in use, refresh proxy
        var oPrefs  = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
        if(oPrefs.prefHasUserValue("mproxy.proxy.current") 
          && oPrefs.getCharPref("mproxy.proxy.current") == mproxy.Value){
          
          opener.mproxy_doCommand("mproxy_setProxy()");
        }
        //If not in use, select proxy
        else{
          opener.mproxy_doCommand("mproxy_selectItem('"+ mproxyNameField.value +"')");
        }
        
        //alert("Proxy Info Changed");
      }
      else{
        opener.mproxy_doCommand("mproxy_selectItem('"+ mproxyNameField.value +"')"); 
        //alert("Proxy Added");
      }

      
  }catch(e){
    alert(mproxy_getString("error.unknown") +"\n("+ e +")");
    return;
  }
  
  mproxy_openerFocus()  
  return true;
}


//Enable or disable Manual
//  + config options
function mproxy_enableOptions(){
  
  var disable = !(document.getElementById("networkProxyType").value == "1"); //if 1 then manual is selected
  
  //Set Radios
  oType = document.getElementById("networkProxyType");
  if(!disable){
    oType.selectedItem = document.getElementById("type-manual-radio");

  }
  else{
    oType.selectedItem = document.getElementById("type-auto-radio");
  }
  if (document.getElementById("networkProxyType").value == "2"){
  
  //Manual Options
  document.getElementById("networkProxyHTTP").disabled = true;
  document.getElementById("networkProxyHTTP_Port").disabled = true;
  document.getElementById("networkProxyHTTPShare").disabled = true;
  document.getElementById("networkProxySSL").disabled = true;
  document.getElementById("networkProxySSL_Port").disabled = true;
  document.getElementById("networkProxyFTP").disabled = true;
  document.getElementById("networkProxyFTP_Port").disabled = true;
  document.getElementById("networkProxyGopher").disabled = true;
  document.getElementById("networkProxyGopher_Port").disabled = true;
  document.getElementById("networkProxySOCKS").disabled = true;
  document.getElementById("networkProxySOCKS_Port").disabled = true;
  document.getElementById("networkProxySOCKSVersion4").disabled = true;
  document.getElementById("networkProxySOCKSVersion5").disabled = true;
  document.getElementById("networkProxyNone").disabled = true;

  //Auto
  document.getElementById("networkProxyAutoconfigURL").disabled = false;
 
}
else{
//When manual setting is checked
  mproxy_enableShareSetting();
  document.getElementById("networkProxyHTTP").disabled = false;
  document.getElementById("networkProxyHTTP_Port").disabled = false;
  document.getElementById("networkProxyHTTPShare").disabled = false;
  document.getElementById("networkProxyNone").disabled = false;
  document.getElementById("networkProxyAutoconfigURL").disabled = true;
}
}
//Set setting on start-up
function mproxy_enableShareSettingOnStart(){
var disabletextbox = (document.getElementById("networkProxyHTTPShare").value == "true");

  document.getElementById("networkProxySSL").disabled = disabletextbox;
  document.getElementById("networkProxySSL_Port").disabled = disabletextbox;
  document.getElementById("networkProxyFTP").disabled = disabletextbox;
  document.getElementById("networkProxyFTP_Port").disabled = disabletextbox;
  document.getElementById("networkProxyGopher").disabled = disabletextbox;
  document.getElementById("networkProxyGopher_Port").disabled = disabletextbox;
  document.getElementById("networkProxySOCKS").disabled = disabletextbox;
  document.getElementById("networkProxySOCKS_Port").disabled = disabletextbox;
  document.getElementById("networkProxySOCKSVersion4").disabled = disabletextbox;
  document.getElementById("networkProxySOCKSVersion5").disabled = disabletextbox;

}
//Disable below when check sharing setting
function mproxy_enableShareSetting(){
var disabletextbox = (document.getElementById("networkProxyHTTPShare").checked == true);

  document.getElementById("networkProxySSL").disabled = disabletextbox;
  document.getElementById("networkProxySSL_Port").disabled = disabletextbox;
  document.getElementById("networkProxyFTP").disabled = disabletextbox;
  document.getElementById("networkProxyFTP_Port").disabled = disabletextbox;
  document.getElementById("networkProxyGopher").disabled = disabletextbox;
  document.getElementById("networkProxyGopher_Port").disabled = disabletextbox;
  document.getElementById("networkProxySOCKS").disabled = disabletextbox;
  document.getElementById("networkProxySOCKS_Port").disabled = disabletextbox;
  document.getElementById("networkProxySOCKSVersion4").disabled = disabletextbox;
  document.getElementById("networkProxySOCKSVersion5").disabled = disabletextbox;
  
  //if (document.getElementById("networkProxyHTTPShare").value == "true"){
  //mproxy_copySetting();
//}
}
function mproxy_enableShareSettingSelect(){
var disabletextbox = (document.getElementById("networkProxyHTTPShare").checked == true);

  document.getElementById("networkProxySSL").disabled = disabletextbox;
  document.getElementById("networkProxySSL_Port").disabled = disabletextbox;
  document.getElementById("networkProxyFTP").disabled = disabletextbox;
  document.getElementById("networkProxyFTP_Port").disabled = disabletextbox;
  document.getElementById("networkProxyGopher").disabled = disabletextbox;
  document.getElementById("networkProxyGopher_Port").disabled = disabletextbox;
  document.getElementById("networkProxySOCKS").disabled = disabletextbox;
  document.getElementById("networkProxySOCKS_Port").disabled = disabletextbox;
  document.getElementById("networkProxySOCKSVersion4").disabled = disabletextbox;
  document.getElementById("networkProxySOCKSVersion5").disabled = disabletextbox;
  
  //if (document.getElementById("networkProxyHTTPShare").value == "true"){
  mproxy_copySetting();
//}
}
//Copy http proxy
function mproxy_copySetting(){
if (document.getElementById("networkProxyHTTPShare").checked == true){
  document.getElementById("networkProxySSL").value = document.getElementById("networkProxyHTTP").value;
  document.getElementById("networkProxySSL_Port").value = document.getElementById("networkProxyHTTP_Port").value;
  document.getElementById("networkProxyFTP").value = document.getElementById("networkProxyHTTP").value;
  document.getElementById("networkProxyFTP_Port").value = document.getElementById("networkProxyHTTP_Port").value;
  document.getElementById("networkProxyGopher").value = document.getElementById("networkProxyHTTP").value;
  document.getElementById("networkProxyGopher_Port").value = document.getElementById("networkProxyHTTP_Port").value;
  document.getElementById("networkProxySOCKS").value = document.getElementById("networkProxyHTTP").value;
  document.getElementById("networkProxySOCKS_Port").value = document.getElementById("networkProxyHTTP_Port").value;
}
else{
  document.getElementById("networkProxySSL").value = "";
  document.getElementById("networkProxySSL_Port").value = "";
  document.getElementById("networkProxyFTP").value = "";
  document.getElementById("networkProxyFTP_Port").value = "";
  document.getElementById("networkProxyGopher").value = "";
  document.getElementById("networkProxyGopher_Port").value = "";
  document.getElementById("networkProxySOCKS").value = "";
  document.getElementById("networkProxySOCKS_Port").value = "";
}	
}
