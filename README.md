# 🦷 Odon – Sistema de Gestión Odontológica (MVP)

**Odon** es un **proyecto de desarrollo personal** orientado a la construcción de un sistema web para la gestión de clínicas odontológicas.

Este MVP fue diseñado para **demostrar habilidades técnicas** como arquitectura, modelado de dominio y construcción de soluciones enfocadas en flujos reales del negocio odontológico.

> ⚠️ **Nota importante**  
> Este repositorio corresponde a una versión **no comercial** y **no productiva**.  
> Algunas funcionalidades y configuraciones han sido **simplificadas u omitidas intencionalmente** para evitar la exposición de información sensible.

---

## 🎯 Objetivo del Proyecto

- Construir un MVP funcional con flujos esenciales de una clínica odontológica.
- Aplicar buenas prácticas de desarrollo y organización de código.
- Servir como **portafolio técnico** para procesos de selección.
- Sentar una base escalable para futuras mejoras.

---

## 🚀 Funcionalidades Principales

### 👤 Gestión de Pacientes
- Registro y administración de pacientes.
- Información personal y clínica básica.
- Historial de atención y seguimiento.

### 📅 Agenda y Citas
- Programación de citas por dentista y horario.
- Organización de agenda diaria.
- Base para vistas por sucursal y profesional.

### 🦷 Odontograma Interactivo
- Representación visual del estado dental.
- Registro de tratamientos por pieza dental.
- Historial odontológico gráfico.

### 💉 Tratamientos y Presupuestos
- Definición de tratamientos.
- Asociación de costos.
- Seguimiento del estado del tratamiento.

### 👥 Gestión de Usuarios y Roles
- Control de acceso por roles:
  - Administrador
  - Odontólogo
  - Asistente
  - Recepción

---

## 🧪 Usuario de Prueba

Credenciales de demostración:

- **Email:** `cmoncayo1033@gmail.com`
- **Contraseña:** `mc123456`

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React + Vite  
- **Estilos:** Tailwind CSS  
- **Backend as a Service:** Supabase  
- **Base de Datos:** PostgreSQL  
- **Autenticación:** Supabase Auth  

## 🧩 Estado del Proyecto

- Fase: MVP en desarrollo
- Enfoque: Validación técnica y flujos esenciales
- Nota: Algunas funcionalidades están simplificadas intencionalmente

## 📄 Aviso Legal

- Este proyecto es un desarrollo personal creado con fines educativos y de demostración técnica.
- No contiene datos reales de pacientes.
- No está destinado a uso comercial.
- Parte de la lógica ha sido simplificada intencionalmente.

---

## ⚙️ Configuración del Proyecto

### Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```ini
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-publica
```

---
## ▶️ Ejecución en Desarrollo

### Versión Node.js
Recomiendo usar Node.js v20.18.0 o superior.

### Instalar dependencias
npm install

### Ejecutar el proyecto
npm run dev

