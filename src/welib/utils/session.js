const qcloud = require('../vendor/wafer2-client-sdk/index');

class Session {
	
	static get(key) {
		return Session._getSessionObject()[key];
	}
	
	static set(key, value) {
		let s = Session._getSessionObject();
		s[key] = value;
		Session._setSessionObject(s);
	}
	
	static remove(key) {
		let s = Session._getSessionObject();
		delete s[key];
		Session._setSessionObject(s);
	}
	
	static _getSessionObject() {
		return qcloud.Session.get() || {};
	}
	
	static _setSessionObject(obj) {
		qcloud.Session.set(obj);
	}
	
}