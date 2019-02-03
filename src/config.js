/**
 * 小程序配置文件
 */
const host = 'https://sjtubowling.applinzi.com';//'https://h1ok3a5d.qcloud.la';
const publicUrl = 'http://sjtubowling.applinzi.com/bowling/Public';
const storageUrl = 'http://sjtubowling-public.stor.sinaapp.com';

const config = {
	
	// 下面的地址配合云端 Demo 工作
	service: {
		host,
		
		// 登录地址，用于建立会话
		loginUrl: `${host}/weapp/login`,
		
		// 测试的请求地址，用于测试会话
		requestUrl: `${host}/weapp/user`,
		
		// 测试的信道服务地址
		tunnelUrl: `${host}/weapp/tunnel`,
		
		// 上传图片接口
		uploadUrl: `${host}/weapp/upload`,
	},
	publicUrl: publicUrl,
	storageUrl: storageUrl,
	defaultAvatar: `${publicUrl}/img/default_avatar.png`,
	avatarUrl: `${storageUrl}/avatar/`,
	
	// Welib配置
	welib: {
		host: host + "/weapp",
		wui: {
			abnor: {
				'USER_LEAVE': {
					image: ''
				},
				'YOU_LEAVE': {
					image: ''
				},
				'NO_NEWEST_POST': {
					image: ''
				},
				'NO_SCHEDULE_THIS_WEEK': {
					image: ''
				},
				'VOTE_NOT_VISIBLE': {
					image: 'default',
					button: null
				}
			}
		}
	}
};

module.exports = config;