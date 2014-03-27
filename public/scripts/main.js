
var myapp = angular.module("myApp", ["kda", "requesterapi", "chatmodule", "playermodule", 'ngCookies']);



myapp.controller("myAppController", function($scope, requesterapiFactory, $cookieStore) {

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
			console.log("got player:", player, player.data);
			if(!player.data) {
				console.log("No valid data for this player");
				return;
			}	
			$scope.players.all.push({name:player.data.name.replace(' ', '')});
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

		var name = name.replace(' ', '');

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


	$scope.$watch('players.requested', function() {
		console.log('new array:', $scope.players.requested);
        $cookieStore.put('playersrequested', $scope.players.requested);		
	}, true);


	if($cookieStore.get('playersrequested')) {
		console.log('stored:', $cookieStore.get('playersrequested'));
		$scope.players.requested = $cookieStore.get('playersrequested');
	}


});