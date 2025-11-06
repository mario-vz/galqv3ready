/*
  # Sistema de Gestión de Limpieza

  1. Nuevas Tablas
    - `cleaners`
      - `id` (uuid, primary key)
      - `name` (text) - Nombre del limpiador o empresa
      - `phone` (text) - Teléfono con código internacional
      - `type` (text) - 'individual' o 'company'
      - `active` (boolean) - Si está activo
      - `notes` (text) - Notas adicionales
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `cleaning_tasks`
      - `id` (uuid, primary key)
      - `reservation_id` (uuid, foreign key) - Reserva asociada
      - `property_id` (uuid, foreign key) - Propiedad a limpiar
      - `cleaner_id` (uuid, foreign key, nullable) - Limpiador asignado
      - `cleaning_date` (date) - Fecha de limpieza
      - `cleaning_time_start` (time) - Hora inicio (default 11:00)
      - `cleaning_time_end` (time) - Hora fin (default 16:00)
      - `status` (text) - 'pending', 'assigned', 'completed', 'cancelled'
      - `priority` (text) - 'normal', 'urgent'
      - `notes` (text) - Notas para el limpiador
      - `whatsapp_sent` (boolean) - Si se envió WhatsApp
      - `whatsapp_sent_at` (timestamptz) - Cuándo se envió
      - `completed_at` (timestamptz) - Cuándo se completó
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Seguridad
    - Habilitar RLS en ambas tablas
    - Solo usuarios autenticados pueden acceder
    - Políticas para SELECT, INSERT, UPDATE, DELETE

  3. Funciones
    - Función para actualizar `updated_at` automáticamente
    - Trigger para mantener timestamp actualizado

  4. Índices
    - Índice en `cleaning_date` para búsquedas rápidas
    - Índice en `status` para filtros
    - Índice en `property_id` para filtros por propiedad
*/

-- Crear tabla de limpiadores
CREATE TABLE IF NOT EXISTS cleaners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  type text NOT NULL CHECK (type IN ('individual', 'company')),
  active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de tareas de limpieza
CREATE TABLE IF NOT EXISTS cleaning_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES reservations(id) ON DELETE SET NULL,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  cleaner_id uuid REFERENCES cleaners(id) ON DELETE SET NULL,
  cleaning_date date NOT NULL,
  cleaning_time_start time DEFAULT '11:00:00',
  cleaning_time_end time DEFAULT '16:00:00',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'completed', 'cancelled')),
  priority text DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent')),
  notes text,
  whatsapp_sent boolean DEFAULT false,
  whatsapp_sent_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_cleaners_updated_at ON cleaners;
CREATE TRIGGER update_cleaners_updated_at
  BEFORE UPDATE ON cleaners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cleaning_tasks_updated_at ON cleaning_tasks;
CREATE TRIGGER update_cleaning_tasks_updated_at
  BEFORE UPDATE ON cleaning_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_date ON cleaning_tasks(cleaning_date);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_status ON cleaning_tasks(status);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_property ON cleaning_tasks(property_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_cleaner ON cleaning_tasks(cleaner_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_reservation ON cleaning_tasks(reservation_id);

-- Habilitar RLS
ALTER TABLE cleaners ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_tasks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para cleaners
CREATE POLICY "Authenticated users can view cleaners"
  ON cleaners FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert cleaners"
  ON cleaners FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update cleaners"
  ON cleaners FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete cleaners"
  ON cleaners FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para cleaning_tasks
CREATE POLICY "Authenticated users can view cleaning tasks"
  ON cleaning_tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert cleaning tasks"
  ON cleaning_tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update cleaning tasks"
  ON cleaning_tasks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete cleaning tasks"
  ON cleaning_tasks FOR DELETE
  TO authenticated
  USING (true);

-- Insertar algunos limpiadores de ejemplo
INSERT INTO cleaners (name, phone, type, notes) VALUES
  ('María García', '+34612345678', 'individual', 'Disponible lunes a viernes'),
  ('Limpiezas Galicia S.L.', '+34698765432', 'company', 'Empresa de limpieza profesional'),
  ('Juan Pérez', '+34623456789', 'individual', 'Especialista en limpiezas profundas')
ON CONFLICT DO NOTHING;