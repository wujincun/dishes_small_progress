let Pormise = require('../../api/es6-promise.min.js');
//index.js
//获取应用实例
var app = getApp();
Page({
    data: {
        storeInfo: {},   // 店铺信息
        isShowTel: false,   // 是否显示电话
        isGetAuthSetting: true    // true：不展示授权蒙层
    },
    onLoad: function (options) {
        // 此处需要获取storeid和tableid的逻辑存到storage里面
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        wx.setStorageSync('table_id', '');
        console.log('index onLoad')
    },
    onShow: function () {
        let that = this;
        // 判断是否拿到用户的授权，如果用户授权的话就不再执行下面的代码，并且把局部的授权判断置为true（小程序的坑：防止多次调用getSetting报错）
        if (!app.globalData.isGetAuthSetting) {
            console.log('isGetAuthSetting', app.globalData.isGetAuthSetting);
            wx.getSetting({
                success(res) {
                    console.log(res);
                    console.log(res.authSetting['scope.userInfo']);
                    if (res.authSetting['scope.userInfo']) {
                        that.setData({
                            isGetAuthSetting: true
                        });
                        // 如果拿到用户授权，全局变量置为true，锁住这段代码
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
        console.log('刷新了');
        let store_id = wx.getStorageSync('store_id');
        console.log('store_id:', store_id);
        app.globalData.wtApi.apiStore_storeList({}).then((data) => {
            if (data.type == 'success') {
                if (store_id) {
                    let flag = false;
                    for (let i = 0; i < data.data.length; i++) {
                        if (data.data[i].id == store_id) {
                            flag = true;
                            break
                        }
                    }
                    if (!flag) {
                        wx.setStorageSync('store_id', data.data[0].id)
                    }
                    this.getStoreInfo()
                } else {
                    wx.setStorageSync('store_id', data.data[0].id);
                    this.getStoreInfo()
                }
                // this.getStoreInfo()
            }
        })
    },
    getStoreInfo: function () {
        app.globalData.wtApi.apiStore_storeInfo({}).then((data) => {
            if (data) {
                this.setData({
                    storeInfo: data.data,
                });

                if (!this._checkTime()) {
                    this.data.storeInfo.is_delivery = 0;
                    this.data.storeInfo.is_meal = 0;
                    this.data.storeInfo.is_queue = 0;
                    this.data.storeInfo.is_reservation = 0;
                    this.setData({
                        storeInfo: this.data.storeInfo
                    });
                    if (this.data.isGetAuthSetting) {
                        wx.showModal({
                            title: '提示',
                            content: '门店休息中',
                            showCancel: false
                        })
                    }
                }
            }
            if (!app.globalData.isGetAuthSetting) {
                wx.getSetting({
                    success: (res) => {
                        if (res.authSetting['scope.userInfo']) {
                            this.setData({
                                isGetAuthSetting: true
                            })
                        }
                    }
                })
            }
            wx.hideLoading()
        })
    },
    gotoChooseShop: function () {
        if (this.data.isGotoChooseShop) {
            return
        }
        this.data.isGotoChooseShop = true;
        if (!(this.data.storeInfo.is_other == 1)) {
            wx.showToast({
                title: '暂无分店',
                image: '/images/icon_warning.png',
                mask: true, duration: 1500,

            });
            this.data.isGotoChooseShop = false
        } else {
            wx.navigateTo({
                url: '/pages/index/chooseShop/chooseShop'
            });
            setTimeout(() => {
                this.data.isGotoChooseShop = false
            }, 500)
        }
    },
    gotoGetcoupon: function () {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true;
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000);
        wx.navigateTo({
            url: '/pages/mine/coupon/getCoupon'
        })
    },
    gotoMaiDan: function () {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true;
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000);

        wx.navigateTo({
            url: '/pages/pay/payQuick/payQuick?logo=' + this.data.storeInfo.logo + '&title=' + this.data.storeInfo.title
        })
    },
    gotoMap: function () {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true;
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000);


        console.log('地图定位！');
        var that = this;

        wx.openLocation({
            latitude: parseFloat(that.data.storeInfo.lat),
            longitude: parseFloat(that.data.storeInfo.lng),
            scale: 14,
            name: this.data.storeInfo.title,
            address: this.data.storeInfo.address
        })

    },
    gotoDianCan: function () {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true;
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000);
        if (this._checkTime()) {
            wx.navigateTo({
                url: `/pages/chooseMeals/chooseMeals?dining_mode=2&sendingprice=${this.data.storeInfo.sendingprice}`
            })
        } else {
            wx.showToast({
                title: '门店休息中',
                image: '/images/icon_warning.png',
                mask: true, duration: 1500,
            })
        }
    },
    gotoTangdian: function () {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true;
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000);
        if (this._checkTime()) {
            wx.scanCode({
                success: (res) => {
                    if (res.errMsg == 'scanCode:ok') {
                        let str = res.result;
                        console.log(str);
                        if (!/\?/.test(str)) {
                            setTimeout(function () {
                                wx.showModal({
                                    title: '提示',
                                    content: '二维码有误',
                                    showCancel: false
                                })
                            }, 500);
                            return
                        }
                        str = str.split('?')[1];
                        let params = str.split('&');
                        let num = 0;
                        let table_id;
                        for (let i = 0; i < params.length; i++) {
                            if (/tablesid/.test(params[i])) {
                                wx.setStorageSync('table_id', params[i].split('=')[1]);
                                table_id = params[i].split('=')[1];
                                num++
                            }
                            if (/store/.test(params[i])) {
                                if (this.data.storeInfo.id != params[i].split('=')[1]) {
                                    setTimeout(function () {
                                        wx.showToast({
                                            title: '门店不符',
                                            image: '/images/icon_warning.png',
                                            mask: true,
                                            duration: 2000,
                                        })
                                    }, 1500);
                                    return
                                }
                                wx.setStorageSync('store_id', params[i].split('=')[1]);
                                num++
                            }
                        }
                        if (num == 2) {

                            app.globalData.wtApi.apiTableOpen({}, {table_id: table_id}).then((data) => {
                                if (data.type == 'success') {
                                    wx.navigateTo({
                                        url: '/pages/chooseMeals/chooseMeals?dining_mode=1'
                                    })
                                }
                            })

                        } else {
                            // wx.showToast({
                            //   title: '二维码有误',
                            //   image: '/images/icon_warning.png',
                            //   mask: true
                            // })
                            wx.showModal({
                                title: '提示',
                                content: '二维码有误',
                                showCancel: false
                            })
                        }
                    } else {
                        wx.showToast({
                            title: '扫描失败',
                            image: '/images/icon_warning.png',
                            mask: true,
                            duration: 5000,
                        })
                    }
                }
            })

        } else {
            wx.showToast({
                title: '门店休息中',
                image: '/images/icon_warning.png',
                mask: true,
                duration: 1500,
            })
        }
    },
    /**
     *  页面方法------> 跳转排队页面
     *  (跳转逻辑:首先判断是否已排队，yes：跳转至我的排队页面，no：跳转至取号页面)
     */
    gotoQueue: function () {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true;
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000);
        if (this._checkTime()) {
            //判断是否排队(1 已排队 0 未排队)
            if (this.data.storeInfo.is_queueing == 1) {
                wx.navigateTo({
                    url: "/pages/index/queue/myNumber"
                })
            } else {
                wx.navigateTo({
                    url: "/pages/index/queue/queueNumber"
                })
            }
        } else {
            wx.showToast({
                title: '门店休息中',
                image: '/images/icon_warning.png',
                mask: true, duration: 1500,
            })
        }
    },
    gotoYuDing: function () {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true;
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000);
        if (this._checkTime()) {
            wx.navigateTo({
                url: '/pages/index/reserve/reserve',
            })
        } else {
            wx.showToast({
                title: '门店休息中',
                image: '/images/icon_warning.png',
                mask: true,
                duration: '5000',
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
    actionSheetTap: function () {
        let tels = this.data.storeInfo.tel.split(',');
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
            var itemList = tels;
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
    /**
     * 用于判断当前时间是否在营业时间内
     * 返回Boolean类型 。ture表示在 。false表示不在
     */
    _checkTime() {
        let result = true;
        let date = new Date();
        let fromDate = new Date();
        let toDate = new Date();
        fromDate.setHours(parseInt(this.data.storeInfo.begin_time.split(':')[0], 10));
        fromDate.setMinutes(parseInt(this.data.storeInfo.begin_time.split(':')[1], 10));
        toDate.setHours(parseInt(this.data.storeInfo.end_time.split(':')[0], 10));
        toDate.setMinutes(parseInt(this.data.storeInfo.end_time.split(':')[1], 10));

        if (((date.getTime() - fromDate.getTime()) < 0) || ((date.getTime() - toDate.getTime()) > 0)) {
            result = false
        }
        return result
    },
    authSetting: function () {
        wx.getUserInfo({
            fail() {
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
    }
});