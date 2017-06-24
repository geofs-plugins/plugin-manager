chrome.webNavigation.onCommitted.addListener(function(details) {
	if (~details.url.indexOf("http://www.geo-fs.com/geofs.php")) {
		//chrome.pageAction.show(details.tabId);
		content_func = "(" + (function(res) {
			console.log("Content script ACTIVATED!");
			var script = document.createElement('script');
			script.id = "plugin_manager";
			script.src = "http://geofs-plugins.appspot.com/load.php?ids=aircraft_warehouse";
			(document.head || document.documentElement).appendChild(script);
		}) + ")();";
		chrome.tabs.executeScript(details.tabid, {code: content_func});
	}
	else {
		//chrome.pageAction.hide(details.tabId);
	}
});