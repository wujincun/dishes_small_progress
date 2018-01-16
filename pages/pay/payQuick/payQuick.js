let Pormise = require('../../../api/es6-promise.min.js')
let Util = require('../../../utils/util')
// pages/maidan/pay-quick/pay-quick.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        logo: '',
        title: '',
        index: 0,   // 未用刀
        isAble: true, // btn是否可点
        credit: ''  // 消费金额
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 获取店铺logo 和 店铺名称
        this.setData({
            logo: options.logo,
            title: options.title
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
    /**
     * 获取输入金额 && 按钮样式
     * 金额输入必须为大于等于0 的正数
     * 未输入金额透明度降低，输入数据后透明度正常
     */
    getCredit: function (e) {
        if (e.detail.value >= 0) {
            if (Util.onInputCheck(e.detail.value)) {
                this.setData({
                    credit: e.detail.value
                })
            } else {
                this.setData({
                    credit: e.detail.value.substr(0, e.detail.value.length - 1)
                })
            }
        } else {
            wx.showToast({
                title: '金额有误',
                icon: 'success',
                duration: 2000,
                image: '/images/icon_warning.png',
                mask: true
            })
            this.setData({
                isAble: true,
                credit: ''
            })
        }

        if (!Util.checkFee(this.data.credit)) {
            this.setData({
                isAble: true
            })
        } else {
            this.setData({
                isAble: false
            })
        }
    },
    /**
     * 快捷支付提交
     * 如果支付成功，进入成功页面，支付失败进入失败页面
     */
    quickPay: function () {
        let that = this
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000)

        if (!Util.checkFee(this.data.credit)) {
            wx.showToast({
                title: '金额有误',
                icon: 'success',
                duration: 2000,
                image: '/images/icon_warning.png',
                mask: true
            })
            this.setData({
                isAble: true,
                credit: ''
            })
            return
        }
        let params = {
            "fee": this.data.credit, // 消费金额
            "storeid": wx.getStorageSync('store_id')
        }
        app.globalData.wtApi.apiStore_quickPayGetOrderId(params, params).then((res) => {
            if (res.type == 'success') {
                // console.log(res)
                app.globalData.wtApi.apiStore_confirmPay({ order_id: res.data.id, type: 'wechat', totalprice: this.data.credit }, {}).then((data) => {
                    let order_id = res.data.id
                    if (data.type == 'success') {
                        // wx.showToast({
                        //     title: '支付成功'
                        // })
                        // console.log(data)

                        wx.requestPayment({
                            'timeStamp': data.data.timeStamp + '',
                            'nonceStr': data.data.nonceStr,
                            'package': data.data.package,
                            'signType': data.data.signType,
                            'paySign': data.data.paySign,
                            'success': function (res) {
                                if (res.errMsg == 'requestPayment:ok') {
                                    app.globalData.wtApi.apiStore_getPayInfo({ order_id: order_id, storeid: params.storeid })
                                    // wx.showToast({
                                    //     title: '支付成功',
                                    //     mask: true,
                                    //     image: '/images/icon_warning.png'
                                    // })
                                    wx.navigateBack()
                                }
                            },
                            'fail': function (res) {
                                app.globalData.wtApi.apiStore_orderFailPay({ order_id: order_id }, {}).then()
                                wx.showToast({
                                    title: '支付失败',
                                    mask: true,
                                    image: '/images/icon_warning.png', duration: 1500
                                })
                            },
                            complete: function () {
                                // that.setData({
                                //     isAble: true,
                                //     credit: ''
                                // })
                            }
                        })
                        // wx.redirectTo({
                        //     url: '/pages/index/check/payment/success?shop='
                        //     + this.data.cardPayData.store_list[this.data.index].title // 商家
                        //     + '&goodsprice=' + data.data.fee // 金额
                        //     + '&real_fee=' + data.data.card_fee // 实际支付
                        //     + '&integral=' + data.data.points // 获得积分
                        //     + '&ordersn=' + res.data.id // 订单编号
                        // })
                    } else {
                        wx.showToast({
                            title: '支付失败',
                            image: '/images/icon_warning.png',
                            mask: true, duration: 1500
                        })
                    }
                })
            } else {
                wx.navigateTo({
                    url: '/pages/index/check/payment/fail'
                })
            }
        })
    }
})