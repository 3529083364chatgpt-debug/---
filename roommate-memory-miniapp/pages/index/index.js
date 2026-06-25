// pages/index/index.js - 云数据库版本
const app = getApp()

Page({
  data: {
    memories: [],
    timelineGroups: [],
    onThisDayMemories: [],
    searchQuery: '',
    loading: true
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    // 每次显示页面时重新加载数据
    this.loadData()
  },

  // 加载数据（异步云数据库）
  loadData() {
    this.setData({ loading: true })

    app.getMemories().then(memories => {
      // 处理记忆数据
      const processedMemories = memories.map(memory => ({
        ...memory,
        relativeTime: app.formatRelativeTime(memory.date || memory.createdAt),
        moodEmoji: memory.mood ? app.getMoodEmoji(memory.mood) : '',
        moodText: memory.mood ? app.getMoodText(memory.mood) : '',
        preview: this.getPreview(memory)
      }))

      // 获取那年今日的记忆
      const onThisDayMemories = this.getOnThisDayMemories(processedMemories)

      // 按时间分组
      const timelineGroups = this.groupByMonth(processedMemories)

      this.setData({
        memories: processedMemories,
        timelineGroups,
        onThisDayMemories,
        loading: false
      })
    }).catch(err => {
      console.error('加载首页数据失败:', err)
      this.setData({ loading: false })
    })
  },

  // 获取预览文本
  getPreview(memory) {
    if (memory.type === 'photo') {
      return memory.description || ''
    } else if (memory.type === 'chat') {
      return memory.messages && memory.messages.length > 0
        ? memory.messages[0].content
        : memory.description || ''
    } else {
      return memory.content ? memory.content.substring(0, 100) + '...' : ''
    }
  },

  // 获取那年今日的记忆
  getOnThisDayMemories(memories) {
    const today = new Date()
    const month = today.getMonth()
    const day = today.getDate()

    return memories.filter(memory => {
      const dateStr = memory.date || memory.createdAt
      let memoryDate
      if (typeof dateStr === 'object' && dateStr.$date) {
        memoryDate = new Date(dateStr.$date)
      } else {
        memoryDate = new Date(dateStr)
      }
      return memoryDate.getMonth() === month && memoryDate.getDate() === day
    }).map(memory => ({
      ...memory,
      year: new Date(memory.date || memory.createdAt).getFullYear()
    }))
  },

  // 按月份分组
  groupByMonth(memories) {
    const grouped = {}

    memories.forEach(memory => {
      const monthYear = app.getMonthYear(memory.date || memory.createdAt)
      if (!grouped[monthYear]) {
        grouped[monthYear] = []
      }
      grouped[monthYear].push(memory)
    })

    // 转换为数组并按时间倒序排列
    return Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .map(month => ({
        month,
        memories: grouped[month].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
      }))
  },

  // 搜索输入
  onSearchInput(e) {
    const searchQuery = e.detail.value
    this.setData({ searchQuery })
    this.filterMemories()
  },

  // 过滤记忆（本地过滤，不需要重新查询云数据库）
  filterMemories() {
    const { searchQuery, memories } = this.data

    if (!searchQuery.trim()) {
      const timelineGroups = this.groupByMonth(memories)
      this.setData({ timelineGroups })
      return
    }

    const lowerQuery = searchQuery.toLowerCase()
    const filtered = memories.filter(memory => {
      const titleMatch = memory.title.toLowerCase().includes(lowerQuery)
      const descMatch = memory.description && memory.description.toLowerCase().includes(lowerQuery)
      const contentMatch = memory.content && memory.content.toLowerCase().includes(lowerQuery)
      const personMatch = memory.persons && memory.persons.some(p => p.toLowerCase().includes(lowerQuery))

      return titleMatch || descMatch || contentMatch || personMatch
    })

    const timelineGroups = this.groupByMonth(filtered)
    this.setData({ timelineGroups })
  },

  // 点击记忆卡片
  onMemoryTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadData()
    wx.stopPullDownRefresh()
  }
})
