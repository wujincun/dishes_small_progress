let Pormise = require('../../../api/es6-promise.min.js')
let Utit = require('../../../utils/util')
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        info: {},
        isShowDetail: false,
        isShowNone: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.globalData.wtApi.apiStore_couponCouponList({}).then((data) => {
            if (data.type === 'success') {
                if (data.data.coupons && data.data.coupons.length == 0) {
                } else {
                    for (let i = 0; i < data.data.coupons.length; i++) {
                        if (data.data.coupons[i].type == '2') {
                            // data.data.coupons[i].discount = Utit.switchFee(data.data.coupons[i].discount)
                        }
                        if (data.data.coupons[i].type == '1') {
                            data.data.coupons[i].discount = Math.round(data.data.coupons[i].discount * 100) / 10
                        }
                    }
                }

                if (!(data.data.coupons && data.data.coupons.length > 0)) {
                    this.setData({
                        isShowNone: true
                    })
                }

                this.setData({
                    info: data.data
                })
            } else {
                this.setData({
                    isShowNone: true,
                    info: data.data
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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    toggleShow: function (e) {
        let idx = e.currentTarget.dataset.index
        this.data.info.coupons[idx].isShowDetail = this.data.info.coupons[idx].isShowDetail ? !this.data.info.coupons[idx].isShowDetail : true
        this.setData({
            info: this.data.info
        })
    },
    getCoupon: function (e) {
        let id = e.currentTarget.dataset.id
        let idx = e.currentTarget.dataset.index
        if (this.data.info.coupons[idx].credit != 0) {
            wx.showModal({
                title: '提示',
                content: '确认消耗' + this.data.info.coupons[idx].credit + this.data.info.coupons[idx].credit_type,
                success: (res) => {
                    if (res.confirm) {
                        app.globalData.wtApi.apiStore_receiveCoupon({}, { coupon_id: id }).then((data) => {
                            if (data.type == 'success') {
                                if (this.data.info.coupons[idx].credit_type == '积分') {
                                    this.data.info.my_credit = data.data.my_credit
                                }
                                this.data.info.my_credit = this.toDecimal2(this.data.info.my_credit)
                                wx.showToast({
                                    title: data.message,
                                    mask: true
                                })
                                this.setData({
                                    info: this.data.info
                                })
                            } else {
                                if (data.type == 'info' && data.message == '抢光了') {
                                    app.globalData.wtApi.apiStore_couponCouponList({}).then((data) => {
                                        if (data.type === 'success') {
                                            for (let i = 0; i < data.data.coupons.length; i++) {
                                                if (data.data.coupons[i].type == '2') {
                                                    // data.data.coupons[i].discount = Utit.switchFee(data.data.coupons[i].discount)
                                                }
                                            }
                                            this.setData({
                                                info: data.data
                                            })
                                        }
                                    })
                                }
                            }
                        })
                    }
                }
            })
        } else {
            app.globalData.wtApi.apiStore_receiveCoupon({}, { coupon_id: id }).then((data) => {
                if (data.type == 'success') {
                    if (this.data.info.coupons[idx].credit_type == '积分') {
                        this.data.info.my_credit = this.data.info.my_credit - this.data.info.coupons[idx].credit
                    }
                    this.data.info.my_credit = this.toDecimal2(this.data.info.my_credit)
                    wx.showToast({
                        title: data.message,
                        mask: true
                    })
                    this.setData({
                        info: this.data.info
                    })
                } else {
                    if (data.type == 'info' && data.message == '抢光了') {
                        app.globalData.wtApi.apiStore_couponCouponList({}).then((data) => {
                            if (data.type === 'success') {
                                for (let i = 0; i < data.data.coupons.length; i++) {
                                    if (data.data.coupons[i].type == '2') {
                                        // data.data.coupons[i].discount = Utit.switchFee(data.data.coupons[i].discount)
                                    }
                                }
                                this.setData({
                                    info: data.data
                                })
                            }
                        })
                    }
                }
            })
        }

    },
    // 最多保留两位小数
    toDecimal2: function (x) {
        var f = parseFloat(x);
        if (isNaN(f)) {
            return false;
        }
        var f = Math.round(x * 100) / 100;
        var s = f.toString();
        var rs = s.indexOf('.');
        if (rs < 0) {
            rs = s.length;
            s += '.';
        }
        while (s.length <= rs + 2) {
            s += '0';
        }
        return s;
    }
})