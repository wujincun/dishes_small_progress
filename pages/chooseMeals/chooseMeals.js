// pages/chooseMeals/chooseMeals.js
let Pormise = require('../../api/es6-promise.min.js')
let app = getApp()
let Util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tableInfo: {                    // 桌台信息（仅堂点可用）
      text: '大厅名称',
      limit_price: 20
    },
    isFirstInto: false,             // 是否是第一次进入该页面（仅堂点可用）
    categoriesList: [],             // 类别列表
    goodsList: [],                  // 商品列表
    currentCategory: 0,             // 当前选择的类别index
    isShowChooseNum: false,         // 是否显示加减号（规格处）
    isShowShopCart: false,          // 是否显示购物车
    isShowConfirmDialog: false,     // 是否显示删除对话框
    tGoodsInfo: false,              // 规格商品信息
    currentGoodsbyDish: {},         // 当前规格框内展示的商品信息
    selectedGoodsList: [],          // 购物车列表商品数组
    chooseDishString: '',           // 选择规格字符串
    maxSelectNum: 10000,            // 规格种类的数量
    selectObject: {},               // 规格选择对象
    shopCartObject: {},             // 购物车数据对象
    table_id: 0,                    // 桌台id
    dining_mode: 2,                 // 模式：1：堂点2：外卖7：预定
    dValue: 0,                      // 差价
    attribute: '1px dashed #ddd',
    sendingprice: 0,                // 多少元起送
    windowHeight: 0,                // 视口高度
    animationData: {}               // 动画对象（未用到）
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 取到table_id 和 模式
    this.setData({
      table_id: wx.getStorageSync('table_id'),
      dining_mode: options.dining_mode ? options.dining_mode : 1,
      sendingprice: options.sendingprice
    })
    // 动态设置title
    wx.setNavigationBarTitle({
      title: this.data.dining_mode == 1 ? '堂点' : this.data.dining_mode == 2 ? '外卖' : '点菜'
    })
    // 如果是堂点模式，进行额外的判断逻辑
    if (this.data.dining_mode == 1) {
      if (this.data.dining_mode == 1) {
        app.globalData.wtApi.apiGetTableName({}, {table_id: this.data.table_id}).then((data) => {
          this.setData({
            tableInfo: data.data
          })
        })
      }
    }

    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowHeight: res.windowHeight
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      tGoodsInfo: false
    })
    this.updateGoodsList()
  },
  // 选择商品品类
  selectCurrentCategory: function (e) {
    let index = e.currentTarget.dataset.index
    if (this.data.currentCategory !== index) {
      this.setData({
        currentCategory: index
      })
      if (!this.data.goodsList[this.data.currentCategory]) {
        wx.showToast({
          title: '此栏目下暂无商品',
          image: '/images/icon_warning.png',
          mask: true
        })
      }
    }
  },
  // 关闭欢乐堂点弹窗
  closeHappyRestaurant: function () {
    this.setData({
      isFirstInto: false
    })
  },
  // 去确认订单界面
  gotoConfirmOrder: function () {
    if (app.globalData.isClickBtn) {
      return
    }
    app.globalData.isClickBtn = true
    setTimeout(function () {
      app.globalData.isClickBtn = false
    }, 1000)

    // 如果是外卖，则进入确认订单页面
    if (this.data.dining_mode == 2) {
      wx.navigateTo({
        url: '/pages/order/confirmOrder/confirmOrder?mode=' + this.data.dining_mode,
      })
    } else {
      // 如果是预定，则返回排队页面
      wx.navigateBack()
    }
  },
  // 去购物车界面
  gotoCart: function () {
    if (app.globalData.isClickBtn) {
      return
    }
    app.globalData.isClickBtn = true
    setTimeout(function () {
      app.globalData.isClickBtn = false
    }, 1000)

    if (this.data.dining_mode == 7) {
      wx.navigateBack()
    } else {
      wx.navigateTo({
        url: '/pages/chooseMeals/cart/cart'
      })
    }
  },
  // 更新商品列表
  updateGoodsList() {
    // 准备网络请求参数
    let params = this.data.dining_mode == 1 ? {
      table_id: this.data.table_id,
      dining_mode: this.data.dining_mode
    } : {
      dining_mode: this.data.dining_mode
    };


    //  获取商品列表逻辑
    app.globalData.wtApi.apiGetGoods({}, params).then((data) => {
      if (data.type == 'success') {
        for (let i = 0; i < data.data.length; i++) {
          if (data.data[i].name.length > 10) {
            data.data[i].name = data.data[i].name.substr(0, 10) + '...'
          }
        }
        // 初始化商品列表
        this.data.goodsList = []
        for (let x = 0; x < data.data.length; x++) {
          this.data.goodsList.push(data.data[x].goods)
        }
        // 转换商品金额
        for (let x = 0; x < this.data.goodsList.length; x++) {
          if (this.data.goodsList[x] && this.data.goodsList[x].length > 0) {
            for (let y = 0; y < this.data.goodsList[x].length; y++) {
              this.data.goodsList[x][y].marketprice = Util.switchGoodsPrice(this.data.goodsList[x][y].marketprice)
              this.data.goodsList[x][y].productprice = Util.switchGoodsPrice(this.data.goodsList[x][y].productprice)
              this.data.goodsList[x][y].sale_price = Util.switchGoodsPrice(this.data.goodsList[x][y].sale_price)
              if (this.data.goodsList[x][y].hasoption && this.data.goodsList[x][y].hasoption != '0') {
                // console.log(this.data.goodsList[x][y])
                for (let z = 0; z < this.data.goodsList[x][y].options.length; z++) {
                  // console.log(this.data.goodsList[x][y].options[z])
                  if (this.data.goodsList[x][y].options[z].price) {
                    this.data.goodsList[x][y].options[z].price = Util.switchGoodsPrice(this.data.goodsList[x][y].options[z].price)
                  }
                  if (this.data.goodsList[x][y].options[z].sale_price) {
                    this.data.goodsList[x][y].options[z].sale_price = Util.switchGoodsPrice(this.data.goodsList[x][y].options[z].sale_price)
                  }
                }
              }
            }
          }
        }
        // 处理有规格商品最低价
        for (let x = 0; x < this.data.goodsList.length; x++) {
          if (this.data.goodsList[x] && this.data.goodsList[x].length > 0) {
            for (let y = 0; y < this.data.goodsList[x].length; y++) {
              if (this.data.goodsList[x][y].hasoption && this.data.goodsList[x][y].hasoption != 0) {
                let minPrice = 0
                let minPriceold = -1
                let flag = 0
                for (let z = 0; z < this.data.goodsList[x][y].options.length; z++) {
                  let price = this.data.goodsList[x][y].is_sale != 1 ? parseFloat(this.data.goodsList[x][y].options[z].price) : parseFloat(this.data.goodsList[x][y].options[z].sale_price)
                  if (z == 0) {
                    minPrice = price
                  } else {
                    if (price < minPrice) {
                      minPrice = price
                      flag = z
                    }
                  }
                }
                if (this.data.goodsList[x][y].is_sale == 1) {
                  this.data.goodsList[x][y].minPriceold = parseFloat(this.data.goodsList[x][y].options[flag].price)
                }
                this.data.goodsList[x][y].minPrice = minPrice
              }
            }
          }
        }
        // 获取总价和总数量
        let count = 0;
        let price = 0;

        for (let x = 0; x < this.data.goodsList.length; x++) {
          if (this.data.goodsList[x] && this.data.goodsList[x].length) {
            for (let y = 0; y < this.data.goodsList[x].length; y++) {
              let goods = this.data.goodsList[x][y]
              if (goods.hasoption && goods.hasoption != 0) {
                goods.total = 0
                for (let z = 0; z < goods.options.length; z++) {
                  goods.total = parseInt(goods.options[z].stock, 10) + parseInt(goods.total, 10)
                }
              }
              if (goods.number) {
                count += parseInt(goods.number, 10)
                if (goods.hasoption && goods.hasoption != '0') {
                  for (let j = 0; j < goods.options.length; j++) {
                    // 计算价格
                    if (isNaN(parseFloat(goods.options[j].number))) {
                    } else {
                      price += parseFloat(goods.options[j].number, 10) * ((goods.is_sale == 1) ? parseFloat(goods.options[j].sale_price, 10) : parseFloat(goods.options[j].price, 10))
                    }
                  }
                } else {
                  price += (parseFloat(goods.number, 10) * (goods.is_sale == 1 ? parseFloat(goods.sale_price, 10) : parseFloat(goods.marketprice, 10)))
                }
              }
            }
          }
        }
        // price 4舍5入两位
       // price = Math.round(price * 100) / 100
        price = price.toFixed(2);
        this.setData({
          categoriesList: data.data,
          goodsList: this.data.goodsList,
          shopCartObject: {price, count},
          dValue: this.data.dining_mode == 2 ? Math.round((this.data.sendingprice - price) * 100) / 100 : 0
        })

        // 如果当前栏目下无商品则弹窗
        if (!this.data.goodsList[this.data.currentCategory]) {
          wx.showToast({
            title: '此栏目下暂无商品',
            image: '/images/icon_warning.png',
            mask: true
          })
        }

        // 判断是不是第一次打开堂点页面
        if (this.data.dining_mode == 1 && !wx.getStorageSync('isFirst')) {
          wx.setStorageSync('isFirst', 'no')
          setTimeout(() => {
            this.setData({
              isFirstInto: true
            })
          }, 400)
        }
      } else {
        if (data.type == 'info' && data.message == '参数错误 table_id') {
          wx.showToast({
            title: '二维码有误',
            image: '/images/icon_warning.png',
            mask: true
          })
          setTimeout(function () {
            wx.navigateBack()
          }, 1000);
        }
      }
    })
  },
  // 商品列表处增加商品到购物车
  addGoodsToShopcart: function (e) {
    // --增加商品数量--
    // 获取goodsList的下标
    let x = this.data.currentCategory
    let y = e.currentTarget.dataset.index
    // 准备网络请求参数
    let goods = this.data.goodsList[x][y]
    let goods_id = goods.id
    let option_id = goods.selectOptionId
    let total = goods.number ? parseInt(goods.number, 10) : 0
    if (this.data.selectObject.ok) {
      // 有规格商品选择
      total = goods.options[this.data.selectObject.optionIdx].number ? parseInt(goods.options[this.data.selectObject.optionIdx].number, 10) : 0
    }
    // *********
    total = total + 1
    let params = {
      goods_id,            // 商品id
      option_id,           // 如果有规格，则 option_id
      total,               //  期望修改到的数量
      dining_mode: this.data.dining_mode,      // 购物车类别，2为 外卖 。 1为 堂点 。   如果为堂点模式 还应有table_id字段
      table_id: this.data.table_id
    }
    // 发起网络请求
    app.globalData.wtApi.apiUpdateShopCart(params, {}, true).then((data) => {
      // 判断成功后，执行回调函数，修改view
      // this.setData({
      //   shopCartObject: data.data
      // })
      if (data.type == 'success') {
        // 数量有3处，1.类别数量修改  2.商品number  3.如果是规格商品，optionid对应的修改
        // 添加品类已选数量
        if (!this.data.categoriesList[x].number) {
          this.data.categoriesList[x].number = 0
        }
        this.data.categoriesList[x].number += 1;
        // 添加商品已选数量
        if (!this.data.goodsList[x][y].number) {
          this.data.goodsList[x][y].number = 0;
        }
        this.data.goodsList[x][y].number += 1
        if (this.data.selectObject.ok) {
          this.data.goodsList[x][y].options[this.data.selectObject.optionIdx].number = total
        }

        this.setData({
          goodsList: this.data.goodsList,
          categoriesList: this.data.categoriesList,
          shopCartObject: {count: data.data.count, price: data.data.price},
          dValue: Math.round((this.data.sendingprice - data.data.price) * 100) / 100
        })
      }
    })
  },
  // 购物车列表处增加商品到购物车
  addGoodsToShopcartFromCart(e) {
    let i = e.currentTarget.dataset.index
    // 准备网络请求参数
    let goods = this.data.selectedGoodsList[i]
    let goods_id = goods.goods_id
    let option_id = goods.option_id
    let total = goods.total ? parseInt(goods.total, 10) : 0

    // *********
    total = total + 1
    let params = {
      goods_id,            // 商品id
      option_id,           // 如果有规格，则 option_id
      total,               //  期望修改到的数量
      dining_mode: this.data.dining_mode,      // 购物车类别，2为 外卖 。 1为 堂点 。   如果为堂点模式 还应有table_id字段
      table_id: this.data.table_id
    }
    // 发起网络请求
    app.globalData.wtApi.apiUpdateShopCart(params, {}, true).then((data) => {
      // 判断成功后，执行回调函数，修改view
      // this.setData({
      //   shopCartObject: data.data
      // })
      if (data.type == 'success') {
        this.data.selectedGoodsList[i].total = total
        this.data.selectedGoodsList[i].sumPrice = Math.round(((this.data.selectedGoodsList[i].is_sale == 1) ? this.data.selectedGoodsList[i].sale_price : this.data.selectedGoodsList[i].marketprice) * this.data.selectedGoodsList[i].total * 100) / 100

        this.setData({
          selectedGoodsList: this.data.selectedGoodsList,
          shopCartObject: {count: data.data.count, price: data.data.price},
          dValue: Math.round((this.data.sendingprice - data.data.price) * 100) / 100
        })
      }
    })
  },
  // 商品列表处减少商品到购物车
  removeGoodsToShopcart: function (e) {
    // --增加商品数量--
    // 获取goodsList的下标
    let x = this.data.currentCategory
    let y = e.currentTarget.dataset.index
    // 准备网络请求参数
    let goods = this.data.goodsList[x][y]
    let goods_id = goods.id
    let option_id = goods.selectOptionId
    let total = e.currentTarget.dataset.total ? parseInt(e.currentTarget.dataset.total, 10) : goods.number ? parseInt(goods.number, 10) : 0
    if (this.data.selectObject.ok) {
      // 有规格商品选择
      total = goods.options[this.data.selectObject.optionIdx].number ? parseInt(goods.options[this.data.selectObject.optionIdx].number, 10) : 0
    }
    // *********
    total = total - 1
    let params = {
      goods_id,            // 商品id
      option_id,           // 如果有规格，则 option_id
      total,               //  期望修改到的数量
      dining_mode: this.data.dining_mode,       // 购物车类别，2为 外卖 。 1为 堂点 。   如果为堂点模式 还应有table_id字段
      table_id: this.data.table_id
    }
    // 发起网络请求
    app.globalData.wtApi.apiUpdateShopCart(params, {}, true).then((data) => {
      // 判断成功后，执行回调函数，修改view
      if (data.type == 'success') {
        // 数量有3处，1.类别数量修改  2.商品number  3.如果是规格商品，optionid对应的修改
        // 添加品类已选数量
        if (!this.data.categoriesList[x].number) {
          this.data.categoriesList[x].number = 0
        }
        this.data.categoriesList[x].number = this.data.categoriesList[x].number - 1;
        // 添加商品已选数量
        console.log(this.data.goodsList[x][y])

        if (!this.data.goodsList[x][y].number) {
          this.data.goodsList[x][y].number = 0;
        }
        this.data.goodsList[x][y].number = this.data.goodsList[x][y].number - 1
        // if (this.data.goodsList[x][y].options && this.data.goodsList[x][y].options.length > 0) {
        if (this.data.goodsList[x][y].hasoption && this.data.goodsList[x][y].hasoption > 0) {
          this.data.goodsList[x][y].options[this.data.selectObject.optionIdx].number = total
        }

        this.setData({
          goodsList: this.data.goodsList,
          categoriesList: this.data.categoriesList,
          shopCartObject: {count: data.data.count, price: data.data.price},
          dValue: Math.round((this.data.sendingprice - data.data.price) * 100) / 100
        })
      }
    })
  },
  // 购物车列表处减少商品到购物车
  removeGoodsToShopcartFromCart(e) {
    let i = e.currentTarget.dataset.index
    // 准备网络请求参数
    let goods = this.data.selectedGoodsList[i]
    let goods_id = goods.goods_id
    let option_id = goods.option_id
    let total = goods.total ? parseInt(goods.total, 10) : 0

    // *********
    total = total - 1
    let params = {
      goods_id,            // 商品id
      option_id,           // 如果有规格，则 option_id
      total,               //  期望修改到的数量
      dining_mode: this.data.dining_mode,      // 购物车类别，2为 外卖 。 1为 堂点 。   如果为堂点模式 还应有table_id字段
      table_id: this.data.table_id
    }
    // 发起网络请求
    app.globalData.wtApi.apiUpdateShopCart(params, {}, true).then((data) => {
      // 判断成功后，执行回调函数，修改view
      // this.setData({
      //   shopCartObject: data.data
      // })
      if (data.type == 'success') {
        this.data.selectedGoodsList[i].total = total
        this.data.selectedGoodsList[i].sumPrice = Math.round(((this.data.selectedGoodsList[i].is_sale == 1) ? this.data.selectedGoodsList[i].sale_price : this.data.selectedGoodsList[i].marketprice) * this.data.selectedGoodsList[i].total * 100) / 100

        this.setData({
          selectedGoodsList: this.data.selectedGoodsList,
          shopCartObject: {count: data.data.count, price: data.data.price},
          dValue: Math.round((this.data.sendingprice - data.data.price) * 100) / 100,
        })
        if (total == 0 && this.data.isShowChooseNum) {
          this.setData({
            isShowChooseNum: false
          })
        }
      }
    })
  },
  // 显示规格选择弹窗
  showChooseDish: function (e) {
    if (app.globalData.isClickBtn) {
      return
    }
    app.globalData.isClickBtn = true
    setTimeout(function () {
      app.globalData.isClickBtn = false
    }, 1000)

    let x = this.data.currentCategory
    let y = e.currentTarget.dataset.index
    let goods = this.data.goodsList[x][y]
    this.data.goodsList[x][y].selectSpecs = {}
    // this.data.goodsList[x][y].selectSpecs = this.data.goodsList[x][y].selectSpecs ? this.data.goodsList[x][y].selectSpecs : {}


    // 在goodslist记录选择的是哪个项
    // for (let i = 0; i < this.data.goodsList[x][y].specs.length; i++) {
    //     this.data.goodsList[x][y].selectSpecs[i] = this.data.goodsList[x][y].selectSpecs[i] ? this.data.goodsList[x][y].selectSpecs[i] : 0
    // }
    // 初始化selectecoptionsid
    this.data.goodsList[x][y].selectOptionId = this.data.goodsList[x][y].options[0].id


    // 初始化
    for (let i = 0; i < this.data.goodsList[x][y].specs.length; i++) {
      this.data.goodsList[x][y].selectSpecs[i] = 0
    }

    // 获取第一个option的id
    let toptions = ''
    for (let i = 0; i < this.data.goodsList[x][y].options.length; i++) {
      if (this.data.goodsList[x][y].options[i].number && this.data.goodsList[x][y].options[i].number != 0) {
        toptions = this.data.goodsList[x][y].options[i].specs
        this.data.goodsList[x][y].selectOptionId = this.data.goodsList[x][y].options[i].id
        break
      }
    }

    if (toptions == '') {
      toptions = this.data.goodsList[x][y].options[0].specs
      this.data.goodsList[x][y].selectOptionId = this.data.goodsList[x][y].options[0].id
    }

    console.log(toptions)
    let tarr = toptions.split('_')
    console.log(tarr)
    for (let i = 0; i < tarr.length; i++) {
      for (let j = 0; j < this.data.goodsList[x][y].specs.length; j++) {
        for (let z = 0; z < this.data.goodsList[x][y].specs[j].items.length; z++) {
          if (tarr[i] == this.data.goodsList[x][y].specs[j].items[z].id) {
            this.data.goodsList[x][y].selectSpecs[j] = z
            break
          }
        }
      }
    }

    // this.data.goodsList[x][y].selectOptionId = this.data.goodsList[x][y].selectOptionId ? this.data.goodsList[x][y].selectOptionId : this.data.goodsList[x][y].options[0].id
    // 得到options 的下标
    let optionIdx = 0
    for (let i = 0; i < this.data.goodsList[x][y].options.length; i++) {
      if (this.data.goodsList[x][y].selectOptionId == this.data.goodsList[x][y].options[i].id) {
        optionIdx = i
        break
      }
    }

    console.log(this.data.goodsList[x][y].selectSpecs)

    // console.log(this.data.goodsList[x][y].selectSpecs)
    // this.data.goodsList[x][y].options[0].id
    let selectObject = {
      optionIdx,
      ok: true
    }

    for (let z = 0; z < goods.specs.length; z++) {
      let idx = this.data.goodsList[x][y].selectSpecs[z]
      selectObject[z] = goods.specs[z].items[idx].id
      // 增加flag

      for (let i = 0; i < this.data.goodsList[x][y].options.length; i++) {
        if (RegExp(selectObject[z]).test(this.data.goodsList[x][y].options[i].specs)) {
          if (!this.data.goodsList[x][y].options[i].selectNum) {
            this.data.goodsList[x][y].options[i].selectNum = 0
          }
          this.data.goodsList[x][y].options[i].selectNum += 1
        }
      }
    }

    this.setData({
      tGoodsInfo: {
        x,
        y,
        is_sale: this.data.goodsList[x][y].is_sale
      },
      maxSelectNum: this.data.goodsList[x][y].specs.length,
      selectObject: selectObject,
      goodsList: this.data.goodsList
    })
  },
  // 关闭规格选择弹窗
  closeChooseDish: function (e) {
    let x = this.data.tGoodsInfo.x
    let y = this.data.tGoodsInfo.y
    for (let i = 0; i < this.data.goodsList[x][y].options.length; i++) {
      this.data.goodsList[x][y].options[i].selectNum = 0
    }
    this.setData({
      tGoodsInfo: false,
      maxSelectNum: 10000,
      selectObject: {},
      isShowChooseNum: false,
      goodsList: this.data.goodsList
    })
  },
  // 选择规格方法
  chooseDish: function (e) {
    let x = this.data.currentCategory
    let y = e.currentTarget.dataset.index
    let row = e.currentTarget.dataset.specrow
    let id = e.currentTarget.dataset.itemid
    let specIdx = e.currentTarget.dataset.specidx

    // 记录选择的是哪个值，存到一个对象中
    // this.data.goodsList[x][y].selectSpecs[row] = specIdx
    // console.log(this.data.goodsList[x][y].selectSpecs)
    // let selectSpec = {}

    if (!this.data.selectObject[row]) {
      // 如果当前项没有被选中过
      this.data.selectObject[row] = id

      // 增加flag
      for (let i = 0; i < this.data.goodsList[x][y].options.length; i++) {
        if (RegExp(id).test(this.data.goodsList[x][y].options[i].specs)) {
          if (!this.data.goodsList[x][y].options[i].selectNum) {
            this.data.goodsList[x][y].options[i].selectNum = 0
          }
          this.data.goodsList[x][y].options[i].selectNum += 1
        }
      }
    } else {
      // 如果当前项已有值
      let oldId = this.data.selectObject[row]
      this.data.selectObject[row] = id

      for (let i = 0; i < this.data.goodsList[x][y].options.length; i++) {

        // 减少flag  为了通过spces里面的items里面的id找到对应的optios里面的元素
        if (RegExp(oldId).test(this.data.goodsList[x][y].options[i].specs)) {

          this.data.goodsList[x][y].options[i].selectNum -= 1
        }

        // 增加flag  为了通过spces里面的items里面的id找到对应的optios里面的元素
        if (RegExp(id).test(this.data.goodsList[x][y].options[i].specs)) {
          if (!this.data.goodsList[x][y].options[i].selectNum) {
            this.data.goodsList[x][y].options[i].selectNum = 0
          }
          this.data.goodsList[x][y].options[i].selectNum += 1
        }
      }
    }

    for (let i = 0; i < this.data.goodsList[x][y].options.length; i++) {

      if (this.data.goodsList[x][y].options[i].selectNum == this.data.maxSelectNum) {
        this.data.goodsList[x][y].selectOptionId = this.data.goodsList[x][y].options[i].id
        this.data.selectObject.ok = true
        this.data.selectObject.optionIdx = i
        break
      }
    }

    this.setData({
      goodsList: this.data.goodsList,
      selectObject: this.data.selectObject
    })
  },
  // 规格处，选择数量
  toChooseNum: function (e) {
    this.addGoodsToShopcart(e)
    // this.setData({
    //     isShowChooseNum: !this.data.isShowChooseNum
    // })
  },
  // 显示购物车详情列表
  showShopCart: function () {
    if (app.globalData.isClickBtn) {
      return
    }
    app.globalData.isClickBtn = true
    setTimeout(function () {
      app.globalData.isClickBtn = false
    }, 1000)
    // 获取购物车商品列表
    let queryObject = this.data.dining_mode == 1 ? {
      dining_mode: this.data.dining_mode,
      table_id: this.data.table_id
    } : {
      dining_mode: this.data.dining_mode,
    }
    app.globalData.wtApi.apigetShopCartList({}, queryObject).then((data) => {

      for (let i = 0; i < data.data.list.length; i++) {
        data.data.list[i].sumPrice = Math.round(((data.data.list[i].is_sale == 1) ? data.data.list[i].sale_price : data.data.list[i].marketprice) * data.data.list[i].total * 100) / 100
      }

      this.setData({
        selectedGoodsList: data.data.list,
        shopCartObject: {count: data.data.count, price: data.data.price},
        isShowShopCart: true
      })
    })

  },
  // 关闭购物车详情列表
  closeShopCart: function () {
    this.updateGoodsList()
    wx.showLoading()
    setTimeout(() => {
      this.setData({
        isShowShopCart: false
      })
      wx.hideLoading()
    }, 400)
  },
  // 对话框取消事件
  toggleDialog: function () {
    let that = this
    // this.setData({
    //     isShowConfirmDialog: !this.data.isShowConfirmDialog
    // })
    wx.showModal({
      title: '确认要清空吗',
      success: function (res) {
        if (res.confirm) {
          that.dialogConfirm()
        }
      }
    })
  },
  // 对话框确认事件
  dialogConfirm: function () {
    app.globalData.wtApi.apiRemoveAllGoods({}, {dining_mode: this.data.dining_mode}).then((data) => {
      wx.showToast({
        title: '已清空购物车',
        // image: '/images/icon_warning.png',
        duration: 1000
      })
      setTimeout(() => {


        this.setData({
          categoriesList: [],             // 类别列表
          goodsList: [],                  // 商品列表
          currentCategory: 0,             // 当前选择的类别index
          isShowChooseNum: false,
          isShowShopCart: false,
          isShowConfirmDialog: false,
          tGoodsInfo: false,
          currentGoodsbyDish: {},
          selectedGoodsList: [],
          chooseDishString: '',
          maxSelectNum: 10000,
          selectObject: {},
          shopCartObject: {},
          dValue: 0,
        })

        this.updateGoodsList()
      }, 1100)
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
  createAnimation() {
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: "ease",
      delay: 0
    })
    this.setData({
      animationData: animation.export()
    })
  }
})