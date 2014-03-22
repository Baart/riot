
var myapp = angular.module("myApp", ["kda", "requesterapi"]);



myapp.controller("myAppController", function($scope, requesterapiFactory) {

	$scope.players =  {
		all: [],
		requested: []
	};

	requesterapiFactory.getPlayers(function(err, array) {

		if(err) {
			console.log('no players: ', err);
			return;
		}

		$scope.players.all = [];
		array.forEach(function(player) {
			console.log("got player:", player.data);
			$scope.players.all.push({name:player.data.name});
		})
	});


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