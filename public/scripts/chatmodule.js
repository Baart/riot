

var chatmodule = angular.module("chatmodule", []);

chatmodule.directive("chatmoduleDirective", function() {
	return {
			restrict: "E",
			templateUrl: "views/chatmodule.html",
			link: function (scope, element, attrs) {

            }
		};

});

chatmodule.controller("chatmoduleController", function ($scope, $rootScope, $http, $attrs, requesterapiFactory) {

	$scope.chat = { 
		name: 'Anonymous',
		content: '',
		lines: [  ]
	};

	$scope.chat.myFunct = function (event) {
		if(event.which === 13) {
            $scope.chat.sendMessage();
	    }
	}
	
	//var socketio = io.connect("http://localhost:8082");
	var socketio = io.connect("http://weedoseeds.no-ip.org:8082");
	socketio.on('init', function (data) {
            console.log('INIT', data.msg);
        });

	socketio.on("message_to_client", function(data) {
        console.log('message_to_client', data);
		$scope.$apply(function() {
			if($scope.chat.lines.length > 12) {
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
