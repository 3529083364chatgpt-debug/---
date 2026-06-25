// Firebase 配置文件
// 请替换为您自己的 Firebase 项目配置

const firebaseConfig = {
  // 从 Firebase 控制台获取以下配置
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);

// 获取数据库引用
const database = firebase.database();
const auth = firebase.auth();

// 数据库路径
const MEMORIES_REF = 'memories';
const COMMENTS_REF = 'comments';

console.log('Firebase 初始化完成');
