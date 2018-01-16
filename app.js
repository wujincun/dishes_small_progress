//app.js
import WtApi from './api/WtApi'
// import api from './api/Resource1'
App({
    onLaunch: function () {
        wx.setStorageSync('session_id', '')
        // 调用API从本地缓存中获取数据
        // var logs = wx.getStorageSync('logs') || []
        // logs.unshift(Date.now())
        // wx.setStorageSync('session_id', '')
    },
    getUserInfo: function (cb) {
        var that = this
        if (this.globalData.userInfo) {
            typeof cb == "function" && cb(this.globalData.userInfo)
        } else {
            //调用登录接口
            wx.getUserInfo({
                withCredentials: false,
                success: function (res) {
                    that.globalData.userInfo = res.userInfo
                    typeof cb == "function" && cb(that.globalData.userInfo)
                }
            })
        }
    },
    submitUserInfo: function () {
        wx.getUserInfo({
            success: (res) => {
                this.globalData.wtApi.apiStore_userSubmit({
                    'userInfo': res.userInfo,
                    'rawData': res.rawData,
                    'signature': res.signature,
                    'encryptedData': res.encryptedData,
                    'iv': res.iv
                }).then(function (res) {
                    console.log('用户提交信息回文', res)
                })
            }
        })
    },
    globalData: {
        userInfo: null,
        wtApi: new WtApi,
        mineHiddenModal: false,   // 用于领会员卡成功后显示modal
        isClickBtn: false,        // 判断是否已点击防止连点
        isGetAuthSetting:false    // 是否得到了用户的授权
    },
})
