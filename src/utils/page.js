/**
 *
 * Copyright (c) 2018.
 */
const util = require('./index.js');



module.exports = {
	
	getPath() {
		let path = this.route;
		if (!util.isEmptyObject(this.options))
			path += `?${util.obj2params(this.options)}`;
		return path;
	},
	
	setLoading(isLoading, ex) {
		if (isLoading)
			this.setData({ loading: true });
		else if (!isLoading && !ex)
			this.setData({ loading: false });
		else {
			console.log('加载失败', ex);
			this.setData({
				loading: false,
				loadingError: { type: ex.type, message: ex.message }
			});
		}
	}
	
};
