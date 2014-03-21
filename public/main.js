
var myapp = angular.module("myApp", ["kda", "playersdb"]);



myapp.controller("myAppController", function($scope, playersdbFactory) {

	$scope.players =  {
		all: playersdbFactory.getList(),
		requested: []
	};

	$scope.removePlayer = function(name) {
		console.log("removing player", name);
		var array = $scope.players.requested;
		var index = array.indexOf(name);
		if(index == -1) {
			return;
		}
		array.splice(index, 1);
	}

	$scope.addPlayer = function (name) {

		var unique = true;

		$scope.players.requested.forEach(function(requested, index) {
			if(name == requested) {
				unique = false;
				$scope.players.requested.splice(index, 1)
				return;
			}
		})
		if(!unique) {
			return;
		}
		$scope.players.requested.push(name);	
	}

});