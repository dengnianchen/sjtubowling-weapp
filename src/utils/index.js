const error = require('../error');
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

// 隐藏提示框
const hideToast = () => wx.hideToast();

// 显示失败提示对话框
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

function getLatestVersion() {
	const versionNames = Object.keys(versions);
	return versionNames[0];
}

function getConfig(key) {
	if (!key)
		return getApp().globalData.config;
	return getApp().globalData.config[key];
}

module.exports = {
	formatTime, showBusy, showSuccess, hideToast, showModel, showError,
	getWeekNumber, getSysinfo, getScreenSize, rpx2px, px2rpx,
	getLatestVersion, md5, getConfig
};
