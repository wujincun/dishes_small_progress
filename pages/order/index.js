let Pormise = require('../../api/es6-promise.min.js')
var app = getApp()
Page({
    data: {
        orderList: [],  // 订单列表
        pageSize: 10,   // page长度
        page: 1,    // 当前page
        dataFlag: true,   // 是否显示倒计时
        timer:'',  // 倒计时句柄
        orderId: '',   // 订单id
        cancelFlag: true,    //是否显示取消按钮
        isGetAuthSetting:true,   // 是否有用户授权
        surplusFlag: false   // 判断倒计时结束后是否再去执行取消订单接口
    },
    onLoad: function () {},
    onUnload: function () {
        let _this = this
        clearInterval(_this.data.timer)
    },
    onShow: function () {
        console.log('orderList show')
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
        this.setData({
            cancelFlag: true,
            dataFlag: true,
            page: 1
        })
        let flag = 'onshow'
        this.onLoadOrderList(-999, 1, 10, 'fresh')
        this.data.timer = setInterval(() => {
            this.countDown()
        }, 1000)

        setTimeout(() => {
            this.setData({
                surplusFlag: true
            })
        }, 1000)
    },
    onHide: function () {
        this.setData({
            cancelFlag: false,
            surplusFlag: false
        })
        let _this = this
        clearInterval(_this.data.timer)
    },
    /**
     * 获取订单列表
     */
    onLoadOrderList: function (status, num, pageSize, flag) {
        let _this = this
        let parmas = {
            'status': status,
            'dining_mode': '',
            'last_order_id': '',
            'page_size': pageSize,
            'page': num
        }
        let parmasObject = {
            'status': status,
            'dining_mode': '',
            'last_order_id': '',
            'page_size': pageSize,
            'page': num
        }
        app.globalData.wtApi.apiStore_orderList(parmas, parmasObject).then((res) => {
            console.log(res.data)
            if(res.type == 'success') {
                if(res.data){
                    if(flag == 'fresh') {
                        this.setData({
                            orderList:res.data
                        })
                    } else {
                        var getOrders = this.data.orderList.concat(res.data)
                        this.setData({
                            orderList: getOrders
                        })
                    }
                } else {
                    this.setData({
                        dataFlag: false,
                    })
                    if (flag == 'fresh') {
                        this.setData({
                            orderList: []
                        })
                    }
                }
                wx.stopPullDownRefresh()
            }
        })
    },
    /**
     * 下拉刷新
     */
    onPullDownRefresh: function () {
        let _this = this
        let flag = 'fresh'
        this.setData({
            page: 1
        })
        setTimeout(function () {
            _this.onLoadOrderList(-999, 1, 10,flag)
        },500)

    },
    /**
     * 上拉加载
     */
    onReachBottom: function () {
        if(this.data.dataFlag) {
            let _this = this
            let page = this.data.page + 1
            this.setData({
                page: page
            })

            setTimeout(function () {
                _this.onLoadOrderList(-999, page, 10,'')
            },500)
        }
    },
    /**
     * 倒计时
     */
    countDown: function () {
        let newOrderList = this.data.orderList
        let timer = 15 * 60 * 1000
        let nowTimer = new Date().getTime()
        let orderTimer, resultTime, timerHour, timerMinutes, minutes, timerSeconds, seconds, cuuntTimer, iosFormatDate
        for (let item in newOrderList) {
            iosFormatDate = newOrderList[item].dateline.split(/[- : \/]/)
            orderTimer = new Date(iosFormatDate[0], iosFormatDate[1] - 1, iosFormatDate[2], iosFormatDate[3], iosFormatDate[4], iosFormatDate[5]).getTime()
            cuuntTimer = nowTimer - orderTimer
            resultTime = timer - (nowTimer - orderTimer)
            if (newOrderList[item].pay_type == '未支付' && (nowTimer - orderTimer < timer - 1000) && newOrderList[item].real_fee != '0' && newOrderList[item].status_type != -1 && newOrderList[item].status_type != -2 ) {
                resultTime = resultTime - 1000
                timerHour = resultTime % (24 * 3600 * 1000)
                timerMinutes = timerHour % (3600 * 1000)
                minutes = Math.floor(timerMinutes / (60 * 1000))
                timerSeconds = timerMinutes % ((60 * 1000))
                seconds = Math.round(timerSeconds / 1000)
                seconds >= 10 ? seconds = seconds : seconds = '0' + seconds
                newOrderList[item].minutes = minutes
                newOrderList[item].seconds = seconds
                this.setData({
                    orderList: newOrderList
                })
            } else {
                this.setData({
                    orderId: newOrderList[item].id
                //     orderList: newOrderList
                })
                if (newOrderList[item].pay_type == '未支付' && newOrderList[item].status_type == 0) {
                    // newOrderList[item].pay = 0
                    if (newOrderList[item].real_fee != '0') {
                        if (this.data.cancelFlag == true) {
                            this.orderAutoCancel()
                        }
                    }
                }
            }
        }
        this.setData({
            orderListAll: newOrderList
        })
    },
    /**
     * 订单自动取消
     */
    orderAutoCancel: function () {
        let params = {
            'order_id': this.data.orderId
        }
        let queryObject = {
            'order_id': this.data.orderId
        }
        app.globalData.wtApi.apiStore_orderAutoCancel(params, queryObject).then((response) => {
            if (response.type == 'success') {
                this.setData({
                    // orderList: [],
                    timer: clearInterval(this.data.timer)
                })
                this.onLoadOrderList(-999, 1, 10, 'fresh')
            }
        })
    },
    /**
     * 跳转到详情页
     * @param e
     */
    gotoOrderDetail: function (e) {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000)

        console.log(e)
        let orderId = e.currentTarget.dataset.orderid
        let storeId = e.currentTarget.dataset.storeid
        let orderSn = e.currentTarget.dataset.ordersn
        let mode = e.currentTarget.dataset.mode
        if (mode == '堂点' || mode == '外卖') {
            wx.navigateTo({
                url: '/pages/order/orderDetail/orderDetail?orderId=' + orderId + '&storeId=' + storeId + '&orderSn=' + orderSn
            })
        } else {
            wx.navigateTo({
                url: '/pages/order/orderAppointment/orderAppointment?orderId=' + orderId + '&storeId=' + storeId + '&orderSn=' + orderSn
            })
        }
    },
    /**
     * 支付
     */
    immediatePayment: function (e) {
        let iosFormatDate = e.currentTarget.dataset.time.split(/[- : \/]/)
        let time = new Date(iosFormatDate[0], iosFormatDate[1] - 1, iosFormatDate[2], iosFormatDate[3], iosFormatDate[4], iosFormatDate[5]).getTime()
        let id = e.currentTarget.dataset.id
        let sn = e.currentTarget.dataset.sn
        wx.navigateTo({
            url: '/pages/pay/pay?order_id=' + id + '&order_sn=' + sn + '&time=' + time
        })
    },
    // 获取用户授权信息
    authSetting:function () {
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