chrome.storage.local.get(["installed_plugins"], function(data)
{

	setNotice("Loading...");

	let installed_plugins = [];
	try
	{
		installed_plugins = JSON.parse(data["installed_plugins"]);
	}
	catch(ex)
	{
		installed_plugins = [];
	}

	$.ajax(
	{
		url : "http://geofs-plugins.appspot.com/list.php",
		type : "GET" ,
		success : function(e)
		{
			var default_plugins_list = JSON.parse(e);
			for(var i = 0 ; i < default_plugins_list.length ; i++)
			{
				let default_plugin = default_plugins_list[i];
				var installed_plugin = null;
				for(var j = 0 ; j < installed_plugins.length ; j++)
				{
					if(default_plugin["id"] == installed_plugins[j]["id"])
					{
						if(installed_plugin != null)
						{
							//ERROR : THERE ARE 2 PLUGINS WITH THE SAME ID
							//TODO : Prioritize default plugins
						}
						else
						{
							installed_plugin = installed_plugins[j];
						}
					}
				}

				//If the plugin is not installed or the version installed is not the latest and the code is actually where it's supposed to be
				if(installed_plugin == null || parseInt(installed_plugin["last_modified"]) < parseInt(default_plugin["last_modified"]))
				{
					$.ajax(
					{
						url : default_plugin["url"] ,
						type : "GET" ,
						success : function(e)
						{
							var pluginId = default_plugin["id"];
							var obj = {};
							obj[pluginId] = e;
							chrome.storage.local.set(obj);
							default_plugin["is_enabled"] = true;
							default_plugin["is_default"] = true;
							default_plugin["plugin_url"] = "default";
							var current_stored_data = [];
							chrome.storage.local.get(["installed_plugin"] , function(data2)
							{
								try
								{
									current_stored_data = data2["installed_plugin"];
								}
								catch(ex)
								{
									current_stored_data = [];
								}
							});
							current_stored_data[current_stored_data.length] = default_plugin;
							chrome.storage.local.set({"installed_plugins" : current_stored_data});
							createSwitch(default_plugin["id"] , default_plugin["name"] , true);
						} ,

						error : function(jqXHR, exception)
						{
							//ERROR : Could not fetch plugin script
							alert("An error occured while trying to fetch " + default_plugin["id"]);
						}
					});
				}
			}

			setNotice("");
		} ,

		error  : function()
		{
			alert("An error occured while trying to fetch default plugins");
		}

	});


});

//TODO : Load community plugins


$(document).on('click', '.tgl', function() {
	set($(this)[0]);
})

function set(checker) {
	chrome.storage.local.get(["installed_plugins"], function(data) {
		debugger;
		data["installed_plugins"][checker.id].enabled = !!checker.checked;
		chrome.storage.local.set({"installed_plugins": data["installed_plugins"]}, function() {
			setNotice("Please refresh your GeoFS game to apply changes");
		});
	});
}

function setNotice(innerText){
	$("#notice").text(innerText);
}

function createSwitch(id, name, toggled) {
	return "<tr><td><b style='display: inline-block; float: left;'>" + name + "</b></td><td><label style='float: right' class='switch'><input class='tgl' type='checkbox' id='" + id + "'" + (toggled ? "checked" : "") + "><div class='slider round'></div></label></td></tr>";
}
