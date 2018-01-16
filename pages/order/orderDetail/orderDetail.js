let Pormise = require('../../../api/es6-promise.min.js')
// pages/order/order-detail/order-detail.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: '', // 订单id
    storeId: '',// 店铺id
    ordersn: '',// ordersn
    orderDetail: {},// 订单信息对象
    hiddenModal: true,// 显示与隐藏对话框
    hiddenDeleteModal: true,// 显示与隐藏删除对话框
    minutes: '',// 分钟
    seconds: '',// 秒
    orderMessage: '',//订单信息
    timerFlag: false,//  是否显示倒计
    status: '',//  订单状态
    payTime: '',// 支付时间
    discount: [],//  是否校验订单状态
    pay: '',// 订单状态
    timer: '',// 倒计时句柄
    cancelFlag: true     // 是否显示取消按钮
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderId: options.orderId,
      storeId: options.storeId,
      ordersn: options.orderSn
    })
  },
  onUnload: function () {
    let _this = this
    clearInterval(_this.data.timer)
  },
  onShow: function () {
    this.setData({
      cancelFlag: true
    })
    this.loadMessage()
    this.data.timer = setInterval(() => {
      this.countDown()
    }, 1000)
  },
  onHide: function () {
    let _this = this
    clearInterval(_this.data.timer)
    this.setData({
      cancelFlag: false
    })
  },
  loadMessage: function () {
    let parmas = {
      'order_id': this.data.orderId,
      'store_id': this.data.storeId
    }
    let queryObject = {
      'order_id': this.data.orderId,
      'store_id': this.data.storeId
    }
    app.globalData.wtApi.apiStore_orderDetail(parmas, queryObject).then((response) => {
      if (response.type == 'success') {
        let orderDetail = response.data
        for (let item in orderDetail.goods) {
          orderDetail.goods[item].price = (Math.round(orderDetail.goods[item].goods_price * orderDetail.goods[item].goods_total * 100) / 100)
        }
        this.setData({
          orderDetail: orderDetail
        })
        let iosFormatDate = this.data.orderDetail.dateline.split(/[- : \/]/)
        let payTime = new Date(iosFormatDate[0], iosFormatDate[1] - 1, iosFormatDate[2], iosFormatDate[3], iosFormatDate[4], iosFormatDate[5]).getTime()
        this.setData({
          payTime: payTime
        })
        this.orderStauts()
        this.countDown()
      }
    })
  },
  /**
   * 未支付/已支付客户手动取消订单
   */
  cancellationOrder: function () {
    // this.setData({
    //     hiddenModal: !this.data.hiddenModal
    // })
    let that = this
    wx.showModal({
      title: '是否取消该订单',
      success(res) {
        if (res.confirm) {
          that.listenerConfirm()
        } else {
        }
      }
    })
  },
  listenerConfirm: function () {
    let id = this.data.orderId
    let params = {
      'order_id': id
    }
    let queryObject = {
      'order_id': id
    }
    if (this.data.orderDetail.is_pay == 0) {
      app.globalData.wtApi.apiStore_orderCancel(params, queryObject).then((response) => {
        if (response.type == 'success') {
          wx.showToast({
            title: '订单取消成功', duration: 1500
          })
          this.loadMessage()
        }
      })
    } else if (this.data.orderDetail.is_pay == 1) {
      app.globalData.wtApi.apiStore_orderCancelPay(params, queryObject).then((response) => {
        if (response.type == 'success') {
          wx.showToast({
            title: '订单取消成功', duration: 1500
          })
          this.loadMessage()
        }
      })
    }

  },
  listenerCancel: function () {
    this.setData({
      hiddenModal: !this.data.hiddenModal
    })
  },
  /**
   * 删除订单
   */
  deleteOrder: function () {
    // this.setData({
    //     hiddenDeleteModal: !this.data.hiddenDeleteModal
    // })
    let that = this
    wx.showModal({
      title: '是否删除该订单',
      success(res) {
        if (res.confirm) {
          that.listenerConfirmDeleteOrder()
        }
      }
    })
  },
  listenerConfirmDeleteOrder: function () {
    let id = this.data.orderId
    let params = {
      'order_id': id
    }
    let queryObject = {
      'order_id': id
    }
    app.globalData.wtApi.apiStore_deleteOrder(params, queryObject).then((response) => {
      if (response.type == 'success') {
        this.setData({
          hiddenDeleteModal: !this.data.hiddenDeleteModal
        })
        wx.showToast({
          title: '订单删除成功', duration: 1500
        })
        setTimeout(() => {
          this.goPage()
        }, 1000)
      }
    })
  },
  listenerCancelDeleteOrder: function () {
    this.setData({
      hiddenDeleteModal: !this.data.hiddenDeleteModal
    })
  },
  /**
   * 订单自动取消
   */
  orderAutoCancel: function () {
    this.setData({
      timerFlag: false
    })
    let params = {
      'order_id': this.data.orderId
    }
    let queryObject = {
      'order_id': this.data.orderId
    }
    app.globalData.wtApi.apiStore_orderAutoCancel(params, queryObject).then((response) => {
      if (response.type == 'success') {
        this.loadMessage()
      }
    })
  },
  /**
   * 页面跳转
   */
  goPage: function () {
    wx.navigateBack()
  },
  /**
   * 校验订单状态
   */
  orderStauts: function () {
    let order = this.data.orderDetail
    let message = ''
    switch (order.pay_type) {
      case '0':
        switch (order.status) {
          case '0':
            message = '超出支付时间 订单将自动取消'
            break
          case '-2':
            message = '超出支付时间 订单已自动取消'
            break
          case '-1':
            message = '订单已取消'
            switch (order.cancel_resource) {
              case '-1':
                message = '商家取消订单'
                break
              case '0':
                message = '订单已取消'
                break
            }
            break
        }
        break
      default:
        switch (order.status) {
          case '0':
            message = '等待商家接单'
            break
          case '1':
            message = '商家已接单'
            break
          case '-2':
            message = '超出支付时间 订单已自动取消'
            break
          case '-1':
            message = '订单已取消'
            switch (order.cancel_resource) {
              case '-1':
                message = '商家取消订单 退款已原路返回'
                break
              case '0':
                message = '订单已取消 退款已原路返回'
                break
            }
            break
          case '3':
            message = '订单已完成'
            break
        }
    }
    this.setData({
      orderMessage: message
    })
  },
  /**
   * 倒计时
   */
  countDown: function () {
    let iosFormatDate = this.data.orderDetail.dateline.split(/[- : \/]/)
    let payTime = new Date(iosFormatDate[0], iosFormatDate[1] - 1, iosFormatDate[2], iosFormatDate[3], iosFormatDate[4], iosFormatDate[5]).getTime()
    let newTime = new Date().getTime()
    let timer = 15 * 60 * 1000
    let resultTime = timer - (newTime - payTime)
    let timerHour, timerMinutes, timerSeconds, minutes, seconds
    if ((newTime - payTime > timer && this.data.orderDetail.pay_type == 0) && (this.data.orderDetail.status != -1 && this.data.orderDetail.status != -2 && this.data.orderDetail.is_pay != 1)) {
      this.setData({
        timerFlag: false
      })
      // wx.showToast({
      //     title: '因15分钟内未支付, 您的订单已经自动取消'
      // })
      if (this.data.cancelFlag == true) {
        this.orderAutoCancel()
      }
    } else {
      // setInterval(() => {
      if (!(newTime - payTime < timer - 1000)) {
        this.setData({
          timerFlag: false
        })
      } else {
        resultTime = resultTime - 1000
        timerHour = resultTime % (24 * 3600 * 1000)
        timerMinutes = timerHour % (3600 * 1000)
        minutes = Math.floor(timerMinutes / (60 * 1000))
        minutes >= 10 ? minutes = minutes : minutes = '0' + minutes
        timerSeconds = timerMinutes % ((60 * 1000))
        seconds = Math.round(timerSeconds / 1000)
        seconds >= 10 ? seconds = seconds : seconds = '0' + seconds
        this.setData({
          minutes: minutes,
          seconds: seconds,
          timerFlag: true
        })
      }
      // }, 1000)
    }
  },
  /**
   * 立即支付
   */
  immediatePayment: function () {
    console.log('this.data.payTime', this.data.payTime)
    wx.navigateTo({
      url: '/pages/pay/pay?order_id=' + this.data.orderId + '&order_sn=' + this.data.ordersn + '&time=' + this.data.payTime
    })
  }
})