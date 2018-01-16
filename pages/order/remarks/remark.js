// pages/order/remarks/remark.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        fontSize: 0,
        remarkContent:'',
        isDisable: true
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
        let _this = this
        //获取备注信息
        wx.getStorage({
            key: 'remark',
            success: function (res) {
                console.log('hg',res.data)
                if (res.data) {
                    _this.setData({
                        remarkContent: res.data,
                        isDisable:false
                    })
                    // 初始化字数
                    _this.setData({
                        fontSize: res.data.length
                    })
                }

            },
            fail: function (res) {
                _this.setData({
                    remarkContent: ''
                })
            }
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
    // 获取备注信息
    getRemarks: function (e) {
        let fontSize = e.detail.value.length
        this.setData({
            isDisable: false
        })
        if (fontSize <= 45) {
            this.setData({
                fontSize: fontSize,
                remarkContent:e.detail.value
            })
        } else {
            this.setData({
                remarkContent:e.detail.value.substr(0, 45)
            })
        }
    },
    backOrder:function () {
        let _this = this;
        wx.setStorage({
            key:"remark",
            data: _this.data.remarkContent
        })
        wx.navigateBack({
            delta: 1
        })
    }
})