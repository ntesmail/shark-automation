define(function (require, exports, module) {
	var Cart = require('../cache/cart');
	var Cart1 = require('./cart1');
	var Tool = require('../tool/tool');
	
	var service = {
		init : function() {
			console.log(Cart.getList());
			console.log(Cart1.getList());
			console.log(Tool.getList());

			$(document.body).append('cart main');
		}
	};

	service.init();
});