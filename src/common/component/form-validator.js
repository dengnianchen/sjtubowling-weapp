export default {
	maxlength: function (value, length) {
		if (value !== null && value !== undefined &&
			value.constructor !== String)
			value = value.toString();
		if (!value || value.length <= length)
			return '';
		return `字符长度不能大于${length}`;
	},
	minlength: function (value, length) {
		if (value !== null && value !== undefined &&
			value.constructor !== String)
			value = value.toString();
		if (value && value.length >= length)
			return '';
		return `字符长度不能小于${length}`;
	},
	btlength: function (value, length1, length2) {
		if (length1 === 0)
			return this.maxlength(length2);
		if (value !== null && value !== undefined &&
			value.constructor !== String)
			value = value.toString();
		if (value && value.length >= length1 && value.length <= length2)
			return '';
		return `字符长度必须介于${length1}和${length2}之间`;
	},
	eqlength: function (value, length) {
		if (length === 0)
			return this.maxlength(length);
		if (value !== null && value !== undefined &&
			value.constructor !== String)
			value = value.toString();
		if (value && value.length === length)
			return '';
		return `字符长度必须等于${length}`;
	},
	email: function (value) {
		const rule = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
		if (rule.test(value))
			return '';
		return '输入的E-mail格式有误';
	}
}