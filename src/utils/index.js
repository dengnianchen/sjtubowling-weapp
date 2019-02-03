const versions = require('../versions');

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

function getLatestVersion() {
	const versionNames = Object.keys(versions);
	return versionNames[0];
}

module.exports = {
	getWeekNumber, getLatestVersion
};
