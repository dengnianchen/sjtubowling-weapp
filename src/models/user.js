const config = require('../config');

class User {
	
	constructor(userData) {
		$(this).extend(userData);
		this._preprocess();
	}
	
	checkInfoCompletion() {
		return [
			this.info.gender !== 0,
			this.info.photo !== config.defaultAvatar,
			!this.active || this.numOfFreeTimeSelected() >= getApp().globalData.config.timetable_min_selected
		];
	}
	
	numOfFreeTimeSelected() {
		let n = 0;
		$(this.timetable).each((key, value) => n += value);
		return n;
	}
	
	/**
	 * 对服务器传回的用户信息进行预处理：
	 * 1. 预处理年级显示格式为统一的三位形式，空显示为未知
	 * 2. 转化头像标识为缩略图路径和大图路径方便界面层显示
	 *
	 * @author Deng Nianchen
	 */
	_preprocess() {
		if (this.grade !== undefined) {
			if (!this.grade)
				this.grade = '未知';
			else
				this.grade = this.grade.substr(0, 3);
		}
		if (this.info && this.info.photo !== undefined) {
			if (!this.info.photo) {
				this.info.fullPhoto = config.defaultAvatar;
				this.info.thumbnail = config.defaultAvatar;
			} else {
				this.info.fullPhoto = config.avatarUrl + this.info.photo.substr(7);
				this.info.thumbnail = config.avatarUrl + this.info.photo;
			}
		}
		if (this.photo !== undefined) {
			if (!this.photo) {
				this.fullPhoto = config.defaultAvatar;
				this.thumbnail = config.defaultAvatar;
			} else {
				this.fullPhoto = config.avatarUrl + this.photo.substr(7);
				this.thumbnail = config.avatarUrl + this.photo;
			}
		}
	}
	
}