let Pormise = require('../../../api/es6-promise.min.js')
let Util = require('../../../utils/util')
// pages/maidan/index.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        cardPayData: {},   // 会员卡支付数据
        index: 0,   // 现在的门店下标
        isAble: true, // btn是否可点
        credit: '',  // 积分
        noCouponMoney:'',//不参与优惠金额
        oldIndex: 0  // 原来的下标
    },

    /**
     * 生命周期函数--监听页面加载
     * 1.获取商家店铺列表
     */
    onLoad: function (options) {
        //1.获取商家店铺列表
        app.globalData.wtApi.apiStore_cardPay({}).then((res) => {
            let store_id = wx.getStorageSync('store_id')
            if (store_id) {
                for (let i = 0; i < res.data.store_list.length; i++) {
                    if (store_id == res.data.store_list[i].id) {
                        this.setData({
                            index: i,
                            oldIndex: i
                        })
                        break
                    }
                }
            }
            this.setData({
                cardPayData: res.data
            })
        })
    },

    /**
     * 门店选择事件
     * 选择后picker返回数据[index]角标值
     */
    bindPickerChange: function (e) {
        if (this.data.index != e.detail.value) {
            this.setData({
                index: e.detail.value,
                credit: '',
                isAble: true
            })
        }
    },
    /**
     * 获取输入金额 && 按钮样式
     * 金额输入必须为大于等于0 的正数
     * 未输入金额透明度降低，输入数据后透明度正常
     */
    getCredit: function (e) {
        if (e.detail.value >= 0) {
            if (Util.onInputCheck(e.detail.value)) {

                this.setData({
                    credit: e.detail.value
                })
            } else {
                this.setData({
                    credit: e.detail.value.substr(0, e.detail.value.length - 1)
                })
            }
        } else {
            wx.showToast({
                title: '金额有误',
                image: '/images/icon_warning.png',
                // mask: true,
                duration: 2000
            })
            this.setData({
                isAble: true,
                credit: ''
            })
        }

        if (!Util.checkFee(this.data.credit)) {
            this.setData({
                isAble: true
            })
        } else {
            this.setData({
                isAble: false
            })
        }
    },
    getNoCouponMoney(e){
      if(this.data.credit == ''){
        wx.showToast({
          title: '请先输入总金额',
          image: '/images/icon_warning.png',
          // mask: true,
          duration: 2000
        })
        this.setData({
          noCouponMoney:''
        })
      }else{
        if (e.detail.value >= 0) {
          if (e.detail.value*1 > this.data.credit*1) {
            wx.showToast({
              title: '需小于等于总金额',
              image: '/images/icon_warning.png',
              duration: 2000
            })
            this.setData({
              noCouponMoney: ''
            })
          }else{
            var reg = /^((?:0)|(?:[1-9]{0,9})|(?:[1-9]\d{0,8}))(?:\.\d{0,1})?$/;
            console.log(reg.test(Number(e.detail.value)))
            if (reg.test(Number(e.detail.value))) {
              this.setData({
                noCouponMoney: e.detail.value
              })
            }else{
              this.setData({
                noCouponMoney: this.data.noCouponMoney
              })
            }
          }
        }else {
          wx.showToast({
            title: '金额有误',
            image: '/images/icon_warning.png',
            // mask: true,
            duration: 2000
          })
        }
      }
      
    },
    /**
     * 会员卡支付提交
     * 如果支付成功，进入成功页面，支付失败进入失败页面
     */
    cardDoPay: function () {
        if (!Util.checkFee(this.data.credit)) {
            wx.showToast({
                title: '金额有误',
                icon: 'success',
                duration: 2000,
                image: '/images/icon_warning.png',
                // mask: true
            })
            this.setData({
                isAble: true,
                credit: ''
            })
            return
        }
       //wu
        if (this.data.credit*1 < this.data.noCouponMoney*1) {
          wx.showToast({
            title: '需小于总金额',
            image: '/images/icon_warning.png',
            // mask: true,
            duration: 2000
          })
          this.setData({
            noCouponMoney: ''
          })
          return
        }
        
        let params = {
            "credit": this.data.credit, // 消费金额
            "card_no_discount_fee":this.data.noCouponMoney,
            "store_id": this.data.cardPayData.store_list[this.data.index].id // 门店id
        }
        wx.showLoading({
            title: '加载中',
            mask: true
        })
        app.globalData.wtApi.apiStore_cardDoPay(params).then((res) => {
            if (res.type == 'success') {
                app.globalData.wtApi.apiStore_confirmPay({
                    order_id: res.data.id,
                    type: 'credit',
                    source: 'index',
                    totalprice: this.data.credit,
                    card_no_discount_fee: this.data.noCouponMoney
                }, {}).then((data) => {
                    if (data.type == 'success') {
                        wx.showToast({
                            title: '支付成功'
                        })
                        wx.hideLoading()

                        wx.redirectTo({
                            url: '/pages/index/check/payment/success?shop='
                            + this.data.cardPayData.store_list[this.data.index].title // 商家
                            + '&goodsprice=' + data.data.fee // 金额
                            + '&real_fee=' + data.data.card_fee // 实际支付
                            + '&integral=' + data.data.points // 获得积分
                            + '&ordersn=' + res.data.id // 订单编号
                        })

                    } else {
                        wx.hideLoading()
                        // wx.showToast({
                        //     title: '支付失败',
                        //     image: '/images/icon_warning.png',
                        //     mask: true
                        // })
                        console.log(data.data)
                        console.log(data.data.code)
                        if (data.data && data.data.code == '-5003') {

                        } else {
                            wx.navigateTo({
                                url: '/pages/index/check/payment/fail'
                            })
                        }
                    }

                })
            }
        })
    }
})