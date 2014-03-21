
var requesterapi = angular.module("requesterapi", []);



requesterapi.factory("requesterapiFactory", function($http) {

	var restserverAddress = "http://localhost:8082/stats/"

	return {
			getRecentGames : function(name, callback) {
				var request = restserverAddress+name;
				$http({method: 'GET', url: request}).
				success(function(data, status, headers, config) {
					callback(data);
				});
			}
	}
});

