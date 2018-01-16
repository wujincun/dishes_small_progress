let Pormise = require('../../../api/es6-promise.min.js')
// pages/mine/coupon/coupon-unused.js
let Util = require('../../../utils/util')
let app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        list: [],
        isShowPoor: false,
        page: 1,
        isLoading: false,
        isCanLoad: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.data.list = []
        this.getCouponList()
    },
    getCouponList: function () {
        this.setData({
            isLoading: true
        })
        app.globalData.wtApi.apiStore_getUserCouponsList({}, {page: this.data.page, is_exp: 1}).then((data) => {
            if (data.data) {

                for (let i = 0; i < data.data.length; i++) {
                    if (data.data[i].type == '优惠券') {
                        // data.data[i].discount = Util.switchFee(data.data[i].discount)
                    }
                    if (data.data[i].type == '折扣券') {
                        data.data[i].discount = Math.round(data.data[i].discount * 100) / 10
                    }
                }

                this.setData({
                    list: this.data.list.concat(data.data),
                    isLoading: false
                })
            } else {
                this.setData({
                    isCanLoad: false,
                    isShowPoor: true
                })
            }
        })
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (!this.data.isLoading && this.data.isCanLoad) {
            this.setData({
                page: this.data.page + 1
            })
            this.getCouponList()
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    gotoCouponInfo: function () {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000)

        wx.navigateTo({
            url: '/pages/mine/coupon/couponInfo',
            success: function (res) {
            },
            fail: function (res) {
            },
            complete: function (res) {
            },
        })
    },
})