-- ========================================================
-- SCRIPT DE MIGRACIÓN SQL PARA SUPABASE (YAK PLATFORM)
-- Copiar y pegar en el SQL Editor de tu proyecto en Supabase
-- ========================================================

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS public.usuarios (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    correo TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol TEXT DEFAULT 'USUARIO',
    foto_perfil TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Intentos de Quizzes (Evaluaciones)
CREATE TABLE IF NOT EXISTS public.intentos (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES public.usuarios(id) ON DELETE CASCADE,
    lengua TEXT NOT NULL,
    titulo TEXT NOT NULL,
    porcentaje INT NOT NULL,
    aciertos INT NOT NULL,
    total INT NOT NULL,
    fecha DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Progresos por Ejercicio
CREATE TABLE IF NOT EXISTS public.progresos (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES public.usuarios(id) ON DELETE CASCADE,
    ejercicio_id INT NOT NULL,
    completado BOOLEAN DEFAULT false,
    fecha DATE DEFAULT CURRENT_DATE
);

-- 4. Tabla de Ejercicios y Preguntas de Quizzes (Catálogo Educativo en la Nube)
CREATE TABLE IF NOT EXISTS public.ejercicios (
    id INT PRIMARY KEY,
    lengua TEXT NOT NULL,
    titulo TEXT NOT NULL,
    nivel TEXT NOT NULL,
    pregunta TEXT NOT NULL,
    opcion1 TEXT NOT NULL,
    opcion2 TEXT NOT NULL,
    opcion3 TEXT NOT NULL,
    opcion4 TEXT NOT NULL,
    respuesta_correcta TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar permisos de lectura y escritura públicos/autenticados para la API
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ejercicios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo en usuarios" ON public.usuarios FOR ALL USING (true);
CREATE POLICY "Permitir todo en intentos" ON public.intentos FOR ALL USING (true);
CREATE POLICY "Permitir todo en progresos" ON public.progresos FOR ALL USING (true);
CREATE POLICY "Permitir todo en ejercicios" ON public.ejercicios FOR ALL USING (true);

-- Datos iniciales del Admin
INSERT INTO public.usuarios (id, username, correo, password, rol)
VALUES (1, 'admin', 'admin@yak.com', 'admin', 'OWNER')
ON CONFLICT (correo) DO NOTHING;
