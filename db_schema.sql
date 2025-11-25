-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Reset: Drop existing tables if they exist to avoid conflicts
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS books;

-- 2. Create Books Table
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    "pageCount" INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Available',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create News Table
CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    excerpt TEXT,
    "imageUrl" TEXT,
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Requests Table
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "bookId" UUID references books(id),
    "bookTitle" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "dateRequested" TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CRITICAL: Disable Row Level Security (RLS)
-- This allows the app to Read/Write without setting up complex Auth policies for this demo.
ALTER TABLE books DISABLE ROW LEVEL SECURITY;
ALTER TABLE news DISABLE ROW LEVEL SECURITY;
ALTER TABLE requests DISABLE ROW LEVEL SECURITY;