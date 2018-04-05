var app = getApp();
var meafe = require('../../utils/util_meafe.js');
var util = require('../../utils/util.js');
Page({
  data: {
    id: -1,
    receivers: [],
    title: '',
    content: '',
    fj_ids: []
  },
  onLoad: function (option) {
    var thiz = this;
    if (option.id)
      thiz.setData({
        id: option.id,
        reply: option.reply,
      });
    thiz.getData();
    var work_id = app.globalData.ggwUserInfo.work_id;
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    let selected = wx.getStorageSync('selected');
    if (selected)
      this.setData({ receivers: selected.map(val => val.nm) });
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {

  },
  distinct: function (arr) {
    var result = [],
      i,
      j,
      len = arr.length;
    for (i = 0; i < len; i++) {
      for (j = i + 1; j < len; j++) {
        if (arr[i] === arr[j]) {
          j = ++i;
        }
      }
      result.push(arr[i]);
    }
    return result;
  },
  getData: function () {
    wx.showLoading({
      title: '正在加载..',
    })
    var thiz = this;
    //获取数据内容
    wx.request({
      url: "https://www.meafe.cn/sxf/get_grsw_shou_detail/?id=" + thiz.data.id,
      data: {},
      header: {},
      method: "GET",
      dataType: "json",
      responseType: "text",
      success: function (res) {
        console.log(res.data);
        var sender = res.data.sender.trim();
        var fj_ids = [];
        for (var i in res.data.fujian) {
          fj_ids.push(res.data.fujian[i][2]);
        }
        thiz.setData({
          title: "转发 " + res.data.title,
          content: res.data.neirong,
          sender: res.data.sender,
          fj_ids: fj_ids
        });
      },
      fail: function (res) {
        wx.showModal({
          title: '服务器开小差了，是否重新获取数据？',
          content: '',
          success: function (res) {
            if (res.confirm) {
              thiz.getData();
            } else if (res.cancel) {
            }
          }
        })
      },
      complete: function (res) { wx.hideLoading(); },
    })
  },
  bindPickerChange: function (e) {
    this.setData({
      wanggeTypeIndex: e.detail.value
    })
  },
  textBlur: function (e) {
    this.setData({ title: e.detail.value });
  },
  textBlur2: function (e) {
    this.setData({ content: e.detail.value });
  },

  bindInput: function (e) {
    this.setData({
      title: e.detail.value
    })
  },
  bindInput1: function (e) {
    this.setData({
      content: e.detail.value
    })
  },
  submit: function () {
    var thiz = this;
    setTimeout(function () {
      if (thiz.data.receivers.length == 0) {
        meafe.Toast("请选择联系人");
        return;
      }
      if (thiz.data.title.trim().length == 0) {
        meafe.Toast("请输入标题");
        return;
      }
      wx.request({
        url: "https://www.meafe.cn/sxf/zhuanfa_grsw/",
        data: {
          receivers: thiz.data.receivers,
          sender: app.globalData.ggwUserInfo.work_id,
          title: thiz.data.title,
          content: thiz.data.content,
          fj_ids: thiz.data.fj_ids,
          shouid: thiz.data.id
        },
        method: "POST",
        dataType: "json",
        responseType: "text",
        success: function (res) {
          console.log(res.data);
          if (res.data == true) {
            meafe.Toast("发送成功");
            wx.removeStorageSync("selected");
            wx.navigateBack({
              delta: 1
            })
          }
          else {
            meafe.Toast("发送失败");
          }
        },
        fail: function (res) {
          wx.showModal({
            title: '服务器开小差了，是否重新获取数据？',
            content: '',
            success: function (res) {
              if (res.confirm) {
                thiz.submit();
              } else if (res.cancel) {
              }
            }
          })
        },
        complete: function (res) { wx.hideLoading(); },
      })
    }, 300);
  },
  selectContact: function () {
    wx.navigateTo({
      url: '../grsw_select_person/grsw_select_person',
    })
  }
})