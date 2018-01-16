let Pormise = require('../../../api/es6-promise.min.js')
// pages/mine/vipCard/getVipCard.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    number: '',
    isAble: true    // btn是否可以按
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
  getName: function (e) {
    let v = e.detail.value
    this.setData({
      name: v
    })
    if (!this.data.name || !this.data.number) {
      this.setData({
        isAble: true
      })
    } else {
      this.setData({
        isAble: false
      })
    }
  },
  getNumber: function (e) {
    let v = e.detail.value
    this.setData({
      number: v
    })
    if (!this.data.name || !this.data.number) {
      this.setData({
        isAble: true
      })
    } else {
      this.setData({
        isAble: false
      })
    }
  },
  getVipCard: function () {
    if (!this.data.name || !this.data.number) {
      wx.showToast({
        title: '请输入您的信息',
          duration: 1500
      })
      return
    }
    if (!/^1[3|4|5|7|8][0-9]\d{4,8}$/.test(this.data.number) || !(this.data.number.length == 11)) {
      wx.showToast({
        title: '手机号错误',
        image: '/images/icon_warning.png',
        mask: true
      })
      return
    }
    app.globalData.wtApi.apiStore_receiveVipCard({}, { real_name: this.data.name, mobile: this.data.number }).then((data) => {
      if (data.type == 'success') {
        // wx.showToast({
        //   title: '领取成功'
        // })
        // wx.showModal({
        //   content:'领卡成功',
        //   showCancel:false
        // })
        wx.navigateBack()
        // setTimeout(() => {
        //   wx.showModal({
        //     title: '提示',
        //     content: '领卡成功',
        //     showCancel: false
        //   })
        // }, 200)
        app.globalData.mineHiddenModal = true
      } else {
        wx.showToast({
          title: data.message,
          image: '/images/icon_warning.png',
          mask: true,duration: 1500
        })
        setTimeout(function () {
          console.log('back')
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
      }
    })
  }
})