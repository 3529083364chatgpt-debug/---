// pages/detail/detail.js
const app = getApp()

Page({
  data: {
    memory: {},
    comments: [],
    commentInput: ''
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
  
  // 加载回忆详情
  loadMemory(id) {
    const memories = app.getMemories()
    const memory = memories.find(m => m.id === id)
    
    if (memory) {
      // 处理数据
      const processedMemory = {
        ...memory,
        formattedDate: app.formatDate(memory.date),
        moodEmoji: memory.mood ? app.getMoodEmoji(memory.mood) : '',
        moodText: memory.mood ? app.getMoodText(memory.mood) : ''
      }
      
      // 加载评论
      const comments = app.getComments(id)
      const processedComments = comments.map(comment => ({
        ...comment,
        relativeTime: app.formatRelativeTime(comment.time)
      }))
      
      this.setData({
        memory: processedMemory,
        comments: processedComments
      })
    }
  },
  
  // 预览图片
  previewImage(e) {
    const src = e.currentTarget.dataset.src
    wx.previewImage({
      current: src,
      urls: this.data.memory.images
    })
  },
  
  // 编辑回忆
  editMemory() {
    // 跳转到编辑页面，传递ID参数
    wx.showToast({
      title: '编辑功能开发中...',
      icon: 'none'
    })
  },
  
  // 删除回忆
  deleteMemory() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条回忆吗？删除后无法恢复。',
      confirmColor: '#e74c3c',
      success: (res) => {
        if (res.confirm) {
          app.deleteMemory(this.data.memory.id)
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
          
          // 返回上一页
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        }
      }
    })
  },
  
  // 分享回忆
  shareMemory() {
    // 显示分享菜单
    wx.showActionSheet({
      itemList: ['分享给朋友', '分享到朋友圈', '复制链接'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            // 分享给朋友 - 使用微信分享
            wx.showToast({
              title: '请点击右上角分享',
              icon: 'none'
            })
            break
          case 1:
            // 分享到朋友圈
            wx.showToast({
              title: '请点击右上角分享',
              icon: 'none'
            })
            break
          case 2:
            // 复制链接
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
  
  // 添加评论
  addComment() {
    const content = this.data.commentInput.trim()
    if (!content) {
      wx.showToast({
        title: '请输入留言内容',
        icon: 'none'
      })
      return
    }
    
    const comment = {
      author: '我',
      content: content
    }
    
    app.addComment(this.data.memory.id, comment)
    
    // 重新加载评论
    this.loadMemory(this.data.memory.id)
    
    // 清空输入框
    this.setData({
      commentInput: ''
    })
    
    wx.showToast({
      title: '留言成功！',
      icon: 'success'
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