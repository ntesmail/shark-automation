define(function (require, exports, module) {
	var Cart = require('../cache/cart');
	var Home = require('../cache/home');
	var service = {
		init : function() {
			console.log(Home.getList());
			$(document.body).prepend('home main');
		}
	};

	service.init();
});