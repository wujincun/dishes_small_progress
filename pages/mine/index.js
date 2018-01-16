let Pormise = require('../../api/es6-promise.min.js')
// pages/mine/index.js
let app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {},
        hiddenModal: false,
        isGetAuthSetting: true
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
        console.log('mine onshow')
        let that = this
        if (!app.globalData.isGetAuthSetting) {
            console.log('isGetAuthSetting', app.globalData.isGetAuthSetting)
            wx.getSetting({
                success(res) {
                    console.log(res)
                    console.log(res.authSetting['scope.userInfo'])
                    if (res.authSetting['scope.userInfo']) {
                        that.setData({
                            isGetAuthSetting: true
                        })
                        app.globalData.isGetAuthSetting = true
                        // app.submitUserInfo()
                    } else {
                        that.setData({
                            isGetAuthSetting: false
                        })
                    }
                }
            })
        } else {
            if (app.globalData.isGetAuthSetting != that.data.isGetAuthSetting) {
                that.setData({
                    isGetAuthSetting: app.globalData.isGetAuthSetting
                })
            }
        }
        app.globalData.wtApi.apiStore_getUserInfo({}).then((data) => {
            data.data.credit1 = this.toDecimal2(data.data.credit1)
            data.data.credit2 = this.toDecimal2(data.data.credit2)
            this.setData({
                userInfo: data.data,
                hiddenModal: app.globalData.mineHiddenModal
            })
            app.globalData.mineHiddenModal = false
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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    // 会员卡支付界面
    gotoVipPay: function () {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000)

        wx.navigateTo({
            url: '/pages/index/check/index',
            success: function (res) {
            },
            fail: function (res) {
            },
            complete: function (res) {
            },
        })
    },
    // 积分纪录界面
    gotoPointRecord: function () {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000)

        // if (!this.data.userInfo.has_card) {
        //   return
        // }
        wx.navigateTo({
            url: '/pages/mine/record/pointRecord',
            success: function (res) {
            },
            fail: function (res) {
            },
            complete: function (res) {
            },
        })
    },
    // 交易记录界面
    gotoBusinessRecord: function () {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000)

        // if (!this.data.userInfo.has_card) {
        //   return
        // }
        wx.navigateTo({
            url: '/pages/mine/record/businessRecord',
            success: function (res) {
            },
            fail: function (res) {
            },
            complete: function (res) {
            },
        })
    },
    // 我的优惠券界面
    gotoMyCoupon: function () {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000)

        wx.navigateTo({
            url: '/pages/mine/coupon/coupon',
            success: function (res) {
            },
            fail: function (res) {
            },
            complete: function (res) {
            },
        })
    },
    // 我的收货地址界面
    gotoAddressList: function () {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000)

        wx.navigateTo({
            url: '/pages/mine/address/chooseAddress?from=mine',
        })
    },
    // 领取会员卡界面
    gotoGetVipCard: function () {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000)

        wx.navigateTo({
            url: '/pages/mine/vipCard/getVipCard',
        })
    },
    // 我的订单界面
    gotoOrderList: function () {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000)

        wx.switchTab({
            url: '/pages/order/index',
        })
    },
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
    },
    listenerConfirm() {
        this.setData({
            hiddenModal: false
        })
    },
    authSetting: function () {
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.userInfo']) {
                    wx.openSetting({
                        success(res) {
                            console.log(res)
                        }
                    })
                }
            }
        })
    }
})