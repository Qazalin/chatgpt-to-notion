CREATE TABLE notion_recorded_chats (
  id int AUTO_INCREMENT PRIMARY KEY,
  notion_page_id varchar(255) NOT NULL,
  openai_id varchar(255) NOT NULL,
  last_msg text
);
