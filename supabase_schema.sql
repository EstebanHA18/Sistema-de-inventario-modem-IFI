-- Copy and paste this in your Supabase SQL Editor to create the table

CREATE TABLE IF NOT EXISTS public.inventory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  item text,
  entry_date text,
  channel text,
  brand text,
  imei text UNIQUE NOT NULL,
  iccid text,
  assignment text,
  assignment_date text,
  status text DEFAULT 'En Almacén',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) but allow anonymous access for now (since we use anon key)
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access" ON public.inventory
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert access" ON public.inventory
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update access" ON public.inventory
  FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous delete access" ON public.inventory
  FOR DELETE USING (true);
