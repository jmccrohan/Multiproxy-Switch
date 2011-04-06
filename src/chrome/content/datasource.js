//DataSource
var gSProxyDs			= null;
var gSProxyRdf			= null;
var gSProxyRdfC			= null;
var gSProxyRDFUtil		= null

//Initializes the RDF Datasource components
function mproxy_ds_initDataSource(){
	try{
		
		// Datasource URI
		if(gSProxyRdfDataSouce == "rdf:local-store"){
			var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
			var io = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
			file = file.get("PrefD", Components.interfaces.nsILocalFile);
			file.appendRelativePath("multiproxy.rdf");
			
			io = io.newFileURI(file);
			gSProxyRdfDataSouce = io.spec;
		}
	
		if(gSProxyRdf == null)
			gSProxyRdf = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);
		if(gSProxyDs == null)
			gSProxyDs	= gSProxyRdf.GetDataSourceBlocking(gSProxyRdfDataSouce);
		if(gSProxyRDFUtil == null)
			gSProxyRDFUtil = Components.classes["@mozilla.org/rdf/container-utils;1"].getService(Components.interfaces.nsIRDFContainerUtils);
		if(gSProxyRdfC == null){
			gSProxyRdfC = Components.classes["@mozilla.org/rdf/container;1"].createInstance(Components.interfaces.nsIRDFContainer);
			
			//Get or Add Sequence
			try{
				gSProxyRdfC.Init(gSProxyDs, gSProxyRdf.GetResource(gSProxyRdfRoot)); //Get
			}catch(err){
				gSProxyRdfC = gSProxyRDFUtil.MakeSeq(gSProxyDs, gSProxyRdf.GetResource(gSProxyRdfRoot)); //Create
			}
		}
				
	}catch(err){ throw "(mproxy_ds_initDataSource)\n" + err; }
}

//Add RDF Observer
function mproxy_ds_addObserver(oObserver){
	mproxy_ds_initDataSource();
	
	try{
		gSProxyDs.AddObserver(oObserver);
	}catch(err){throw "(mproxy_ds_addObserver)\n" + err}
}

//Returns resource for the given uri
function mproxy_ds_getElement(sUri){
	mproxy_ds_initDataSource();
	
	try{
		return gSProxyRdf.GetResource(sUri);
	}catch(err){ throw "(mproxy_ds_getElement)\n" + err; }
}

//Duplicate of mproxy_ds_getElement
function mproxy_ds_getResource(sAbout){
	return mproxy_ds_getElement(sAbout)
}

//Returns array of all mproxy Element URIs
//	array[index] = uri
function mproxy_ds_getAllElements(){
	mproxy_ds_initDataSource();
	
	var aOut		= new Array();
	var aElements	= gSProxyRdfC.GetElements();
	while(aElements.hasMoreElements()){
		var oRes = aElements.getNext();
			oRes = oRes.QueryInterface(Components.interfaces.nsIRDFResource);
		
		aOut[aOut.length] = oRes.Value;
	}
	
	return aOut;
}

//Returns an associative array of properties (attributes) contained in sUri element
//	array[propName] = oRes
function mproxy_ds_getPropertiesFor(sUri){
	mproxy_ds_initDataSource();
	
	var aOut = new Array();
	
	//Get an array of elements for sAbout
	try{
		var oRes	= mproxy_ds_getElement(sUri);
		var oTrgts	= gSProxyDs.ArcLabelsOut(oRes);
		while(oTrgts.hasMoreElements()){
			var oTrgt = oTrgts.getNext();
			
			if (oTrgt instanceof Components.interfaces.nsIRDFResource){
				var sTrgName = oTrgt.Value.substring(gSProxyRdfNodeUriRoot.length + 1); //return node name without URI
				aOut[sTrgName] = oTrgt;
			}
		}
	}catch(err){throw "(mproxy_ds_getPropertiesFor)\n" + err}
	
	return aOut;
}

//Similar to 'mproxy_ds_getPropertiesFor' however returns uri=>literal_object_value
//	array[uri] = oLiteral
function mproxy_ds_getPropertyValuesFor(sUri){
	mproxy_ds_initDataSource();
	
	var aOut = new Array();
	
	//Get an array of elements for sAbout
	try{
		var oRes	= mproxy_ds_getElement(sUri);
		var oTrgts	= gSProxyDs.ArcLabelsOut(oRes, true);
		while(oTrgts.hasMoreElements()){
			var oTrgt = oTrgts.getNext();
			
			if (oTrgt instanceof Components.interfaces.nsIRDFResource){
				aOut[oTrgt.Value] = mproxy_ds_getValueFor(oRes, oTrgt);
			}
		}
	}catch(err){throw "(mproxy_ds_getPropertyValuesFor)\n" + err}
	
	return aOut;
}

//Returns element that has this property/value
function mproxy_ds_getElementForValue(sPropertyUri, sValue){
	mproxy_ds_initDataSource();
	
	try{
		var oValue		 = gSProxyRdf.GetLiteral(sValue);
		var oProp		 = gSProxyRdf.GetResource(sPropertyUri);
		var oSubject	= gSProxyDs.GetSource(oProp, oValue, true);
		
		return oSubject;
		
	}catch(err){throw "(mproxy_ds_getElementForValue)\n" + err}
	
	return null;
}

// Returns all elements that has this property/value
function mproxy_ds_getElementsForValue(sPropertyUri, sValue){
	mproxy_ds_initDataSource();
	
	var aOut = new Array();
	
	try{
		var oValue		 = gSProxyRdf.GetLiteral(sValue);
		var oProp		 = gSProxyRdf.GetResource(sPropertyUri);
		var aSubject	= gSProxyDs.GetSources(oProp, oValue, true);
		var oSubject	= null
		
		while(aSubject.hasMoreElements()){
			oSubject = aSubject.getNext().QueryInterface(Components.interfaces.nsIRDFResource);
			aOut[aOut.length] = oSubject;
		}
		
	}catch(err){throw "(mproxy_ds_getElementsForValue)\n" + err}
	
	return aOut;
}

//Change element's URI
function mproxy_ds_changeElementUri(oRes, sNewUri){
	mproxy_ds_initDataSource();
		
	try{
		
		//Get All Properties for element
		var aProps = mproxy_ds_getPropertyValuesFor(oRes.Value);
		
		//Remove Element
		mproxy_ds_removeElement(oRes.Value);
		
		//Create element again with new URI
		var newElem = gSProxyRdf.GetResource(sNewUri);
		gSProxyRdfC.AppendElement(newElem);
		for(sProp in aProps){
			gSProxyDs.Assert(newElem, gSProxyRdf.GetResource(sProp), gSProxyRdf.GetLiteral(aProps[sProp]), true);
		}
		
	}catch(err){throw "(mproxy_ds_changeElementUri)\n" + err}
}

//Add element with given sUri, returns added resource
function mproxy_ds_addElement(sUri){
	mproxy_ds_initDataSource();
		
	try{
		
		return oRes = gSProxyRdfC.AppendElement(gSProxyRdf.GetResource(sUri));
		
	}catch(err){throw "(mproxy_ds_addElement)\n" + err}
}

//Remove Element for sUri
function mproxy_ds_removeElement(sUri){
	mproxy_ds_initDataSource();
	
	try{
		var oRes = gSProxyRdf.GetResource(sUri);
	
		//Remove All Archs
		// Loop for duplicates
		var aArchs		= null;
		var hasArchs	= true;
		while(hasArchs){
			aArchs		 = gSProxyDs.ArcLabelsOut(oRes);
			hasArchs	 = aArchs.hasMoreElements();
			while(aArchs.hasMoreElements()){
				oArch = aArchs.getNext().QueryInterface(Components.interfaces.nsIRDFResource);
				
				//Remove
				gSProxyDs.Unassert(oRes, oArch, gSProxyDs.GetTarget(oRes, oArch, true));
			}
		}
		
		//Remove Element
		gSProxyRdfC.RemoveElement(oRes, true);
	}catch(err){throw "(mproxy_ds_removeElement)\n" + err}
}

//Remove property (sUri) from oRes
function mproxy_ds_removeProperty(sUri, oRes, sValue){
	mproxy_ds_initDataSource();
	
	try{
		var oPred	 = gSProxyRdf.GetResource(sUri);
		var aValues	= mproxy_ds_getValuesFor(oRes, oPred);
			 
	if(typeof(sValue) == 'undefined'){
		// Make sure to delete all properites of this sUri
		for(var i = 0; i < aValues.length; i++){ 
			gSProxyDs.Unassert(oRes, oPred, gSProxyRdf.GetLiteral(aValues[i]) );
		}
	}
	else{
		// Only delete the property with this value
		sValue = gSProxyRdf.GetLiteral(sValue);
		if(gSProxyDs.HasAssertion(oRes, oPred, sValue, true)){
			gSProxyDs.Unassert(oRes, oPred,  sValue);
		}
	}
		
	}catch(err){throw "(mproxy_ds_removeProperty)\n" + err}
}

//Does URI Exist
function mproxy_ds_doesProxyElementExist(sProxyUri){
	mproxy_ds_initDataSource();
	
	try{
		var aElems = mproxy_ds_getAllElements();
		for(var e = 0; e < aElems.length; e++){
			if(aElems[e] == sProxyUri)
				return true;
		}		
	}catch(err){throw "(mproxy_ds_doesElementExist)\n" + err}
}

//Get Index of URI
function mproxy_ds_indexOf(sProxyUri){
	mproxy_ds_initDataSource();
	
	try{
		return gSProxyRdfC.IndexOf(mproxy_ds_getResource(sProxyUri));
	}catch(err){throw "(mproxy_ds_indexOf)\n" + err}
}

//Rename oProp's URI to sNewUri
function mproxy_ds_renamePropertyUri(oRes, oProp, sNewUri){
	mproxy_ds_initDataSource();
	
	try{
		var sValue = gSProxyDs.GetTarget(oRes, oProp, true).QueryInterface(Components.interfaces.nsIRDFLiteral);
		
		gSProxyDs.Unassert(oRes, oProp, gSProxyDs.GetTarget(oRes, oProp, true));
		gSProxyDs.Assert(oRes, gSProxyRdf.GetResource(sNewUri), sValue, true);
		
	}catch(err){throw "(mproxy_ds_renamePropertyUri)\n" + err}
}

//Add Property oProp to oRes
function mproxy_ds_addProperty(oRes, oProp, sValue, overwriteExisting){
	mproxy_ds_initDataSource();
		
	try{
		//Don't overwrite it this property exists
		if(!overwriteExisting && gSProxyDs.hasArcOut(oRes, oProp))
			return;
			
		//Add
		gSProxyDs.Assert(oRes, oProp, gSProxyRdf.GetLiteral(sValue), true);
	}catch(err){throw "(mproxy_ds_addProperty)\n" + err}
}

//Change Property value for sPropUri in oRes
function mproxy_ds_changePropertyValue(oRes, sPropUri, sValue){
	mproxy_ds_initDataSource();
		
	try{
		var oProp = gSProxyRdf.GetResource(sPropUri);
		
		//Get old value
		var sOld = mproxy_ds_getValueFor(oRes, oProp);
		
		//Change
		gSProxyDs.Change(oRes, oProp, gSProxyRdf.GetLiteral(sOld), gSProxyRdf.GetLiteral(sValue));
		
	}catch(err){throw "(mproxy_ds_changePropertyValue)\n" + err}
}

//Get Property Value for Property oProp
function mproxy_ds_getValueFor(oRes, oProp){
	mproxy_ds_initDataSource();
	
	try{
		oTrgt = gSProxyDs.GetTarget(oRes, oProp, true);
		
		if(oTrgt instanceof Components.interfaces.nsIRDFLiteral){
			return oTrgt.Value;
		}
		
	}catch(err){throw "(mproxy_ds_getValueFor)\n" + err}
	
	return null;
}

//Get All Property Values for Property oProp
//	This is similiar to mproxy_ds_getValueFor
//	except it returns ALL values for oProp in an array
//		array[index] = sValue
function mproxy_ds_getValuesFor(oRes, oProp){
	mproxy_ds_initDataSource();

	var aOut = new Array();
	
	try{
		var aTrgts	 = gSProxyDs.GetTargets(oRes, oProp, true)
		var oTrgt	= null;
		
		while(aTrgts.hasMoreElements()){
			oTrgt = aTrgts.getNext()
			
			if(oTrgt instanceof Components.interfaces.nsIRDFLiteral){
				aOut[aOut.length] = oTrgt.Value;
			}
		}
	}catch(err){throw "(mproxy_ds_getValueFor)\n" + err}
	
	return aOut;
}

//Does Property/Value exist in oRes
function mproxy_ds_doesPropValueExist(oRes, sPropUri, sValue){
	mproxy_ds_initDataSource();
		
	try{
		var oProp	= gSProxyRdf.GetResource(sPropUri);
		var aValues	= mproxy_ds_getValuesFor(oRes, oProp);
		
		//Find in array
		for(var i = 0; i < aValues.length; i++){
			if(aValues[i] == sValue)
				return true;
		}
		
	}catch(err){throw "(mproxy_ds_doesPropValueExist)\n" + err}
	
	return false;
}

/*
* GET PROPERTIES
*/
	
	//Get RDF Container
	function mproxy_ds_getRDFContainer(){
		mproxy_ds_initDataSource();
		return gSProxyRdf;
	}
	
