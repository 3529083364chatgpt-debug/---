// app.js - 微信云开发版本（多人共享数据）
App({
  onLaunch() {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数：你的云开发环境ID
        // 请在微信开发者工具 -> 云开发控制台 -> 设置中查看环境ID
        // 示例：'cloud1-xxxx' 或 'roommate-memory-xxxx'
        env: 'your-cloud-env-id', // ⚠️ 请替换为你的云环境ID
        traceUser: true
      })
    }

    // 获取用户信息
    this.getUserInfo()
  },

  globalData: {
    userInfo: null,
    db: null // 云数据库实例，初始化后赋值
  },

  // 获取云数据库实例
  getDb() {
    if (!this.globalData.db) {
      this.globalData.db = wx.cloud.database()
    }
    return this.globalData.db
  },

  // 获取用户信息
  getUserInfo() {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo
            }
          })
        }
      }
    })
  },

  // ========== 回忆数据操作（云数据库） ==========

  // 获取所有回忆数据
  getMemories() {
    const db = this.getDb()
    return db.collection('memories')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get()
      .then(res => {
        // 云数据库返回的数据带有 _id 和 _openid 等字段
        return res.data.map(item => ({
          ...item,
          id: item._id // 用云数据库的 _id 作为 id
        }))
      })
      .catch(err => {
        console.error('获取回忆数据失败:', err)
        return []
      })
  },

  // 根据 ID 获取单个回忆
  getMemoryById(id) {
    const db = this.getDb()
    return db.collection('memories')
      .doc(id)
      .get()
      .then(res => ({
        ...res.data,
        id: res.data._id
      }))
      .catch(err => {
        console.error('获取回忆详情失败:', err)
        return null
      })
  },

  // 添加新回忆
  addMemory(memory) {
    const db = this.getDb()
    // 云数据库会自动添加 _id、_openid 和时间戳
    const data = {
      ...memory,
      createdAt: db.serverDate(), // 使用服务器时间
      updatedAt: db.serverDate()
    }
    // 移除本地生成的 id（云数据库自动生成 _id）
    if (data.id) delete data.id

    return db.collection('memories')
      .add({ data })
      .then(res => {
        return { ...memory, id: res._id, createdAt: new Date().toISOString() }
      })
      .catch(err => {
        console.error('添加回忆失败:', err)
        wx.showToast({ title: '保存失败，请重试', icon: 'none' })
        return null
      })
  },

  // 删除回忆
  deleteMemory(id) {
    const db = this.getDb()
    return db.collection('memories')
      .doc(id)
      .remove()
      .then(res => {
        return true
      })
      .catch(err => {
        console.error('删除回忆失败:', err)
        wx.showToast({ title: '删除失败，请重试', icon: 'none' })
        return false
      })
  },

  // 更新回忆
  updateMemory(id, updates) {
    const db = this.getDb()
    const data = {
      ...updates,
      updatedAt: db.serverDate()
    }
    // 不要更新 _id 和 _openid
    if (data._id) delete data._id
    if (data._openid) delete data._openid

    return db.collection('memories')
      .doc(id)
      .update({ data })
      .then(res => {
        return true
      })
      .catch(err => {
        console.error('更新回忆失败:', err)
        return false
      })
  },

  // ========== 评论数据操作（云数据库） ==========

  // 获取某条回忆的评论
  getComments(memoryId) {
    const db = this.getDb()
    return db.collection('comments')
      .where({
        memoryId: memoryId
      })
      .orderBy('time', 'asc')
      .limit(50)
      .get()
      .then(res => {
        return res.data.map(item => ({
          ...item,
          id: item._id
        }))
      })
      .catch(err => {
        console.error('获取评论失败:', err)
        return []
      })
  },

  // 添加评论
  addComment(memoryId, comment) {
    const db = this.getDb()
    const data = {
      ...comment,
      memoryId: memoryId,
      time: db.serverDate()
    }
    if (data.id) delete data.id

    return db.collection('comments')
      .add({ data })
      .then(res => {
        return { ...comment, id: res._id, memoryId, time: new Date().toISOString() }
      })
      .catch(err => {
        console.error('添加评论失败:', err)
        wx.showToast({ title: '留言失败，请重试', icon: 'none' })
        return null
      })
  },

  // ========== 工具函数 ==========

  // 生成唯一ID（本地用途，云数据库会自动生成 _id）
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  },

  // 格式化日期
  formatDate(dateString) {
    // 云数据库 serverDate 返回的是特殊格式，需要处理
    let date
    if (dateString instanceof Date) {
      date = dateString
    } else if (typeof dateString === 'object' && dateString.$date) {
      // 云数据库 serverDate 格式
      date = new Date(dateString.$date)
    } else {
      date = new Date(dateString)
    }

    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${year}年${month}月${day}日 ${hours}:${minutes}`
  },

  // 格式化相对时间
  formatRelativeTime(dateString) {
    let date
    if (dateString instanceof Date) {
      date = dateString
    } else if (typeof dateString === 'object' && dateString.$date) {
      date = new Date(dateString.$date)
    } else {
      date = new Date(dateString)
    }

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
    let date
    if (dateString instanceof Date) {
      date = dateString
    } else if (typeof dateString === 'object' && dateString.$date) {
      date = new Date(dateString.$date)
    } else {
      date = new Date(dateString)
    }
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
