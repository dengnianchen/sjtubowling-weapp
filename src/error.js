const CommonError = (function() {
	function CommonError(type, message) {
		Error.call(this, message);
		this.type = type;
		this.message = message;
	}
	
	CommonError.prototype = new Error();
	CommonError.prototype.constructor = CommonError;
	
	return CommonError;
})();

module.exports = {
	CommonError,
	ERR_UNKNOWN: '未知错误。',
	ERR_REQUEST: '无效的请求。',
	ERR_FORMAT: '无效的响应格式。',
	
	/* 登录相关 */
	ERR_LOGIN_FAIL: '登录失败啦！',
	ERR_NEED_LOGIN: '只有登录用户才能看哦，快去登录吧！',
	
	/* 用户绑定相关 */
	ERR_NOT_BINDED: '当前微信账号尚未与球馆网站账号绑定。',
	
	/* 请求参数错误 */
	ERR_MISSING_PARAM: '缺少必须的请求参数。',
	ERR_INVALID_PARAM: '请求中包含无效参数。',
	ERR_DUPLICATE_SUBMIT: '不可重复执行该提交请求。',
	ERR_INVALID_FILE: '上传的文件不符合要求。',
	ERR_NO_RESOURCE: '找不到您想看的东西哦！',
	
	/* 系统内部错误 */
	ERR_INTERNAL: '哎哟，服务器出错啦！',
	ERR_DB_EXCEPTION: '执行数据库操作时发生异常。',
	ERR_NOT_IMPLEMENTED: '该方法尚未实现。',
	
	/* 业务逻辑 */
	ERR_USER_LEAVE: '该员工已离职啦>_<',
	ERR_YOU_LEAVE: '您已离职啦>_<',
	ERR_NO_NEWEST_POST: '本学期暂未发布例会记录',
	ERR_NO_SCHEDULE_THIS_WEEK: '本周无排班或班表尚未发布',
	ERR_VOTE_NOT_VISIBLE: '您不能查看该投票哦>_<'
};