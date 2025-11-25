
<file>db_schema.sql</file>
<description>Create database schema for Supabase</description>
<content><![CDATA[
-- Enable UUID extension
create extension if not exists "uuid-ossp";
-- Books Table
create table if not exists books (
id uuid default uuid_generate_v4() primary key,
title text not null,
author text not null,
category text,
"pageCount" integer,
status text default 'Available',
description text,
created_at timestamp with time zone default timezone('utc'::text, now())
);
-- News Table
create table if not exists news (
id uuid default uuid_generate_v4() primary key,
title text not null,
excerpt text,
"imageUrl" text,
date text,
created_at timestamp with time zone default timezone('utc'::text, now())
);
-- Requests Table
create table if not exists requests (
id uuid default uuid_generate_v4() primary key,
"bookId" uuid references books(id),
"bookTitle" text,
"studentName" text,
"studentId" text,
"dateRequested" text,
status text default 'Pending',
created_at timestamp with time zone default timezone('utc'::text, now())
);
-- Enable Row Level Security (RLS) is recommended for production,
-- but for this demo, we will allow public read/write to simplify setup.
-- In a real app, you would create policies here.
alter table books enable row level security;
alter table news enable row level security;
alter table requests enable row level security;
-- Allow public access (Simplified for Hackathon/Demo)
create policy "Public Access Books" on books for all using (true);
create policy "Public Access News" on news for all using (true);
create policy "Public Access Requests" on requests for all using (true);
]]></content>
