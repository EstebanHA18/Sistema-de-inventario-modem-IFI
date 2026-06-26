-- Tabla para almacenar modelos de equipos y sus precios

CREATE TABLE IF NOT EXISTS public.equipment_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_model TEXT NOT NULL UNIQUE,
    price_nio NUMERIC(10, 2) DEFAULT 0.00,
    price_usd NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de seguridad (RLS - Row Level Security)
ALTER TABLE public.equipment_models ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública (o a usuarios autenticados)
CREATE POLICY "Permitir lectura a todos los usuarios" ON public.equipment_models
    FOR SELECT USING (true);

-- Permitir inserción, actualización y eliminación pública (Temporal, idealmente a usuarios autenticados)
CREATE POLICY "Permitir insertar a todos los usuarios" ON public.equipment_models
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualizar a todos los usuarios" ON public.equipment_models
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Permitir eliminar a todos los usuarios" ON public.equipment_models
    FOR DELETE USING (true);
