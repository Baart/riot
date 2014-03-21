
var requesterapi = angular.module("requesterapi", []);



requesterapi.factory("requesterFactory", function($http) {

	return {
			getRecentGames : function(name, callback) {
				var url = "";
				$http({method: 'GET', url: request}).
				success(function(data, status, headers, config) {

					callback(data);
				});
			}
	})


