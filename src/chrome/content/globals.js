
var	  gSProxyRdfDataSouce		= "rdf:local-store";
const gSProxyRdfRoot			= "http://mozilla.org/package/mproxy/rdf/all";
const gSProxyRdfNodeUriRoot		= "http://mozilla.org/package/mproxy/rdf"
const gSProxyRdfNodeId			= gSProxyRdfNodeUriRoot+ "#id";
const gSProxyRdfNodeName		= gSProxyRdfNodeUriRoot+ "#name";
const gSProxyRdfNodeProxy		= gSProxyRdfNodeUriRoot+ "#proxy";

const gmproxy_Version	= "1.36";
const gmproxy_DownloadSite	= "https://github.com/jmccrohan/Multiproxy-Switch";

var	gSProxyStrBundle = null;

var gmproxy_options = new Array();
	gmproxy_options['networkProxyType']				= "network.proxy.type";
	gmproxy_options['networkProxyHTTP']				= "network.proxy.http";
	gmproxy_options['networkProxyHTTP_Port']		= "network.proxy.http_port";
	gmproxy_options['networkProxyHTTPShare']		= "network.proxy.share_proxy_settings";
	gmproxy_options['networkProxySSL']				= "network.proxy.ssl";
	gmproxy_options['networkProxySSL_Port']			= "network.proxy.ssl_port";
	gmproxy_options['networkProxyFTP']				= "network.proxy.ftp";
	gmproxy_options['networkProxyFTP_Port']			= "network.proxy.ftp_port";
	gmproxy_options['networkProxyGopher']			= "network.proxy.gopher";
	gmproxy_options['networkProxyGopher_Port']		= "network.proxy.gopher_port";
	gmproxy_options['networkProxySOCKS']			= "network.proxy.socks";
	gmproxy_options['networkProxySOCKS_Port']		= "network.proxy.socks_port";
	gmproxy_options['networkProxySOCKSVersion']		= "network.proxy.socks_version";
	gmproxy_options['networkProxyNone']				= "network.proxy.no_proxies_on";
	gmproxy_options['networkProxyAutoconfigURL']	= "network.proxy.autoconfig_url";
	
var gmproxy_options_defaults = new Array();
	gmproxy_options_defaults['networkProxyType']			= 1;
	gmproxy_options_defaults['networkProxyHTTP']			= "";
	gmproxy_options_defaults['networkProxyHTTP_Port']		= 0;
	gmproxy_options_defaults['networkProxyHTTPShare']		= false;
	gmproxy_options_defaults['networkProxySSL']			 	= "";
	gmproxy_options_defaults['networkProxySSL_Port']		= 0;
	gmproxy_options_defaults['networkProxyFTP']				= "";
	gmproxy_options_defaults['networkProxyFTP_Port']		= 0;
	gmproxy_options_defaults['networkProxyGopher']			= "";
	gmproxy_options_defaults['networkProxyGopher_Port']		= 0;
	gmproxy_options_defaults['networkProxySOCKS']			= "127.0.0.1";
	gmproxy_options_defaults['networkProxySOCKS_Port']		= 9050;
	gmproxy_options_defaults['networkProxySOCKSVersion']	= 5;
	gmproxy_options_defaults['networkProxyNone']			= "localhost, 127.0.0.1";
	gmproxy_options_defaults['networkProxyAutoconfigURL']	= "";
	
/*
* Global Functions
*/
	//Get String Bundle
	function mproxy_getString(sKey){
		try{
		
			if(gSProxyStrBundle == null){
				var oBundle			= Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService);
				gSProxyStrBundle	= oBundle.createBundle('chrome://mproxy/locale/locale.properties');
			}
			
			return gSProxyStrBundle.GetStringFromName(sKey);
				
		}catch(err){}
		
		return "";
	}
	
	// Focus Opener
	function mproxy_openerFocus(){
		try{
			if(opener != null && opener.focus != null){
				opener.focus();
			}
		} catch(err) { }
	}
	
	//Is string empty
	function mproxy_isEmpty(str){
		var oRegExp = new RegExp("([^\\s])", "g");
		
		if(str == "")
			return true;
		
		return !oRegExp.test(str);
	}
	
	// Does this sValue exist in oList
	function mproxy_existsInList(oList, sValue){
		
		for(var i = 0; i < oList.getRowCount(); i++){
			if(oList.getItemAtIndex(i).value == sValue){
				return true;
			}
		}
		
		return false;
	}
	
	// Trims space from both sides of str
	function mproxy_trim(str){
		str	= str.replace(new RegExp("^[\\s\\n\\r]*", "g"), "");
		str	= str.replace(new RegExp("[\\s\\n\\r]*$", "g"), "");
		
		return str;
	}
	
	// Splits a domain or IP from it's port number
	//	returns array[1]
	//		array[0] = (String) Domain or IP
	//		array[1] = (String) Port Number	
	function mproxy_splitDomain(sDomain){
		var aOut	 = new Array();
		var iPort	= -1;
		
		if( (iPort = sDomain.indexOf(":")) > -1){
			aOut[0] = sDomain.substring(0, iPort);
			aOut[1] = sDomain.substring(iPort + 1);
		}
		else{
			aOut[0] = sDomain;
			aOut[1] = "80";
		}
		
		return aOut;
	}
	
	// Returns if str is valid domain or IP address
	function mproxy_isValidDomain(str){
		
		var oValidDomain = new RegExp("^[a-zA-Z0-9][a-zA-Z0-9-\\.:]{0,63}[a-zA-Z0-9]?$", "i");
		
		return oValidDomain.test(str);
	}
	
/*
* Debug Functions
*/
	//Get Properties for an object
	function mproxy_debug_getProps(obj){
		var props = "";
		var i = -1;
		for(prop in obj){
			i++;
			props += prop + " | ";
			
			if(i > 3){
				i = -1;
				props += "\n";
			}
		}
		alert(props);
	}

