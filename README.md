# Razors CRM

Sistema CRM/ERP para gestión de importaciones, inventario multialmacén y ventas B2B.

## Stack Tecnológico

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Frontend**: React 19, TypeScript, Tailwind CSS v4
- **UI Components**: Shadcn UI + Base UI
- **Estado Global**: Zustand
- **Gráficos**: Recharts
- **Base de Datos**: PostgreSQL (Supabase)
- **ORM**: Prisma 5
- **Auth**: Supabase Auth + Proxy de cookies
- **Storage**: Supabase Storage
- **Impresión**: react-to-print

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
- **service_role key**: clave de servicio (para operaciones administrativas)

### 3. Configurar Variables de Entorno

Edita el archivo `.env` en la raíz del proyecto:

```env
# Database connection for Prisma (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[TU_HOST]:5432/postgres?pgbouncer=true&user=postgres&password=[TU_PASSWORD]"
DIRECT_URL="postgresql://postgres.[TU_HOST]:5432/postgres?user=postgres&password=[TU_PASSWORD]"

# Supabase Auth & Storage keys
NEXT_PUBLIC_SUPABASE_URL="https://[TU_PROYECTO_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[TU_ANON_KEY]"
SUPABASE_SERVICE_ROLE_KEY="[TU_SERVICE_ROLE_KEY]"
```

### 4. Inicializar Base de Datos

```bash
# Empujar el esquema a la base de datos
npm run db:push

# Generar el cliente Prisma
npm run db:generate

# Poblar con datos iniciales (usuarios, ubicaciones, etc.)
npm run db:seed
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

# Generar Prisma Client (se ejecuta automáticamente en postinstall)
npm run db:generate

# Poblar base de datos inicial
npm run db:seed

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
│   │   ├── inventory/        # Gestión de inventario
│   │   │   └── transfers/    # Transferencias entre sedes
│   │   ├── imports/          # Importaciones (wizard 4 pasos)
│   │   ├── customers/        # Clientes con facturas
│   │   ├── sales/             # Ventas y POS
│   │   ├── locations/         # Gestión de sedes (ADMIN/BOSS)
│   │   ├── expenses/          # Gastos operativos
│   │   ├── reports/           # Reportes BI
│   │   ├── users/             # Gestión de usuarios (ADMIN)
│   │   └── settings/          # Configuración del sistema
│   ├── actions/               # Server Actions
│   │   ├── auth-actions.ts    # Auth y sesiones
│   │   ├── location-actions.ts # CRUD sedes y transferencias
│   │   ├── sale-actions.ts    # Ventas y anulaciones
│   │   └── ...
│   ├── globals.css            # Estilos dark glassmorphism
│   └── layout.tsx             # Layout principal
├── components/
│   ├── layout/                # Sidebar, MobileNav
│   ├── sales/                 # InvoiceTemplate, TicketTemplate, POS
│   ├── inventory/             # InventoryTable
│   ├── customers/             # CustomersTable
│   └── ui/                    # Componentes Shadcn/Base UI
├── stores/                    # Zustand stores
│   ├── pos-store.ts           # Carrito POS
│   └── import-wizard-store.ts  # Wizard importaciones
├── lib/
│   ├── prisma.ts              # Cliente Prisma
│   └── utils.ts               # Utilidades
└── proxy.ts                   # Proxy de auth (Next.js 16)
```

---

## Reglas de Negocio

### Roles (RBAC)

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| `ADMIN` | Desarrollador | Total + settings + usuarios |
| `BOSS` | Dueña del negocio | Dashboard completo, finanzas, reportes, sedes |
| `EMPLOYEE` | Vendedor | Dashboard, inventario, clientes, ventas |

### Arquitectura Multialmacén

- **Locations**: Cada sede tiene `type` (WAREHOUSE/STORE), dirección, teléfono, email
- **Inventory**: Stock por producto y ubicación (ProductStock)
- **Transferencias**: Movimientos de inventario entre sedes
- **Cierre de sedes**: Transferencia obligatoria de stock antes de desactivar

### Flujo de Importaciones

1. Wizard de 4 pasos: Info → Productos → Documentos → Costos Extra
2. Estados: PENDING → IN_TRANSIT → DISPATCHED → DELIVERED
3. El stock **solo se suma** al almacén cuando cambia a "Entregado"

### Ventas y Facturas

- Las ventas **no se borran**, se **anulan** (status: VOID)
- Al anular, el stock se devuelve automáticamente
- Cálculo automático de IGV (18%)
- Facturas con datos dinámicos de la sede (dirección, teléfono, email)
- Descarga de facturas desde historial de clientes

---

## Base de Datos (Esquema)

### Modelos Principales

| Modelo | Descripción |
|--------|-------------|
| **User** | Usuarios del sistema con roles |
| **Location** | Sedes (Almacenes y Tiendas) con contacto |
| **Product** | Productos con SKU único |
| **Inventory** | Stock por producto y ubicación |
| **Customer** | Clientes B2B (RUC/DNI) |
| **Sale** | Ventas con estado y ubicación |
| **SaleItem** | Detalle de productos vendidos |
| **Import** | Órdenes de importación |
| **ImportItem** | Productos en importación |
| **ImportCost** | Costos extra (naviera, aduanas) |
| **Expense** | Gastos operativos |

### Location (Sedes)

```prisma
model Location {
  id        String       @id @default(uuid())
  name      String
  type      LocationType @default(STORE)  // WAREHOUSE | STORE
  address   String?      // Dirección de la sede
  phone     String?      // Teléfono de contacto
  email     String?      // Email de contacto
  isActive  Boolean      @default(true)
  inventory Inventory[]
  sales     Sale[]
}
```

---

## Módulo de Sedes

### Gestión de Sedes y Locales

- Crear, editar y cerrar sedes (ADMIN/BOSS)
- Cada sede puede ser **Almacén** (WAREHOUSE) o **Tienda** (STORE)
- Campos de contacto: dirección, teléfono, email
- **Cierre seguro**: Si la sede tiene stock, se debe seleccionar destino antes de cerrar

### Flujo de Cierre de Sede

```
1. Usuario intenta cerrar sede con stock
2. Modal inteligente pregunta: "¿A dónde transferimos el inventario?"
3. Select muestra otras sedes activas
4. Al confirmar: transferencia atómica de todo el stock
5. Sede marcada como inactiva
```

### Facturas Dinámicas por Sede

Cada factura/ticket ahora muestra los datos de contacto de la sede donde se realizó la venta:
- Nombre de la sede
- Dirección
- Teléfono
- Email

---

## Deploy en Vercel

### 1. Conectar Repositorio

Conecta tu repositorio GitHub a Vercel desde el dashboard.

### 2. Variables de Entorno en Vercel

Agrega todas las variables del `.env`:
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Build Script

El `postinstall` se ejecuta automáticamente:
```json
"postinstall": "prisma generate"
```

### 4. Deploy

El deploy es automático al hacer push a la rama principal.

---

## Día Cero - Migración de Datos

### 1. Seed de Datos Iniciales

El seed crea:
- 3 usuarios (admin, boss, employee)
- 2 sedes por defecto (Almacén Central, Tienda Principal)
- Datos de prueba

### 2. Corte de Caja

1. Hacer inventario físico real el día del corte
2. Ajustar seed con datos exactos
3. Desplegar a producción
4. A partir de ese momento, **todo** se registra en Razors

### 3. Capacitación

- Ambiente sandbox para practicar
- Simular importaciones falsas completas
- Practicar anulación de ventas
- Probar cierre y transferencias de sedes

---

## Troubleshooting

### Error: "Connection refused" en Prisma

1. Verifica que las credenciales en `.env` estén correctas
2. Asegúrate de que `DATABASE_URL` tenga el formato correcto
3. Revisa que la contraseña no contenga caracteres especiales sin encoding

### Error: "Auth failed" en Supabase

1. Verifica `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Confirma que `SUPABASE_SERVICE_ROLE_KEY` está configurada
3. Revisa que las credenciales sean del proyecto correcto

### Build falla en Vercel

1. Verifica todas las variables de entorno en Vercel Dashboard
2. Asegúrate de que `postinstall` esté configurado en package.json
3. Ejecuta `npm run typecheck` localmente para detectar errores

### Prisma Client desactualizado

Si agregas campos al schema, regenera:
```bash
npx prisma generate
```

---

## Credenciales de Prueba (Seed)

| Rol | Email | Contraseña |
|-----|-------|------------|
| ADMIN | admin@razors.com | password123 |
| BOSS | boss@razors.com | password123 |
| EMPLOYEE | vendedor@razors.com | password123 |

---

## Licencia

Privado - Zairex Code
