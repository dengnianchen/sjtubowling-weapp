var constants = require('./constants');
var utils = require('./utils');
var Session = require('./session');
var loginLib = require('./login');

var noop = function noop() {};

var buildAuthHeader = function buildAuthHeader(session) {
	var header = {};
	
	if (session) {
		header[constants.WX_HEADER_SKEY] = session;
	}
	
	return header;
};

/***
 * @class
 * 表示请求过程中发生的异常
 * @dengnianchen 添加字段statusCode表示HTTP返回码
 */
var RequestError = (function() {
	function RequestError(statusCode, type, message) {
		Error.call(this, message);
		this.statusCode = statusCode;
		this.type = type;
		this.message = message;
	}
	
	RequestError.prototype = new Error();
	RequestError.prototype.constructor = RequestError;

return RequestError;
})();

function request(options) {
	if (typeof options !== 'object') {
		var message = '请求传参应为 object 类型，但实际传了 ' + (typeof options) + ' 类型';
		// @dengnianchen 添加第一个参数0
		throw new RequestError(0, constants.ERR_INVALID_PARAMS, message);
	}
	
	var requireLogin = options.login;
	var success = options.success || noop;
	var fail = options.fail || noop;
	var complete = options.complete || noop;
	var originHeader = options.header || {};
	
	// 成功回调
	var callSuccess = function() {
		success.apply(null, arguments);
		complete.apply(null, arguments);
	};
	
	// 失败回调
	var callFail = function(error) {
		fail.call(null, error);
		complete.call(null, error);
	};
	
	// 是否已经进行过重试
	var hasRetried = false;
	
	// @dengnianchen 对于requireLogin==true，原实现会先登录后执行请求，
	//     改为先请求，若返回错误【需要登陆】再尝试登录后请求
	doRequest();
	
	/* @dengnianchen 源文件实现内容
	if (requireLogin) {
		doRequestWithLogin();
	} else {
		doRequest();
	}
	*/
	
	// 登录后再请求
	function doRequestWithLogin() {
		// @dengnianchen 修改fail回调，封装返回错误为RequestError对象
		loginLib.loginWithCode({
			success: doRequest,
			fail: function(e) {
				callFail(new RequestError(0, 'ERR_REQUEST', e.message));
			},
		});
	}
	
	// 实际进行请求的方法
	function doRequest() {
		var authHeader = {};
		
		if (requireLogin) {
			var session = Session.get();
			
			if (!session) {
				return doRequestWithLogin();
			}
			
			authHeader = buildAuthHeader(session.skey);
		}
		
		wx.request(utils.extend({}, options, {
			header: utils.extend({}, originHeader, authHeader),
			
			// @dengnianchen 增加对statusCode的判断，对于非200的返回，以错误处理
			success: function(response) {
				var data = response.data;
				var statusCode = response.statusCode; // @dengnianchen
				
				// @dengnianchen 判断返回数据是否存在且为JSON格式 >>>
				if (!data || data.code == null) {
					return callFail(new RequestError(0, 'ERR_FORMAT',
						`响应格式错误：${JSON.stringify(data)}`));
				}
				// <<<
				
				// @dengnianchen 根据状态码判断请求成功或失败，并调用相应的回调函数 >>>
				if (statusCode >= 200 && statusCode < 300) { // 200~299段为执行成功之状态码
					callSuccess.apply(null, arguments);
				} else if (statusCode == 401 && !hasRetried) {
					// @dengnianchen 若返回错误码为401（需要登录），则尝试登录后重新发起请求
					//     该尝试只进行一次，若再次返回401，则按常规错误处理
					hasRetried = true;
					doRequestWithLogin();
				} else {
					callFail(
						new RequestError(statusCode, data.error, data.message));
				}
				// <<<
				
				/* @dengnianchen 原文件实现内容
				var error, message;
				if (data && data.code === -1) {
					Session.clear();
					// 如果是登录态无效，并且还没重试过，会尝试登录后刷新凭据重新请求
					if (!hasRetried) {
						hasRetried = true;
						doRequestWithLogin();
						return;
					}

					message = '登录态已过期';
					error = new RequestError(data.error, message);

					callFail(error);
					return;
				} else {
					callSuccess.apply(null, arguments);
				}
				*/
			},
			
			// @dengnianchen 修改原实现，将err信息封装成RequestError对象
			fail: function(err) {
				callFail(new RequestError(0, 'ERR_REQUEST', err.msg));
			},
			complete: noop,
		}));
	}
	
}

/**
 * 封装上传文件功能，改自request函数，wx.request改为wx.uploadFile
 * @param options
 * @author DengNianchen
 */
function upload(options) {
	if (typeof options !== 'object') {
		var message = '请求传参应为 object 类型，但实际传了 ' + (typeof options) + ' 类型';
		// @dengnianchen 添加第一个参数0
		throw new RequestError(0, constants.ERR_INVALID_PARAMS, message);
	}
	
	var requireLogin = options.login;
	var success = options.success || noop;
	var fail = options.fail || noop;
	var complete = options.complete || noop;
	var originHeader = options.header || {};
	
	// 成功回调
	var callSuccess = function() {
		success.apply(null, arguments);
		complete.apply(null, arguments);
	};
	
	// 失败回调
	var callFail = function(error) {
		fail.call(null, error);
		complete.call(null, error);
	};
	
	// 是否已经进行过重试
	var hasRetried = false;
	
	// @dengnianchen 对于requireLogin==true，原实现会先登录后执行请求，
	//     改为先请求，若返回错误【需要登陆】再尝试登录后请求
	doUpload();
	
	/* @dengnianchen 源文件实现内容
	if (requireLogin) {
		doRequestWithLogin();
	} else {
		doRequest();
	}
	*/
	
	// 登录后再请求
	function doUploadWithLogin() {
		// @dengnianchen 修改fail回调，封装返回错误为RequestError对象
		loginLib.loginWithCode({
			success: doUpload,
			fail: function(e) {
				callFail(new RequestError(0, 'ERR_REQUEST', e.message));
			},
		});
	}
	
	// 实际进行请求的方法
	function doUpload() {
		var authHeader = {};
		
		if (requireLogin) {
			var session = Session.get();
			
			if (!session) {
				return doUploadWithLogin();
			}
			
			authHeader = buildAuthHeader(session.skey);
		}
		
		wx.uploadFile(utils.extend({}, options, {
			header: utils.extend({}, originHeader, authHeader),
			
			// @dengnianchen 增加对statusCode的判断，对于非200的返回，以错误处理
			success: function(response) {
				try {
					response.data = JSON.parse(response.data);
				} catch (SyntaxException) {
				}
				var data = response.data;
				var statusCode = response.statusCode; // @dengnianchen
				
				// @dengnianchen 判断返回数据是否存在且为JSON格式 >>>
				if (!data || data.code == null) {
					return callFail(new RequestError(0, 'ERR_FORMAT',
						`响应格式错误：${JSON.stringify(data)}`));
				}
				// <<<
				
				// @dengnianchen 根据状态码判断请求成功或失败，并调用相应的回调函数 >>>
				if (statusCode >= 200 && statusCode < 300) { // 200~299段为执行成功之状态码
					callSuccess.apply(null, arguments);
				} else if (statusCode == 401 && !hasRetried) {
					// @dengnianchen 若返回错误码为401（需要登录），则尝试登录后重新发起请求
					//     该尝试只进行一次，若再次返回401，则按常规错误处理
					hasRetried = true;
					doUploadWithLogin();
				} else {
					callFail(
						new RequestError(statusCode, data.error, data.message));
				}
				// <<<
				
				/* @dengnianchen 原文件实现内容
				var error, message;
				if (data && data.code === -1) {
					Session.clear();
					// 如果是登录态无效，并且还没重试过，会尝试登录后刷新凭据重新请求
					if (!hasRetried) {
						hasRetried = true;
						doRequestWithLogin();
						return;
					}

					message = '登录态已过期';
					error = new RequestError(data.error, message);

					callFail(error);
					return;
				} else {
					callSuccess.apply(null, arguments);
				}
				*/
			},
			
			// @dengnianchen 修改原实现，将err信息封装成RequestError对象
			fail: function(err) {
				callFail(new RequestError(0, 'ERR_REQUEST', err.msg));
			},
			complete: noop,
		}));
	}
	
}

module.exports = {
	RequestError, request, upload
};