USE studyflow;
CREATE TABLE IF NOT EXISTS quiz_questions (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id     INT NOT NULL,
    question    TEXT NOT NULL,
    option_a    VARCHAR(300) NOT NULL,
    option_b    VARCHAR(300) NOT NULL,
    option_c    VARCHAR(300) NOT NULL,
    option_d    VARCHAR(300) NOT NULL,
    correct_ans ENUM('A','B','C','D') NOT NULL DEFAULT 'A',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES global_quizzes(id) ON DELETE CASCADE
);