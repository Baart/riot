//RADS\projects\lol_air_client\releases\0.0.1.77\deploy\assets\storeImages

var playermodule = angular.module("playermodule", ["requesterapi"]);

playermodule.directive("playermoduleDirective", function() {
	return {
			scope: {
				name:"=",
			},
			restrict: "E",
			templateUrl: "views/playermodule.html",
			link: function (scope, element, attrs) {

            }
		};

});

playermodule.controller("playermoduleController", function ($scope, $rootScope, $http, $attrs, requesterapiFactory) {

	$scope.playermodule = {
		lastgame : {},
		kdastatus:"Loading...",
		id:"",
		lasthitstatus: "Loading...",
		lasthitper10: "Loading...",
		wardstatus: "Loading...",
		finalscore: 0,
	};


	var getLastHitComment = function(perten) {
		if(perten < 10) {
			return "Support or afk right ?"
		} else if (perten < 30) {
			return "Focus more on last hit and less on harass."
		} else if (perten < 60) {
			return "Under average, focus more on last hit"
		} else if (perten < 90) {
			return "Average last hitter, but is that you goal ? Average ?"
		} else {
			return "Ok that's getting serious. Keep up the good work."
		}
	}


	var getWardComment = function(perten) {
		if(perten < 2) {
			return "Use at least the trinker, it's free"
		} else if (perten < 3) {
			return "Check your trinket cooldown more often, and buy some real ward"
		} else if (perten < 5) {
			return "The ~30 seconds you spend unwarded may cost you much more than 75 gold"
		} else if (perten < 7) {
			return "Average warder. You must be almost safe"
		} else {
			return "That's a good score. If you are still getting ganked, ward further."
		}
	}


	var getKdaComment = function() {
		var d = $scope.playermodule.lastgame.stats.numDeaths || 0;
		if(d == 0) {
			return "Damn you're good"
		}
		else if(d < 2) {
			return "Almost perfect. Keep up the good work"
		}else if(d < 5) {
			return "Average death manager"
		}else if(d < 8) {
			return "You die too much"
		}else if(d < 12) {
			return "You die way too much"
		} else {
			return "Did you get report ? Stop the suicides !"
		}
	}


	function updateRecentGameByName() {

		requesterapiFactory.getRecentGames($scope.playermodule.name, function(data){
				//console.log("im back with an answer:", data);

				$scope.playermodule.id = data.summonerId;

				if(!data.games.length) {
					console.log("no game in history for", $scope.playermodule.name);
					return;
				}
				console.log("new last game ->", data.games[0]);

				$scope.playermodule.id = data.summonerId;
				$scope.playermodule.lastgame = data.games[0];


				$scope.playermodule.lasthitper10 = parseInt($scope.playermodule.lastgame.stats.minionsKilled / ($scope.playermodule.lastgame.stats.timePlayed / 60. )* 10);
				$scope.playermodule.lasthitstatus = getLastHitComment($scope.playermodule.lasthitper10);

				$scope.playermodule.wardper10 = parseInt(($scope.playermodule.lastgame.stats.wardPlaced || 0) / ($scope.playermodule.lastgame.stats.timePlayed / 60. ) * 10);
				$scope.playermodule.wardstatus = getWardComment($scope.playermodule.wardper10);

				$scope.playermodule.kdastatus = getKdaComment();

				$scope.playermodule.finalscore = getFinalScore();
			})
	}

	$scope.$watch("name", function() {
		$scope.playermodule.name = $scope.name;
		console.log("got a new name : ", $scope.playermodule.name);
		$scope.playermodule.refresh();
	})


	$scope.playermodule.refresh = function() {
		updateRecentGameByName();		
	}

	var getFinalScore = function() {
		var score = 0;
		score += ($scope.playermodule.lastgame.stats.championsKilled || 0 ) * 2;
		score -= ($scope.playermodule.lastgame.stats.numDeaths || 0 ) * 3;
		score += ($scope.playermodule.lastgame.stats.assists || 0 ) * 1;

		score += $scope.playermodule.lasthitper10;
		score += $scope.playermodule.wardper10;
		return score;
	}

});
