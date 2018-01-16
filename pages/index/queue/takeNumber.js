let Pormise = require('../../../api/es6-promise.min.js')
var app = getApp()
Page({

    /**
    * 页面的初始数据
    */
    data: {
        countValue: '',   // 人数
        telValue: '',    // 电话
        isDisable: true   // btn是否为disabled
    },

    /**
    * 前往排号页面
    */
    gotoMyNumber: function () {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000)

        wx.redirectTo({
            url: '/pages/index/queue/myNumber',
        })
    },

    /**
     *  页面方法------> 获取客人数量
     *  数值校验：1.判断用户输入的值的范围是否在最小值和最大值之间，yes：校验是否有当前桌次，No：提示用户输入数量不在预定范围
     */
    getCount: function (e) {
        if (e.detail.value) {
            if (/^[1-9]\d*$/g.test(e.detail.value)) {
                this.setData({
                    countValue: e.detail.value
                })
            } else {
                wx.showToast({
                    title: '请输入正整数',
                    image: '/images/icon_warning.png',
                    mask: true,duration: 1500
                })
                this.setData({
                    countValue: ''
                })
            }
            this.checkInputValue()
        } else {
            this.setData({
                isDisable: true
            })
        }
    },
    /**
     *  页面方法------> 获取联系电话
     */
    getTel: function (e) {
        this.setData({
            telValue: e.detail.value
        })
        this.checkInputValue()
    },
    checkInputValue() {
        if (this.data.telValue.length == 11 && this.data.countValue != '') {
            this.setData({
                isDisable: false
            })
        } else {
            if (!this.data.isDisable) {
                this.setData({
                    isDisable: true
                })
            }
        }
    },
    /**
     *  页面方法------> 提交取号
     *  (规则校验：1.校验非空 2.校验手机号格式)
     */
    getNumber: function () {
        // 1.非空校验 ---> 客人数量和联系电话不为空
        if (this.data.telValue || this.data.countValue) {
            // 2.手机格式校验
            if (/^1[3|4|5|7|8][0-9]\d{4,8}$/.test(this.data.telValue)) {
                wx.showLoading({
                    title: '加载中',
                    mask: false
                })
                let params = {
                    user_mobile: this.data.telValue, // 手机号
                    user_count: this.data.countValue // 客人数量
                }
                app.globalData.wtApi.apiStore_setQueue(params).then((res) => {
                    if (res.type == 'success') {
                        wx.redirectTo({
                            url: '/pages/index/queue/myNumber'
                        })
                    }
                    this.setData({
                        queueData: res.data
                    })
                    wx.hideLoading()
                })
            } else {
                wx.showToast({
                    title: '手机号错误',
                    image: '/images/icon_warning.png',
                    mask: false,
                    duration: 2000
                })
            }
        } else {
            wx.showToast({
                title: '客人数量或联系电话不能为空',
                image: '/images/ic_info.png',
                duration: 2000,
                mask: false,
            })
        }

    }
})