import os

file_path = r'C:\Users\samue\Downloads\speak\speak-mvp-json\frontend\app\(teacher)\dashboard\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    ('Teacher Credentials Verified', 'Credenciales de Docente Verificadas'),
    ('COMMAND CENTER', 'CENTRO DE MANDO'),
    ('Root Admin:', 'Admin Raíz:'),
    ('CREATE SQUADRON', 'CREAR ESCUADRÓN'),
    ('ESTABLISHING DATABASE CONNECTION...', 'ESTABLECIENDO CONEXIÓN CON LA BASE DE DATOS...'),
    ('NO ACTIVE SQUADRONS FOUND', 'NO SE ENCONTRARON ESCUADRONES ACTIVOS'),
    ('Initialize your first command group to deploy missions and monitor student operative readouts.', 'Inicialice su primer grupo de mando para desplegar misiones y monitorear a los estudiantes operativos.'),
    ('INITIALIZE PROTOCOL', 'INICIALIZAR PROTOCOLO'),
    ('Active Squadrons Deployed', 'Escuadrones Activos Desplegados'),
    ('View Dashboard', 'Ver Panel'),
    ('ACCESS_KEY', 'CLAVE_ACCESO'),
    ('SECURED', 'COPIADA'),
    ('COPY KEY', 'COPIAR CLAVE'),
    ('title="Logout"', 'title="Cerrar Sesión"')
]

for old, new in replacements:
    content = content.replace(old, new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Translated successfully.')
