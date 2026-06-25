// pages/detail/detail.js - 云数据库版本
const app = getApp()

Page({
  data: {
    memory: {},
    comments: [],
    commentInput: '',
    loading: true
  },

  onLoad(options) {
    const id = options.id
    if (id) {
      this.loadMemory(id)
    }
  },

  onShow() {
    // 每次显示页面时重新加载数据
    if (this.data.memory.id) {
      this.loadMemory(this.data.memory.id)
    }
  },

  // 加载回忆详情（异步）
  loadMemory(id) {
    this.setData({ loading: true })

    // 同时加载回忆和评论
    Promise.all([
      app.getMemoryById(id),
      app.getComments(id)
    ]).then(([memory, comments]) => {
      if (memory) {
        // 处理回忆数据
        const processedMemory = {
          ...memory,
          formattedDate: app.formatDate(memory.date || memory.createdAt),
          moodEmoji: memory.mood ? app.getMoodEmoji(memory.mood) : '',
          moodText: memory.mood ? app.getMoodText(memory.mood) : ''
        }

        // 处理评论数据
        const processedComments = comments.map(comment => ({
          ...comment,
          relativeTime: app.formatRelativeTime(comment.time)
        }))

        this.setData({
          memory: processedMemory,
          comments: processedComments,
          loading: false
        })
      } else {
        this.setData({ loading: false })
        wx.showToast({ title: '回忆不存在', icon: 'none' })
      }
    }).catch(err => {
      console.error('加载详情失败:', err)
      this.setData({ loading: false })
    })
  },

  // 预览图片
  previewImage(e) {
    const src = e.currentTarget.dataset.src
    const images = this.data.memory.images || []
    wx.previewImage({
      current: src,
      urls: images
    })
  },

  // 编辑回忆
  editMemory() {
    wx.showToast({
      title: '编辑功能开发中...',
      icon: 'none'
    })
  },

  // 删除回忆（异步）
  deleteMemory() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条回忆吗？删除后无法恢复。',
      confirmColor: '#e74c3c',
      success: (res) => {
        if (res.confirm) {
          app.deleteMemory(this.data.memory.id).then(success => {
            if (success) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              setTimeout(() => {
                wx.navigateBack()
              }, 1500)
            } else {
              wx.showToast({ title: '删除失败', icon: 'none' })
            }
          })
        }
      }
    })
  },

  // 分享回忆
  shareMemory() {
    wx.showActionSheet({
      itemList: ['分享给朋友', '分享到朋友圈', '复制链接'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            wx.showToast({
              title: '请点击右上角分享',
              icon: 'none'
            })
            break
          case 1:
            wx.showToast({
              title: '请点击右上角分享',
              icon: 'none'
            })
            break
          case 2:
            wx.setClipboardData({
              data: `室友回忆录 - ${this.data.memory.title}`,
              success: () => {
                wx.showToast({
                  title: '已复制到剪贴板',
                  icon: 'success'
                })
              }
            })
            break
        }
      }
    })
  },

  // 评论输入
  onCommentInput(e) {
    this.setData({
      commentInput: e.detail.value
    })
  },

  // 添加评论（异步）
  addComment() {
    const content = this.data.commentInput.trim()
    if (!content) {
      wx.showToast({
        title: '请输入留言内容',
        icon: 'none'
      })
      return
    }

    const userInfo = app.globalData.userInfo
    const comment = {
      author: userInfo ? userInfo.nickName : '匿名室友',
      avatarUrl: userInfo ? userInfo.avatarUrl : '',
      content: content
    }

    app.addComment(this.data.memory.id, comment).then(result => {
      if (result) {
        // 重新加载评论
        this.loadMemory(this.data.memory.id)

        this.setData({
          commentInput: ''
        })

        wx.showToast({
          title: '留言成功！',
          icon: 'success'
        })
      }
    }).catch(err => {
      console.error('留言失败:', err)
    })
  },

  // 分享给朋友
  onShareAppMessage() {
    return {
      title: `室友回忆录 - ${this.data.memory.title}`,
      path: `/pages/detail/detail?id=${this.data.memory.id}`
    }
  }
})
