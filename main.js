
var myapp = angular.module("myApp", ["kda", "playersdb"]);



myapp.controller("myAppController", function($scope, playersdbFactory) {

	$scope.players =  {
		all: playersdbFactory.getList(),
		requested: []
	};

	$scope.addPlayer = function (name) {

		var unique = true;

		$scope.players.requested.forEach(function(requested) {
			if(name == requested) {
				unique = false;
				return;
			}
		})
		if(!unique) {
			return;
		}
		$scope.players.requested.push(name);	
	}

});