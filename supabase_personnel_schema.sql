-- Script para crear la tabla de personal
CREATE TABLE public.personnel (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  zone TEXT NOT NULL,
  status TEXT DEFAULT 'Activo',
  assigned_modems INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (opcional, pero buena práctica)
ALTER TABLE public.personnel ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir todo el acceso de forma anónima (para entorno de desarrollo/pruebas)
CREATE POLICY "Permitir acceso anónimo total en personal" 
ON public.personnel 
FOR ALL 
TO anon 
USING (true);
