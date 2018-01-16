let Pormise = require('../../../api/es6-promise.min.js')
var app = getApp()
let Util = require('../../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    couponList: [],
    selectIndex: -1,   // 当前选择的优惠券下标
    page: 1,   // 当前page页
    isLoading: false,  // 是否在请求接口
    isCanLoad: true,   // 是否可以读取下一页
    type: 'select',    //  接口用到的参数
    use_discount_fee: 11,   //  可优惠券金额（确认订单页传过来的）
    exist_order_id: 0 // 接口用到的参数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      use_discount_fee: options.use_discount_fee,
      exist_order_id: options.exist_order_id,
    })
    this.getCouponList()
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
    app.globalData.wtApi.apiStore_getUserCouponsList({}, { page: this.data.page, type: 'select', use_discount_fee: this.data.use_discount_fee, exist_order_id: this.data.exist_order_id }).then((data) => {
      if (data.data) {
        let couponId = wx.getStorageSync('coupon_id')
        if (couponId) {
          for (let i = 0; i < data.data.length; i++) {
            if (couponId == data.data[i].recid) {
              this.setData({
                selectIndex: i
              })
              break
            }
          }
        }

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
          isLoading: false
        })
      } else {
        this.setData({
          isCanLoad: false
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
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  // 选择优惠券逻辑
  chooseCoupon: function (e) {
    let idx = e.currentTarget.dataset.index
    this.setData({
      selectIndex: idx
    })
    if (idx == -1) {
      wx.setStorageSync('coupon_id', '')
      wx.setStorageSync('coupon_name', '')
    } else {
      wx.setStorageSync('coupon_id', e.currentTarget.dataset.id)
      wx.setStorageSync('coupon_name', e.currentTarget.dataset.title)
    }
    setTimeout(() => {
      wx.navigateBack()
    }, 200)
  }
})