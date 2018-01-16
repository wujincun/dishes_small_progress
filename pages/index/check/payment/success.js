// pages/index/check/payment/success.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        shop: '',  // store_title
        pay: '',   // 支付金额
        realPay: '',  // 实际支付金额
        integral: '',  // 折扣
        orderSn: '', // sn
        id: ''    // 订单id
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            shop: options.shop,
            pay: options.goodsprice,
            realPay: options.real_fee,
            integral: options.integral,
            orderSn: options.ordersn
        })
        this.data.id = setTimeout(() => {
            wx.navigateBack()
        }, 3500)
    },
    onHide() {
        clearTimeout(this.data.id)
    },
    onUnload() {
        clearTimeout(this.data.id)
    }

})