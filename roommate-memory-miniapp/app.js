// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  
  globalData: {
    userInfo: null,
    // 回忆数据存储键
    memoriesKey: 'roommate_memories',
    commentsKey: 'roommate_comments'
  },
  
  // 获取所有回忆数据
  getMemories() {
    return wx.getStorageSync(this.globalData.memoriesKey) || []
  },
  
  // 保存回忆数据
  saveMemories(memories) {
    wx.setStorageSync(this.globalData.memoriesKey, memories)
  },
  
  // 添加新回忆
  addMemory(memory) {
    const memories = this.getMemories()
    memory.id = this.generateId()
    memory.createdAt = new Date().toISOString()
    memories.unshift(memory) // 添加到开头
    this.saveMemories(memories)
    return memory
  },
  
  // 删除回忆
  deleteMemory(id) {
    let memories = this.getMemories()
    memories = memories.filter(m => m.id !== id)
    this.saveMemories(memories)
  },
  
  // 更新回忆
  updateMemory(id, updates) {
    const memories = this.getMemories()
    const index = memories.findIndex(m => m.id === id)
    if (index !== -1) {
      memories[index] = { ...memories[index], ...updates }
      this.saveMemories(memories)
      return memories[index]
    }
    return null
  },
  
  // 获取评论
  getComments(memoryId) {
    const allComments = wx.getStorageSync(this.globalData.commentsKey) || {}
    return allComments[memoryId] || []
  },
  
  // 添加评论
  addComment(memoryId, comment) {
    const allComments = wx.getStorageSync(this.globalData.commentsKey) || {}
    if (!allComments[memoryId]) {
      allComments[memoryId] = []
    }
    comment.id = this.generateId()
    comment.time = new Date().toISOString()
    allComments[memoryId].push(comment)
    wx.setStorageSync(this.globalData.commentsKey, allComments)
    return comment
  },
  
  // 生成唯一ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  },
  
  // 格式化日期
  formatDate(dateString) {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${year}年${month}月${day}日 ${hours}:${minutes}`
  },
  
  // 格式化相对时间
  formatRelativeTime(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 30) return `${days}天前`
    return this.formatDate(dateString)
  },
  
  // 获取月份年份
  getMonthYear(dateString) {
    const date = new Date(dateString)
    return `${date.getFullYear()}年${date.getMonth() + 1}月`
  },
  
  // 获取情绪表情
  getMoodEmoji(mood) {
    const moods = {
      happy: '😊',
      touched: '🥺',
      funny: '😂',
      miss: '😢',
      warm: '🥰'
    }
    return moods[mood] || ''
  },
  
  // 获取情绪文本
  getMoodText(mood) {
    const moods = {
      happy: '开心',
      touched: '感动',
      funny: '搞笑',
      miss: '怀念',
      warm: '温暖'
    }
    return moods[mood] || ''
  },
  
  // 获取类型图标
  getTypeIcon(type) {
    const icons = {
      photo: 'image',
      chat: 'chat',
      story: 'book'
    }
    return icons[type] || 'book'
  },
  
  // 获取类型文本
  getTypeText(type) {
    const texts = {
      photo: '照片',
      chat: '聊天',
      story: '故事'
    }
    return texts[type] || ''
  }
})