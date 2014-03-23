

var kda = angular.module("kda", ["requesterapi"]);

kda.directive("kdaDirective", function() {
	return {
			scope: {
				name:"@",
				removePlayer:"&",
			},
			restrict: "E",
			templateUrl: "views/kda.html",
			link: function (scope, element, attrs) {

            }
		};

});

kda.controller("kdaController", function ($scope, $rootScope, $http, $attrs, requesterapiFactory) {

	$scope.kda = {
		k:0,
		d:0,
		a:0,
		kt:0,
		dt:0,
		at:0,
	};

	function updateLastGame(game) {
		$scope.kda.k = game.stats.championsKilled || 0;
		$scope.kda.d = game.stats.numDeaths || 0;
		$scope.kda.a = game.stats.assists || 0;

		$scope.kda.wardbought = game.stats.sightWardsBought || 0;
		$scope.kda.wardplaced = game.stats.wardPlaced || 0;
	}

	function updateAllGames(games) {
		$scope.kda.kt = 0;
		$scope.kda.dt = 0;
		$scope.kda.at = 0;

		$scope.kda.wardboughttotal =  0;
		$scope.kda.wardplacedtotal =  0;

		games.forEach(function(game) {
			$scope.kda.kt += game.stats.championsKilled || 0;
			$scope.kda.dt += game.stats.numDeaths || 0;
			$scope.kda.at += game.stats.assists || 0;

			$scope.kda.wardboughttotal += game.stats.sightWardsBought || 0;
			$scope.kda.wardplacedtotal += game.stats.wardPlaced || 0;
		});
	}

	function updateRecentGameByName() {

		requesterapiFactory.getRecentGames($scope.kda.name, function(data){
				console.log("im back with an answer:", data);

				$scope.kda.id = data.summonerId;

				if(!data.games.length) {
					console.log("no game in history for", $scope.kda.name);
					return;
				}
				//console.log($scope.id,  "->", data.games[0].stats);

				updateAllGames(data.games)
				updateLastGame(data.games[0]);
			})
	}

	$scope.$watch("name", function() {
		$scope.kda.name = $scope.name;
		console.log("got a new name : ", $scope.kda.name);
		$scope.kda.refresh();
	})


	function reset() {
		$scope.kda.kt = 0;
		$scope.kda.dt = 0;
		$scope.kda.at = 0;
		$scope.kda.k = 0;
		$scope.kda.d = 0;
		$scope.kda.a = 0;
	}

	$scope.kda.refresh = function() {
		reset();
		updateRecentGameByName();		
	}


	$scope.kda.getScore = function() {
		var score = $scope.kda.k*2 + $scope.kda.d*(-3) + $scope.kda.a;
		return score;
	}

	$scope.kda.getTotalScore = function() {
		return $scope.kda.kt*2 + $scope.kda.dt*(-3) + $scope.kda.at
	}
});
