
var playersdb = angular.module("playersdb", []);



playersdb.factory("playersdbFactory", function() {


	return {
		getList: function() {
			var players = [
				{name:"Baarth"},
				{name:"Didibg"},
				{name:"Khadock"},
				{name:"Dukii"},
				{name:"Garga69"},
				{name:"Z3roCo0l"},
				{name:"Baarthh"},
				{name:"Misstrike"},
				{name:"WSPygargue"},
				{name:"WSKhadock"},
				{name:"WSDidi"},
				{name:"WSBaarth"},
				{name:"Ph0nk"},
				{name:"DuDDu"},
			]
			return players;
		}
	}


})


