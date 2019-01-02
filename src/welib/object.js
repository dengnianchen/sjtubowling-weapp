function weobj (o) {
	
	return {
		data: o,
		
		isEmpty() {
			let isEmpty = true;
			this.each(() => {
				isEmpty = false;
				return false;
			});
			return isEmpty;
		},
		
		urlParams() {
			const params = [];
			this.each((key, value) => params.push(`${key}=${value}`));
			return params.join("&");
		},
		
		getValue(path) {
			let keys = path.split(".");
			let obj = o;
			for (let key of keys) {
				obj = obj[key];
				if (obj === undefined || obj === null)
					break;
			}
			return obj;
		},
		
		setValue(path, value) {
			let keys = path.split(".");
			let obj = o;
			for (let i = 0; i < keys.length - 1; ++i) {
				if (obj[keys[i]] === undefined || obj[keys[i]] === null)
					obj[keys[i]] = {};
				obj = obj[keys[i]];
			}
			obj[keys[keys.length - 1]] = value;
		},
		
		extend() {
			for (let i = 0; i < arguments.length; i++) {
				const source = arguments[i];
				weobj(source).each((key, value) => o[key] = value, true);
			}
			return this;
		},
		
		each(callback, includeFunction) {
			for (let key in o) {
				if (!o.hasOwnProperty(key))
					continue;
				if (typeof(value) === 'function' && !includeFunction)
					continue;
				if (callback(key, o[key]) === false)
					break;
			}
			return this;
		},
		
		eachFunction (callback) {
			return this.each((key, value) => {
				if (typeof(value) !== 'function')
					return;
				return callback(key, value);
			}, true);
		}
	};
	
}

weobj.extend = function() {
	let o = {};
	for (let i = 0; i < arguments.length; i++) {
		const source = arguments[i];
		weobj(source).each((key, value) => o[key] = value, true);
	}
	return o;
};

module.exports = weobj;