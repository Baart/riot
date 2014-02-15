
var riotapi = angular.module("riotapi", []);



riotapi.factory("riotapiFactory", function($http) {

	var apikey = "9f6da8c3-d74c-445c-8208-3d746bfe844b";
	
	return {
			getIdFromName: function(name, callback) {


				function getCachedIdFromName(name) {

				var array =  {
					"Baarth":283843,
					"Didibg":283887,
					"Khadock":19120703,
					"Dukii":19064575,
					"Garga69":300079,
					"Z3roCo0l":300328,
					"Misstrike":49452862,
					"Baarthh":372903,
					"WSKhadock":52328003,
					"WSDidi":52478668,
					"WSBaarth":52218602,
					"DuDDu":21749628,
					"Ph0nk":215276,
				};
				var id = "";
				if(name in array) {
					id = array[name]
				}

				return id;
				}

				var id = getCachedIdFromName(name);

				if(id == "") {
					var request = "https://prod.api.pvp.net/api/lol/euw/v1.3/summoner/by-name/"+name+"?api_key=" + apikey;

					$http({method: 'GET', url: request}).
				    	success(function(data, status, headers, config) {
							console.log("FACTORY: new ID for name:", name, data[name.toLowerCase()].id);
				    		callback(data[name.toLowerCase()].id)
					});
				}
				else {
					callback(id)
				}
			},

			getRecentGames : function(id, callback) {
			var request = "https://prod.api.pvp.net/api/lol/euw/v1.3/game/by-summoner/"+id+"/recent?api_key=" + apikey;
			$http({method: 'GET', url: request}).
			success(function(data, status, headers, config) {

				callback(data);
			});
		}
				
			}
	})


