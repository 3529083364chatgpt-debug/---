// ===== 数据存储 =====
const STORAGE_KEY = 'roommate-memory-data';
const COMMENTS_KEY = 'roommate-memory-comments';

// 初始化数据
let memories = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let comments = JSON.parse(localStorage.getItem(COMMENTS_KEY)) || {};

// ===== 工具函数 =====
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;
  return formatDate(dateString);
}

function getMonthYear(dateString) {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  toastMessage.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
}

function getMoodEmoji(mood) {
  const moods = {
    happy: '😊',
    touched: '🥺',
    funny: '😂',
    miss: '😢',
    warm: '🥰'
  };
  return moods[mood] || '';
}

function getMoodText(mood) {
  const moods = {
    happy: '开心',
    touched: '感动',
    funny: '搞笑',
    miss: '怀念',
    warm: '温暖'
  };
  return moods[mood] || '';
}

function getTypeIcon(type) {
  const icons = {
    photo: 'fa-image',
    chat: 'fa-comments',
    story: 'fa-book'
  };
  return icons[type] || 'fa-book';
}

function getTypeText(type) {
  const texts = {
    photo: '照片',
    chat: '聊天',
    story: '故事'
  };
  return texts[type] || '';
}

// ===== 那年今日功能 =====
function getOnThisDayMemories() {
  const today = new Date();
  const month = today.getMonth();
  const day = today.getDate();
  
  return memories.filter(memory => {
    const memoryDate = new Date(memory.date);
    return memoryDate.getMonth() === month && memoryDate.getDate() === day;
  });
}

function renderOnThisDay() {
  const container = document.getElementById('onThisDayContent');
  const onThisDayMemories = getOnThisDayMemories();
  
  if (onThisDayMemories.length === 0) {
    container.innerHTML = `
      <div class="empty-on-this-day">
        <p>今天还没有历史回忆，继续创造美好回忆吧！</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = onThisDayMemories.map(memory => {
    const year = new Date(memory.date).getFullYear();
    const preview = memory.type === 'story' 
      ? memory.content?.substring(0, 50) + '...'
      : memory.description?.substring(0, 50) + '...';
    
    return `
      <div class="on-this-day-card" data-id="${memory.id}">
        <div class="year">${year}年</div>
        <div class="title">${memory.title}</div>
        <div class="preview">${preview || '暂无预览'}</div>
      </div>
    `;
  }).join('');
  
  // 添加点击事件
  container.querySelectorAll('.on-this-day-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      showMemoryDetail(id);
    });
  });
}

// ===== 时间线渲染 =====
function renderTimeline(filteredMemories = null) {
  const timeline = document.getElementById('timeline');
  const emptyState = document.getElementById('emptyState');
  const data = filteredMemories || memories;
  
  if (data.length === 0) {
    timeline.innerHTML = '';
    emptyState.classList.add('show');
    return;
  }
  
  emptyState.classList.remove('show');
  
  // 按月份分组
  const grouped = {};
  data.forEach(memory => {
    const monthYear = getMonthYear(memory.date);
    if (!grouped[monthYear]) {
      grouped[monthYear] = [];
    }
    grouped[monthYear].push(memory);
  });
  
  // 按时间倒序排列
  const sortedMonths = Object.keys(grouped).sort((a, b) => {
    return new Date(b) - new Date(a);
  });
  
  timeline.innerHTML = sortedMonths.map(month => {
    const memoriesInMonth = grouped[month].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return `
      <div class="timeline-group">
        <div class="timeline-date">${month}</div>
        <div class="memory-cards">
          ${memoriesInMonth.map(memory => renderMemoryCard(memory)).join('')}
        </div>
      </div>
    `;
  }).join('');
  
  // 添加点击事件
  timeline.querySelectorAll('.memory-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      showMemoryDetail(id);
    });
  });
}

function renderMemoryCard(memory) {
  const typeIcon = getTypeIcon(memory.type);
  const time = formatRelativeTime(memory.date);
  
  let preview = '';
  if (memory.type === 'photo') {
    preview = memory.description || '';
  } else if (memory.type === 'chat') {
    preview = memory.messages ? memory.messages[0]?.content : memory.description;
  } else {
    preview = memory.content?.substring(0, 100) + '...';
  }
  
  let imagesHtml = '';
  if (memory.type === 'photo' && memory.images && memory.images.length > 0) {
    const displayImages = memory.images.slice(0, 3);
    imagesHtml = `
      <div class="memory-card-images">
        ${displayImages.map(img => `<img src="${img}" alt="照片">`).join('')}
        ${memory.images.length > 3 ? `<div class="more-images">+${memory.images.length - 3}</div>` : ''}
      </div>
    `;
  }
  
  let chatPreview = '';
  if (memory.type === 'chat' && memory.messages && memory.messages.length > 0) {
    chatPreview = `
      <div class="chat-messages-preview">
        ${memory.messages.slice(0, 2).map(msg => `
          <div class="chat-msg">
            <div class="chat-msg-avatar">${msg.speaker.charAt(0)}</div>
            <div class="chat-msg-content">
              <div class="chat-msg-name">${msg.speaker}</div>
              <div class="chat-msg-bubble">${msg.content}</div>
            </div>
          </div>
        `).join('')}
        ${memory.messages.length > 2 ? `<div class="more-messages">还有 ${memory.messages.length - 2} 条消息</div>` : ''}
      </div>
    `;
  }
  
  const tagsHtml = `
    <div class="memory-card-tags">
      ${memory.persons?.map(person => `<span class="tag tag-person">${person}</span>`).join('') || ''}
      ${memory.mood ? `<span class="tag tag-mood">${getMoodEmoji(memory.mood)} ${getMoodText(memory.mood)}</span>` : ''}
    </div>
  `;
  
  const commentsCount = comments[memory.id]?.length || 0;
  
  return `
    <div class="memory-card" data-id="${memory.id}">
      <div class="memory-card-header">
        <div class="memory-card-type ${memory.type}">
          <i class="fas ${typeIcon}"></i>
        </div>
        <div class="memory-card-title">${memory.title}</div>
        <div class="memory-card-time">${time}</div>
      </div>
      <div class="memory-card-body">
        ${preview ? `<div class="memory-card-preview">${preview}</div>` : ''}
        ${imagesHtml}
        ${chatPreview}
      </div>
      <div class="memory-card-footer">
        ${tagsHtml}
        <div class="memory-card-stats">
          <span><i class="fas fa-comment"></i> ${commentsCount}</span>
        </div>
      </div>
    </div>
  `;
}

// ===== 分类筛选 =====
function filterByCategory(category) {
  if (category === 'all') {
    renderTimeline();
    return;
  }
  
  const filtered = memories.filter(memory => memory.type === category);
  renderTimeline(filtered);
}

// ===== 搜索功能 =====
function searchMemories(query) {
  if (!query.trim()) {
    renderTimeline();
    return;
  }
  
  const lowerQuery = query.toLowerCase();
  const filtered = memories.filter(memory => {
    const titleMatch = memory.title.toLowerCase().includes(lowerQuery);
    const descMatch = memory.description?.toLowerCase().includes(lowerQuery);
    const contentMatch = memory.content?.toLowerCase().includes(lowerQuery);
    const personMatch = memory.persons?.some(p => p.toLowerCase().includes(lowerQuery));
    
    return titleMatch || descMatch || contentMatch || personMatch;
  });
  
  renderTimeline(filtered);
}

// ===== 详情展示 =====
function showMemoryDetail(id) {
  const memory = memories.find(m => m.id === id);
  if (!memory) return;
  
  const modal = document.getElementById('detailModal');
  const title = document.getElementById('detailTitle');
  const content = document.getElementById('detailContent');
  
  title.textContent = memory.title;
  
  let detailHtml = `
    <div class="detail-meta">
      <span class="time">${formatDate(memory.date)}</span>
      <div class="tags">
        ${memory.persons?.map(person => `<span class="tag tag-person">${person}</span>`).join('') || ''}
        ${memory.mood ? `<span class="tag tag-mood">${getMoodEmoji(memory.mood)} ${getMoodText(memory.mood)}</span>` : ''}
      </div>
    </div>
  `;
  
  if (memory.type === 'photo' && memory.images && memory.images.length > 0) {
    detailHtml += `
      <div class="detail-images">
        ${memory.images.map(img => `<img src="${img}" alt="照片" onclick="window.open('${img}', '_blank')">`).join('')}
      </div>
    `;
  }
  
  if (memory.type === 'chat' && memory.messages && memory.messages.length > 0) {
    detailHtml += `
      <div class="detail-chat">
        ${memory.messages.map(msg => `
          <div class="chat-msg">
            <div class="chat-msg-avatar">${msg.speaker.charAt(0)}</div>
            <div class="chat-msg-content">
              <div class="chat-msg-name">${msg.speaker}</div>
              <div class="chat-msg-bubble">${msg.content}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  if (memory.description) {
    detailHtml += `<div class="detail-text">${memory.description}</div>`;
  }
  
  if (memory.type === 'story' && memory.content) {
    detailHtml += `<div class="detail-text">${memory.content}</div>`;
  }
  
  content.innerHTML = detailHtml;
  
  // 渲染留言
  renderComments(id);
  
  // 存储当前查看的记忆ID
  modal.dataset.memoryId = id;
  
  modal.classList.add('show');
}

function renderComments(memoryId) {
  const commentsList = document.getElementById('commentsList');
  const memoryComments = comments[memoryId] || [];
  
  if (memoryComments.length === 0) {
    commentsList.innerHTML = '<p style="color: var(--muted); font-size: 14px;">还没有留言，来留下第一条吧！</p>';
    return;
  }
  
  commentsList.innerHTML = memoryComments.map(comment => `
    <div class="comment-item">
      <div class="comment-avatar">${comment.author.charAt(0)}</div>
      <div class="comment-content">
        <div class="comment-header">
          <span class="comment-name">${comment.author}</span>
          <span class="comment-time">${formatRelativeTime(comment.time)}</span>
        </div>
        <div class="comment-text">${comment.content}</div>
      </div>
    </div>
  `).join('');
}

function addComment(memoryId, content) {
  if (!comments[memoryId]) {
    comments[memoryId] = [];
  }
  
  comments[memoryId].push({
    id: generateId(),
    author: '我',
    content: content,
    time: new Date().toISOString()
  });
  
  saveData();
  renderComments(memoryId);
  showToast('留言成功！');
}

// ===== 录入功能 =====
let currentType = '';
let currentImages = [];
let currentChatMessages = [];
let currentTags = [];
let currentMood = '';

function openAddModal(type = '') {
  const modal = document.getElementById('addModal');
  const typeSelector = document.getElementById('typeSelector');
  const forms = document.querySelectorAll('.memory-form');
  
  // 重置表单
  forms.forEach(form => form.reset());
  forms.forEach(form => form.style.display = 'none');
  
  currentImages = [];
  currentChatMessages = [];
  currentTags = [];
  currentMood = '';
  
  // 清空预览
  document.querySelectorAll('.photo-preview').forEach(el => el.innerHTML = '');
  document.querySelectorAll('.tags-list').forEach(el => el.innerHTML = '');
  document.querySelectorAll('.mood-btn').forEach(el => el.classList.remove('active'));
  
  if (type) {
    // 直接打开对应表单
    typeSelector.style.display = 'none';
    showForm(type);
  } else {
    // 显示类型选择
    typeSelector.style.display = 'grid';
  }
  
  modal.classList.add('show');
}

function showForm(type) {
  currentType = type;
  const forms = {
    photo: document.getElementById('photoForm'),
    chat: document.getElementById('chatForm'),
    story: document.getElementById('storyForm')
  };
  
  // 隐藏所有表单
  Object.values(forms).forEach(form => form.style.display = 'none');
  
  // 显示对应表单
  if (forms[type]) {
    forms[type].style.display = 'flex';
    
    // 设置默认时间
    const dateInput = forms[type].querySelector('input[type="datetime-local"]');
    if (dateInput) {
      const now = new Date();
      const offset = now.getTimezoneOffset();
      const localDate = new Date(now.getTime() - offset * 60 * 1000);
      dateInput.value = localDate.toISOString().slice(0, 16);
    }
    
    // 初始化聊天发言人列表
    if (type === 'chat') {
      updateSpeakerSelect();
    }
  }
}

function updateSpeakerSelect() {
  const select = document.getElementById('chatSpeaker');
  const persons = new Set();
  
  memories.forEach(memory => {
    memory.persons?.forEach(p => persons.add(p));
  });
  
  select.innerHTML = '<option value="">选择发言人</option>' +
    Array.from(persons).map(p => `<option value="${p}">${p}</option>`).join('') +
    '<option value="custom">自定义...</option>';
}

function addTag(containerId, tag) {
  const container = document.getElementById(containerId);
  if (!tag.trim() || currentTags.includes(tag.trim())) return;
  
  currentTags.push(tag.trim());
  
  const tagElement = document.createElement('div');
  tagElement.className = 'tag-item';
  tagElement.innerHTML = `
    ${tag.trim()}
    <button class="remove-tag" onclick="removeTag('${containerId}', '${tag.trim()}')">×</button>
  `;
  container.appendChild(tagElement);
}

function removeTag(containerId, tag) {
  currentTags = currentTags.filter(t => t !== tag);
  const container = document.getElementById(containerId);
  const tagElements = container.querySelectorAll('.tag-item');
  tagElements.forEach(el => {
    if (el.textContent.trim().replace('×', '').trim() === tag) {
      el.remove();
    }
  });
}

function setMood(mood, formType) {
  currentMood = mood;
  const forms = ['photoForm', 'chatForm', 'storyForm'];
  
  forms.forEach(form => {
    const buttons = document.getElementById(form).querySelectorAll('.mood-btn');
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mood === mood);
    });
  });
}

function handlePhotoUpload(input, previewId) {
  const files = input.files;
  const preview = document.getElementById(previewId);
  
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      currentImages.push(imageUrl);
      
      const previewItem = document.createElement('div');
      previewItem.className = 'photo-preview-item';
      previewItem.innerHTML = `
        <img src="${imageUrl}" alt="预览">
        <button class="remove-btn" onclick="removePhoto('${previewId}', ${currentImages.length - 1})">×</button>
      `;
      preview.appendChild(previewItem);
    };
    reader.readAsDataURL(file);
  });
}

function removePhoto(previewId, index) {
  currentImages.splice(index, 1);
  const preview = document.getElementById(previewId);
  preview.innerHTML = '';
  
  currentImages.forEach((img, i) => {
    const previewItem = document.createElement('div');
    previewItem.className = 'photo-preview-item';
    previewItem.innerHTML = `
      <img src="${img}" alt="预览">
      <button class="remove-btn" onclick="removePhoto('${previewId}', ${i})">×</button>
    `;
    preview.appendChild(previewItem);
  });
}

function addChatMessage() {
  const speakerSelect = document.getElementById('chatSpeaker');
  const contentInput = document.getElementById('chatContent');
  
  let speaker = speakerSelect.value;
  const content = contentInput.value.trim();
  
  if (speaker === 'custom') {
    speaker = prompt('请输入发言人名字：');
    if (!speaker) return;
  }
  
  if (!speaker || !content) {
    showToast('请选择发言人并输入消息内容');
    return;
  }
  
  currentChatMessages.push({ speaker, content });
  
  const messagesContainer = document.getElementById('chatMessages');
  const messageItem = document.createElement('div');
  messageItem.className = 'chat-message-item';
  messageItem.innerHTML = `
    <span class="speaker">${speaker}</span>
    <span class="content">${content}</span>
    <button class="remove-msg" onclick="removeChatMessage(${currentChatMessages.length - 1})">×</button>
  `;
  messagesContainer.appendChild(messageItem);
  
  contentInput.value = '';
  contentInput.focus();
}

function removeChatMessage(index) {
  currentChatMessages.splice(index, 1);
  const messagesContainer = document.getElementById('chatMessages');
  messagesContainer.innerHTML = '';
  
  currentChatMessages.forEach((msg, i) => {
    const messageItem = document.createElement('div');
    messageItem.className = 'chat-message-item';
    messageItem.innerHTML = `
      <span class="speaker">${msg.speaker}</span>
      <span class="content">${msg.content}</span>
      <button class="remove-msg" onclick="removeChatMessage(${i})">×</button>
    `;
    messagesContainer.appendChild(messageItem);
  });
}

function saveMemory(type) {
  let memoryData = {
    id: generateId(),
    type: type,
    createdAt: new Date().toISOString()
  };
  
  if (type === 'photo') {
    const title = document.getElementById('photoTitle').value.trim();
    const date = document.getElementById('photoDate').value;
    const description = document.getElementById('photoDesc').value.trim();
    
    if (!title || !date || currentImages.length === 0) {
      showToast('请填写标题、时间并上传照片');
      return false;
    }
    
    Object.assign(memoryData, {
      title,
      date: new Date(date).toISOString(),
      description,
      images: [...currentImages],
      persons: [...currentTags],
      mood: currentMood
    });
  } else if (type === 'chat') {
    const title = document.getElementById('chatTitle').value.trim();
    const date = document.getElementById('chatDate').value;
    const description = document.getElementById('chatDesc').value.trim();
    
    if (!title || !date || (currentChatMessages.length === 0 && currentImages.length === 0)) {
      showToast('请填写标题、时间并添加聊天内容');
      return false;
    }
    
    Object.assign(memoryData, {
      title,
      date: new Date(date).toISOString(),
      description,
      messages: [...currentChatMessages],
      images: [...currentImages],
      persons: [...currentTags],
      mood: currentMood
    });
  } else if (type === 'story') {
    const title = document.getElementById('storyTitle').value.trim();
    const date = document.getElementById('storyDate').value;
    const content = document.getElementById('storyContent').value.trim();
    
    if (!title || !date || !content) {
      showToast('请填写标题、时间和正文内容');
      return false;
    }
    
    Object.assign(memoryData, {
      title,
      date: new Date(date).toISOString(),
      content,
      persons: [...currentTags],
      mood: currentMood
    });
  }
  
  memories.push(memoryData);
  saveData();
  
  return true;
}

function editMemory(id) {
  const memory = memories.find(m => m.id === id);
  if (!memory) return;
  
  // 关闭详情模态框
  document.getElementById('detailModal').classList.remove('show');
  
  // 打开编辑模态框
  openAddModal(memory.type);
  
  // 填充表单数据
  setTimeout(() => {
    if (memory.type === 'photo') {
      document.getElementById('photoTitle').value = memory.title;
      document.getElementById('photoDate').value = new Date(memory.date).toISOString().slice(0, 16);
      document.getElementById('photoDesc').value = memory.description || '';
      document.getElementById('photoEditId').value = memory.id;
      
      currentImages = memory.images || [];
      currentTags = memory.persons || [];
      currentMood = memory.mood || '';
      
      // 渲染图片预览
      const preview = document.getElementById('photoPreview');
      preview.innerHTML = '';
      currentImages.forEach((img, i) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'photo-preview-item';
        previewItem.innerHTML = `
          <img src="${img}" alt="预览">
          <button class="remove-btn" onclick="removePhoto('photoPreview', ${i})">×</button>
        `;
        preview.appendChild(previewItem);
      });
      
      // 渲染标签
      const tagsContainer = document.getElementById('photoPersonTags');
      tagsContainer.innerHTML = '';
      currentTags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-item';
        tagElement.innerHTML = `
          ${tag}
          <button class="remove-tag" onclick="removeTag('photoPersonTags', '${tag}')">×</button>
        `;
        tagsContainer.appendChild(tagElement);
      });
      
      // 设置情绪
      if (currentMood) {
        setMood(currentMood, 'photoForm');
      }
    } else if (memory.type === 'chat') {
      document.getElementById('chatTitle').value = memory.title;
      document.getElementById('chatDate').value = new Date(memory.date).toISOString().slice(0, 16);
      document.getElementById('chatDesc').value = memory.description || '';
      document.getElementById('chatEditId').value = memory.id;
      
      currentChatMessages = memory.messages || [];
      currentImages = memory.images || [];
      currentTags = memory.persons || [];
      currentMood = memory.mood || '';
      
      // 渲染聊天消息
      const messagesContainer = document.getElementById('chatMessages');
      messagesContainer.innerHTML = '';
      currentChatMessages.forEach((msg, i) => {
        const messageItem = document.createElement('div');
        messageItem.className = 'chat-message-item';
        messageItem.innerHTML = `
          <span class="speaker">${msg.speaker}</span>
          <span class="content">${msg.content}</span>
          <button class="remove-msg" onclick="removeChatMessage(${i})">×</button>
        `;
        messagesContainer.appendChild(messageItem);
      });
      
      // 渲染图片预览
      const preview = document.getElementById('chatPreview');
      preview.innerHTML = '';
      currentImages.forEach((img, i) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'photo-preview-item';
        previewItem.innerHTML = `
          <img src="${img}" alt="预览">
          <button class="remove-btn" onclick="removePhoto('chatPreview', ${i})">×</button>
        `;
        preview.appendChild(previewItem);
      });
      
      // 渲染标签
      const tagsContainer = document.getElementById('chatPersonTags');
      tagsContainer.innerHTML = '';
      currentTags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-item';
        tagElement.innerHTML = `
          ${tag}
          <button class="remove-tag" onclick="removeTag('chatPersonTags', '${tag}')">×</button>
        `;
        tagsContainer.appendChild(tagElement);
      });
      
      // 设置情绪
      if (currentMood) {
        setMood(currentMood, 'chatForm');
      }
    } else if (memory.type === 'story') {
      document.getElementById('storyTitle').value = memory.title;
      document.getElementById('storyDate').value = new Date(memory.date).toISOString().slice(0, 16);
      document.getElementById('storyContent').value = memory.content || '';
      document.getElementById('storyEditId').value = memory.id;
      
      currentTags = memory.persons || [];
      currentMood = memory.mood || '';
      
      // 渲染标签
      const tagsContainer = document.getElementById('storyPersonTags');
      tagsContainer.innerHTML = '';
      currentTags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-item';
        tagElement.innerHTML = `
          ${tag}
          <button class="remove-tag" onclick="removeTag('storyPersonTags', '${tag}')">×</button>
        `;
        tagsContainer.appendChild(tagElement);
      });
      
      // 设置情绪
      if (currentMood) {
        setMood(currentMood, 'storyForm');
      }
    }
  }, 100);
}

function deleteMemory(id) {
  if (!confirm('确定要删除这条回忆吗？删除后无法恢复。')) return;
  
  memories = memories.filter(m => m.id !== id);
  delete comments[id];
  saveData();
  
  document.getElementById('detailModal').classList.remove('show');
  renderTimeline();
  renderOnThisDay();
  showToast('回忆已删除');
}

function updatePersonFilters() {
  const container = document.getElementById('personFilters');
  const persons = new Set();
  
  memories.forEach(memory => {
    memory.persons?.forEach(p => persons.add(p));
  });
  
  container.innerHTML = Array.from(persons).map(person => 
    `<button class="filter-btn" data-person="${person}">${person}</button>`
  ).join('');
}

// ===== 分享功能 =====
function openShareModal(memoryId = null) {
  const modal = document.getElementById('shareModal');
  const linkInput = document.getElementById('shareLink');
  
  // 生成分享链接
  const shareUrl = memoryId 
    ? `${window.location.origin}${window.location.pathname}?memory=${memoryId}`
    : `${window.location.origin}${window.location.pathname}`;
  
  linkInput.value = shareUrl;
  
  // 如果是单条分享，选中对应选项
  if (memoryId) {
    document.querySelector('input[name="shareType"][value="single"]').checked = true;
  }
  
  modal.classList.add('show');
}

function copyShareLink() {
  const linkInput = document.getElementById('shareLink');
  linkInput.select();
  document.execCommand('copy');
  showToast('链接已复制到剪贴板！');
}

// ===== 筛选功能 =====
let activeFilters = {
  category: 'all',
  time: 'all',
  person: '',
  mood: ''
};

function applyFilters() {
  let filtered = [...memories];
  
  // 分类筛选
  if (activeFilters.category !== 'all') {
    filtered = filtered.filter(m => m.type === activeFilters.category);
  }
  
  // 时间筛选
  const now = new Date();
  if (activeFilters.time === 'month') {
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
    filtered = filtered.filter(m => new Date(m.date) >= monthAgo);
  } else if (activeFilters.time === 'year') {
    const yearAgo = new Date(now.getFullYear(), 0, 1);
    filtered = filtered.filter(m => new Date(m.date) >= yearAgo);
  }
  
  // 人物筛选
  if (activeFilters.person) {
    filtered = filtered.filter(m => m.persons?.includes(activeFilters.person));
  }
  
  // 情绪筛选
  if (activeFilters.mood) {
    filtered = filtered.filter(m => m.mood === activeFilters.mood);
  }
  
  renderTimeline(filtered);
}

// ===== 事件监听 =====
document.addEventListener('DOMContentLoaded', () => {
  // 初始化
  renderTimeline();
  renderOnThisDay();
  updatePersonFilters();
  
  // 导航栏搜索
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    searchMemories(e.target.value);
  });
  
  // 分类标签页
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilters.category = btn.dataset.category;
      applyFilters();
    });
  });
  
  // 筛选按钮
  document.getElementById('filterBtn').addEventListener('click', () => {
    document.getElementById('filterPanel').classList.toggle('show');
  });
  
  // 时间筛选
  document.querySelectorAll('[data-time]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-time]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilters.time = btn.dataset.time;
      applyFilters();
    });
  });
  
  // 人物筛选
  document.getElementById('personFilters').addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      document.querySelectorAll('#personFilters .filter-btn').forEach(b => b.classList.remove('active'));
      if (activeFilters.person === e.target.dataset.person) {
        activeFilters.person = '';
      } else {
        e.target.classList.add('active');
        activeFilters.person = e.target.dataset.person;
      }
      applyFilters();
    }
  });
  
  // 情绪筛选
  document.querySelectorAll('[data-mood]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-mood]').forEach(b => b.classList.remove('active'));
      if (activeFilters.mood === btn.dataset.mood) {
        activeFilters.mood = '';
      } else {
        btn.classList.add('active');
        activeFilters.mood = btn.dataset.mood;
      }
      applyFilters();
    });
  });
  
  // 添加按钮
  document.getElementById('addBtn').addEventListener('click', () => openAddModal());
  
  // 类型选择
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('typeSelector').style.display = 'none';
      showForm(btn.dataset.type);
    });
  });
  
  // 关闭模态框
  document.getElementById('closeAddModal').addEventListener('click', () => {
    document.getElementById('addModal').classList.remove('show');
  });
  
  document.getElementById('closeDetailModal').addEventListener('click', () => {
    document.getElementById('detailModal').classList.remove('show');
  });
  
  document.getElementById('closeShareModal').addEventListener('click', () => {
    document.getElementById('shareModal').classList.remove('show');
  });
  
  // 点击模态框背景关闭
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });
  });
  
  // 取消按钮
  document.getElementById('cancelPhoto').addEventListener('click', () => {
    document.getElementById('addModal').classList.remove('show');
  });
  
  document.getElementById('cancelChat').addEventListener('click', () => {
    document.getElementById('addModal').classList.remove('show');
  });
  
  document.getElementById('cancelStory').addEventListener('click', () => {
    document.getElementById('addModal').classList.remove('show');
  });
  
  // 图片上传
  document.getElementById('photoUpload').addEventListener('click', () => {
    document.getElementById('photoInput').click();
  });
  
  document.getElementById('photoInput').addEventListener('change', (e) => {
    handlePhotoUpload(e.target, 'photoPreview');
  });
  
  document.getElementById('chatUpload').addEventListener('click', () => {
    document.getElementById('chatInput').click();
  });
  
  document.getElementById('chatInput').addEventListener('change', (e) => {
    handlePhotoUpload(e.target, 'chatPreview');
  });
  
  // 拖拽上传
  ['photoUpload', 'chatUpload'].forEach(id => {
    const uploadArea = document.getElementById(id);
    
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--accent)';
      uploadArea.style.background = 'rgba(232, 155, 108, 0.05)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.borderColor = '';
      uploadArea.style.background = '';
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '';
      uploadArea.style.background = '';
      
      const files = e.dataTransfer.files;
      const previewId = id === 'photoUpload' ? 'photoPreview' : 'chatPreview';
      
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            currentImages.push(event.target.result);
            const preview = document.getElementById(previewId);
            const previewItem = document.createElement('div');
            previewItem.className = 'photo-preview-item';
            previewItem.innerHTML = `
              <img src="${event.target.result}" alt="预览">
              <button class="remove-btn" onclick="removePhoto('${previewId}', ${currentImages.length - 1})">×</button>
            `;
            preview.appendChild(previewItem);
          };
          reader.readAsDataURL(file);
        }
      });
    });
  });
  
  // 标签输入
  ['photoPersonInput', 'chatPersonInput', 'storyPersonInput'].forEach(inputId => {
    const input = document.getElementById(inputId);
    const containerId = inputId.replace('Input', 'Tags');
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTag(containerId, input.value);
        input.value = '';
      }
    });
  });
  
  // 情绪选择
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const form = btn.closest('.memory-form');
      const formType = form.id.replace('Form', '');
      setMood(btn.dataset.mood, formType);
    });
  });
  
  // 聊天消息添加
  document.getElementById('addChatMsg').addEventListener('click', addChatMessage);
  
  document.getElementById('chatContent').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addChatMessage();
    }
  });
  
  // 表单提交
  document.getElementById('photoForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('photoEditId').value;
    
    if (editId) {
      // 编辑模式
      const index = memories.findIndex(m => m.id === editId);
      if (index !== -1) {
        memories[index] = {
          ...memories[index],
          title: document.getElementById('photoTitle').value.trim(),
          date: new Date(document.getElementById('photoDate').value).toISOString(),
          description: document.getElementById('photoDesc').value.trim(),
          images: [...currentImages],
          persons: [...currentTags],
          mood: currentMood
        };
        saveData();
        showToast('回忆已更新！');
      }
    } else {
      // 新增模式
      if (saveMemory('photo')) {
        showToast('回忆已保存！');
      }
    }
    
    document.getElementById('addModal').classList.remove('show');
    renderTimeline();
    renderOnThisDay();
    updatePersonFilters();
  });
  
  document.getElementById('chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('chatEditId').value;
    
    if (editId) {
      const index = memories.findIndex(m => m.id === editId);
      if (index !== -1) {
        memories[index] = {
          ...memories[index],
          title: document.getElementById('chatTitle').value.trim(),
          date: new Date(document.getElementById('chatDate').value).toISOString(),
          description: document.getElementById('chatDesc').value.trim(),
          messages: [...currentChatMessages],
          images: [...currentImages],
          persons: [...currentTags],
          mood: currentMood
        };
        saveData();
        showToast('回忆已更新！');
      }
    } else {
      if (saveMemory('chat')) {
        showToast('回忆已保存！');
      }
    }
    
    document.getElementById('addModal').classList.remove('show');
    renderTimeline();
    renderOnThisDay();
    updatePersonFilters();
  });
  
  document.getElementById('storyForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('storyEditId').value;
    
    if (editId) {
      const index = memories.findIndex(m => m.id === editId);
      if (index !== -1) {
        memories[index] = {
          ...memories[index],
          title: document.getElementById('storyTitle').value.trim(),
          date: new Date(document.getElementById('storyDate').value).toISOString(),
          content: document.getElementById('storyContent').value.trim(),
          persons: [...currentTags],
          mood: currentMood
        };
        saveData();
        showToast('回忆已更新！');
      }
    } else {
      if (saveMemory('story')) {
        showToast('回忆已保存！');
      }
    }
    
    document.getElementById('addModal').classList.remove('show');
    renderTimeline();
    renderOnThisDay();
    updatePersonFilters();
  });
  
  // 详情页操作
  document.getElementById('editMemory').addEventListener('click', () => {
    const memoryId = document.getElementById('detailModal').dataset.memoryId;
    editMemory(memoryId);
  });
  
  document.getElementById('deleteMemory').addEventListener('click', () => {
    const memoryId = document.getElementById('detailModal').dataset.memoryId;
    deleteMemory(memoryId);
  });
  
  document.getElementById('shareMemory').addEventListener('click', () => {
    const memoryId = document.getElementById('detailModal').dataset.memoryId;
    document.getElementById('detailModal').classList.remove('show');
    openShareModal(memoryId);
  });
  
  // 留言
  document.getElementById('addComment').addEventListener('click', () => {
    const memoryId = document.getElementById('detailModal').dataset.memoryId;
    const input = document.getElementById('commentInput');
    const content = input.value.trim();
    
    if (!content) {
      showToast('请输入留言内容');
      return;
    }
    
    addComment(memoryId, content);
    input.value = '';
  });
  
  document.getElementById('commentInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('addComment').click();
    }
  });
  
  // 分享功能
  document.getElementById('shareBtn').addEventListener('click', () => openShareModal());
  
  document.getElementById('copyLink').addEventListener('click', copyShareLink);
  
  document.getElementById('enablePassword').addEventListener('change', (e) => {
    document.getElementById('sharePassword').disabled = !e.target.checked;
    if (!e.target.checked) {
      document.getElementById('sharePassword').value = '';
    }
  });
  
  // 检查URL参数
  const urlParams = new URLSearchParams(window.location.search);
  const memoryId = urlParams.get('memory');
  if (memoryId) {
    showMemoryDetail(memoryId);
  }
});

// ===== 添加示例数据（首次使用） =====
function addSampleData() {
  if (memories.length > 0) return;
  
  const sampleMemories = [
    {
      id: generateId(),
      type: 'photo',
      title: '宿舍第一张合照',
      date: '2024-09-01T10:00:00.000Z',
      description: '开学第一天，我们四个人在宿舍门口的合照。那时候还很拘谨，现在想想真怀念。',
      images: [],
      persons: ['小明', '阿杰', '老王'],
      mood: 'warm',
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      type: 'chat',
      title: '凌晨三点的卧谈会',
      date: '2024-10-15T03:00:00.000Z',
      description: '那晚我们聊到了人生理想，虽然都很困但谁也不想先睡。',
      messages: [
        { speaker: '小明', content: '你们以后想做什么工作啊？' },
        { speaker: '阿杰', content: '我想开一家咖啡店，每天闻着咖啡香醒来' },
        { speaker: '老王', content: '我想当程序员，改变世界！' },
        { speaker: '我', content: '我只想暴富...' }
      ],
      images: [],
      persons: ['小明', '阿杰', '老王'],
      mood: 'happy',
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      type: 'story',
      title: '记一次难忘的生日惊喜',
      date: '2024-11-20T18:00:00.000Z',
      content: '那是我大学过的第一个生日。本来以为会像往年一样平淡度过，没想到室友们偷偷准备了一个大惊喜。\n\n那天我从图书馆回来，一推开门，宿舍漆黑一片。我正想开灯，突然听到"砰"的一声，彩带从天而降，他们三个捧着蛋糕唱着生日歌走出来。\n\n蛋糕上写着"永远的404"，是我们宿舍的门牌号。那一刻我真的哭了，不是因为感动，是因为觉得自己太幸运了，能遇到这么好的室友。\n\n我们吃蛋糕、拍照、玩游戏到凌晨，那是我过得最开心的一个生日。',
      persons: ['小明', '阿杰', '老王'],
      mood: 'touched',
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      type: 'photo',
      title: '期末考前的图书馆突击',
      date: '2025-01-10T09:00:00.000Z',
      description: '期末周我们一起泡图书馆，虽然很累但有彼此陪伴就不觉得辛苦。',
      images: [],
      persons: ['小明', '阿杰'],
      mood: 'funny',
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      type: 'chat',
      title: '外卖点单困难症',
      date: '2025-03-08T12:00:00.000Z',
      description: '每天中午都要经历的灵魂拷问：今天吃什么？',
      messages: [
        { speaker: '阿杰', content: '中午吃什么？' },
        { speaker: '老王', content: '随便' },
        { speaker: '小明', content: '我都行' },
        { speaker: '我', content: '那点外卖吧' },
        { speaker: '阿杰', content: '吃什么？' },
        { speaker: '老王', content: '随便...' }
      ],
      images: [],
      persons: ['小明', '阿杰', '老王'],
      mood: 'funny',
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      type: 'story',
      title: '毕业前的最后一次聚餐',
      date: '2025-06-20T19:00:00.000Z',
      content: '时间过得真快，转眼就要毕业了。今晚是我们宿舍最后一次全员聚餐。\n\n我们选了学校旁边那家去了无数次的烧烤店，点了和往常一样的菜，喝着和往常一样的啤酒，聊着和往常一样的话题。但每个人都知道，这可能是最后一次了。\n\n小明说他要去北京闯荡，阿杰考上了本校的研究生，老王回老家当公务员，而我拿到了深圳的offer。\n\n散场的时候，我们拍了很多照片，说了很多"以后常联系"。虽然不知道这些承诺能不能兑现，但那一刻的真心是真实的。\n\n感谢这四年，感谢遇到你们。',
      persons: ['小明', '阿杰', '老王'],
      mood: 'miss',
      createdAt: new Date().toISOString()
    }
  ];
  
  memories = sampleMemories;
  saveData();
  renderTimeline();
  renderOnThisDay();
  updatePersonFilters();
}

// 页面加载时检查是否需要添加示例数据
addSampleData();
