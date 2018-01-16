let Pormise = require('../../../api/es6-promise.min.js')
// pages/index/reserve/reserve.js
var app = getApp()
let Util = require('../../../utils/util')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        storeReservation: {},     // 桌台信息 接口反的
        zones_id: '',   // 预定桌台的id
        zones_title: '',  //  预定桌台的title
        showViewTable: false, //是否显示桌台选择层
        showViewDate: false, //是否显示时间选择层
        classIndex: -1,    // 选择的下标
        tableItem: '',  //  桌台元素
        checkIndex: -1,   // 时间选择下标
        dateIndex: 0,   // 日期选择下标
        date: '',   //  日期
        time: '',  // 时间
        username: '',  // 预定用户名
        telephone: '',  // 电话
        remarks: '', //备注
        fontSize: 0,  // 字体大小
        order_id: '',  // 订单id
        item: '',  //   时间对象
        isIos: false,  // 是否是ios
        placeholderStyle: false,   // 是否使用placeholderStyle
        reserve_price: ''  // 预定价格
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {
    },

    onShow: function () {
        this.messageOnLoad('', '')
        this.judgeEquipment()
        this.setData({
            classIndex: '-1',
            time: '',
            dateIndex: 0,
            date: '',
            checkIndex: '-1',
            username: '',
            telephone: '',
            zones_id: '',
            remarks: '',
            tableItem: ''
        })
    },
    /**
     * 预订桌台和到店时间信息加载
     * zones_id  桌台id
     * select_date  到店日期
     */
    messageOnLoad: function (zonesid, selectdate) {
        let params = {
            'zones_id': zonesid,
            'select_date': selectdate,
        }

        let queryObject = {
            'zones_id': zonesid,
            'select_date': selectdate
        }
        app.globalData.wtApi.apiStore_storeReservation(params, queryObject).then((response) => {
            if (response.type == 'success') {
                this.setData({
                    storeReservation: response.data
                })
            }
        })
    },

    /**
     * 遮罩层的显示与隐藏
     */
    hideShowModleTable: function () {
        console.log('this.data.storeReservation.tablezones_list', this.data.storeReservation.tablezones_list)
        if (this.data.storeReservation.tablezones_list.length == 0) {
            wx.showToast({
                title: '未创建桌台',
                image: '/images/icon_warning.png',
                mask: false, duration: 1500
            })
        } else {
            this.setData({
                showViewTable: (!this.data.showViewTable),
                placeholderStyle: !this.data.placeholderStyle
            })
        }
    },

    hideShowModleDate: function () {
        if (this.data.classIndex == -1) {
            wx.showToast({
                title: '请先选择桌台',
                image: '/images/icon_warning.png',
                mask: false, duration: 1500
            })
        } else {
            if (this.data.time == '') {
                this.setData({
                    showViewDate: !this.data.showViewDate,
                    placeholderStyle: !this.data.placeholderStyle,
                    date: '',
                    time: ''
                })
            } else {
                this.setData({
                    showViewDate: !this.data.showViewDate,
                    placeholderStyle: !this.data.placeholderStyle

                })
            }
        }
    },

    /**
     * 选择预订桌台
     * index: item下标,用来更改选中状态
     * item: 单个桌台的信息
     */
    chooseTable: function (e) {
        let index = e.currentTarget.dataset.index
        let item = e.currentTarget.dataset.item
        let zonesid = item.id
        if (item.user_limit == '0') {
            wx.showToast({
                title: '没有桌台',
                image: '/images/icon_warning.png',
                mask: false, duration: 1500
            })
        } else {
            this.setData({
                classIndex: index,
                tableItem: item.title + '' + item.user_limit,
                item: item,
                zones_id: item.id,
                time: '',
                dateIndex: 0,
                date: '',
                checkIndex: '-1'
            })
            this.messageOnLoad(zonesid, '')
            setTimeout(() => {
                this.hideShowModleTable()
            }, 200)
        }
    },

    /**
     * 选择时间
     * @param e
     */
    chooseTime: function (e) {
        let index = e.currentTarget.dataset.index
        let item = e.currentTarget.dataset.item
        if (this.data.dateIndex == -1) {
            wx.showToast({
                title: '请先选择日期',
                image: '/images/icon_warning.png',
                mask: false, duration: 1500
            })
        } else {
            if (item.is_enable == 1) {
                this.setData({
                    checkIndex: index,
                    time: item.time
                })
            } else {
                wx.showToast({
                    title: '当前时段不可预订',
                    image: '/images/icon_warning.png',
                    mask: false, duration: 1500
                })
            }
        }
    },
    /**
     * 选择日期
     * @param e
     */
    chooseDate: function (e) {
        let index = e.currentTarget.dataset.index
        let datetime = e.currentTarget.dataset.item
        let zonesid = this.data.item.id
        if (this.data.tableItem == []) {
            wx.showToast({
                title: '请您选择桌台',
                image: '/images/icon_warning.png',
                mask: false, duration: 1500
            })
        } else {
            this.setData({
                dateIndex: index,
                date: datetime,
                checkIndex: '-1',
                time: ''
            })
            this.messageOnLoad(zonesid, datetime)
        }
    },


    /**
     * 监听姓名输入
     * @param e
     */
    listenerUserInput: function (e) {
        if (Util.onInputNameCheck(e.detail.value)) {
            this.setData({
                username: e.detail.value
            })
        } else {
            this.setData({
                username: this.data.username
            })
            wx.showToast({
                title: '格式错误',
                image: '/images/icon_warning.png',
                mask: false, duration: 1500
            })
        }
    },

    /**
     * 监听手机号输入
     * @param e
     */
    listenerPhoneInput: function (e) {
        this.setData({
            telephone: e.detail.value
        })
    },
    /**
     * 监听备注输入
     * @param e
     */
    listenerRemarks: function (e) {
        let fontSize = e.detail.value.length
        if (fontSize <= 48) {
            this.setData({
                remarks: e.detail.value,
                fontSize: fontSize
            })
        } else {
            e.detail.value = e.detail.value.substr(0, 45)
            this.setData({
                remarks: e.detail.value.substr(0, 45)
            })
        }
    },

    /**
     * 提交表单
     */
    submieForm: function () {
        wx.showLoading({
            title: '加载中',
            mask: false
        })
        let params = {
            'zones_id': this.data.zones_id,
            'order_type': 3,
            'meal_time': this.data.date + ' ' + this.data.time,
            'guest_name': this.data.username,
            'mobile': this.data.telephone,
            'remark': this.data.remarks
        }
        if (this.data.zones_id == '') {
            wx.showToast({
                title: '请选择桌台',
                image: '/images/icon_warning.png',
                mask: false, duration: 1500
            })
        } else if (this.data.date == '' || this.data.time == '') {
            wx.showToast({
                title: '请选择时间',
                image: '/images/icon_warning.png',
                mask: false, duration: 1500
            })
        } else if (this.data.username == '') {
            wx.showToast({
                title: '请填写姓名',
                image: '/images/icon_warning.png',
                mask: false, duration: 1500
            })
        } else if (this.data.telephone == '') {
            wx.showToast({
                title: '请填写电话',
                image: '/images/icon_warning.png',
                mask: false, duration: 1500
            })
        } else if (!(/^1(3|4|5|7|8)\d{9}$/.test(this.data.telephone))) {
            wx.showToast({
                title: '手机号错误',
                image: '/images/icon_warning.png',
                mask: false, duration: 1500
            })
        } else {
            app.globalData.wtApi.apiStore_orderReserveOrder(params).then((response) => {
                if (response.type == 'success') {
                    wx.showToast({
                        title: '提交成功',
                        mask: false, duration: 1500
                    })
                    this.setData({
                        order_id: response.data.order_id,
                        reserve_price: response.data.reserve_price
                    })
                    this.gotoAppointment()
                    wx.hideLoading()
                }
            })
        }
    },

    /**
     * 页面跳转
     */
    gotoAppointment: function () {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000)

        let orderId = this.data.order_id
        let reserve_price = this.data.reserve_price
        if (Number(reserve_price) == 0) {
            wx.navigateTo({
                url: '/pages/order/orderAppointment/orderAppointment?orderId=' + orderId
            })
        } else {
            wx.navigateTo({
                url: '/pages/pay/pay?order_id=' + orderId + '&flag=reserve'
            })
        }
    },
    /**
     * 判断设备
     */
    judgeEquipment: function () {
        let _this = this
        wx.getSystemInfo({
            success: function (res) {
                console.log(res.model.indexOf('iPhone'))
                if (res.model.indexOf('iPhone') > -1) {
                    _this.setData({
                        isIos: true
                    })
                }
            }
        })
    },
    /**
     * 确定
     */
    determine: function () {
        if (this.data.date == '' && this.data.time != '') {
            let date = new Date()
            let year = date.getFullYear()
            let month = date.getMonth() + 1
            month > 9 ? month = month : month = '0' + month
            let day = date.getDate()
            day > 9 ? day = day : day = '0' + day
            this.setData({
                date: year + '-' + month + '-' + day,
                showViewDate: !this.data.showViewDate
            })
        } else if (this.data.date != '' && this.data.time != '') {
            this.setData({
                showViewDate: !this.data.showViewDate
            })
        }
    }


})