define(function (require, exports, module) {
	var Cart = require('../cache/cart');
	var Home = require('../cache/home');
	var service = {
		init : function() {
			console.log('index.page ');
			$(document.body).prepend('index main');
		}
	};
	service.init();
});