// pages/category/category.js
const app = getApp()

Page({
  data: {
    memories: [],
    filteredMemories: [],
    activeCategory: 'all',
    timeFilter: 'all',
    moodFilter: '',
    showFilters: false
  },
  
  onLoad() {
    this.loadData()
  },
  
  onShow() {
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
      preview: this.getPreview(memory)
    }))
    
    this.setData({
      memories: processedMemories
    })
    
    this.filterMemories()
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
  
  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      activeCategory: category
    })
    this.filterMemories()
  },
  
  // 设置时间筛选
  setTimeFilter(e) {
    const time = e.currentTarget.dataset.time
    this.setData({
      timeFilter: time
    })
    this.filterMemories()
  },
  
  // 设置情绪筛选
  setMoodFilter(e) {
    const mood = e.currentTarget.dataset.mood
    this.setData({
      moodFilter: mood
    })
    this.filterMemories()
  },
  
  // 切换筛选显示
  toggleFilters() {
    this.setData({
      showFilters: !this.data.showFilters
    })
  },
  
  // 过滤记忆
  filterMemories() {
    const { memories, activeCategory, timeFilter, moodFilter } = this.data
    
    let filtered = [...memories]
    
    // 分类筛选
    if (activeCategory !== 'all') {
      filtered = filtered.filter(m => m.type === activeCategory)
    }
    
    // 时间筛选
    const now = new Date()
    if (timeFilter === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1)
      filtered = filtered.filter(m => new Date(m.date) >= monthAgo)
    } else if (timeFilter === 'year') {
      const yearAgo = new Date(now.getFullYear(), 0, 1)
      filtered = filtered.filter(m => new Date(m.date) >= yearAgo)
    }
    
    // 情绪筛选
    if (moodFilter) {
      filtered = filtered.filter(m => m.mood === moodFilter)
    }
    
    // 按时间倒序排列
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    this.setData({
      filteredMemories: filtered
    })
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