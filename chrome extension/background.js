chrome.webNavigation.onCommitted.addListener(function(details) {
	if (~details.url.indexOf("http://www.geo-fs.com/geofs.php")) {

		//Loading the plugins
		chrome.storage.local.get(["installed_plugins"], function(data) {

			let installed_plugins = data["installed_plugins"];
			for(var i = 0 ; i < installed_plugins.length ; i++){
				var plugin = installed_plugins[i];
				if(plugin["is_enabled"]){
					var content_func = "(" + (function(pluginUrl) {
						console.log("Content script ACTIVATED!");
						var script = document.createElement('script');
						script.id = "plugin_manager";
						script.src =  pluginUrl;
						(document.head || document.documentElement).appendChild(script);
					}) + ")(" + JSON.stringify(plugin["url"]) + ");";
					console.log(content_func);
					chrome.tabs.executeScript(details.tabid, {code: content_func} , function(){
						console.log("Code executed successfuly");
					});
				}
			}
		});


		//fetching the plugins
		chrome.storage.local.get(["installed_plugins"], function(data)
		{

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
						// if(installed_plugin == null || parseInt(installed_plugin["last_modified"]) < parseInt(default_plugin["last_modified"]))
						// {
						// 	$.ajax(
						// 	{
						// 		url : default_plugin["url"] ,
						// 		type : "GET" ,
						// 		success : function(e)
						// 		{
						// 			var pluginId = default_plugin["id"];
						// 			var obj = {};
						// 			obj[pluginId] = e;
						// 			chrome.storage.local.set(obj);
						// 			default_plugin["is_enabled"] = true;
						// 			default_plugin["is_default"] = true;
						// 			default_plugin["plugin_url"] = "default";
						// 			var current_stored_data = [];
						// 			chrome.storage.local.get(["installed_plugin"] , function(data2)
						// 			{
						// 				current_stored_data = data2["installed_plugin"];
						// 			});
						// 			current_stored_data[current_stored_data.length] = default_plugin;
						// 			chrome.storage.local.set({"installed_plugins" : current_stored_data});
						// 			//TODO : Preserve the is_enabled status from before the update
						// 			//TODO : Fix this alert message
						// 			//TODO : Find a better way to notify the user.
						// 			// alert("An update is available , please reload Geo-Fs for the update to apply");
						// 		} ,

						// 		error : function(jqXHR, exception)
						// 		{
						// 			//ERROR : Could not fetch plugin script
						// 			alert("An error occured while trying to fetch " + default_plugin["id"]);
						// 		}
						// 	});
						// }
					}
				} ,

				error  : function()
				{
					alert("An error occured while trying to fetch default plugins");
				}

			});
		});
	}
});
