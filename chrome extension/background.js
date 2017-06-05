chrome.webNavigation.onCommitted.addListener(function(details) {
	if (~details.url.indexOf("http://www.geo-fs.com/geofs.php")) {


		//Loading the plugins
		chrome.storage.local.get(["installed_plugins" , 'dev_plugins' , "saved_plugins"], function(data) {

			let installed_plugins = data["installed_plugins"];
			let idToIndex = {};
			let dev_plugins = {};

			try{dev_plugins = data["dev_plugins"];} catch (e){}


			for(var key in dev_plugins){
				if(dev_plugins.hasOwnProperty(key)){
					let plugin = dev_plugins[key];
					var dict2 = {file : plugin["path"]};
					console.log(dict2);
					// // plugin["path"].replace('\\' , '\\\\');
					// var content_func = "(" + (function(pluginUrl) {
					// 	var script = document.createElement('script');
					// 	script.class = "plugin_manager";
					// 	script.src =  pluginUrl;
					// 	(document.head || document.documentElement).appendChild(script);
					// }) + ")(" + JSON.stringify(plugin['path']) + ");";
					chrome.tabs.executeScript(details.tabid, dict2 , function(){
						console.log(plugin["name"] + " has loaded");
					});
				}
			}

			for(var i = 0 ; i < installed_plugins.length ; i++){
				let plugin = installed_plugins[i];
				idToIndex[plugin["id"]] = i;

				//TODO : Save the plugins content into a string that yotam will execute

				let plugin_content = data["saved_plugins"][plugin["id"]];
				if(plugin_content != undefined && plugin_content != null){
					//TODO : Yotam - Execute the code in plugin_content
				}


				// //The old method of executing code
				// //Does not save the plugin locally
				// if(plugin["is_enabled"]){
				// 	var content_func = "(" + (function(pluginUrl , pluginId) {
				// 		var script = document.createElement('script');
				// 		script.id = "plugin_manager";
				// 		script.src =  pluginUrl;
				// 		(document.head || document.documentElement).appendChild(script);
				// 		$.notify("Bla");
				// 	}) + ")(" + JSON.stringify(plugin["url"]) + ");";
				// 	chrome.tabs.executeScript(details.tabid, {code: content_func} , function(){
				// 		console.log(plugin["name"] + " is running");
				// 	});
				// }
			}

			$.ajax({
				url : "http://geofs-plugins.appspot.com/list.php" ,
				method : "GET" ,

				success : function(e){
					let remoteData = JSON.parse(e);
					let newPluginsList = [];

					//Going over the list of community installed plugins
					//And adding them to the final list
					for(var i = 0 ; i < installed_plugins.length ; i++){
						if(!installed_plugins[i]["is_default"]){
							//TODO : Check for updates , somehow
							newPluginsList[newPluginsList.length] = installed_plugins[i];
						}
					}


					//Going over all of the remote data and adding them to list only after trying to update
					for(var i = 0 ; i < remoteData.length ; i++){
						var remotePlugin = remoteData[i];
						var localPlugin = installed_plugins[idToIndex[remotePlugin["id"]]];
						remotePlugin["is_enabled"] = true;
						remotePlugin["is_default"] = true;

						//Will check for an update if on the following condition is met :
						//    the plugin is not installed on the machine
						//    there current installed version is not the latest
						//    the plugin is not saved locally
						if(localPlugin == undefined ||  remotePlugin["last_modified"] != localPlugin["last_modified"] || data["saved_plugins"][remotePlugin["id"]] == undefined){

							//Sending an ajax request to the plugin url to get the plugin's content and saving it locally
							$.ajax({
								url : remotePlugin["url"] ,
								method : "GET" ,
								success : function(e){
									var saved_plugins = data["saved_plugins"];
									if(saved_plugins == undefined || saved_plugins == null){
										saved_plugins = {};
									}

									saved_plugins[remotePlugin["id"]] = e;
									newPluginsList[newPluginsList.length] = remotePlugin;
									chrome.storage.local.set({"installed_plugins" : newPluginsList});
									chrome.storage.local.set({"saved_plugins" : saved_plugins});

									//TODO : Notify the user that there is an update.

								} ,

								error : function(){
									//TODO : Notify the user that an error occured
								}
							});
						}  else {
							newPluginsList[newPluginsList.length] = localPlugin;
						}
					}


				} ,

				error : function(){
					//TODO : Notify the user that an error occured while trying to fetch the default plugins.
					$.notify('An error occured while trying to fetch the default plugins' , 'error');
				}

			});

		});
	}
});
