let Pormise = require('../../../api/es6-promise.min.js')
// pages/mine/record/business-record.js
let app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        info: {},   // 积分信息
        isShowPoor: false  // 是否显示缺省页
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
        app.globalData.wtApi.apiStore_getUserRecord({}, {type: 'credit2'}).then((data) => {
            if (data.data.data && data.data.data.length > 0) {
                for (let i = 0; i < data.data.data.length; i++) {
                    // console.log(typeof data.data.data[i].createtime, ' -- ', data.data.data[i].createtime, '->', typeof parseInt(data.data.data[i].createtime, 10), ' -- ', parseInt(data.data.data[i].createtime, 10))
                    let timeS = data.data.data[i].createtime + '000'
                    // console.log(timeS)
                    let date = new Date(parseInt(timeS, 10))
                    // console.log(new Date(timeS))
                    // console.log(date.getFullYear(), date.getMonth(), date.getDate())
                    data.data.data[i].timeStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
                }
            } else {
                this.setData({
                    isShowPoor: true
                })
            }
            data.data.income = this.toDecimal2(data.data.income)
            data.data.expend = this.toDecimal2(data.data.expend)
            this.setData({
                info: data.data
            })
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
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    toDecimal2: function (x) {
        var f = parseFloat(x);
        if (isNaN(f)) {
            return false;
        }
        var f = Math.round(x * 100) / 100;
        var s = f.toString();
        var rs = s.indexOf('.');
        if (rs < 0) {
            rs = s.length;
            s += '.';
        }
        while (s.length <= rs + 2) {
            s += '0';
        }
        return s;
    }
})