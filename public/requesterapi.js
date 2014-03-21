
var requesterapi = angular.module("requesterapi", []);



requesterapi.factory("requesterapiFactory", function($http) {

	return {
			getRecentGames : function(name, callback) {
				var request = "http://localhost:8082/stats/"+name;
				$http({method: 'GET', url: request}).
				success(function(data, status, headers, config) {

					callback(data);
				});
			}
	}
});

