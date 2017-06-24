//Displaying a list of all of the installed plugins
chrome.storage.local.get(["installed_plugins" , "dev_plugins" , "devMode"] , function(data){
	var installed_plugins = data["installed_plugins"];

	if(installed_plugins == undefined){
		installed_plugins = [];
	}

	for(var i = 0 ; i < installed_plugins.length ; i++){
		var plugin = installed_plugins[i];
		createSwitch(plugin["id"] , plugin["name"] , plugin["is_enabled"]);
	}

	if(installed_plugins.length == 0){
		setNotice("Please wait for GeoFS plugins to load ! </br> try refreshing if it doesn't work !");
	}

	if(data["devMode"]){
		toggleDevMode(true);
		document.getElementById("devModeToggle").checked = true;
	}

});

//Changes the notice message
function setNotice(innerText){
	$("#notice").html(innerText);
}




// ----------------------------- Plugins Functions -----------------------------

//Called when adding a new plugin
$(document).on('click' , '#addPluginButton' , function(){
	let infoUrl = $("#pluginUrl").val();
	$.ajax({
		url : infoUrl ,
		method : "GET" ,
		success : function(e){
			var data = e;

			//Making sure all of the required variables are found
			var variables = [data["name"] , data["id"] , data["description"] , data["version"] , data["last_modified"] , data["url"]];
			for(var i = 0 ; i < variables.length ; i++){
				if(variables[i] == undefined || variables[i] == null || variables[i] == ""){
					alert("Error : plugin structure is not valid");
					return;
				}
			}

			let plugin = {
				"name" : data["name"] ,
				"version" : data["version"] ,
				"description" : data["description"] ,
				"id" : data["id"] ,
				"last_modified" : data["last_modified"] ,
				"url" : data["url"] ,
				"is_enabled" : true ,
				"is_default" : false ,
				"info_url" : infoUrl
			};


			//Fetching and saving the plugin's content
			chrome.storage.local.get(["installed_plugins" , "saved_plugins"] , function(data){
				let installed_plugins = data["installed_plugins"];
				let saved_plugins = data["saved_plugins"];

				$.ajax({
					url : plugin["url"] ,
					method : "GET" ,
					success : function(content){
						saved_plugins[plugin["id"]] = content;
						installed_plugins[installed_plugins.length] = plugin;
						chrome.storage.local.set({"saved_plugins" : saved_plugins , "installed_plugins" : installed_plugins});
						alert("Plugin has been installed !");
					} ,
					error : function(){
						alert("Error : Url not found");
					}
				});
			});
		} ,

		error : function(){
			alert("Error : Url not found");
		}
	});
});

//Called when a plugin is toggled
$(document).on('click', '.tgl', function() {
	set($(this)[0].id , $(this)[0].checked);
});

//Called when removing a plugin
$(document).on('click' , '.removeButton' , function(){
	var element = $(this)[0];
	let pluginId = element.id.substring(12);
	chrome.storage.local.get(["installed_plugins" , "saved_plugins"] , function(data){
		var newPluginArray = [];
		var currentPluginArray = data["installed_plugins"];
		for(var i = 0 ; i < currentPluginArray.length ; i++){
			//Going over all of the plugins
		
			//If the plugin is not the selected plugin then add it to the list
			if(currentPluginArray[i]["id"] != pluginId){
				newPluginArray[newPluginArray.length] = currentPluginArray[i];
			} else {
				//If it is and is a default plugin , add it and notify the user that he can't do that
				if(currentPluginArray[i]["is_default"]){
					alert('You cannot remove a default plugin , only toggle it');
					newPluginArray[newPluginArray.length] = currentPluginArray[i];
				}
			}
		}

		if(newPluginArray.length < currentPluginArray.length){
			var savedPlugins = data["saved_plugins"];
			if(savedPlugins != undefined && savedPlugins != null){
				delete savedPlugins[pluginId];
			}
			chrome.storage.local.set({"installed_plugins" : newPluginArray , "saved_plugins" : savedPlugins});
			alert("Plugin has been removed");
		}
	});
});

//Toggles a plugins
function set(pluginId , enabled) {
	chrome.storage.local.get(["installed_plugins"], function(data) {
		var installed_plugins = data["installed_plugins"];
		var plugin = null;

		for(var i = 0 ; i < installed_plugins.length ; i++){
			if(installed_plugins[i].id == pluginId){
				plugin = installed_plugins[i];
			}
		}

		if(plugin != null){
			plugin.is_enabled = enabled;
			chrome.storage.local.set({"installed_plugins": data["installed_plugins"]}, function() {
				setNotice("<center style='color: red;'>Please refresh your GeoFS game to apply changes</center></br>");
			});
		}
	});
}

//Creates a toggle for a plugin
function createSwitch(id, name, toggled) {
	$("#togglesDivtbl").append("<tr><td><b style='display: inline-block; float: left;'>" + name + "</b></td><td><label style='float: right' class='switch'><input class='tgl' type='checkbox' id='" + id + "'" + (toggled ? "checked" : "") + "><div class='slider round'></div></label></td><td><button class='removeButton' id='removeButton" + id + "'>Remove</button></td></tr>");
}




// ----------------------------- Dev Mode Functions -----------------------------


//Called when adding a new developer mode plugin
$(document).on('click' , '.addDevPlugin' , function(){
	let name = document.getElementById('devPluginName').value;
	let path = document.getElementById('devPluginFile').value;

	chrome.storage.local.get(["dev_plugins"] , function(data){
		let dev_plugins = data["dev_plugins"];
		if(dev_plugins == undefined || dev_plugins == null ){
			dev_plugins = {};
		}
		dev_plugins[name] = {"path" : path , "is_enabled" : true , "name" : name};
		chrome.storage.local.set({"dev_plugins" : dev_plugins});
		alert("Developer plugin added !");		
	});

});

//Toggles dev mode
function toggleDevMode(state){
	var devModeDiv = document.getElementById('devModeDiv');
	var isDev = state;
	chrome.storage.local.set({"devMode" : isDev});

	if(isDev){

		//Show dev mode
		var devModeHtml = "<table>";
		devModeHtml += "<tr width='100%'><td width='100%' align='center'><table id='devTogglesDivtbl' style='width: 80%;'></table><br/><hr></td></tr>";
		devModeHtml += "<tr><td> Name : <input type='text' id='devPluginName'></br> </tr></td>";
		devModeHtml += "<tr><td>Code file : <input type='text' id='devPluginFile'></br></td></tr>";
		devModeHtml += "<tr><td align='center'><input class='addDevPlugin' type='button' value='Add' id='addDevPlugin'></td></tr></table>";

		devModeDiv.innerHTML = devModeHtml;

		chrome.storage.local.get(["dev_plugins"] , function(data){
			let dev_plugins = data["dev_plugins"];
			for (var key in dev_plugins) {
				if (dev_plugins.hasOwnProperty(key)) {
					var plugin = dev_plugins[key];
					createDevSwitch(plugin["name"] , plugin["is_enabled"]);
				}
			}
		});
	} else {
		devModeDiv.innerHTML = "";
	}
}

//Called when toggling dev mode
$(document).on('click' , '.devModeToggle' , function(){
	let state = $(this)[0].checked;
	let name = $(this)[0].id;
	toggleDevMode(state);
	chrome.storage.local.get(["dev_plugins"] , function(data){
		let plugins_list = data["dev_plugins"];
		plugins_list[name]["is_enabled"] = state;
		chrome.storage.local.get({"dev_plugins" : plugins_list});
	});
});

//Creates a dev mode plugin toggle
function createDevSwitch(name , toggled){
	$("#devTogglesDivtbl").append("<tr><td><b style='display: inline-block; float: left;'>" + name + "</b></td><td><label style='float: right' class='switch'><input class='devTgl' type='checkbox' id='" + name + "'" + (toggled ? "checked" : "") + "><div class='slider round'></div></label></td><td><button class='devRemoveButton' id='devRemoveButton" + name + "'>Remove</button></td></tr>");
}

///On remove dev plugin
$(document).on('click' , '.devRemoveButton' , function(){
	let name = $(this)[0].id.substring(15);
	chrome.storage.local.get(["dev_plugins"] , function(data){
		let dict = data["dev_plugins"];
		delete dict[name];
		console.log(dict);
		chrome.storage.local.set({"dev_plugins" : dict});
		alert("Plugin has been removed !");
	});
});

//Called when toggling a dev mode plugin
$(document).on('click' , '.devTgl' , function(){
		let name = $(this)[0].id;
		let state = $(this)[0].checked;
		chrome.storage.local.get(["dev_plugins"] , function(data){
			let dev_plugins = data["dev_plugins"];
			for(var plugin in dev_plugins){
				if(dev_plugins.hasOwnProperty(plugin)){
					if(dev_plugins[plugin]["name"] == name){
						dev_plugins[plugin]["is_enabled"] = state;
					}
				} else {
					alert("What ?");
				}
			}

			chrome.storage.local.set({"dev_plugins" : dev_plugins});
		});
});
