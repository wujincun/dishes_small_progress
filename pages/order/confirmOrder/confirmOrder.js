let Pormise = require('../../../api/es6-promise.min.js')
// pages/order/confirm-order/confirm-order.js
let app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        mode: 1,        //  dining——mode
        selectedIndex: {x: 0, y: 0},    // 时间选择下标
        addressList: [],         // 收货地址数组
        timer: {},        //时间对象  对应 接口返回 数据   meal_time.list_all  的 data
        sendTime: '立即送出',      //配送时间
        isShowTimeChoose: false,      //是否显示时间选择层
        orderInfo: {             //订单信息 （后端返回的数据结构，此处写出来是指为了赋初值）
            no_discount_fee: 0,
            goods_price: 0,
            dispatch_price: 0,
            dispatch_price: 0,
            coupon_count: 0,
            card_discount: {
                group_name: '',
                condition: 0,
                discount: 0,
                original_fee: 0
            },
            coupon_discount_fee: 0
        },
        couponId: '',         // 优惠券id
        couponName: '',       // 优惠券title
        switchChecked: false,     // 切换switch按钮
        peopleNum: 0,     // 用餐人数
        remarks: '',     // 备注
        addressIndex: 0,      // 收货地址下标
        address_id: '',      // 收货地址id
        isIos: false,        // 是否是ios
        fontSize: 0,          // font-size
        remarkFlag: false,    // 备注flag是否有备注内容
        pageFlag: ''         //  上一个页面名 （没用到）
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.setStorageSync('isUseVipCard', false)
        wx.setStorageSync('coupon_id', '')
        wx.setStorageSync('coupon_name', '')
        // 确定订单类型（2：外卖，1：堂点）
        this.setData({
            mode: options.mode,
            peopleNum: options.peopleNum,
            pageFlag: options.pageFlag
        })
        if (this.data.mode == 2) {
            let address_id = wx.getStorageSync('address_id')
            this.setData({
                address_id
            })
        }
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
        this.setData({
            switchChecked: wx.getStorageSync('isUseVipCard')
        })
        // 获取配送时间列表
        this.getDeliveryTimeList()

        // 获取确认订单信息
        let couponId = wx.getStorageSync('coupon_id')
        let couponName = wx.getStorageSync('coupon_name')
        this.setData({
            couponId,
            couponName
        })

        if (this.data.mode == 2) {
            this.setData({
                address_id: wx.getStorageSync('address_id')
            })
            // 获取收货地址
            this.getAddressList()
        } else {

        }

        if (couponId) {
            this.getConfirmInfo(couponId, this.data.switchChecked ? 1 : 0)
        } else {
            this.getConfirmInfo('', this.data.switchChecked ? 1 : 0)
        }
        let _this = this
        //获取备注信息
        wx.getStorage({
            key: 'remark',
            success: function (res) {
                console.log('hg', res.data)
                if (res.data) {
                    _this.setData({
                        remarks: res.data,
                        remarkFlag: true
                    })
                } else {
                    _this.setData({
                        remarks: '口味、偏好等要求',
                        remarkFlag: false
                    })
                }

            },
            fail: function (res) {
                _this.setData({
                    remarks: '口味、偏好等要求',
                    remarkFlag: false
                })
            }
        })


    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        console.log('yincang')

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        console.log('xiezai')
        wx.removeStorage({
            key: 'remark',
            success: function (res) {
                console.log(res.data)
            }
        })
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
    // 获取收货地址
    getAddressList: function () {
        let params = {
            'store_id': wx.getStorageSync('store_id')
        }
        app.globalData.wtApi.apiStore_selectAddress(params).then((data) => {
            if (!data.data) {
                wx.showToast({
                    title: '请选地址',
                    image: '/images/icon_warning.png',
                    mask: true, duration: 1500
                })
            } else {
                let addressList = []
                for (let i = 0; i < data.data.length; i++) {
                    if (data.data[i].in_distance) {
                        addressList.push(data.data[i])
                    }
                }
                data.data = addressList
                if (data.data.length == 0) {
                    wx.showToast({
                        title: '请选地址',
                        image: '/images/icon_warning.png',
                        mask: true, duration: 1500
                    })
                    this.setStorage('address_id', '')
                    this.setData({
                        address_id: '',
                        addressList: []
                    })
                    return
                }
                let addressId = this.data.address_id
                if (addressId) {
                    let isHave = false
                    for (let i = 0; i < data.data.length; i++) {
                        if (addressId == data.data[i].id) {
                            isHave = true
                            this.setData({
                                address_id: addressId,
                                addressIndex: i
                            })
                            break
                        }
                    }
                    if (!isHave) {
                        wx.setStorageSync('address_id', data.data[0].id)
                        this.setData({
                            address_id: data.data[0].id,
                            addressIndex: 0
                        })
                    }
                } else {
                    wx.setStorageSync('address_id', data.data[0].id)
                    this.setData({
                        address_id: data.data[0].id,
                        addressIndex: 0
                    })
                }
                this.setData({
                    addressList: data.data
                })
            }

        })
    },
    // 获取订单信息
    getConfirmInfo: function (couponId, use_card) {
        let table_id = wx.getStorageSync('table_id')
        if (this.data.mode == 2) {
            table_id = null
        }
        let dining_mode = this.data.mode
        let count = this.data.peopleNum   //  用餐人数
        let address_id = this.data.address_id   // 配送地址
        let params = {
            dining_mode,
            table_id,
            count,
            address_id,
            coupon_record_id: couponId,
            use_card: use_card ? 1 : 0
        }
        app.globalData.wtApi.apiStore_getConfirmInfo({}, params).then((data) => {
            if (data.type == 'success') {

                for (let i = 0; i < data.data.list.length; i++) {
                    data.data.list[i].sumPrice = Math.round(((data.data.list[i].is_sale == 1) ? data.data.list[i].sale_price : data.data.list[i].marketprice) * data.data.list[i].total * 100) / 100
                }

                this.setData({
                    orderInfo: data.data
                })
            } else {
                if (/用餐人数已超出限额/.test(data.message)) {
                    setTimeout(() => {
                        wx.navigateBack()
                    }, 600)
                }
                if (/收货地址不存在/.test(data.message)) {
                    wx.setStorageSync('address_id', '')
                    wx.showToast({
                        title: '请选择收货地址',
                        image: '/images/icon_warning.png',
                        mask: true, duration: 1500
                    })
                    this.setData({
                        address_id: ''
                    })
                }
            }
        })
    },
    // 根据获取的时间段确定时间选择器内数据
    getDeliveryTimeList: function () {
        // 获取配送时间列表
        app.globalData.wtApi.apiStore_getDeliveryTimeList({}).then((data) => {
            // 根据获取的时间段确定时间选择器内数据
            let days = data.data.delivery_within_days
            let date = new Date()
            let nowDay = date.getDay()
            this.data.timer.days = []
            for (let i = 0; i < days + 1; i++) {
                let result = ''
                let tDate = new Date()
                result = (nowDay + i > 7) ? nowDay + i - 7 : nowDay + i
                result = this._switchDate(result)
                if (i == 0) {
                    result = `今天`
                }
                if (i == 1) {
                    result = `明天`
                }
                tDate.setDate(tDate.getDate() + i)
                result = `${result}${(tDate.getMonth() + 1) > 10 ? (tDate.getMonth() + 1) : '0' + (tDate.getMonth() + 1)}月${tDate.getDate() > 10 ? tDate.getDate() : '0' + tDate.getDate()}日`
                this.data.timer.days[i] = result
            }
            // this.data.timer.hours = data.data.meal_times
            this.data.timer.hours = []
            for (let i = 0; i < days + 1; i++) {
                this.data.timer.hours[i] = []
                for (let j = 0; j < data.data.meal_times.length; j++) {
                    if (i == 0) {
                        if (j == 0) {
                            this.data.timer.hours[i][j] = '立即送出'
                        }
                        if (date.getHours() - data.data.meal_times[j].end_time.split(':')[0] < 0) {
                            this.data.timer.hours[i].push(data.data.meal_times[j].begin_time + ' － ' + data.data.meal_times[j].end_time)
                        }
                    } else {
                        this.data.timer.hours[i].push(data.data.meal_times[j].begin_time + ' － ' + data.data.meal_times[j].end_time)
                    }
                }
            }
            this.setData({
                timer: this.data.timer
            })
        })
    },
    // 转换日期
    _switchDate: function (num) {
        switch (num) {
            case 1: {
                return '周一'
            }
            case 2: {
                return '周二'
            }
            case 3: {
                return '周三'
            }
            case 4: {
                return '周四'
            }
            case 5: {
                return '周五'
            }
            case 6: {
                return '周六'
            }
            case 7: {
                return '周日'
            }
            default: {
                return num
            }
        }
    },
    // 时间选择器选择日期函数
    selectDay: function (e) {
        this.data.selectedIndex.x = e.currentTarget.dataset.index
        let x = this.data.selectedIndex.x      // 日期
        let y = this.data.selectedIndex.y      // 时间区间
        console.log('x', x, ',y', y)
        if (x == 0) {
            this.data.sendTime = this.data.timer.hours[x][y]
        } else {
            this.data.sendTime = this.data.timer.days[x] + ' ' + this.data.timer.hours[x][y]
        }
        this.setData({
            selectedIndex: this.data.selectedIndex,
            sendTime: this.data.sendTime
        })
    },
    // 时间选择器选择小时函数
    selectHour: function (e) {
        this.data.selectedIndex.y = e.currentTarget.dataset.index
        let x = this.data.selectedIndex.x
        let y = this.data.selectedIndex.y
        if (x == 0) {
            this.data.sendTime = this.data.timer.hours[x][y]
        } else {
            this.data.sendTime = this.data.timer.days[x] + ' ' + this.data.timer.hours[x][y]
        }
        this.setData({
            selectedIndex: this.data.selectedIndex,
            sendTime: this.data.sendTime
        })
    },
    // 显示与隐藏时间选择器
    toggleTimeChoose: function () {
        this.setData({
            isShowTimeChoose: !this.data.isShowTimeChoose
        })
    },
    // 选择收货地址
    gotoChooseAddress: function () {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000)

        wx.navigateTo({
            url: '/pages/mine/address/chooseAddress'
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
            url: '/pages/mine/vipCard/getVipCard'
        })
    },
    // 生成订单并付款界面
    gotoPayOrder: function () {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000)

        wx.showLoading({
            title: '加载中',
            mask: true
        })
        let table_id = wx.getStorageSync('table_id')
        if (/偏好等要求/.test(this.data.remarks)) {
            this.data.remarks = ''
        }
        let params = {
            dining_mode: this.data.mode,        // 方式
            coupon_record_id: this.data.couponId,  // 优惠券id
            remark: this.data.remarks,    // 备注
            use_card: this.data.switchChecked ? 1 : 0,  // 是否使用会员卡优惠
            address_id: this.data.address_id,     // 收货地址id
            meal_time: this.data.sendTime,     // 配送时间
            table_id: this.data.mode == 2 ? null : table_id,    //  桌台id
            counts: this.data.peopleNum,       // 用餐人数
            version: this.data.orderInfo.version    // version
        }
        app.globalData.wtApi.apiStore_orderOrder(params, {}).then((data) => {
            if (data.type == 'success') {
                wx.redirectTo({
                    url: `/pages/pay/pay?order_id=${data.data.order_id}&order_sn=${data.data.order_sn}&isNew=true`
                })
            } else {
                if (/库存不足/.test(data.message)) {
                    wx.showModal({
                        title: '提示',
                        content: data.message,
                        showCancel: false,
                        confirmText: '知道了'
                    })
                } else if (data.data && data.data.code == '-5004') {
                    setTimeout(function () {
                        // wx.switchTab({
                        //   url: '/pages/order/index'
                        // })
                        let storeId = wx.getStorageSync('store_id')
                        wx.redirectTo({
                            url: `/pages/order/orderDetail/orderDetail?orderId=${data.data.order_id}&storeId=${storeId}&orderSn=${data.data.order_sn}`
                        })
                    }, 1000)
                } else if (data.data && data.data.code == '-5005') {
                    // 订单已支付
                    wx.showToast({
                        title: '订单已支付',
                        image: '/images/icon_warning.png',
                        mask: true, duration: 1500
                    })
                    setTimeout(function () {
                        wx.navigateBack({
                            delta: 6
                        })
                    }, 1000)
                }
                else {
                    wx.showToast({
                        title: data.message,
                        image: '/images/icon_warning.png',
                        mask: true, duration: 1500
                    })
                }
            }
            wx.hideLoading()
        })
        // wx.navigateTo({
        //   url: '/pages/pay/pay'
        // })
    },
    // 选择优惠券界面
    gotoChooseCoupons: function () {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000)

        if (this.data.switchChecked) {
            // 如果已经选择会员卡
            wx.showToast({
                title: '已用会员卡',
                image: '/images/icon_warning.png',
                mask: true, duration: 1500
            })
        } else {
            // 如果没有选择会员卡
            wx.navigateTo({
                url: `/pages/mine/coupon/couponChoose?use_discount_fee=${this.data.orderInfo.use_discount_fee}&exist_order_id=${this.data.orderInfo.exist_order_id}`
            })
        }
    },
    // 获取优惠券界面
    gotoGetCoupons: function () {
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
    // 是否使用会员卡优惠
    isUseVipCard: function (e) {
        if (this.data.couponId != '') {
            // 如果已经选择优惠券
            wx.showToast({
                title: '已用优惠券',
                image: '/images/icon_warning.png',
                mask: true, duration: 1500
            })
        } else if (!(parseFloat(this.data.orderInfo.use_discount_fee) >= parseFloat(this.data.orderInfo.card_discount.condition))) {
            wx.showToast({
                title: '消费金额不足',
                image: '/images/icon_warning.png',
                duration: 1500
            })
        } else {
            // 如果没有选择优惠券
            wx.setStorageSync('isUseVipCard', !this.data.switchChecked)
            this.setData({
                switchChecked: !this.data.switchChecked
            })
            this.getConfirmInfo('', this.data.switchChecked ? 1 : 0)
        }
    },
    /**
     * 跳转至备注页面
     */
    goRemarks: function () {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000)
        wx.navigateTo({
            url: '/pages/order/remarks/remark'
        })
    }

})