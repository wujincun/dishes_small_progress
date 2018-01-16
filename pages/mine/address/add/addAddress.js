let Util = require('../../../../utils/util')
let Pormise = require('../../../../api/es6-promise.min.js')
// pages/index/address/add/addAddress.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: '',   // 用户名
    telephone: '',   // 手机号
    addressDetails: '',  // 详细地址
    sex: 0,   // 性别
    address: '',  // 地址
    city: '', // 城市
    latitude: '',   // 经度
    longitude: '',  // 纬度
    id: '',   // 收货地址id
    hiddenModal: true,   // 是否显示对话框
    isCanChooseLocation: true   //  是否可以选择地址（锁）
  },

  /**
   * 生命周期函数--监听页面加载
   * @param options
   */
  onLoad: function (options) {
    if (options.id) {
      this.setData({
        id: options.id
      })
      this.checkAddOrChangeAddress(this.data.id)
    }
  },
  onShow: function () {
    if (this.data.id) {
      wx.setNavigationBarTitle({
        title: '修改地址'
      })
    } else {
      wx.setNavigationBarTitle({
        title: '新增地址'
      })
    }
  },
  /**
   * 选择收货地址
   */
  chooseAddress: function () {
    if (app.globalData.isClickBtn) {
      return
    }
    app.globalData.isClickBtn = true
    setTimeout(function () {
      app.globalData.isClickBtn = false
    }, 1000)

    console.log('chooseLocation')
    let _this = this
    this.setData({
      isCanChooseLocation: false
    })

    wx.chooseLocation({
      success: function (res) {
        _this.setData({
          address: res.address,
          city: res.name + ' ',
          latitude: parseFloat(res.latitude),
          longitude: parseFloat(res.longitude)
        })
      },
      fail() {
        wx.getSetting({
          success: (res1) => {
            console.log(res1)
            if (!res1.authSetting['scope.userLocation']) {
              wx.openSetting({
                success: (res2) => {
                  wx.chooseLocation({
                    success: function (res3) {
                      _this.setData({
                        address: res3.address,
                        city: res3.name + ' ',
                        latitude: parseFloat(res3.latitude),
                        longitude: parseFloat(res3.longitude)
                      })
                    }
                  })
                }
              })
            }
          }
        })
      },
      complete() {
        _this.setData({
          isCanChooseLocation: true
        })
      }
    })
    console.log('chooseLocationEnd')
  },
  /**
   * 监听姓名输入
   */
  listenedUserName: function (e) {
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
        mask: true, duration: 1500
      })
    }
  },
  /**
   * 监听电话输入
   */
  listenedUserPhone: function (e) {
    this.setData({
      telephone: e.detail.value
    })
  },
  /**
   * 监听详细地址输入
   */
  listenedAdressDetail: function (e) {
    this.setData({
      addressDetails: e.detail.value
    })
  },
  /**
   * 监听性别选择
   */
  listenedSex: function (e) {
    this.setData({
      sex: e.currentTarget.dataset.sex
    })
  },
  /**
   * 新增/修改地址
   */
  newDeliveryAddress: function () {
    if (app.globalData.isClickBtn) {
      return
    }
    app.globalData.isClickBtn = true
    setTimeout(function () {
      app.globalData.isClickBtn = false
    }, 1000)

    let id = this.data.id || ''
    let params = {
      'id': id,
      'realname': this.data.username,
      'gender': this.data.sex,
      'mobile': this.data.telephone,
      'name': this.data.city,
      'address': this.data.address,
      'detail': this.data.addressDetails,
      'latitude': this.data.latitude,
      'longitude': this.data.longitude
    }
    if (this.data.username == '') {
      wx.showToast({
        title: '请填写联系人',
        image: '/images/icon_warning.png',
        mask: true, duration: 1500
      })
    } else if (this.data.telephone == '') {
      wx.showToast({
        title: '请填写联系电话',
        image: '/images/icon_warning.png',
        mask: true, duration: 1500
      })
    } else if (this.data.address == '') {
      wx.showToast({
        title: '请填写地址',
        image: '/images/icon_warning.png',
        mask: true, duration: 1500
      })
    } else if (!(/^1(3|4|5|7|8)\d{9}$/.test(this.data.telephone))) {
      console.log('this.data.mobile', this.data.telephone)
      wx.showToast({
        title: '手机号错误',
        image: '/images/icon_warning.png',
        mask: true, duration: 1500
      })
    } else {
      if (!id) {
        app.globalData.wtApi.apiStore_adressAdd(params).then((response) => {
          if (response.type == 'success') {
            this.goPage()
          }
        })
      } else {
        app.globalData.wtApi.apiStore_changeAddress(params).then((response) => {
          if (response.type == 'success') {
            this.goPage()
          }
        })
      }
    }
  },
  /**
   * 检测收货地址入口
   * @param id    地址id
   */
  checkAddOrChangeAddress: function (id) {
    if (id) {
      let params = {
        'id': id || ''
      }
      app.globalData.wtApi.apiStore_queryAddress(params).then((response) => {
        if (response.type == 'success') {
          this.setData({
            username: response.data.realname,
            telephone: response.data.mobile,
            addressDetails: response.data.detail,
            sex: response.data.gender,
            address: response.data.address,
            city: response.data.name,
            latitude: response.data.latitude,
            longitude: response.data.longitude,
            id: response.data.id
          })
        }
      })
    }
  },
  /**
   * 删除收货地址
   */
  deleteAddress: function () {
    // this.setData({
    //     hiddenModal: !this.data.hiddenModal
    // })
    let that = this
    wx.showModal({
      title: '提示',
      content: '确定要删除收货地址么',
      success: function (res) {
        if (res.confirm) {
          that.listenerConfirm()
        } else {
          // that.listenerCancel()
        }
      }
    })
  },
  listenerConfirm: function () {
    let params = {
      'id': this.data.id
    }
    app.globalData.wtApi.apiStore_removeAddress(params).then((response) => {
      this.setData({
        hiddenModal: !this.data.hiddenModal
      })
      if (response.type == 'success') {
        wx.showToast({
          title: '删除成功', duration: 1500
        })
        setTimeout(() => {
          this.goPage()
        }, 1000)
      }
    })
  },
  listenerCancel: function () {
    this.setData({
      hiddenModal: !this.data.hiddenModal
    })
  },
  /**
   * 页面跳转
   */
  goPage: function () {
    wx.navigateBack()
  }
})