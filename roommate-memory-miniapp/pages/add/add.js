// pages/add/add.js - 云数据库版本
const app = getApp()

Page({
  data: {
    selectedType: '',
    formData: {
      title: '',
      description: '',
      content: '',
      date: '',
      images: [],
      messages: [],
      persons: [],
      mood: ''
    },
    tagInput: '',
    chatInput: '',
    speakers: ['我', '室友A', '室友B', '室友C'],
    selectedSpeakerIndex: 0,
    saving: false
  },

  onLoad() {
    // 设置默认日期为今天
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10)
    this.setData({
      'formData.date': dateStr
    })
  },

  // 选择类型
  selectType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      selectedType: type
    })
  },

  // 返回类型选择
  goBack() {
    this.setData({
      selectedType: '',
      formData: {
        title: '',
        description: '',
        content: '',
        date: this.data.formData.date,
        images: [],
        messages: [],
        persons: [],
        mood: ''
      }
    })
  },

  // 输入处理
  onInput(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${field}`]: value
    })
  },

  // 日期选择
  onDateChange(e) {
    this.setData({
      'formData.date': e.detail.value
    })
  },

  // 选择图片（同时上传到云存储）
  chooseImage() {
    wx.chooseMedia({
      count: 9,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFiles = res.tempFiles
        const images = tempFiles.map(file => file.tempFilePath)
        this.setData({
          'formData.images': [...this.data.formData.images, ...images]
        })
      }
    })
  },

  // 删除图片
  removeImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.formData.images
    images.splice(index, 1)
    this.setData({
      'formData.images': images
    })
  },

  // 标签输入
  onTagInput(e) {
    this.setData({
      tagInput: e.detail.value
    })
  },

  // 添加标签
  addTag() {
    const tag = this.data.tagInput.trim()
    if (!tag) return

    const persons = this.data.formData.persons
    if (!persons.includes(tag)) {
      persons.push(tag)
      this.setData({
        'formData.persons': persons,
        tagInput: ''
      })
    }
  },

  // 删除标签
  removeTag(e) {
    const index = e.currentTarget.dataset.index
    const persons = this.data.formData.persons
    persons.splice(index, 1)
    this.setData({
      'formData.persons': persons
    })
  },

  // 选择情绪
  selectMood(e) {
    const mood = e.currentTarget.dataset.mood
    this.setData({
      'formData.mood': mood
    })
  },

  // 发言人选择
  onSpeakerChange(e) {
    this.setData({
      selectedSpeakerIndex: e.detail.value
    })
  },

  // 聊天输入
  onChatInput(e) {
    this.setData({
      chatInput: e.detail.value
    })
  },

  // 添加聊天消息
  addChatMessage() {
    const speaker = this.data.speakers[this.data.selectedSpeakerIndex]
    const content = this.data.chatInput.trim()

    if (!speaker || !content) {
      wx.showToast({
        title: '请选择发言人并输入消息',
        icon: 'none'
      })
      return
    }

    const messages = this.data.formData.messages
    messages.push({ speaker, content })

    this.setData({
      'formData.messages': messages,
      chatInput: ''
    })
  },

  // 删除聊天消息
  removeChatMessage(e) {
    const index = e.currentTarget.dataset.index
    const messages = this.data.formData.messages
    messages.splice(index, 1)
    this.setData({
      'formData.messages': messages
    })
  },

  // 上传图片到云存储
  uploadImagesToCloud(localPaths) {
    if (!localPaths || localPaths.length === 0) return Promise.resolve([])

    const uploadPromises = localPaths.map(path => {
      const cloudPath = `memories/${Date.now()}-${Math.random().toString(36).substr(2, 8)}${path.match(/\.\w+$/)[0] || '.jpg'}`
      return wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: path
      }).then(res => {
        return res.fileID // 返回云文件ID
      }).catch(err => {
        console.error('上传图片失败:', err)
        return path // 上传失败时使用本地路径作为fallback
      })
    })

    return Promise.all(uploadPromises)
  },

  // 保存回忆（异步云数据库写入）
  saveMemory() {
    const { selectedType, formData } = this.data

    // 验证必填字段
    if (!formData.title.trim()) {
      wx.showToast({ title: '请输入标题', icon: 'none' })
      return
    }

    if (!formData.date) {
      wx.showToast({ title: '请选择时间', icon: 'none' })
      return
    }

    // 根据类型验证
    if (selectedType === 'photo' && formData.images.length === 0) {
      wx.showToast({ title: '请上传照片', icon: 'none' })
      return
    }

    if (selectedType === 'chat' && formData.messages.length === 0) {
      wx.showToast({ title: '请添加聊天记录', icon: 'none' })
      return
    }

    if (selectedType === 'story' && !formData.content.trim()) {
      wx.showToast({ title: '请输入故事内容', icon: 'none' })
      return
    }

    this.setData({ saving: true })

    // 先上传图片到云存储，再保存回忆数据
    this.uploadImagesToCloud(formData.images).then(cloudImageIds => {
      // 创建记忆对象
      const memory = {
        type: selectedType,
        title: formData.title.trim(),
        date: new Date(formData.date).toISOString(),
        description: formData.description.trim(),
        content: formData.content.trim(),
        images: cloudImageIds, // 使用云存储的文件ID
        messages: formData.messages,
        persons: formData.persons,
        mood: formData.mood
      }

      // 保存到云数据库
      return app.addMemory(memory)
    }).then(result => {
      if (result) {
        wx.showToast({
          title: '保存成功！',
          icon: 'success'
        })

        // 返回首页
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          })
        }, 1500)
      } else {
        this.setData({ saving: false })
      }
    }).catch(err => {
      console.error('保存回忆失败:', err)
      this.setData({ saving: false })
      wx.showToast({ title: '保存失败，请重试', icon: 'none' })
    })
  }
})
