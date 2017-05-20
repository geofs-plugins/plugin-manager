var installedPlugins = new Array();

//sends and http requst and returns the output
function httpGet(theUrl)
{
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", theUrl, false );
	xmlHttp.send( null );
	return xmlHttp.responseText;
}

//Sets a cookie to the given value
function setCookie(cname, cvalue) {
	var d = new Date();
	d.setTime(2147483647);
	var expires = "expires="+ d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

//Returns the value of a cookie
function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for(var i = 0; i <ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

//Installs the given plugin url
function addPlugin(pluginUrl){
	installedPlugins[installedPlugins.length] = pluginUrl;
}

//The onLoad method of the plugin manager
function loadPlugins(){
	if(installedPlugins.length == 0){
		//NOTIFY USER : No plugins are installed , please install some plugins first
		return;
	}
	
	for(var i = 0 ; i < installedPlugins.length ; i++){
		var element = installedPlugins[i];	
		var pluginData = httpGet(element);
		if(pluginData == null || pluginData == ""){
			//NOTIFY USER : An error occured while trying to fetch plugin data
		} else {
			eval(pluginData);
			if(pluginAuthor == undefined || pluginAuthor == null){
			//NOTIFY USER : Plugin Author is not defined
			} else if (pluginVersion == undefined || pluginVersion == null) {
				//NOTIFY USER : Plugin Version is not defined
			} else if (pluginDescription == undefined || pluginDescription == null) {
				//NOTIFY USER : Plugin Description is not defined
			} else if (pluginOnLoad == undefined || pluginOnLoad == null) {
				//NOTIFY USER : Plugin main on load function is not found
			} else {
				pluginOnLoad();
			}
		}
	}
}
