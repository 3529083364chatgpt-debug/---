# 室友专属赛博回忆录

一个用于记录宿舍和室友回忆的线上纪念簿应用，支持多人实时共享数据。

## 功能特性

### 核心功能（P0）
- **记忆素材录入**：支持照片、聊天记录、文字故事三种类型
- **时间线首页**：按时间倒序展示所有回忆
- **三大内容分类**：照片专区、聊天记录专区、文字故事专区
- **分享功能**：生成分享链接，支持整本回忆录或单条记忆分享

### 增强功能（P1）
- **人物标签与归属**：给每条记忆打上室友标签，可按人物筛选
- **留言互动**：室友可在任意一条记忆下留言评论
- **那年今日**：自动聚合一年/多年前的今天的回忆
- **搜索与多维筛选**：按关键词、日期范围、人物、情绪标签筛选
- **情绪标签**：支持开心、感动、搞笑、怀念、温暖五种情绪

### 多人共享功能
- **实时数据同步**：所有用户看到同一份数据
- **用户认证**：邮箱注册登录，确保数据安全
- **权限控制**：只能编辑自己创建的内容
- **创建者标识**：每条回忆显示创建者信息

### 设计风格
- 温柔治愈、简约干净、青春校园氛围感
- 暖色调为主（暖白底 #FAF7F2、暖橘强调 #E89B6C、薄荷绿 #7BA69C）
- 移动端优先响应式设计
- 圆角、留白与暖色设计

## 快速开始

### 1. 配置 Firebase（必需）

本应用使用 Firebase Realtime Database 实现多人数据共享。请按以下步骤配置：

#### 步骤一：创建 Firebase 项目
1. 访问 [Firebase 控制台](https://console.firebase.google.com/)
2. 点击"添加项目"创建新项目
3. 输入项目名称（如"室友回忆录"）
4. 选择是否启用 Google Analytics（可选）

#### 步骤二：启用 Realtime Database
1. 在 Firebase 控制台，点击左侧菜单"Realtime Database"
2. 点击"创建数据库"
3. 选择数据库位置（建议选择离用户最近的区域）
4. 选择安全规则模式：
   - **测试模式**：方便开发调试，但任何人都可读写
   - **生产模式**：需要配置安全规则

#### 步骤三：启用 Authentication
1. 在 Firebase 控制台，点击左侧菜单"Authentication"
2. 点击"开始使用"
3. 在"登录方法"中启用"邮箱/密码"

#### 步骤四：获取配置信息
1. 在 Firebase 控制台，点击左侧菜单"项目设置"（齿轮图标）
2. 滚动到"您的应用"部分，点击"</>"图标添加 Web 应用
3. 输入应用名称，点击"注册应用"
4. 复制生成的配置信息

#### 步骤五：更新配置文件
编辑 `firebase-config.js` 文件，替换以下配置：

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 2. 配置安全规则（重要）

在 Firebase 控制台的 Realtime Database 规则中，设置以下安全规则：

```json
{
  "rules": {
    "memories": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$memoryId": {
        ".validate": "newData.hasChildren(['title', 'date', 'type'])"
      }
    },
    "comments": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### 3. 部署应用

#### 本地运行
1. 下载或克隆本项目
2. 配置好 `firebase-config.js`
3. 使用本地服务器运行（如 VS Code 的 Live Server）
4. 直接打开 `index.html` 可能因 CORS 策略导致 Firebase 加载失败

#### 部署到 GitHub Pages
1. 将所有文件上传到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 访问部署后的 URL 即可使用

#### 部署到其他平台
- **Netlify**：拖拽文件夹即可部署
- **Vercel**：连接 GitHub 仓库自动部署
- **Firebase Hosting**：使用 `firebase deploy` 命令

## 文件结构

```
roommate-memory/
├── index.html            # 主页面
├── styles.css            # 样式文件
├── app.js                # 主应用逻辑（Firebase 版本）
├── firebase-config.js    # Firebase 配置文件（需要用户配置）
├── app-localstorage.js   # 本地存储版本（备份）
└── README.md             # 说明文档
```

## 数据存储

### Firebase Realtime Database
- **memories**：存储所有回忆数据
- **comments**：存储留言数据
- 数据实时同步，所有用户看到相同内容
- 需要用户登录后才能访问

### 数据结构示例

```javascript
// memories 节点
{
  "memory_id_1": {
    "id": "memory_id_1",
    "type": "photo",
    "title": "宿舍第一张合照",
    "date": "2024-09-01T10:00:00.000Z",
    "description": "开学第一天的合照",
    "images": ["base64_encoded_image"],
    "persons": ["小明", "阿杰"],
    "mood": "warm",
    "createdBy": "user@example.com",
    "createdAt": "2024-09-01T10:00:00.000Z"
  }
}

// comments 节点
{
  "memory_id_1": {
    "comment_id_1": {
      "id": "comment_id_1",
      "author": "小明",
      "content": "这张照片真好看！",
      "time": "2024-09-02T10:00:00.000Z",
      "createdBy": "xiaoming@example.com"
    }
  }
}
```

## 使用指南

### 注册与登录
1. 首次访问需要注册账号
2. 所有室友使用**同一账号**登录即可共享数据
3. 建议使用一个公共邮箱注册，方便所有人使用

### 添加回忆
1. 登录后点击右下角的 "+" 按钮
2. 选择回忆类型（照片、聊天、故事）
3. 填写相关信息并保存
4. 保存后所有登录的用户都能看到

### 浏览回忆
- **时间线视图**：默认按时间倒序展示所有回忆
- **分类浏览**：点击顶部标签切换照片、聊天、故事专区
- **搜索筛选**：使用搜索框或筛选面板快速定位回忆

### 那年今日
- 首页顶部会自动展示历史上的今天的回忆
- 点击卡片可查看详细内容

### 留言互动
- 打开任意回忆详情页
- 在底部留言区输入内容并发送
- 所有用户都能看到留言

### 分享回忆
- 点击导航栏的分享按钮
- 选择分享整本回忆录或单条回忆
- 复制链接发送给室友
- 访问者需要登录才能查看内容

## 技术实现

- **前端**：纯 HTML + CSS + JavaScript，无框架依赖
- **后端**：Firebase Realtime Database
- **认证**：Firebase Authentication（邮箱/密码）
- **响应式**：CSS Media Queries 实现移动端适配
- **图标**：Font Awesome 图标库

## 浏览器兼容性

支持所有现代浏览器：
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 注意事项

1. **Firebase 免费额度**：Spark 计划（免费）每月限制：
   - 1 GB 数据库存储
   - 10 GB/月下载量
   - 10 万次/月数据库读取
   - 5 万次/月数据库写入
   - 对于小型项目足够使用

2. **图片存储**：图片会转换为 Base64 格式直接存储在数据库中
   - 建议压缩图片后再上传
   - 单张图片建议不超过 500KB
   - 大量图片可能影响加载速度

3. **数据备份**：建议定期在 Firebase 控制台导出数据备份

4. **安全建议**：
   - 不要将 Firebase 配置文件提交到公开仓库
   - 配置合适的数据库安全规则
   - 定期检查用户访问权限

## 常见问题

### Q: 为什么需要登录才能使用？
A: 为了实现多人数据共享，需要用户认证来管理权限和数据归属。

### Q: 多个室友应该用同一个账号吗？
A: 是的，建议所有室友使用同一个账号登录，这样大家看到的数据完全一致。

### Q: 可以不使用 Firebase 吗？
A: 可以，使用 `app-localstorage.js` 替换 `app.js`，但这样每个人只能看到自己的数据。

### Q: 如何限制只有特定用户能访问？
A: 在 Firebase 控制台配置安全规则，或使用 Firebase 的用户管理功能添加白名单。

### Q: 数据会被其他人看到吗？
A: 只有知道账号密码的人才能访问。建议不要公开分享账号信息。

## 本地存储版本

如果不需要多人共享功能，可以使用本地存储版本：

1. 在 `index.html` 中，将 `<script src="app.js"></script>` 改为 `<script src="app-localstorage.js"></script>`
2. 删除或注释掉 Firebase 相关的 `<script>` 标签
3. 数据将存储在浏览器本地，每人独立

## 未来迭代方向

### P2 功能（可选）
- 背景音乐与短视频
- 纪念日提醒
- 统计看板
- 地点标记与地图
- 导出备份与回收站
- 主题切换

## 许可证

本项目采用 MIT 许可证。

## 致谢

感谢所有室友一起创造的美好回忆！

---

> 愿每一段宿舍时光，都被温柔记住。
