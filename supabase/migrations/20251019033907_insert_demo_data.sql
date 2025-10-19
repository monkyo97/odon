/*
  # Insertar Datos de Demostración
  
  1. Datos Demo
    - Clínica de prueba
    - Tratamientos del catálogo
    - Datos para testing
  
  2. Notas
    - Estos datos permiten probar el sistema inmediatamente
    - Se puede eliminar en producción
*/

-- Insertar clínica demo (solo si no existe)
INSERT INTO odon.clinics (id, name, ruc, address, phone, email, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Clínica Dental Demo',
  '20123456789',
  'Av. Principal 123, Lima, Perú',
  '+51 999 888 777',
  'demo@dentalpro.com',
  '1'
)
ON CONFLICT (id) DO NOTHING;

-- Insertar tratamientos comunes para la clínica demo
INSERT INTO odon.clinic_treatment (clinic_id, treatment_id, name, description, default_duration, default_cost, status)
VALUES 
  ('00000000-0000-0000-0000-000000000001', gen_random_uuid(), 'Limpieza Dental', 'Limpieza profunda y profilaxis', 30, 80.00, '1'),
  ('00000000-0000-0000-0000-000000000001', gen_random_uuid(), 'Obturación Simple', 'Restauración con resina', 45, 120.00, '1'),
  ('00000000-0000-0000-0000-000000000001', gen_random_uuid(), 'Extracción Simple', 'Extracción de pieza dental', 30, 100.00, '1'),
  ('00000000-0000-0000-0000-000000000001', gen_random_uuid(), 'Endodoncia', 'Tratamiento de conducto', 90, 350.00, '1'),
  ('00000000-0000-0000-0000-000000000001', gen_random_uuid(), 'Corona Dental', 'Corona de porcelana o metal', 60, 600.00, '1'),
  ('00000000-0000-0000-0000-000000000001', gen_random_uuid(), 'Ortodoncia Mensual', 'Control y ajuste de brackets', 30, 200.00, '1'),
  ('00000000-0000-0000-0000-000000000001', gen_random_uuid(), 'Blanqueamiento', 'Blanqueamiento dental completo', 60, 250.00, '1'),
  ('00000000-0000-0000-0000-000000000001', gen_random_uuid(), 'Implante Dental', 'Colocación de implante', 120, 1500.00, '1')
ON CONFLICT (clinic_id, treatment_id) DO NOTHING;
