

var chatmodule = angular.module("chatmodule", ['ngCookies']);

chatmodule.directive("chatmoduleDirective", function() {
	return {
			restrict: "E",
			templateUrl: "views/chatmodule.html",
			link: function (scope, element, attrs) {

            }
		};

});

chatmodule.controller("chatmoduleController", function ($scope, $rootScope, $http, $attrs, $cookieStore) {

	$scope.chat = { 
		name: 'Anonymous',
		content: '',
		lines: [  ]
	};
	console.log('COOKIE', $cookieStore.get('chatname'));

	var fakeNames = [
		'Malphite', 
		'Annie', 
		'Ahri', 
		'Talon', 
		'Gragas', 
		'Shaco', 
		'Fizz', 
		'Nocturne', 
		'Alistar', 
		'Blitzcrank', 
		'Kassadin', 
	];

	if(!$cookieStore.get('chatname')) {
		$scope.chat.name = fakeNames[Math.floor(Math.random()*fakeNames.length)];
	} else {
		$scope.chat.name = $cookieStore.get('chatname');
	}


	$scope.$watch('chat.name', function() {
		console.log('new name:', $scope.chat.name);
        $cookieStore.put('chatname', $scope.chat.name);		
	})


	$scope.chat.enterPressed = function (event) {
		if(event.which === 13) {
            $scope.chat.sendMessage();
	    }
	}
	
	var socketio = io.connect("http://localhost:8082");
	//var socketio = io.connect("http://weedoseeds.no-ip.org:8082");
	socketio.on('init', function (data) {
            console.log('INIT', data.msg);
        });

	socketio.on("message_to_client", function(data) {
        console.log('message_to_client', data);
		$scope.$apply(function() {
			if($scope.chat.lines.length > 8) {
				$scope.chat.lines.shift();
			}
			$scope.chat.lines.push(
				{ 
					date: data.date,
					name:data.name,
					content: data.message 
				});
		})
	});
	

	$scope.chat.sendMessage = function() {
		console.log("sending:", $scope.chat.name);
    	socketio.emit("message_to_server", { 
    		name: $scope.chat.name,
    		message : $scope.chat.content,
    	});
    	$scope.chat.content = "";
	}


});
