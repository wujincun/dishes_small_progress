let Pormise = require('../../../api/es6-promise.min.js')
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        queueData: {}
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
    },

    onShow() {
        app.globalData.wtApi.apiStore_storeQueue({}).then((res) => {
            this.setData({
                queueData: res.data
            })
        })
    },
    /**
     * 立即取号
     */
    gotoTakeNumber: function () {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000)

        wx.redirectTo({
            url: '/pages/index/queue/takeNumber',
        })
    },
    /**
     * 拨打电话
     * （逻辑：判断电话个数，yes：直接拨打，No: 弹出actionSheet选择拨打）
     */
    makeCall: function () {
        let tels = this.data.queueData.store.tel.split(',')
        for (let i = 0; i < tels.length; i++) {
            if (tels[i] == '') {
                tels.splice(i, 1)
            }
        }
        if (tels.length == 1) {
            wx.makePhoneCall({
                phoneNumber: tels[0]
            })
        } else {
            var itemList = tels
            wx.showActionSheet({
                itemList: itemList,
                success: (res) => {
                    if (!res.cancel) {
                        this.phoneCall(tels[res.tapIndex])
                    }
                }
            })
        }
    },
    phoneCall: function (number) {
        wx.makePhoneCall({
            phoneNumber: number,
            success: function (res) {
            },
            fail: function (res) {
            },
            complete: (res) => {
            },
        })
    },
    openMap: function () {
        wx.openLocation({
            latitude: parseFloat(this.data.queueData.store.lat),
            longitude: parseFloat(this.data.queueData.store.lng),
            scale: 14,
            name: this.data.queueData.store.title,
            address: this.data.queueData.store.address
        })
    },
    onPullDownRefresh() {
        app.globalData.wtApi.apiStore_storeQueue({}).then((res) => {
            this.setData({
                queueData: res.data
            })
        })
    }
})