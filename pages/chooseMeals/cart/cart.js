// pages/cart/cart.js
let Pormise = require('../../../api/es6-promise.min.js')
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cartGoodsList: [],  // 购物车列表
    tableInfo: {},    // 桌台信息
    totalPrice: 0,   // 总价
    isShowConfirmDialog: false,  // 是否显示对话框
    peopleNum: '', // 人数
    dValue: 0,  // 差价 额度-桌台费
    version: '',  // version
    table_id: '',  // 桌台id
    table_fee: 0, // 桌台费
    isReturn: true, // 是否返回到首页
    ddValue: 0,   // 差价（额度-dValue）
    allPrice: 0 //总价
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
    // this.setData({
    //   peopleNum: ''
    // })
    let table_id = wx.getStorageSync('table_id')
    app.globalData.wtApi.apiGetTableName({}, {table_id: table_id}).then((data) => {
      this.setData({
        tableInfo: data.data,
        table_id: table_id
      })
      this.getCartGoodsList()
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
   * 页面下拉刷新处理函数
   */
  onPullDownRefresh: function () {
    this.getCartGoodsList()
    setTimeout(function () {
      wx.stopPullDownRefresh()
    }, 1500)
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 获取用餐人数
  getPeopleNum: function (e) {
    if (!e.detail.value) {
      this.setData({
        table_fee: 0
      })
      this.setData({
        ddValue: +(this.data.dValue - this.data.table_fee).toFixed(2),
        allPrice : (this.data.table_fee + this.data.totalPrice).toFixed(2),
      })
      return
    }
    if (/\d+/.test(e.detail.value)) {
      let table_fee = this.data.tableInfo.table_fee_type == 2 ? parseFloat(this.data.tableInfo.table_fee) * parseInt(e.detail.value, 10) : parseFloat(this.data.tableInfo.table_fee)

      console.log(table_fee)
      this.setData({
        peopleNum: e.detail.value,
        table_fee,
      })
      this.setData({
        ddValue: +(this.data.dValue - this.data.table_fee).toFixed(2),
        allPrice : (this.data.table_fee + this.data.totalPrice).toFixed(2),
      })

    } else {
      wx.showToast({
        mask: true,
        title: '请输入正整数',
        image: '/images/icon_warning.png', duration: 1500,
      })
      this.setData({
        peopleNum: '',
        table_fee: 0
      })
      this.setData({
        ddValue: +(this.data.dValue - this.data.table_fee).toFixed(2),
        allPrice : (this.data.table_fee + this.data.totalPrice).toFixed(2),
      })
    }
  },
  // 前往确认订单页面
  gotoConfirmOrder: function () {
    if (app.globalData.isClickBtn) {
      return
    }
    app.globalData.isClickBtn = true
    setTimeout(function () {
      app.globalData.isClickBtn = false
    }, 1000)

    let num = parseInt(this.data.peopleNum, 10)
    if (this.data.peopleNum == 0) {
      wx.showToast({
        title: '请输入人数',
        image: '/images/icon_warning.png',
        mask: true, duration: 1500,
      })
      return
    }
    if (!/^[0-9]\d*$/.test(this.data.peopleNum)) {
      wx.showToast({
        title: '请输入人数',
        image: '/images/icon_warning.png',
        mask: true, duration: 1500,
      })
      this.setData({
        peopleNum: ''
      })
    } else if (num == 0) {
      wx.showToast({
        title: '请输入人数',
        image: '/images/icon_warning.png',
        mask: true, duration: 1500,
      })
    } else {
      wx.navigateTo({
        url: `/pages/order/confirmOrder/confirmOrder?peopleNum=${num}&mode=1&pageFlag=cart`
      })
    }
  },
  // 前往点餐页面
  gotoChurch: function () {
    if (app.globalData.isClickBtn) {
      return
    }
    app.globalData.isClickBtn = true
    setTimeout(function () {
      app.globalData.isClickBtn = false
    }, 1000)

    wx.navigateBack()
  },
  // 显示清空购物车弹窗
  toggleDialog: function () {
    let that = this
    wx.showModal({
      title: '提示',
      content: '确认要清空吗',
      success: function (res) {
        if (res.confirm) {
          that.dialogConfirm()
        }
      }
    })
    // this.setData({
    //   isShowConfirmDialog: !this.data.isShowConfirmDialog
    // })
  },
  // 获取购物车商品列表
  getCartGoodsList: function () {
    let table_id = this.data.table_id
    // console.log(table_id)
    app.globalData.wtApi.apigetShopCartList({}, {dining_mode: 1, table_id}).then((data) => {
      if (data.type == 'success') {
        if (data.data.list.length == 0 && this.data.isReturn) {
          wx.showToast({
            title: '购物车为空',
            image: '/images/icon_warning.png',
            mask: false,
            duration: 1500
          })
          setTimeout(() => {
            wx.navigateBack({
              delta: 5
            })
          }, 1500)
          return
        }
        this.data.cartGoodsList = data.data.list
        // let count = wx.getStorageSync()
        this.setData({
          cartGoodsList: this.data.cartGoodsList,
          totalPrice: data.data.price,
          dValue: Math.round((this.data.tableInfo.limit_price - data.data.price) * 100) / 100,
          pad: data.data.pad,
          version: data.data.version,
          peopleNum: data.data.pad ? data.data.pad.counts : this.data.peopleNum,
          table_fee: data.data.pad ? parseFloat(data.data.pad.table_fee) : parseFloat(this.data.table_fee)
        })
        this.setData({
          ddValue: +(this.data.dValue - this.data.table_fee).toFixed(2),
          allPrice : (this.data.table_fee + this.data.totalPrice).toFixed(2),
        })
      }
    })
  },
  // 对话框确认事件
  dialogConfirm: function () {
    let table_id = this.data.table_id
    app.globalData.wtApi.apiRemoveAllGoods({}, {dining_mode: 1, table_id}).then((data) => {
      wx.showToast({
        title: '已清空购物车',
        image: '/images/icon_warning.png',
        mask: true, duration: 1500,
      })
      setTimeout(function () {
        wx.navigateBack()
      }, 300)
      // 清理一些变量
      this.setData({
        cartGoodsList: [],
        totalPrice: 0,
        isShowConfirmDialog: false,
        dValue: Math.round(this.data.tableInfo.limit_price),
        version: ''
      })
    })
  },
  // 删除商品从购物车
  removeGoodsToShopcart: function (e) {
    this.setData({
      isReturn: false
    })
    let index = e.currentTarget.dataset.index
    let total = parseInt(this.data.cartGoodsList[index].total, 10) - 1
    let params = {
      cart_id: this.data.cartGoodsList[index].cart_id,
      goods_id: this.data.cartGoodsList[index].goods_id,
      option_id: this.data.cartGoodsList[index].option_id,
      version: this.data.version,
      total: total,
      table_id: 24,
      dining_mode: 1
    }
    app.globalData.wtApi.apiUpdateShopCart(params, {}, true).then((data) => {
      this.getCartGoodsList()
    })
  },
  // 增加商品从购物车
  addGoodsToShopcart: function (e) {
    this.setData({
      isReturn: false
    })
    let index = e.currentTarget.dataset.index
    let total = parseInt(this.data.cartGoodsList[index].total, 10) + 1
    let params = {
      cart_id: this.data.cartGoodsList[index].cart_id,
      goods_id: this.data.cartGoodsList[index].goods_id,
      option_id: this.data.cartGoodsList[index].option_id,
      version: this.data.version,
      total: total,
      table_id: 24,
      dining_mode: 1
    }
    app.globalData.wtApi.apiUpdateShopCart(params, {}, true).then((data) => {
      this.getCartGoodsList()
    })
  }
})