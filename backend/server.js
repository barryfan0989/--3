const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 記憶體暫存（無資料庫時使用）
const memoryUsers = [];
const memoryStrategies = [];
let userIdCounter = 1;
let strategyIdCounter = 1;
let dbConnected = false;

// 測試資料庫連線
db.getConnection()
  .then(connection => {
    dbConnected = true;
    console.log('資料庫連線成功，使用 MySQL');
    connection.release();
  })
  .catch(err => {
    console.log('資料庫連線失敗，使用記憶體暫存模式');
  });

// 中介軟體
app.use(cors());
app.use(express.json());

// 1. 使用者註冊
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (dbConnected) {
      // 使用資料庫
      const [existingUsers] = await db.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ message: '使用者名稱已存在' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await db.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword]
      );
    } else {
      // 使用記憶體
      const existingUser = memoryUsers.find(u => u.username === username);
      if (existingUser) {
        return res.status(400).json({ message: '使用者名稱已存在' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      memoryUsers.push({
        id: userIdCounter++,
        username,
        password: hashedPassword
      });
    }

    res.json({ message: 'Register success' });
  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({ message: '註冊失敗' });
  }
});

// 2. 使用者登入
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    let user = null;

    if (dbConnected) {
      // 使用資料庫
      const [users] = await db.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );

      if (users.length === 0) {
        return res.status(401).json({ message: '帳號或密碼錯誤' });
      }
      user = users[0];
    } else {
      // 使用記憶體
      user = memoryUsers.find(u => u.username === username);
      if (!user) {
        return res.status(401).json({ message: '帳號或密碼錯誤' });
      }
    }

    // 驗證密碼
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: '帳號或密碼錯誤' });
    }

    res.json({
      message: 'Login success',
      user_id: user.id
    });
  } catch (error) {
    console.error('登入錯誤:', error);
    res.status(500).json({ message: '登入失敗' });
  }
});

// 3. 使用者登出
app.post('/logout', (req, res) => {
  res.json({ message: 'Logout success' });
});

// 4. 搶票成功率模擬
app.post('/simulate', async (req, res) => {
  try {
    const { platform, entry_time, ticket_type, network, user_id } = req.body;

    // 計算成功率規則
    const platformScores = {
      'ibon': 1.0,
      'KKTIX': 0.8,
      '拓元': 0.7
    };

    const entryTimeScores = {
      'early': 1.0,
      'ontime': 0.8,
      'late': 0.6
    };

    const ticketTypeScores = {
      '3800': 1.0,
      '4800': 0.8,
      '6800': 0.6
    };

    const networkScores = {
      'fast': 1.0,
      'normal': 0.8,
      'slow': 0.6
    };

    // 計算成功率
    const platformScore = (platformScores[platform] || 0) * 30;
    const entryTimeScore = (entryTimeScores[entry_time] || 0) * 25;
    const ticketTypeScore = (ticketTypeScores[ticket_type] || 0) * 25;
    const networkScore = (networkScores[network] || 0) * 20;

    const success_rate = Math.round(platformScore + entryTimeScore + ticketTypeScore + networkScore);

    // 生成建議
    let suggestion = '';
    if (success_rate >= 80) {
      suggestion = '您的設定非常好！繼續保持！';
    } else if (success_rate >= 60) {
      if (ticketTypeScore < 25) {
        suggestion = '建議改搶 3800 區';
      } else if (platformScore < 30) {
        suggestion = '建議改用 ibon 平台';
      } else if (networkScore < 20) {
        suggestion = '建議改用更快的網路';
      } else {
        suggestion = '建議提早進場';
      }
    } else {
      suggestion = '建議改搶 3800 區並提早進場，使用快速網路';
    }

    // 儲存到資料庫或記憶體
    if (dbConnected) {
      await db.query(
        'INSERT INTO strategies (user_id, platform, entry_time, ticket_type, network, success_rate, suggestion) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user_id, platform, entry_time, ticket_type, network, success_rate, suggestion]
      );
    } else {
      memoryStrategies.push({
        id: strategyIdCounter++,
        user_id,
        platform,
        entry_time,
        ticket_type,
        network,
        success_rate,
        suggestion,
        created_at: new Date()
      });
    }

    res.json({
      success_rate,
      suggestion
    });
  } catch (error) {
    console.error('模擬錯誤:', error);
    res.status(500).json({ message: '模擬失敗' });
  }
});

// 5. 查看歷史紀錄
app.get('/history', async (req, res) => {
  try {
    const { user_id } = req.query;

    let records = [];

    if (dbConnected) {
      const [dbRecords] = await db.query(
        'SELECT * FROM strategies WHERE user_id = ? ORDER BY created_at DESC',
        [user_id]
      );
      records = dbRecords;
    } else {
      records = memoryStrategies
        .filter(s => s.user_id == user_id)
        .sort((a, b) => b.created_at - a.created_at);
    }

    res.json(records);
  } catch (error) {
    console.error('查詢歷史紀錄錯誤:', error);
    res.status(500).json({ message: '查詢失敗' });
  }
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`伺服器運行於 http://localhost:${PORT}`);
});
