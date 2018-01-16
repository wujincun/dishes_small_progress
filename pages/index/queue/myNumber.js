let Pormise = require('../../../api/es6-promise.min.js')
// pages/line/myNumber/myNumber.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        queueData: {},  // 排队数据
        timeId: '' // 计时器句柄
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    onShow: function () {
        this.getData()
        this.data.timeId = setInterval(() => {
            this.getData()
        }, (1000 * 30))
    },

    onHide() {
        clearInterval(this.data.timeId)
    },
    onUnload() {
        clearInterval(this.data.timeId)
    },
    /**
     * 页面下拉刷新处理函数
     */
    onPullDownRefresh: function () {
        this.getData()
        setTimeout(function () {
            wx.stopPullDownRefresh()
        }, 1500)
    },

    gotoDianCan: function () {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000)

        wx.navigateTo({
            url: '/pages/chooseMeals/chooseMeals?dining_mode=7'
        })
    },
    /**
     * 取消排队
     * (逻辑：用户点击取消排队，弹出确认框，yes：取消排队 No:放弃取消)
     */
    cancelQueue: function () {
        wx.showModal({
            title: '提示',
            content: '确认取消排队？',
            success: function (res) {
                if (res.confirm) {
                    app.globalData.wtApi.apiStore_cancelQueue({}).then((res) => {
                        if (res.type == 'success') {
                            //成功后，跳转至首页
                            wx.showToast({
                                title: '取消成功',
                                duration: 2000,
                                success: function () {
                                    setTimeout(function () {
                                        wx.switchTab({
                                            url: '/pages/index/index'
                                        })
                                    }, 2000)
                                }
                            })
                        } else {
                            //失败后，停留当前页面，提示重试
                            wx.showToast({
                                title: '取消不成功，请下拉刷新后重试',
                                image: '/images/icon_warning.png',
                                mask: true,
                                duration: 2000
                            })
                        }
                        console.log('hahhahahahha', res.data)
                        // this.setData({
                        //     queueData: res.data.queueInfo
                        // })
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    getData: function () {
        app.globalData.wtApi.apiStore_storeQueue({}).then((res) => {
            console.log(res.data.queueInfo)
            this.setData({
                queueData: res.data.queueInfo
            })
            console.log(res.data.is_have)

            if (res.data.is_have == 0) {
                wx.redirectTo({
                    url: '/pages/index/queue/queueNumber'
                })
            }
        })
    }

})