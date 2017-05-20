chrome.storage.local.get(["installed_plugins"], function(data) {
	if (data["installed_plugins"]) { // Not first time
		let installed_plugins = data["installed_plugins"];
		$.ajax({
			url: "http://geofs-plugins.appspot.com/list.php",
			type: "GET",
			success: function(e) {
				var j = JSON.parse(e);
				$("#loadingGif").fadeOut();
				for (var i = 0; i < j.length; i++) {
					var meta = j[i];
					if (!installed_plugins[meta.id]) {
						installed_plugins[meta.id] = meta;
						installed_plugins[meta.id].enabled = true; 
					}
					installed_plugins[meta.id].isDefault = true;
					installed_plugins[meta.id].name = meta.name;
				}
				for (var x in installed_plugins) if (installed_plugins.hasOwnProperty(x)) {
					$("#togglesDivtbl").append(createSwitch(x, installed_plugins[x].name, installed_plugins[x].enabled));
				}
				chrome.storage.local.set({"installed_plugins": installed_plugins});
			}
		});
	}
	else { // First time
		let installed_plugins = {};
		$.ajax({
			url: "http://geofs-plugins.appspot.com/list.php",
			type: "GET",
			success: function(e) {
				var j = JSON.parse(e);
				$("#loadingGif").fadeOut();
				for (var i = 0; i < j.length; i++) {
					var meta = j[i];
					meta.isDefault = true;
					enabled = true;
					installed_plugins[meta.id] = meta;
				}
				for (var x in installed_plugins) if (installed_plugins.hasOwnProperty(x)) {
					$("#togglesDivtbl").append(createSwitch(x, installed_plugins[x].name, installed_plugins[x].enabled));
				}
				chrome.storage.local.set({"installed_plugins": installed_plugins});
			}
		});
	}
});

$(document).on('click', '.tgl', function() {
	set($(this)[0]);
})

function set(checker) {
	chrome.storage.local.get(["installed_plugins"], function(data) {
		debugger;
		data["installed_plugins"][checker.id].enabled = !!checker.checked;
		chrome.storage.local.set({"installed_plugins": data["installed_plugins"]}, function() {
			$("#notice").hide().fadeIn();
		});
	});
}

function createSwitch(id, name, toggled) {
	return "<tr><td><b style='display: inline-block; float: left;'>" + name + "</b></td><td><label style='float: right' class='switch'><input class='tgl' type='checkbox' id='" + id + "'" + (toggled ? "checked" : "") + "><div class='slider round'></div></label></td></tr>";
}