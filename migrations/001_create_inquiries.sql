CREATE TABLE inquiries (
  id SERIAL PRIMARY KEY,
  name TEXT,
  phone TEXT,
  lesson_type TEXT,
  message TEXT,
  referrer TEXT,
  utm_source TEXT,
  status TEXT DEFAULT '신규',
  created_at TIMESTAMP DEFAULT NOW()
);
