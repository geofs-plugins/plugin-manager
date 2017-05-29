chrome.webNavigation.onCommitted.addListener(function(details) {
	if (~details.url.indexOf("http://www.geo-fs.com/geofs.php")) {


		//Loading the plugins
		chrome.storage.local.get(["installed_plugins"], function(data) {

			let installed_plugins = data["installed_plugins"];
			let idToIndex = {};

			for(var i = 0 ; i < installed_plugins.length ; i++){
				let plugin = installed_plugins[i];
				idToIndex[plugin["id"]] = i;

				if(plugin["is_enabled"]){
					var content_func = "(" + (function(pluginUrl , pluginId) {
						var script = document.createElement('script');
						script.id = "plugin_manager";
						script.src =  pluginUrl;
						(document.head || document.documentElement).appendChild(script);
						$.notify("Bla");
					}) + ")(" + JSON.stringify(plugin["url"]) + ");";
					chrome.tabs.executeScript(details.tabid, {code: content_func} , function(){
						$.notify(plugin["id"] + " is now running" , 'success');
					});
				}
			}

			$.ajax({
				url : "http://geofs-plugins.appspot.com/list.php" ,
				method : "GET" ,

				success : function(e){
					let remoteData = JSON.parse(e);
					let newPluginsList = [];
					let hasUpdate = false;

					for(var i = 0 ; i < installed_plugins.length ; i++){
						if(!installed_plugins[i]["is_default"]){
							//TODO : Check for updates , somehow
							newPluginsList[newPluginsList.length] = installed_plugins[i];
						}
					}

					for(var i = 0 ; i < remoteData.length ; i++){
						var remotePlugin = remoteData[i];
						var localPlugin = installed_plugins[idToIndex[remoteData["id"]]];
						remotePlugin["is_enabled"] = true;
						remotePlugin["is_default"] = true;


						if(localPlugin == undefined || localPlugin == null){
							newPluginsList[newPluginsList.length] = remotePlugin;
							hasupdate = true;
						} else if(remotePlugin["last_modified"] != localPlugin["last_modified"]){
							newPluginsList[newPluginsList.length] = remotePlugin;
							hasUpadte = true;
						} else {
							newPluginsList[newPluginsList.length] = localPlugin;
						}
					}

					if(hasUpdate){
						$.notify('A new update is available ! please refresh GEO-FS for the update to apply' , 'info');
					}

					chrome.storage.local.set({"installed_plugins" : newPluginsList});

				} ,

				error : function(){
					//TODO : Notify the user that an error occured while trying to fetch the default plugins.
					$.notify('An error occured while trying to fetch the default plugins' , 'error');
				}

			});

		});
	}
});
