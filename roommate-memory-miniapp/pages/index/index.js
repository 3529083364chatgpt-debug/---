// pages/index/index.js
const app = getApp()

Page({
  data: {
    memories: [],
    timelineGroups: [],
    onThisDayMemories: [],
    searchQuery: ''
  },
  
  onLoad() {
    this.loadData()
  },
  
  onShow() {
    // 每次显示页面时重新加载数据
    this.loadData()
  },
  
  // 加载数据
  loadData() {
    const memories = app.getMemories()
    
    // 处理记忆数据
    const processedMemories = memories.map(memory => ({
      ...memory,
      relativeTime: app.formatRelativeTime(memory.date),
      moodEmoji: memory.mood ? app.getMoodEmoji(memory.mood) : '',
      moodText: memory.mood ? app.getMoodText(memory.mood) : '',
      preview: this.getPreview(memory),
      commentsCount: app.getComments(memory.id).length
    }))
    
    // 获取那年今日的记忆
    const onThisDayMemories = this.getOnThisDayMemories(processedMemories)
    
    // 按时间分组
    const timelineGroups = this.groupByMonth(processedMemories)
    
    this.setData({
      memories: processedMemories,
      timelineGroups,
      onThisDayMemories
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
      const memoryDate = new Date(memory.date)
      return memoryDate.getMonth() === month && memoryDate.getDate() === day
    }).map(memory => ({
      ...memory,
      year: new Date(memory.date).getFullYear()
    }))
  },
  
  // 按月份分组
  groupByMonth(memories) {
    const grouped = {}
    
    memories.forEach(memory => {
      const monthYear = app.getMonthYear(memory.date)
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
        memories: grouped[month].sort((a, b) => new Date(b.date) - new Date(a.date))
      }))
  },
  
  // 搜索输入
  onSearchInput(e) {
    const searchQuery = e.detail.value
    this.setData({ searchQuery })
    this.filterMemories()
  },
  
  // 过滤记忆
  filterMemories() {
    const { searchQuery, memories } = this.data
    
    if (!searchQuery.trim()) {
      this.loadData()
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