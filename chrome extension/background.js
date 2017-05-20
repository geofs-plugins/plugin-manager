chrome.webNavigation.onComitted.addListener(function(details) {
	if (~details.url.indexOf("http://www.geo-fs.com/geofs.php")) {
		chrome.pageAction.show(details.tabId);
		chrome.storage.local.get(["installed_plugins"], function(data) {
			var res = [];
			for (var x in data["installed_plugins"]) if (data["installed_plugins"].hasOwnProperty(x)){
				if (data["installed_plugins"][x].enabled) {
					res.push(x);
				}
			}
			var content_func = "(" + (function(res) {
				console.log("Content script ACTIVATED!");
				var script = document.createElement('script');
				script.id = "plugin_manager";
				script.src = "http://geofs-plugins.appspot.com/load.php?ids=" + res.join();
				(document.head || document.documentElement).appendChild(script);
			}) + ")(" + JSON.stringify(res) + ");";
			chrome.tabs.executeScript(details.tabid, {code: content_func});
		});
	}
	else {
		chrome.pageAction.hide(details.tabId);
	}
});