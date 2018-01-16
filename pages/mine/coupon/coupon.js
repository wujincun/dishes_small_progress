let Pormise = require('../../../api/es6-promise.min.js')
var app = getApp()
let Util = require('../../../utils/util')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        couponList: [],    // 优惠券列表
        isShowPoor: false,   // 是否显示无优惠券缺省页
        page: 1,   // 当前页码
        isLoading: false,   // 是否在loading
        isCanLoad: true,   //  是否可以访问下一页
        unUseisNull: false   // 是否可以点击失效券页
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this
        // setTimeout(function () {
        //   if (that.data.couponList.length == 0)
        //     that.setData({
        //       isShowPoor: true
        //     })
        // }, 2000)


        app.globalData.wtApi.apiStore_getUserCouponsList({}, { page: this.data.page, is_exp: 1 }).then((data) => {
            console.log(data.data)
            if (!data.data || data.data.length == 0) {
                this.setData({
                    unUseisNull: true
                })
            }
        })
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
        this.data.couponList = []
        this.getCouponList()
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
    getCouponList: function () {
        this.setData({
            isLoading: true
        })
        app.globalData.wtApi.apiStore_getUserCouponsList({}, { page: this.data.page }).then((data) => {
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
                    couponList: this.data.couponList.concat(data.data),
                    isLoading: false,
                    isShowPoor: false
                })
            } else if (this.data.page == 1) {
                this.setData({
                    isCanLoad: false,
                    isShowPoor: true
                })
            }
        })
    },
    toggleShow: function (e) {
        let idx = e.currentTarget.dataset.index
        this.data.couponList[idx].isShowDetail = this.data.couponList[idx].isShowDetail ? !this.data.couponList[idx].isShowDetail : true
        this.setData({
            couponList: this.data.couponList
        })
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
    gotoGetCoupon: function () {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000)

        wx.navigateTo({
            url: '/pages/mine/coupon/getCoupon'
        })
    },
    gotoUnused() {
        wx.navigateTo({
            url: "/pages/mine/coupon/couponUnused"
        })
    }
})