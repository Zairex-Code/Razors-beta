# Razors CRM

Sistema CRM/ERP para gestión de importaciones, inventario multialmacén y ventas B2B.

## Stack Tecnológico

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19, TypeScript, Tailwind CSS v4
- **UI Components**: Shadcn UI
- **Estado Global**: Zustand
- **Gráficos**: Recharts
- **Base de Datos**: PostgreSQL (Supabase)
- **ORM**: Prisma 5
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage

## Requisitos Previos

- Node.js 20+
- Cuenta de Supabase
- npm o pnpm

---

## Configuración de Supabase

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Crea un nuevo proyecto llamado `razors-crm`
3. Selecciona la región más cercana (ej. South America - São Paulo)
4. Guarda la contraseña de la base de datos

### 2. Obtener Credenciales

En **Project Settings > Database**, copia:

- **Host**: aparece como `db.[tu-proyecto].supabase.co`
- **Password**: la que creaste al iniciar el proyecto

En **Project Settings > API**, copia:

- **Project URL**: `https://[tu-proyecto-id].supabase.co`
- **anon/public key**: la clave que aparece

### 3. Configurar Variables de Entorno

Edita el archivo `.env` en la raíz del proyecto:

```env
# Database connection for Prisma (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[TU_PASSWORD]@[TU_HOST]:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[TU_PASSWORD]@[TU_HOST]:5432/postgres"

# Supabase Auth & Storage keys
NEXT_PUBLIC_SUPABASE_URL="https://[TU_PROYECTO_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[TU_ANON_KEY]"
```

### 4. Crear Tablas en Supabase

Una vez configuradas las variables de entorno, ejecuta:

```bash
npm run db:push
```

Esto creará todas las tablas del esquema en tu base de datos de Supabase.

### 5. Generar Prisma Client

```bash
npm run db:generate
```

---

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Linting
npm run lint

# Verificar tipos TypeScript
npm run typecheck

# Push esquema a base de datos
npm run db:push

# Generar Prisma Client
npm run db:generate

# Resetear base de datos (cuidado: borra todo)
npm run db:reset
```

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/login/          # Página de login
│   ├── dashboard/             # Panel principal
│   │   ├── inventory/         # Gestión de inventario
│   │   ├── imports/           # Importaciones (wizard 4 pasos)
│   │   ├── customers/         # Clientes
│   │   ├── sales/             # Ventas y POS
│   │   ├── expenses/         # Gastos operativos
│   │   └── reports/          # Reportes BI
│   ├── actions/               # Server Actions
│   ├── globals.css            # Estilos dark glassmorphism
│   └── layout.tsx             # Layout principal
├── components/
│   ├── layout/                # Sidebar, header
│   └── ui/                    # Componentes Shadcn
├── stores/                    # Zustand stores
│   ├── pos-store.ts           # Carrito POS
│   └── import-wizard-store.ts # Wizard importaciones
├── lib/
│   ├── prisma.ts              # Cliente Prisma
│   └── utils.ts               # Utilidades
└── utils/supabase/            # Clientes Supabase
    ├── server.ts              # Server component client
    └── client.ts             # Browser client
```

---

## Reglas de Negocio

### Roles (RBAC)

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| `ADMIN` | Desarrollador | Total + settings técnicos |
| `BOSS` | Dueña del negocio | Dashboard completo, finanzas, reportes |
| `EMPLOYEE` | Vendedor | Dashboard, inventario, clientes, ventas |

### Inventario Multialmacén

- Cada producto tiene stock dividido entre "Almacén Central" y "Tienda Principal"
- Transferencias entre almacenes disponibles

### Importaciones

- Wizard de 4 pasos: Info → Productos → Documentos → Costos Extra
- El stock **solo se suma** cuando la importación cambia a estado "Entregado"
- Eliminación en cascada de productos, costos y documentos

### Ventas

- Las ventas **no se borran**, se **anulan** (status: VOID)
- Al anular, el stock se devuelve automáticamente
- Cálculo automático de IGV (18%)

---

## Base de Datos (Esquema)

### Modelos Principales

- **User**: Usuarios del sistema con roles
- **Product**: Productos con SKU único
- **Inventory**: Stock por producto y ubicación
- **Location**: Almacén Central, Tienda Principal
- **Customer**: Clientes (RUC/DNI)
- **Import**: Órdenes de importación
- **ImportItem**: Productos en una importación
- **ImportCost**: Costos extra (naviera, aduanas, etc.)
- **Sale**: Ventas con estado
- **SaleItem**: Productos vendidos
- **Expense**: Gastos operativos
- **Document**: PDFs/imágenes (solo URLs)

### Relaciones Clave

- `Inventory`: [Product, Location] - stock multialmacén
- `Sale`: [User, Customer, Location] - quién vendió, a quién, dónde
- `Import`: [ImportItem, ImportCost, Document] - con cascade delete

---

## Configuración de Auth (Supabase)

### 1. Habilitar Email Auth en Supabase

En tu proyecto Supabase:
1. Ve a **Authentication > Providers**
2. Asegúrate de que **Email** esté habilitado
3. Desactiva "Confirm email" si no quieres verificación de email

### 2. Crear Usuarios Iniciales

Puedes crear usuarios desde:
- **Supabase Dashboard > Authentication > Users**
- O mediante seed script

### 3. Configurar Metadata de Usuario

Cada usuario necesita `role` en su metadata:
```json
{
  "role": "BOSS"
}
```

Roles válidos: `ADMIN`, `BOSS`, `EMPLOYEE`

---

## Deploy en Vercel

1. Conecta tu repositorio GitHub a Vercel
2. Agrega las variables de entorno en Vercel:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy automático al hacer push a main

---

## Día Cero - Migración de Datos

### 1. Seed de Datos Iniciales

Crea un script `prisma/seed.ts` para cargar:
- Productos con SKU, nombre, categoría, precio
- Stock actual por ubicación
- Clientes frecuentes

### 2. Corte de Caja

1. Hacer inventario físico real el día del corte
2. Cargar datos exactos en el seed
3. Desplegar a producción
4. A partir de ese momento, **todo** se registra en Razors

### 3. Capacitación

- Ambiente sandbox para practicar
- Simular importaciones falsas completas
- Practicar anulación de ventas

---

## Troubleshooting

### Error: "Connection refused" en Prisma

1. Verifica que las credenciales en `.env` estén correctas
2. Asegúrate de que `DIRECT_URL` tenga el puerto `5432`
3. Revisa que la contraseña sea la de la base de datos (no la de Supabase)

### Error: "Auth failed" en Supabase

1. Verifica `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Las credenciales deben ser del proyecto correcto

### Build falla en Vercel

1. Verifica todas las variables de entorno en Vercel Dashboard
2. Asegúrate de haber ejecutado `npm run db:generate` antes del build

---

## Licencia

Privado - Zairex Code
