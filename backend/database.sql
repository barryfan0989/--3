-- 建立資料庫
CREATE DATABASE IF NOT EXISTS ticket_simulator CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ticket_simulator;

-- 使用者資料表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 模擬紀錄資料表
CREATE TABLE IF NOT EXISTS strategies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  platform VARCHAR(20) NOT NULL,
  entry_time VARCHAR(20) NOT NULL,
  ticket_type VARCHAR(10) NOT NULL,
  network VARCHAR(10) NOT NULL,
  success_rate INT NOT NULL,
  suggestion VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 建立索引以提升查詢效能
CREATE INDEX idx_user_id ON strategies(user_id);
CREATE INDEX idx_created_at ON strategies(created_at);
