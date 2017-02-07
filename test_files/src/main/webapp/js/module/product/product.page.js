define(function (require, exports, module) {
	var Cart = require('../cache/cart');
	var Product = require('../cache/product');
	var Tool = require('../tool/tool');
	var service = {
		init : function() {
			console.log(Product.getList());
			console.log(Tool.getList());
			$(document.body).append('product main');
		}
	};

	service.init();
});