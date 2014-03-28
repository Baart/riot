
var requesterapi = angular.module("requesterapi", []);



requesterapi.factory("requesterapiFactory", function($http) {

	var restserverAddress = "http://localhost:8082/";
	//var restserverAddress = "http://weedoseeds.no-ip.org:8082/";

	return {
			getRecentGames : function(name, callback) {
				var request = restserverAddress+'stats/'+name;
				$http({method: 'GET', url: request}).
				success(function(data, status, headers, config) {
					callback(data);
				});
			},
			getPlayers : function(callback) {
				var request = restserverAddress+'players';
				$http({method: 'GET', url: request}).
				success(function(data, status, headers, config) {
					callback(null, data);
				});
			},
	}
});

