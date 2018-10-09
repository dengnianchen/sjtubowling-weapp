var qcloud = require('../vendor/wafer2-client-sdk/index')
var util = require('./index.js')

function AuthPage (page) {
    var pageOnLoad = page.onLoad;
    page.onLoad = function (options) {
        if (!qcloud.Session.get() || !qcloud.Session.get().user) {
            // 若Session不存在则跳转到登录页面
            var redirectUrl = this.route;
            if (!util.isEmptyObject(options))
                redirectUrl += `?${util.obj2params(options)}`;
            wx.redirectTo({
                url: `../bind/bind?from=${encodeURIComponent(redirectUrl)}`,
            });
            return;
        }
        // 继续执行原先的onLoad函数
        if (pageOnLoad instanceof Function)
            pageOnLoad.call (this, options);
    }
    Page(page);
}

module.exports = AuthPage
