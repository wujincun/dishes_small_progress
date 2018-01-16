let Pormise = require('../../../api/es6-promise.min.js')
// pages/index/address/choose-address.js
let app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        addressList: [],  // 收货地址列表
        checkIndex: 0,   // 选择的下标
        from: ''  // 从哪个入口进到的本页面
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            from: options.from
        })
    },
    /**
     * 声明周期函数--监听页面显示
     */
    onShow: function () {
        this.getAddressList()
    },
    getAddressList: function () {
        if (this.data.from == 'mine') {
            app.globalData.wtApi.apiStore_addressListAll({}).then((res) => {
                if (!res.data) {
                    wx.showToast({
                        title: '暂无收货地址',
                        image: '/images/icon_warning.png',
                        mask: true, duration: 1500
                    })
                    this.setData({
                        addressList: []
                    })
                } else {
                    let addressID = wx.getStorageSync('address_id')
                    if (addressID) {
                        for (let i = 0; i < res.data.length; i++) {
                            if (res.data[i].id == addressID) {
                                this.setData({
                                    checkIndex: i
                                })
                            }
                        }
                    } else {
                        wx.setStorageSync('address_id', res.data[0].id)
                        this.setData({
                            checkIndex: 0
                        })
                    }
                    this.setData({
                        addressList: res.data
                    })
                }
            })
        } else {
            app.globalData.wtApi.apiStore_addressListAll({}).then((response) => {
                if (!response.data) {
                    wx.showToast({
                        title: '暂无收货地址',
                        image: '/images/icon_warning.png',
                        mask: true, duration: 1500
                    })
                    this.setData({
                        addressList: []
                    })
                } else {
                    let params = {
                        'store_id': wx.getStorageSync('store_id')
                    }
                    app.globalData.wtApi.apiStore_selectAddress(params).then((res) => {
                        this.setData({ addressList: [] })
                        if (res.type == 'success') {
                            let addressID = wx.getStorageSync('address_id')
                            if (addressID) {
                                for (let i = 0; i < res.data.length; i++) {
                                    if (res.data[i].id == addressID) {
                                        this.setData({
                                            checkIndex: i
                                        })
                                    }
                                }
                            } else {
                                wx.setStorageSync('address_id', res.data[0].id)
                                this.setData({
                                    checkIndex: 0
                                })
                            }
                            this.setData({
                                addressList: res.data
                            })
                        }
                    })
                }

            })
        }
    },
    /**
     * 设置默认收货地址、选择收货地址
     */
    setDefaultAddress: function (e) {
        let index = e.currentTarget.dataset.index
        let addressid = e.currentTarget.dataset.addressid
        this.setData({
            checkIndex: index
        })
        wx.setStorageSync('address_id', addressid)
        if (this.data.from != 'mine') {
            wx.navigateBack()
        }
    },
    /**
     * 页面跳转
     */
    gotoEditAddress: function (e) {
        if (app.globalData.isClickBtn) {
            return
        }
        app.globalData.isClickBtn = true
        setTimeout(function () {
            app.globalData.isClickBtn = false
        }, 1000)

        if (e.currentTarget.dataset.flag) {
            let addressId = e.currentTarget.dataset.id
            wx.navigateTo({
                url: '/pages/mine/address/add/addAddress?id=' + addressId,
            })
        } else {
            wx.navigateTo({
                url: '/pages/mine/address/add/addAddress',
            })
        }
    }
})