chrome.storage.local.get(["installed_plugins"] , function(data){
	var installed_plugins = [];
	try{installed_plugins = data["installed_plugins"];}catch(ex){}

	for(var i = 0 ; i < installed_plugins.length ; i++){
		var plugin = installed_plugins[i];
		createSwitch(plugin["id"] , plugin["name"] , plugin["is_enabled"]);
	}
});


$(document).on('click' , '#addPluginButton' , function(){
	$.ajax({
		url : $("#pluginUrl").val() ,
		method : "GET" ,
		success : function(e){
			alert("Url is available");
			var data = JSON.parse(e);
			var variables = [data["name"] , data["id"] , data["description"] , data["version"] , data["last_modified"] , data["url"]];
			for(var i = 0 ; i < variables.length ; i++){
				if(variables[i] == undefined || variables[i] == null || variables[i] == ""){
					//TODO : Notify the user there is a problem with the plugin
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
				"is_default" : false
			};

			chrome.storage.local.get(["installed_plugins"] , function(data){
				var list = data["installed_plugins"];
				list[list.length] = plugin;
				chrome.storage.local.set({"installed_plugins" : list});
			});

		} ,

		error : function(){
			alert("Url is not available");
		}
	});
});


$(document).on('click', '.tgl', function() {
	set($(this)[0].id , $(this)[0].checked);
});

function set(pluginId , enabled) {
	chrome.storage.local.get(["installed_plugins"], function(data) {
		var installed_plugins = data["installed_plugins"];
		var plugin = null;

		for(var i = 0 ; i < installed_plugins.length ; i++){
			if(installed_plugins[i].id == pluginId){
				plugin = installed_plugins[i];
			}
			//TODO : Check for dupes.
		}

		if(plugin != null){
			plugin.is_enabled = enabled;
			chrome.storage.local.set({"installed_plugins": data["installed_plugins"]}, function() {
				setNotice("Please refresh your GeoFS game to apply changes");
			});
		}

		//TODO : Check if plugin is null
	});
}

function setNotice(innerText){
	$("#notice").text(innerText);
}

function createSwitch(id, name, toggled) {
	$("#togglesDivtbl").append("<tr><td><b style='display: inline-block; float: left;'>" + name + "</b></td><td><label style='float: right' class='switch'><input class='tgl' type='checkbox' id='" + id + "'" + (toggled ? "checked" : "") + "><div class='slider round'></div></label></td></tr>");
}
