const error = require('../error');
const config = require('../config');
const qcloud = require('../vendor/wafer2-client-sdk/index');
const versions = require('../versions');
const md5 = require('md5');

const formatTime = date => {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const hour = date.getHours();
	const minute = date.getMinutes();
	const second = date.getSeconds();
	
	return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
};

const formatNumber = n => {
	n = n.toString();
	return n[1] ? n : '0' + n
};


// 显示繁忙提示
const showBusy = text => wx.showToast({
	title: text,
	icon: 'loading',
	duration: 100000,
	mask: true
});

// 显示成功提示
const showSuccess = text => wx.showToast({
	title: text,
	icon: 'success'
});

// 显示失败提示
const showModel = (title, content) => {
	wx.hideToast();
	return new Promise((resolve, reject) => {
		wx.showModal({
			title,
			content: !content ?
				'' :
				(content.constructor === String ?
					content :
					JSON.stringify(content)),
			showCancel: false,
			success: res => resolve(res),
			fail: () => reject
		})
	});
};
const showError = (title, ex) => {
	console.error(title, ex);
	return showModel(title, typeof(ex) === "string" ? ex :
		(ex.message === "" ? error[ex.type] : ex.message));
};

const obj2params = obj => {
	const params = [];
	for (let key in obj)
		params.push(`${key}=${obj[key]}`);
	return params.join("&");
};

const isEmptyObject = obj => {
	for (let key in obj)
		return false;
	return true;
};

/**
 * 计算从指定日期开始的周次
 * @param {String|Date} fromDate 起始日期
 * @param {String|Date} toDate  （可选）目标日期，若省略则默认为当天日期
 * @returns {number} 目标日期所在的周次
 */
const getWeekNumber = (fromDate, toDate) => {
	if (toDate === undefined)
		toDate = new Date();
	else if (toDate.constructor === String)
		toDate = new Date(toDate);
	else if (toDate.constructor !== Date)
		throw new TypeError("toDate must be String or Date");
	if (fromDate === undefined)
		throw new Error("missing parameter fromDate");
	else if (fromDate.constructor === String)
		fromDate = new Date(fromDate);
	else if (fromDate.constructor !== Date)
		throw new TypeError("fromDate must be String or Date");
	
	const durationInMs = toDate.getTime() - fromDate.getTime();
	return Math.floor(durationInMs / (1000 * 3600 * 24 * 7)) + 1;
};

const getSysinfo = () => wx.getSystemInfoSync();

const rpx2px = rpx => rpx / 750 * getSysinfo().windowWidth;

const px2rpx = px => px / getSysinfo().windowWidth * 750;

function getScreenSize (unit) {
	if (unit === "rpx")
		return {
			x: px2rpx(getSysinfo().windowWidth),
			y: px2rpx(getSysinfo().windowHeight)
		};
	else
		return {
			x: getSysinfo().windowWidth,
			y: getSysinfo().windowHeight
		};
}

function extend(target) {
	const sources = Array.prototype.slice.call(arguments, 1);
	for (let i = 0; i < sources.length; i += 1) {
		const source = sources[i];
		for (const key in source) {
			if (source.hasOwnProperty(key)) {
				target[key] = source[key];
			}
		}
	}
	return target;
}

/**
 * qcloud.request方法的Promise封装，URL自动添加根路径，解析请求方法，自适应登录态/非登
 * 录态。
 * 若成功则提供(data, result)，其中data为响应对象中的数据，result为原始响应对象。
 * 若失败则提供ex，包含错误信息。
 *
 * @param {String}  urlWithMethod 包含请求方法的URL相对路径，格式为：[method] url。
 *                                若省略请求方法则默认为GET。
 *                                范例："PUT /user", "/user" = "GET /user"
 * @param {Object?} data          随请求提交的数据
 * @param {Object?} options       请求选项，同request函数的options，但是忽略
 *                                url, method, data, success, fail五个选项
 * @return {Promise}
 * @author Deng Nianchen
 */
function request(urlWithMethod, data, options) {
	return new Promise((resolve, reject) => {
		const splitPosition = urlWithMethod.indexOf(' ');
		const method = splitPosition === -1 ? 'GET' :
			urlWithMethod.substr(0, splitPosition);
		const relativeUrl = urlWithMethod.substr(splitPosition + 1);
		const session = qcloud.Session.get();
		const requestWithLogin = (options && options.login) || (session && session.skey);
		const basicRequestOptions = extend({}, options, {
			url: `${config.service.host}/weapp${relativeUrl}`,
			method: method,
			data: data,
			success: result => resolve(result.data.data, result)
		});
		qcloud.request(extend({}, basicRequestOptions, {
			login: requestWithLogin,
			fail: ex => {
				if (ex.statusCode === 401 && !requestWithLogin) {
					// 以非登录态请求时服务器告知需要登录，则重新尝试以登陆态请求
					qcloud.request(extend({}, basicRequestOptions, {
						login: true,
						fail: ex => reject(ex)
					}))
				} else
					reject(ex);
			}
		}));
	});
}

/**
 * 基本功能和request函数一致，提交请求时将包含由submit事件提供的表单ID到请求头（并自动登
 * 陆）。
 * 注：仅在访问受限的资源路径（需要登陆才能访问的路径）时表单ID才会被后台收集。
 *
 * @param {Object}  e             表单提交事件
 * @param {String?} urlWithMethod 包含请求方法的URL相对路径，见request函数。未指定则
 *                                默认为 /noop
 * @param {Object?} data          随请求提交的数据
 * @param {Object?} options       请求选项，见request函数
 * @return {Promise}
 * @author Deng Nianchen
 */
function submit(e, urlWithMethod, data, options) {
	if (!e || !e.detail.formId)
		throw new Error("missing e or e.detail.formId");
	if (urlWithMethod === undefined)
		urlWithMethod = "/noop";
	return request(urlWithMethod, data, extend({}, options, {
		header: extend({ 'X-WX-Formid': e.detail.formId },
			options ? options.header : null),
		login: true
	}));
}

/**
 * 上传文件。该方法始终以登录态发起请求，并添加由submit事件提供的表单ID到请求头。
 *
 * @param {Object}  e       表单提交事件
 * @param {String}  url     URL相对路径
 * @param {String}  file    要上传的文件路径
 * @param {String}  name    提供给服务器的文件名
 * @param {Object?} data    随请求提交的数据
 * @param {Object?} options 请求选项，见request函数
 * @returns {Promise}
 */
function upload(e, url, file, name, data, options) {
	if (!e || !e.detail.formId)
		throw new Error("missing e or e.detail.formId");
	return new Promise((resolve, reject) => {
		qcloud.upload(extend({}, options, {
			url: `${config.service.host}/weapp${url}`,
			header: extend({ 'X-WX-Formid': e.detail.formId },
				options ? options.header : null),
			login: true,
			filePath: file,
			name: name,
			formData: data,
			success: result => {
				resolve(result.data.data, result)
			},
			fail: ex => reject(ex)
		}));
	});
}

function getLatestVersion() {
	const versionNames = Object.keys(versions);
	return versionNames[0];
}

function getValue(obj, path) {
	let keys = path.split(".");
	for (let key of keys) {
		obj = obj[key];
		if (obj === undefined || obj === null)
			break;
	}
	return obj;
}

function setValue(obj, path, value) {
	let keys = path.split(".");
	for (let i = 0; i < keys.length - 1; ++i) {
		if (obj[keys[i]] === undefined || obj[keys[i]] === null)
			obj[keys[i]] = {};
		obj = obj[keys[i]];
	}
	obj[keys[keys.length - 1]] = value;
}

function getConfig(key) {
	if (!key)
		return getApp().globalData.config;
	return getApp().globalData.config[key];
}

module.exports = {
	formatTime, showBusy, showSuccess, showModel, showError, obj2params,
	isEmptyObject, getWeekNumber, getSysinfo, getScreenSize, rpx2px, px2rpx,
	extend, request, submit, upload, getLatestVersion, md5,
	getValue, setValue, getConfig
};
