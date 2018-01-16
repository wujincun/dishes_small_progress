let Pormise = require('../../../api/es6-promise.min.js')
// pages/index/chooseShop/chooseShop.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        shopList: [],// 门店列表
        selectIndex: 0  // 选择门店的下标
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.globalData.wtApi.apiStore_storeList({}).then((data) => {
            if (data.type == 'success') {
                let store_id = wx.getStorageSync('store_id')
                for (let i = 0; i < data.data.length; i++) {
                    if (store_id == data.data[i].id) {
                        this.setData({
                            selectIndex: i
                        })
                        break
                    }
                }
                this.setData({
                    shopList: data.data
                })
            }
        })
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
    // 选择店铺事件
    taped: function (e) {
        console.log(e)
        let index = e.target.dataset.index
        console.log(index)
        if (!(this.data.selectIndex === index)) {
            wx.setStorageSync('store_id', this.data.shopList[index].id)
            this.setData({
                selectIndex: index
            })
            wx.navigateBack()
        }
    }
})