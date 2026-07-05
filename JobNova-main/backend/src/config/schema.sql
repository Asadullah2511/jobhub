-- JobNova Database Schema for PostgreSQL

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  password_hash VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('blue_collar', 'white_collar', 'employer', 'admin')),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  is_profile_completed BOOLEAN DEFAULT false,
  is_suspended BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  company_name VARCHAR(255),
  bio TEXT,
  location VARCHAR(255),
  experience_years NUMERIC(4,1),
  skills TEXT,
  avg_rating NUMERIC(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  verification_status VARCHAR(50) DEFAULT 'unverified',
  verification_document_url TEXT,
  avatar_url TEXT,
  hourly_rate VARCHAR(50),
  availability VARCHAR(255),
  trade VARCHAR(255),
  role VARCHAR(50),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  employer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('blue', 'white')),
  status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Closed', 'Deleted')),
  location VARCHAR(255),
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  skills TEXT,
  experience_level VARCHAR(50),
  salary VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected', 'Completed', 'In Progress')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, applicant_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  related_id VARCHAR(255),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reported_job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
  reason VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_logs (
  id SERIAL PRIMARY KEY,
  action VARCHAR(255) NOT NULL,
  performed_by VARCHAR(255),
  target_type VARCHAR(255),
  target_id VARCHAR(255),
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  employer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  worker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  location VARCHAR(255) DEFAULT '',
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  offered_rate VARCHAR(50) DEFAULT '',
  status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS international_jobs (
  id SERIAL PRIMARY KEY,
  employer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  country VARCHAR(255) NOT NULL,
  city VARCHAR(255),
  salary VARCHAR(255),
  currency VARCHAR(50) DEFAULT 'USD',
  visa_sponsored BOOLEAN DEFAULT false,
  type VARCHAR(50) NOT NULL,
  requirements TEXT,
  benefits TEXT,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS international_job_applications (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES international_jobs(id) ON DELETE CASCADE,
  applicant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, applicant_id)
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
  employer_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'Unread' CHECK (status IN ('Unread', 'Read', 'Resolved')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scholarships (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  description TEXT,
  deadline DATE,
  application_link TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scholarship_applications (
  id SERIAL PRIMARY KEY,
  scholarship_id INTEGER NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  applicant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(scholarship_id, applicant_id)
);

CREATE TABLE IF NOT EXISTS time_exchanges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_city VARCHAR(255) NOT NULL,
  to_city VARCHAR(255) NOT NULL,
  travel_date_start DATE NOT NULL,
  travel_date_end DATE NOT NULL,
  available_for_work BOOLEAN DEFAULT false,
  skills TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS time_exchange_requests (
  id SERIAL PRIMARY KEY,
  employer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  worker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  time_exchange_id INTEGER NOT NULL REFERENCES time_exchanges(id) ON DELETE CASCADE,
  message TEXT,
  status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
