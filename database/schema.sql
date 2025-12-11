create database task_db;
use task_db;

CREATE TABLE IF NOT EXISTS statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (status_id) REFERENCES statuses(id)
);

-- Seed data (Dữ liệu mẫu)
INSERT IGNORE INTO statuses (id, name, description) VALUES 
(1, 'In Progress', 'Đang thực hiện'),
(2, 'Completed', 'Đã hoàn thành'),
(3, 'Failed', 'Thất bại');

INSERT IGNORE INTO tasks (title, description, status_id) VALUES 
('Học Docker', 'Tìm hiểu container và image', 1),
('Nộp báo cáo', 'Nộp bài Cloud Computing', 1);