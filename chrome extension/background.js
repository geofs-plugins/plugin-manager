chrome.webNavigation.onCommitted.addListener(function(details) {
	if (~details.url.indexOf("http://www.geo-fs.com/geofs.php")) {

		//Plugin execution
		chrome.storage.local.get(["installed_plugins" , 'dev_plugins' , "saved_plugins"], function(data) {

			let idToIndex = {};
			let dev_plugins = {};
			let installed_plugins = data["installed_plugins"];
			if(typeof(installed_plugins) != typeof([])){
				installed_plugins = [];
			}

			try{dev_plugins = data["dev_plugins"];} catch (e){}


			//Executing dev mode plugins
			for(var key in dev_plugins){
				if(dev_plugins.hasOwnProperty(key)){
					let plugin = dev_plugins[key];
					//TODO : Execute the plugin saved on the local machine
				}
			}


			//Executing all of the saved plugins
			for(var i = 0 ; i < installed_plugins.length ; i++){
				let plugin = installed_plugins[i];
				idToIndex[plugin["id"]] = i;

				let plugin_content = data["saved_plugins"][plugin["id"]];
				if(plugin_content != undefined && plugin_content != null){

					if(plugin["is_enabled"]){
						var content_func = "(" + (function(pluginUrl) {
							var script = document.createElement('script');
							script.id = "plugin_manager";
							script.innerHTML =  pluginUrl;
							(document.head || document.documentElement).appendChild(script);
						}) + ")(" + JSON.stringify(plugin_content) + ");";
						chrome.tabs.executeScript(details.tabid, {code: content_func} , function(){
							console.log("STATUS : " + plugin["name"] + " is running");
						});
					}
				}
			}


			//Auto updater - Community plugins
			for(var i = 0 ; i < installed_plugins.length ; i++){
				if(!installed_plugins[i]["is_default"]){ //Default plugins
					let localPlugin = installed_plugins[i];

					$.ajax({
						url : localPlugin["info_url"] ,
						method : "GET" ,
						success : function(response){
							let remotePlugin = response;
							//NOTE : if there was a change in one of the plugin's details (name , description , plugin url)
							//the developer is required to change the last_modified parameter or else the changes won't apply !

							if(localPlugin["last_modified"] != remotePlugin["last_modified"]){
								$.ajax({
									url : remotePlugin["url"] ,
									method : "GET" ,
									success : function(response2){
										let pluginContent = response2;
										chrome.storage.local.get(["saved_plugins" , "installed_plugins"] , function(data2){
											let current_plugins = data["installed_plugins"];
											let current_saved = data["saved_plugins"];

											remotePlugin["is_default"] = false;
											remotePlugin["info_url"] = localPlugin["info_url"];
											remotePlugin["is_enabled"] = true;

											current_saved[remotePlugin["id"]] = pluginContent;
											var wasChanged = false;
											for(var i = 0 ; i < current_plugins.length ; i++){
												if(current_plugins[i]["id"] == remotePlugin["id"]){
													current_plugins[i] = remotePlugin;
													wasChanged = true;
												}
											}

											//If the plugin's id was changed
											//TODO : write this better
											if(!wasChanged){
												current_plugins[current_plugins.length] = remotePlugin;
											}

											chrome.storage.local.set({"saved_plugins" : current_saved , "installed_plugins" : current_plugins});

											console.log("STATUS : Updated community " + remotePlugin["id"])
										});
									} ,
									error : function(){
										//TODO : Notify the user there is an error
									}
								});
							}
						}
					});
				}
			}


			//Auto updater - Default plugins
			$.ajax({
				url : "http://geofs-plugins.appspot.com/list.php" ,
				method : "GET" ,
				success : function(data2){
					let list = JSON.parse(data2);
					for(var i = 0 ; i < list.length ; i++){
						let remotePlugin = list[i];
						remotePlugin["is_default"] = true;
						remotePlugin["is_enabled"] = true;
						var isNewPlugin = idToIndex[remotePlugin["id"]] == undefined;

						if(isNewPlugin || remotePlugin["last_modified"] != installed_plugins[idToIndex[remotePlugin["id"]]]["last_modified"] || [null , undefined , ""].includes(data["saved_plugins"][remotePlugin["id"]])){

							$.ajax({
								url : remotePlugin["url"] ,
								method : "GET" ,
								success : function(data3){
									let pluginContent = data3;


									//TODO : Boom
									//data4 - is the dictionary containing the saved plugins (the plugin's content) and the installed plugins
									//data3 - contains the content of the plugin (js code)

									chrome.storage.local.get(["saved_plugins" , "installed_plugins"] , function(data4){
										let saved_data = data4["saved_plugins"];
										let current_plugins = data4["installed_plugins"];

										saved_data[remotePlugin["id"]] = pluginContent;

										var index = current_plugins.length;
										for(var j = 0 ; j < current_plugins.length ; j++){
											index = current_plugins[j]["id"] == remotePlugin["id"] ? j : index;
										}

										current_plugins[index] = remotePlugin;

										chrome.storage.local.set({"saved_plugins" : saved_data , "installed_plugins" : current_plugins});

										console.log("STATUS : Updated " + remotePlugin["id"]);
									});
								} ,
								error : function(){
									//TODO : Nofity that there is an error
								}
							});
						}


					}
				}
				,
				error : function(){
					//TODO : Nofity that an error occured while ajaxing
				}
			});
		});
	}
});
