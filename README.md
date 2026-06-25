# ---
区别于普通仅存放图片的电子相册，本产品打造一个 长期记录宿舍、室友全部回忆的线上纪念簿，永久留存和室友相关的全部记忆内容，作为长久纪念载体。 核心价值主张 • 纪念感：不是工具，而是一份会生长的回忆载体，越翻越有温度。 • 完整性：图片、聊天、文字故事全类型收录，不遗漏任何一种记忆形态。 • 共享性：室友可共同浏览、共同补充，让回忆属于每一个人。 • 陪伴感：通过「那年今日」等轻互动，让回忆在未来的某天主动回来找你。

## 在线访问

**直接访问应用**：https://3529083364chatgpt-debug.github.io/---/

> ⚠️ **重要提示**：首次访问需要配置 Firebase 才能正常使用多人共享功能。请参考下方配置指南。

## 多人共享功能

本应用支持 **多人实时数据共享**，所有室友可以看到同一份回忆录：

- **实时同步**：添加的回忆会立即同步给所有登录用户
- **用户认证**：使用邮箱密码登录，确保数据安全
- **权限控制**：只能编辑自己创建的内容
- **创建者标识**：每条回忆显示创建者信息

## Firebase 配置指南

要启用多人共享功能，需要配置 Firebase：

### 1. 创建 Firebase 项目
1. 访问 [Firebase 控制台](https://console.firebase.google.com/)
2. 创建新项目，启用 **Realtime Database** 和 **Authentication**

### 2. 配置安全规则
在 Firebase 控制台设置数据库规则：
```json
{
  "rules": {
    "memories": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "comments": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### 3. 更新配置文件
编辑 `firebase-config.js`，填入您的 Firebase 配置：
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

### 4. 使用方式
1. 所有室友使用 **同一账号** 登录（建议创建公共邮箱）
2. 登录后即可看到共享数据
3. 添加的回忆会实时同步给所有登录用户

## 项目结构

- `roommate-memory-PRD/` - 产品需求文档
- `roommate-memory-app/` - 完整HTML应用源码
- `docs/` - GitHub Pages 部署目录
- `firebase-config.js` - Firebase 配置文件
- `app-localstorage.js` - 本地存储版本（无需配置）

## 快速开始

### 方案一：多人共享版本（推荐）
1. 配置 Firebase（参考上方指南）
2. 访问在线链接：https://3529083364chatgpt-debug.github.io/---/
3. 注册账号并登录
4. 邀请室友使用同一账号登录

### 方案二：本地存储版本
1. 下载 `roommate-memory-app` 目录中的文件
2. 将 `app-localstorage.js` 重命名为 `app.js`
3. 用浏览器打开 `index.html`
4. 数据存储在本地浏览器中，每人独立

## 功能特性

- **时间线首页**：按时间倒序展示回忆
- **三大内容分类**：照片、聊天记录、文字故事
- **记忆素材录入**：支持多媒体、对话、纯文字
- **分享功能**：生成分享链接
- **人物标签与归属**：给记忆打上室友标签
- **留言互动**：记忆下留言评论
- **那年今日**：展示历史上的今天
- **搜索与多维筛选**：多维度筛选功能
- **多人实时共享**：所有用户看到同一份数据

## 技术架构

- **前端**：HTML + CSS + JavaScript（无框架）
- **后端**：Firebase Realtime Database
- **认证**：Firebase Authentication
- **部署**：GitHub Pages

## 注意事项

1. **Firebase 免费额度**：Spark 计划每月限制 1GB 存储、10GB 下载量
2. **图片存储**：建议压缩图片后再上传，单张不超过 500KB
3. **数据安全**：配置合适的安全规则，定期备份数据
4. **账号管理**：建议使用公共邮箱，方便所有室友使用

## 许可证

本项目采用 MIT 许可证。

## 致谢

感谢所有室友一起创造的美好回忆！

---

> 愿每一段宿舍时光，都被温柔记住。
