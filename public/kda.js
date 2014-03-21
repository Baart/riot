

var kda = angular.module("kda", ["riotapi", "requesterapi"]);

kda.directive("kdaDirective", function() {
	return {
			//transclude: true,
			scope: {name:"@"},
			restrict: "E",
			templateUrl: "kda.html",
			link: function (scope, element, attrs) {

            }
		};

});

kda.controller("kdaController", function ($scope, $rootScope, $http, $attrs, riotapiFactory, requesterapiFactory) {

function updateRecentGameByName() {

		requesterapiFactory.getRecentGames($scope.name, function(data){
				console.log("im back with an answer:", data);

				$scope.id = data.summonerId;
								
				var kt = 0;
				var dt = 0;
				var at = 0;

				var wardboughttotal = 0;
				var wardplacedtotal = 0;

				console.log($scope.id,  "->", data.games[0].stats);
				for(var ii=0; ii < 10; ++ii)
				{

					kt += data.games[ii].stats.championsKilled ? data.games[ii].stats.championsKilled : 0;
					dt += data.games[ii].stats.numDeaths ? data.games[ii].stats.numDeaths : 0;
					at += data.games[ii].stats.assists ? data.games[ii].stats.assists : 0;

					wardboughttotal += data.games[ii].stats.sightWardsBought ? data.games[ii].stats.sightWardsBought : 0;
					wardplacedtotal += data.games[ii].stats.wardPlaced ? data.games[ii].stats.wardPlaced : 0;
				}

				$scope.kda.k = data.games[0].stats.championsKilled ? data.games[0].stats.championsKilled : 0;
				$scope.kda.d = data.games[0].stats.numDeaths ? data.games[0].stats.numDeaths : 0;
				$scope.kda.a = data.games[0].stats.assists ? data.games[0].stats.assists : 0;


				$scope.kda.wardbought = data.games[0].stats.sightWardsBought ? data.games[0].stats.sightWardsBought : 0;
				$scope.kda.wardplaced = data.games[0].stats.wardPlaced ? data.games[0].stats.wardPlaced : 0;

				$scope.kda.kt = kt;
				$scope.kda.dt = dt;
				$scope.kda.at = at;

				$scope.kda.wardboughttotal =  wardboughttotal;
				$scope.kda.wardplacedtotal =  wardplacedtotal;
			})
	}


	function updateRecentGame() {
		riotapiFactory.getRecentGames($scope.id, function(data){
				console.log("im back with an answer:", data);
								
				var kt = 0;
				var dt = 0;
				var at = 0;

				var wardboughttotal = 0;
				var wardplacedtotal = 0;

				console.log($scope.id,  "->", data.games[0].stats);
				for(var ii=0; ii < 10; ++ii)
				{

					kt += data.games[ii].stats.championsKilled ? data.games[ii].stats.championsKilled : 0;
					dt += data.games[ii].stats.numDeaths ? data.games[ii].stats.numDeaths : 0;
					at += data.games[ii].stats.assists ? data.games[ii].stats.assists : 0;

					wardboughttotal += data.games[ii].stats.sightWardsBought ? data.games[ii].stats.sightWardsBought : 0;
					wardplacedtotal += data.games[ii].stats.wardPlaced ? data.games[ii].stats.wardPlaced : 0;
				}

				$scope.kda.k = data.games[0].stats.championsKilled ? data.games[0].stats.championsKilled : 0;
				$scope.kda.d = data.games[0].stats.numDeaths ? data.games[0].stats.numDeaths : 0;
				$scope.kda.a = data.games[0].stats.assists ? data.games[0].stats.assists : 0;


				$scope.kda.wardbought = data.games[0].stats.sightWardsBought ? data.games[0].stats.sightWardsBought : 0;
				$scope.kda.wardplaced = data.games[0].stats.wardPlaced ? data.games[0].stats.wardPlaced : 0;

				$scope.kda.kt = kt;
				$scope.kda.dt = dt;
				$scope.kda.at = at;

				$scope.kda.wardboughttotal =  wardboughttotal;
				$scope.kda.wardplacedtotal =  wardplacedtotal;



			})
	}

	function updateId() {
		/*
		riotapiFactory.getIdFromName($scope.name, function(id){
			console.log("im back with an id:", id);
			$scope.id = id;
			$scope.refresh();	
		});
		*/
	}

	$scope.$watch("name", function() {
			//console.log("got a new name : ", $scope.name);
			//updateId()
			$scope.refresh();
		})


	function reset() {
		$scope.kda.kt = 0;
		$scope.kda.dt = 0;
		$scope.kda.at = 0;
		$scope.kda.k = 0;
		$scope.kda.d = 0;
		$scope.kda.a = 0;
	}

	$scope.refresh = function() {
		reset();
		//updateRecentGame();		
		updateRecentGameByName();		
	}


	$scope.kda = {
		k:0,
		d:0,
		a:0,
		kt:0,
		dt:0,
		at:0,
	};

	$scope.getScore = function() {
		var score = $scope.kda.k*2 + $scope.kda.d*(-3) + $scope.kda.a;
		/*if(score == 0)
			score += " bidon"
		else if(score > 0)
			score += " Gg"
		else 
			score += " tout pourri"*/
		return score;
	}

	$scope.getTotalScore = function() {
		return $scope.kda.kt*2 + $scope.kda.dt*(-3) + $scope.kda.at
	}
});
