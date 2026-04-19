# ➕ Razors context

**Rol del Sistema:** Eres un Ingeniero de Software Senior experto en el ecosistema moderno de JavaScript: Next.js (App Router), React, Node.js, TypeScript y diseño de bases de datos relacionales. Tu tarea es asistir en la construcción, análisis y escritura de código para el siguiente proyecto, respetando estrictamente su arquitectura, reglas de negocio y patrones de diseño visual.

**Contexto del Proyecto:** Vamos a desarrollar "Razors", un sistema web CRM/ERP a medida para gestionar las importaciones, inventario multialmacén y ventas B2B de un negocio de productos de barbería de una sola sede. La aplicación será un monolito moderno (Fullstack) desplegado en Vercel.

**Identidad Visual y Patrones UX/UI Estrictos:** \* **Estética:** Interfaz estrictamente en modo oscuro sobre un fondo negro sólido profundo. Uso intensivo de Glassmorphism (Vidrio Líquido oscuro, desenfoque de fondo, reflejos especulares y bordes biselados brillantes con acentos cyan neón \#00f7ff). Tipografía geométrica premium (ej. Inter o Geist).

* **Patrón Maestro-Detalle (Acordeón):** Evitar íconos de "Ojo" aislados. Las filas de las tablas (Clientes, Gastos, Ventas) deben ser contenedores completamente clickeables (`w-full`) que se expanden hacia abajo revelando un panel de vidrio anidado con los detalles, manteniendo exactamente el ancho de su padre.  
* **Formularios:** Uso de modales centrados para creaciones rápidas (Clientes, Gastos) y "Wizards" (Formularios por pasos) para procesos complejos como Importaciones.

**Stack Tecnológico:**

* **Framework Core:** Next.js (App Router) usando Server Components, Server Actions y Middlewares para protección de rutas.  
* **Frontend:** React, TypeScript, Tailwind CSS v4, Shadcn UI, Zustand (estado global), Recharts (para Business Intelligence).  
* **Base de Datos, Backend & Storage:** PostgreSQL alojado en Supabase. Uso intensivo de Supabase Storage para alojar PDFs e imágenes (guardando solo la URL en la BD).  
* **ORM:** Prisma ORM (con políticas de eliminación en cascada `onDelete: Cascade` estrictamente configuradas).

**Requerimientos Core y Reglas de Negocio:**

**1\. Gestión de Productos e Inventario**

* Los productos tienen variantes (ej. peinilla roja, peinilla azul); cada variante es un producto independiente con un ID/SKU único.  
* El control es Multialmacén: el stock se divide entre "Almacén Central" y "Tienda Principal", permitiendo registrar transferencias.

**2\. Importaciones (Flujo Wizard de 4 Pasos)**

* **Paso 1 (Info):** Proveedor, Proforma (PI), Fecha Estimada y Tipo de Cambio Inicial.  
* **Paso 2 (Productos):** Artículos con cantidades y precio unitario en USD. Debe incluir una sección extra para "Costos Internos del Proveedor" (ej. Flete local en origen) antes del Total Proforma.  
* **Paso 3 (Documentos):** Repositorio universal Drag & Drop (Supabase Storage) para adjuntar PI, CI, Vouchers o fotos.  
* **Paso 4 (Costos Extra \- Uno a Muchos):** Naviera, Aduanas y Movilidad. Cada categoría debe permitir agregar múltiples pagos dinámicamente mediante un arreglo de estado, registrando tipo de cambio individual y adjuntando su voucher.  
* **Lógica de Inventario:** El stock *solo* suma al inventario general cuando el estado de la importación cambia a "Entregado". Si se elimina una importación, se ejecuta eliminación en cascada de sus pagos, documentos y productos vinculados.

**3\. Ventas (B2B)**

* **Vista Principal:** Tabla de Historial de Ventas (pagadas/pendientes). Expansión de fila muestra el detalle de productos y permite: Descargar Factura PDF, Imprimir Ticket, o "Anular Venta".  
* **Anulación:** Las ventas no se borran; se anulan. Su valor pasa a 0 y el stock se devuelve automáticamente al inventario de la sede correspondiente.  
* **Creación (POS):** Un botón abre la interfaz de Punto de Venta para seleccionar cliente, sede, productos, calcular IGV (18%) y despachar.

**4\. Gastos Operativos y Clientes**

* **Gastos:** Independientes del costo de importación. Manejan estados (Pagado/Pendiente) y filtrado dinámico por categoría (Alquiler, Luz, Marketing, etc.).  
* **Clientes:** El dropdown de detalle de cliente debe mostrar un historial rápido de sus últimas 3 facturas con opción de descarga.

**5\. Business Intelligence (Reportes de Sede Única)**

* Gráficos enfocados en inteligencia financiera: Rentabilidad Neta (descontando importación y operación), Valorización del Stock, Gráfico de rotación (Top 5 más vendidos vs. Top 5 menos vendidos para detectar inventario muerto) y Alertas de Stock Bajo.

**6\. Roles y Permisos (RBAC de 3 Niveles)**

* **Empleado (Operaciones):** Acceso solo a Dashboard (métricas de sus ventas diarias), Inventario, Clientes y Ventas. NO puede ver rentabilidad, dashboard financiero, costos en dólares ni módulos de gastos/importaciones.  
* **Jefe (Dueña del Negocio):** Acceso total a la lógica de negocio (Dashboard completo, Importaciones, Finanzas, Reportes).  
* **System Admin (Desarrollador):** Acceso total al negocio \+ Módulos técnicos exclusivos (User Management, System Settings, Security Logs). El perfil de usuarios debe tener la capacidad de revocar acceso (Status: Inactive) sin borrar la data histórica del usuario.

# 🎨 Paleta de colores y estilos:

@import "tailwindcss";

@custom-variant dark (&:is(.dark \*));

:root {  
  \--background: oklch(1.0000 0 0);  
  \--foreground: oklch(0 0 0);  
  \--card: oklch(0.9612 0 0);  
  \--card-foreground: oklch(0 0 0);  
  \--popover: oklch(1.0000 0 0);  
  \--popover-foreground: oklch(0 0 0);  
  \--primary: oklch(0.8865 0.1507 198.9849);  
  \--primary-foreground: oklch(0 0 0);  
  \--secondary: oklch(0.9219 0 0);  
  \--secondary-foreground: oklch(0 0 0);  
  \--muted: oklch(0.9702 0 0);  
  \--muted-foreground: oklch(0.5103 0 0);  
  \--accent: oklch(0.8865 0.1507 198.9849);  
  \--accent-foreground: oklch(0 0 0);  
  \--destructive: oklch(0.6280 0.2577 29.2339);  
  \--destructive-foreground: oklch(1.0000 0 0);  
  \--border: oklch(0.9219 0 0);  
  \--input: oklch(0.9219 0 0);  
  \--ring: oklch(0.8865 0.1507 198.9849);  
  \--chart-1: oklch(0.8865 0.1507 198.9849);  
  \--chart-2: oklch(0.4202 0 0);  
  \--chart-3: oklch(0.5999 0 0);  
  \--chart-4: oklch(0.7668 0 0);  
  \--chart-5: oklch(0 0 0);  
  \--sidebar: oklch(0.9821 0 0);  
  \--sidebar-foreground: oklch(0 0 0);  
  \--sidebar-primary: oklch(0.8865 0.1507 198.9849);  
  \--sidebar-primary-foreground: oklch(0 0 0);  
  \--sidebar-accent: oklch(0.9219 0 0);  
  \--sidebar-accent-foreground: oklch(0 0 0);  
  \--sidebar-border: oklch(0.9219 0 0);  
  \--sidebar-ring: oklch(0.8865 0.1507 198.9849);  
  \--font-sans: 'Inter', sans-serif;  
  \--font-serif: 'Georgia', serif;  
  \--font-mono: 'Fira Code', monospace;  
  \--radius: 0.5rem;  
  \--shadow-x: 0px;  
  \--shadow-y: 0px;  
  \--shadow-blur: 14px;  
  \--shadow-spread: 0px;  
  \--shadow-opacity: 0.15;  
  \--shadow-color: \#000000;  
  \--shadow-2xs: 0px 0px 14px 0px hsl(0 0% 0% / 0.07);  
  \--shadow-xs: 0px 0px 14px 0px hsl(0 0% 0% / 0.07);  
  \--shadow-sm: 0px 0px 14px 0px hsl(0 0% 0% / 0.15), 0px 1px 2px \-1px hsl(0 0% 0% / 0.15);  
  \--shadow: 0px 0px 14px 0px hsl(0 0% 0% / 0.15), 0px 1px 2px \-1px hsl(0 0% 0% / 0.15);  
  \--shadow-md: 0px 0px 14px 0px hsl(0 0% 0% / 0.15), 0px 2px 4px \-1px hsl(0 0% 0% / 0.15);  
  \--shadow-lg: 0px 0px 14px 0px hsl(0 0% 0% / 0.15), 0px 4px 6px \-1px hsl(0 0% 0% / 0.15);  
  \--shadow-xl: 0px 0px 14px 0px hsl(0 0% 0% / 0.15), 0px 8px 10px \-1px hsl(0 0% 0% / 0.15);  
  \--shadow-2xl: 0px 0px 14px 0px hsl(0 0% 0% / 0.38);  
  \--tracking-normal: 0.01em;  
  \--spacing: 0.25rem;  
}

.dark {  
  \--background: oklch(0 0 0);  
  \--foreground: oklch(1.0000 0 0);  
  \--card: oklch(0.1822 0 0);  
  \--card-foreground: oklch(1.0000 0 0);  
  \--popover: oklch(0 0 0);  
  \--popover-foreground: oklch(1.0000 0 0);  
  \--primary: oklch(0.8865 0.1507 198.9849);  
  \--primary-foreground: oklch(0 0 0);  
  \--secondary: oklch(0.2686 0 0);  
  \--secondary-foreground: oklch(1.0000 0 0);  
  \--muted: oklch(0.2178 0 0);  
  \--muted-foreground: oklch(0.7155 0 0);  
  \--accent: oklch(0.2977 0.0375 198.0952);  
  \--accent-foreground: oklch(0.8865 0.1507 198.9849);  
  \--destructive: oklch(0.6730 0.2146 25.0397);  
  \--destructive-foreground: oklch(1.0000 0 0);  
  \--border: oklch(0.3211 0 0);  
  \--input: oklch(0.3211 0 0);  
  \--ring: oklch(0.8865 0.1507 198.9849);  
  \--chart-1: oklch(0.8865 0.1507 198.9849);  
  \--chart-2: oklch(0.5999 0 0);  
  \--chart-3: oklch(0.7668 0 0);  
  \--chart-4: oklch(0.4202 0 0);  
  \--chart-5: oklch(1.0000 0 0);  
  \--sidebar: oklch(0.1149 0 0);  
  \--sidebar-foreground: oklch(1.0000 0 0);  
  \--sidebar-primary: oklch(0.8865 0.1507 198.9849);  
  \--sidebar-primary-foreground: oklch(0 0 0);  
  \--sidebar-accent: oklch(0.2686 0 0);  
  \--sidebar-accent-foreground: oklch(1.0000 0 0);  
  \--sidebar-border: oklch(0.3211 0 0);  
  \--sidebar-ring: oklch(0.8865 0.1507 198.9849);  
  \--font-sans: 'Inter', sans-serif;  
  \--font-serif: 'Georgia', serif;  
  \--font-mono: 'Fira Code', monospace;  
  \--radius: 0.5rem;  
  \--shadow-x: 0px;  
  \--shadow-y: 0px;  
  \--shadow-blur: 14px;  
  \--shadow-spread: 0px;  
  \--shadow-opacity: 0.15;  
  \--shadow-color: \#00f7ff;  
  \--shadow-2xs: 0px 0px 14px 0px hsl(181.8824 100% 50% / 0.07);  
  \--shadow-xs: 0px 0px 14px 0px hsl(181.8824 100% 50% / 0.07);  
  \--shadow-sm: 0px 0px 14px 0px hsl(181.8824 100% 50% / 0.15), 0px 1px 2px \-1px hsl(181.8824 100% 50% / 0.15);  
  \--shadow: 0px 0px 14px 0px hsl(181.8824 100% 50% / 0.15), 0px 1px 2px \-1px hsl(181.8824 100% 50% / 0.15);  
  \--shadow-md: 0px 0px 14px 0px hsl(181.8824 100% 50% / 0.15), 0px 2px 4px \-1px hsl(181.8824 100% 50% / 0.15);  
  \--shadow-lg: 0px 0px 14px 0px hsl(181.8824 100% 50% / 0.15), 0px 4px 6px \-1px hsl(181.8824 100% 50% / 0.15);  
  \--shadow-xl: 0px 0px 14px 0px hsl(181.8824 100% 50% / 0.15), 0px 8px 10px \-1px hsl(181.8824 100% 50% / 0.15);  
  \--shadow-2xl: 0px 0px 14px 0px hsl(181.8824 100% 50% / 0.38);  
}

@theme inline {  
  \--color-background: var(--background);  
  \--color-foreground: var(--foreground);  
  \--color-card: var(--card);  
  \--color-card-foreground: var(--card-foreground);  
  \--color-popover: var(--popover);  
  \--color-popover-foreground: var(--popover-foreground);  
  \--color-primary: var(--primary);  
  \--color-primary-foreground: var(--primary-foreground);  
  \--color-secondary: var(--secondary);  
  \--color-secondary-foreground: var(--secondary-foreground);  
  \--color-muted: var(--muted);  
  \--color-muted-foreground: var(--muted-foreground);  
  \--color-accent: var(--accent);  
  \--color-accent-foreground: var(--accent-foreground);  
  \--color-destructive: var(--destructive);  
  \--color-destructive-foreground: var(--destructive-foreground);  
  \--color-border: var(--border);  
  \--color-input: var(--input);  
  \--color-ring: var(--ring);  
  \--color-chart-1: var(--chart-1);  
  \--color-chart-2: var(--chart-2);  
  \--color-chart-3: var(--chart-3);  
  \--color-chart-4: var(--chart-4);  
  \--color-chart-5: var(--chart-5);  
  \--color-sidebar: var(--sidebar);  
  \--color-sidebar-foreground: var(--sidebar-foreground);  
  \--color-sidebar-primary: var(--sidebar-primary);  
  \--color-sidebar-primary-foreground: var(--sidebar-primary-foreground);  
  \--color-sidebar-accent: var(--sidebar-accent);  
  \--color-sidebar-accent-foreground: var(--sidebar-accent-foreground);  
  \--color-sidebar-border: var(--sidebar-border);  
  \--color-sidebar-ring: var(--sidebar-ring);

  \--font-sans: var(--font-sans);  
  \--font-mono: var(--font-mono);  
  \--font-serif: var(--font-serif);

  \--radius-sm: calc(var(--radius) \- 4px);  
  \--radius-md: calc(var(--radius) \- 2px);  
  \--radius-lg: var(--radius);  
  \--radius-xl: calc(var(--radius) \+ 4px);

  \--shadow-2xs: var(--shadow-2xs);  
  \--shadow-xs: var(--shadow-xs);  
  \--shadow-sm: var(--shadow-sm);  
  \--shadow: var(--shadow);  
  \--shadow-md: var(--shadow-md);  
  \--shadow-lg: var(--shadow-lg);  
  \--shadow-xl: var(--shadow-xl);  
  \--shadow-2xl: var(--shadow-2xl);

  \--tracking-tighter: calc(var(--tracking-normal) \- 0.05em);  
  \--tracking-tight: calc(var(--tracking-normal) \- 0.025em);  
  \--tracking-normal: var(--tracking-normal);  
  \--tracking-wide: calc(var(--tracking-normal) \+ 0.025em);  
  \--tracking-wider: calc(var(--tracking-normal) \+ 0.05em);  
  \--tracking-widest: calc(var(--tracking-normal) \+ 0.1em);  
}

@layer base {  
  \* {  
    @apply border-border outline-ring/50;  
  }  
  body {  
    @apply bg-background text-foreground;  
    letter-spacing: var(--tracking-normal);  
  }  


# 🗺️ Prototipo Google Stich:

Prototipo Google AI studio:  
https://ai.studio/apps/243de540-4a5e-4dc4-a1cb-f05823cdb413

# 🗄️ Base de Datos

**El Esquema de la Base de Datos (Modelado Relacional)**

### **1\. Módulo de Seguridad y Usuarios (RBAC)**

Aquí definimos quién entra y qué puede hacer.

**Fragmento de código:**

enum Role {  
  ADMIN  
  BOSS  
  EMPLOYEE  
}

model User {  
  id        String   @id @default(uuid())  
  name      String  
  email     String   @unique  
  password  String   // Contraseña encriptada (Hash)  
  role      Role     @default(EMPLOYEE)  
  isActive  Boolean  @default(true) // Para desactivar sin borrar historial  
  sales     Sale\[\]   // Relación: Un usuario puede registrar muchas ventas  
  createdAt DateTime @default(now())  
}

### 

### **2\. Módulo de Inventario y Clientes**

Respetamos tu regla: cada variante (ej. Peinilla Roja) es un producto independiente con SKU único. Además, creamos una tabla intermedia (`Inventory`) para manejar el stock multialmacén.

**Fragmento de código:**

model Location {  
  id        String      @id @default(uuid())  
  name      String      // "Almacén Central", "Tienda Principal"  
  inventory Inventory\[\]  
  sales     Sale\[\]  
}

model Product {  
  id          String        @id @default(uuid())  
  sku         String        @unique  
  name        String  
  category    String  
  pricePen    Float         // Precio de venta al público  
  inventory   Inventory\[\]  
  importItems ImportItem\[\]  
  saleItems   SaleItem\[\]  
}

// Tabla Intermedia: Control Multialmacén  
model Inventory {  
  id         String   @id @default(uuid())  
  product    Product  @relation(fields: \[productId\], references: \[id\])  
  productId  String  
  location   Location @relation(fields: \[locationId\], references: \[id\])  
  locationId String  
  stock      Int      @default(0)

  @@unique(\[productId, locationId\]) // Evita duplicados del mismo producto en la misma sede  
}

model Customer {  
  id        String   @id @default(uuid())  
  docType   String   // RUC, DNI  
  docNumber String   @unique  
  name      String  
  email     String?  
  sales     Sale\[\]  
}

### **3\. Módulo de Importaciones (La "Madre" y sus "Hijos")**

### Aquí aplicamos tu lógica financiera y la regla de **Eliminación en Cascada** (`onDelete: Cascade`). Si tu mamá borra la importación, Prisma limpiará automáticamente todos sus productos y costos extra para evitar datos huérfanos.

**Fragmento de código:**

enum ImportStatus {  
  PLANNING  
  DISPATCHED  
  IN\_TRANSIT  
  DELIVERED // Solo al llegar a este estado se suma al 'Inventory'  
}

model Import {  
  id           String        @id @default(uuid())  
  provider     String  
  piNumber     String  
  eta          DateTime?  
  exchangeRate Float         // Tipo de cambio inicial  
  status       ImportStatus  @default(PLANNING)  
  items        ImportItem\[\]  // Relación a los productos (Paso 2\)  
  costs        ImportCost\[\]  // Relación a los costos dinámicos (Paso 4\)  
  documents    Document\[\]    // Relación a PDFs en Supabase Storage  
  createdAt    DateTime      @default(now())  
}

model ImportItem {  
  id           String   @id @default(uuid())  
  import       Import   @relation(fields: \[importId\], references: \[id\], onDelete: Cascade)  
  importId     String  
  product      Product  @relation(fields: \[productId\], references: \[id\])  
  productId    String  
  quantity     Int  
  unitPriceUsd Float  
}

model ImportCost {  
  id           String   @id @default(uuid())  
  import       Import   @relation(fields: \[importId\], references: \[id\], onDelete: Cascade)  
  importId     String  
  category     String   // "PROVIDER", "SHIPPING", "CUSTOMS", "MOBILITY"  
  description  String  
  amount       Float    // Monto del pago  
  currency     String   // "USD" o "PEN"  
  exchangeRate Float?   // Tipo de cambio del día del pago  
  voucherUrl   String?  // URL del comprobante en Supabase  
}

### 

### **4\. Módulo de Ventas y Gastos Operativos**

Aplicamos tu regla de que las ventas no se borran, se **Anulan** (`VOID`), y los gastos operativos viven en su propia tabla para no ensuciar el costo de importación.

**Fragmento de código:**

enum SaleStatus {  
  PAID  
  PENDING  
  VOID      // Anulada: Devuelve el stock y pone el total en 0  
}

model Sale {  
  id            String     @id @default(uuid())  
  invoiceNumber String     @unique  
  date          DateTime   @default(now())  
  status        SaleStatus @default(PAID)  
  totalAmount   Float  
    
  user          User       @relation(fields: \[userId\], references: \[id\])  
  userId        String     // El empleado que hizo la venta  
  customer      Customer   @relation(fields: \[customerId\], references: \[id\])  
  customerId    String  
  location      Location   @relation(fields: \[locationId\], references: \[id\])  
  locationId    String     // De dónde salió la mercancía  
    
  items         SaleItem\[\] // Productos vendidos  
}

model SaleItem {  
  id        String  @id @default(uuid())  
  sale      Sale    @relation(fields: \[saleId\], references: \[id\], onDelete: Cascade)  
  saleId    String  
  product   Product @relation(fields: \[productId\], references: \[id\])  
  productId String  
  quantity  Int  
  unitPrice Float  
  subtotal  Float  
}

model Expense {  
  id          String   @id @default(uuid())  
  date        DateTime @default(now())  
  category    String   // "RENT", "MARKETING", "UTILITIES"  
  description String  
  amountPen   Float  
  status      String   // "PAID", "PENDING"  
  voucherUrl  String?  
}

// Repositorio de Documentos Universales  
model Document {  
  id       String  @id @default(uuid())  
  import   Import? @relation(fields: \[importId\], references: \[id\], onDelete: Cascade)  
  importId String?  
  type     String  // "PI", "CI", "VOUCHER", "OTHER"  
  url      String  // Link a Supabase Storage  
}

---

### **Análisis del Esquema**

1. **Multi-Almacén resuelto (`Inventory`):** En lugar de poner el stock directamente en la tabla de `Product`, creamos una tabla que cruza Productos con Locaciones. Así, la peinilla roja puede tener 50 en la "Tienda Principal" y 200 en el "Almacén Central".  
2. **Costos Dinámicos de Importación (`ImportCost`):** Esta tabla soporta la lógica de "Lista Dinámica" (Uno a Muchos) que pediste para los gastos extra. Puedes agregarle 3 pagos a Naviera, 1 a SUNAT y 2 al Proveedor, cada uno con su propio voucher, y todo quedará anclado a la importación matriz.

# ⚡ Arquitectura de Estado y Renderizado

**Arquitectura de Estado y Renderizado**

En React clásico (o Vite), todo el código se ejecutaba en el navegador del usuario. Con **Next.js (App Router)**, cambiamos las reglas: ahora tenemos un servidor súper potente (Node.js) que hace el trabajo pesado antes de enviarle la página a tu mamá o al vendedor.

Para que "Razors" sea ultrarrápido y seguro, dividiremos la arquitectura en tres conceptos clave.

---

### **1\. Server Components vs. Client Components**

Por defecto, Next.js asume que todo es un *Server Component*. Esto significa que el componente se renderiza en el servidor, se conecta directamente a Prisma, y envía solo HTML puro al navegador. Es increíblemente rápido y seguro.

Solo usaremos la directiva "use client" cuando necesitemos interactividad (botones, estados, modales).

**Distribución en Razors:**

| Tipo de Componente | Cuándo usarlo en tu sistema | Ejemplo en tu código |
| :---: | :---: | :---: |
| **Server Components** | Para leer datos de la base de datos de forma segura. SEO y carga inicial. | La tabla de "Historial de Ventas". Trae miles de filas desde Supabase directo en el servidor sin cargar la PC del vendedor. |
| **Client Components** | Para interactividad, hooks (useState, useEffect) y listeners (onClick). | Las filas expansibles (dropdowns), el modal de "Añadir Cliente" y los gráficos de Recharts en el Dashboard. |

### 

### **2\. Server Actions (El reemplazo de las APIs tradicionales)**

Antes, para guardar una venta, tenías que crear un archivo en una carpeta `/api`, hacer un `fetch`, enviar un JSON, y recibirlo. Con las Server Actions, Next.js elimina a ese intermediario.

Las Server Actions son funciones asíncronas de JavaScript que se ejecutan exclusivamente en el servidor, pero que puedes llamar directamente desde un botón en tu Client Component.

**Casos de uso críticos:**

* **Anular una Venta:** Un botón en el cliente llama a la acción `anularVentaAction(saleId)`. El servidor recibe el ID, usa Prisma para devolver el stock al inventario, cambia el estado a `VOID`, y refresca la tabla automáticamente con `revalidatePath('/dashboard/sales')`.  
* **Crear Usuario:** En el panel de *System Admin*, el formulario ejecuta una Server Action que encripta la contraseña y guarda al nuevo empleado en Supabase.

### **3\. Zustand: El Estado Global Ligero**

No llenaremos la aplicación de `useContext` ni usaremos Redux porque es demasiado pesado. **Zustand** es perfecto para manejar el estado global de forma limpia y sin dolores de cabeza.

Lo usaremos exclusivamente para los flujos que necesitan "recordar" datos mientras el usuario navega entre diferentes componentes antes de guardar en la base de datos.

**¿Dónde brilla Zustand en tu sistema?**

* **El Carrito del POS (Punto de Venta):** Cuando el empleado le da al botón "Generar Nueva Venta", empieza a añadir peinillas y máquinas al carrito. Si el empleado minimiza el modal para revisar el stock de otro producto y luego vuelve a abrir el POS, los productos seleccionados deben seguir ahí. Zustand mantiene ese carrito vivo en la memoria RAM del navegador.  
* **El Wizard de Importaciones (4 Pasos):** Tu mamá llenará datos en el Paso 1 (Proforma) y pasará al Paso 2 (Productos). Si le da al botón "Atrás", los datos del Paso 1 no pueden borrarse. Zustand guardará un objeto temporal `importDraft` que acumula la información de los 4 pasos. Solo en el último paso, dispararemos la Server Action para insertar todo de golpe en Prisma.

---

**Un ejemplo rápido de cómo se vería tu "Cerebro" del POS en Zustand:**

**TypeScript**

import { create } from 'zustand'

interface POSState {  
  cart: SaleItem\[\];  
  customer: string | null;  
  locationId: string;  
  addToCart: (product: Product) \=\> void;  
  removeFromCart: (productId: string) \=\> void;  
  clearCart: () \=\> void;  
}

export const usePOSStore \= create\<POSState\>((set) \=\> ({  
  cart: \[\],  
  customer: null,  
  locationId: 'almacen-central-id', // Sede por defecto  
  addToCart: (product) \=\> set((state) \=\> ({ cart: \[...state.cart, product\] })),  
  removeFromCart: (id) \=\> set((state) \=\> ({ cart: state.cart.filter(item \=\> item.id \!== id) })),  
  clearCart: () \=\> set({ cart: \[\], customer: null })  
}))

Con esta arquitectura, la aplicación será indestructible: el servidor lee rápido, el cliente es interactivo solo cuando es necesario, y Zustand mantiene la memoria a corto plazo ordenada.

# 🔐 Estrategia de Seguridad

**Estrategia de Seguridad (Middlewares y RLS)**

La regla de oro en ciberseguridad que todo Ingeniero Senior conoce es: **El frontend es solo una sugerencia.** Ocultar el botón de "Imports" o "Reports" en la barra lateral del empleado está bien para la experiencia de usuario, pero es solo maquillaje. Si un empleado con un poco de conocimiento técnico escribe `razors.com/dashboard/imports` en la barra del navegador o intenta enviar una petición falsa al servidor, nuestro sistema debe bloquearlo en seco.

Para la arquitectura de Razors, implementaremos una **Seguridad en 3 Capas**:

### **Capa 1: Next.js Middleware (El Guardaespaldas en la Puerta)**

El `middleware.ts` de Next.js es un archivo que se ejecuta *antes* de que la página siquiera intente cargar. Actúa como el guardia de seguridad del club.

Cuando alguien intenta entrar a una URL, el middleware revisa su "ID" (el token JWT de su sesión) y pregunta:

1. **¿Está logueado?** Si no, lo patea de vuelta a la vista de Login que diseñaste en Stitch.  
2. **¿Tiene el rol correcto?** Si un `EMPLOYEE` intenta entrar a las rutas que empiezan con `/dashboard/reports` o `/dashboard/imports`, el middleware intercepta la petición al instante y lo redirige automáticamente a `/dashboard/sales` o a una página de "Acceso Denegado". El usuario jamás llegará a ver el código de la vista prohibida.  
     
   

### **Capa 2: Validación en Server Actions (El Auditor Interno)**

Imagina que un empleado no intenta entrar a la página visual de Finanzas, pero de alguna forma averigua el nombre de la función que borra facturas e intenta ejecutarla desde la consola de su navegador.

Para evitar esto, **toda Server Action debe verificar el rol del usuario antes de tocar la base de datos**.

TypeScript  
// Ejemplo conceptual de una Server Action segura  
export async function anularVentaAction(saleId: string) {  
  const session \= await getSession();  
    
  // Barrera de Seguridad  
  if (session.user.role \=== 'EMPLOYEE') {  
    throw new Error("Acción no permitida. Solo el Jefe o Admin pueden anular ventas.");  
  }

  // Si pasa la barrera, recién ejecutamos la lógica de Prisma  
  await prisma.sale.update({ ... });  
}

### **Capa 3: Row Level Security en Supabase (La Bóveda de Titanio)**

Esta es tu máxima red de seguridad. Supabase (al usar PostgreSQL por debajo) nos permite escribir políticas **RLS (Row Level Security)** directamente en la base de datos.

Incluso si cometemos un error fatal como programadores y nos olvidamos de poner la barrera en el Middleware o en la Server Action, la base de datos misma rechazará la petición.

En Supabase, le diremos a PostgreSQL:

* **Tabla `Import` y `Expense`:** *"Solo permite operaciones SELECT, INSERT, UPDATE, DELETE si el `role` del token del usuario es `BOSS` o `ADMIN`."*  
* Si la petición viene de la cuenta del vendedor, la base de datos devolverá un array vacío `[]` o un error `403 Forbidden`, sin importar cuánto lo intenten.

---

Con estas tres capas alineadas (Middleware \-\> Server Actions \-\> RLS de Supabase), tienes un sistema blindado. Tu mamá puede estar absolutamente tranquila sabiendo que su información financiera y de costos está bloqueada a nivel criptográfico, y tú tienes el control total desde tu panel de System Admin.

# 🔁 Migración de Datos

**Estrategia del "Día Cero" y Migración de Datos** es el momento donde la teoría choca con la realidad.

Muchos desarrolladores construyen sistemas perfectos que fracasan el primer día porque no planearon cómo introducir el software en el día a día del negocio. Para que la transición de tu mamá y sus empleados hacia "Razors" sea impecable, debemos estructurar este proceso:

### **1\. La "Semilla" de Datos (Database Seeding)**

El día que subas el sistema a Vercel, la base de datos de Supabase estará vacía. No podemos pedirle a tu mamá que registre a mano sus 100 productos y 50 clientes uno por uno el primer día de trabajo.

* **El Script de Prisma (`seed.ts`):** Crearemos un archivo en tu proyecto que actuará como un inyector automático.  
* **La Tarea Previa:** Necesitarás que tu mamá te pase un Excel con el inventario actual (SKU, Nombre, Categoría, Precio y Stock Actual) y su lista de clientes frecuentes.  
* **La Ejecución:** Leeremos ese Excel con Node.js y, mediante un solo comando en tu terminal, Prisma poblará la base de datos en 5 segundos.

### 

### **2\. El "Corte de Caja" (El Apagón del Sistema Viejo)**

Llevar la contabilidad en dos lugares a la vez (ej. el cuaderno actual y el nuevo sistema Razors) es una receta para el desastre y la duplicación de datos. Necesitamos un corte limpio.

* **El Fin de Semana Cero:** Lo ideal es hacer la migración un domingo (o el día que el negocio esté cerrado). Se hace un inventario físico real, se carga ese número exacto en el `seed.ts` y se sube al servidor.  
* **El Lunes Cero:** A partir de ese lunes a las 8:00 AM, el cuaderno o Excel antiguo "muere". Absolutamente toda venta, transferencia o gasto debe registrarse en Razors. Sin excepciones.  
  


### **3\. Capacitación en Entorno "Sandbox" (Pruebas)**

Antes del Día Cero, el equipo debe perderle el miedo al sistema.

* **Base de Datos de Prueba:** Crearemos un entorno de pruebas idéntico al real pero con datos falsos.  
* **Simulacros:** Tu mamá debe practicar hacer una importación falsa completa (los 4 pasos del Wizard). El vendedor debe practicar qué hacer si se equivoca en una venta (anularla) y cómo crear un cliente nuevo rápido mientras alguien espera en el mostrador.  
* Una vez que dominen este entorno de prueba, reseteamos la base de datos y hacemos el "Corte de Caja" real.


**4\. Plan de Contingencia (Modo Offline)**

¿Qué pasa si el "Día Cero" se cae el internet en la tienda o Vercel tiene mantenimiento? El negocio no puede parar de vender.

* Deben tener un talonario físico de emergencia o un Excel de respaldo local.  
* La regla de negocio debe ser: "Si no hay sistema, se anota a mano. Apenas vuelva el internet, el empleado tiene la obligación de registrar esas ventas en Razors para cuadrar el stock del día".

---

Con estos 4 pilares definidos (Esquema de BD, Renderizado/Estado, Seguridad y Día Cero), tu diseño arquitectónico está al nivel de un líder técnico profesional. Ya sabemos **qué** vamos a construir y **cómo** va a funcionar por debajo.

# ⚙️ 1\. Configuración del Entorno

---

### **Paso 1: Configuración del Entorno y Arquitectura Base (Environment Setup & Core Infrastructure)**

El objetivo de este paso es dejar el cascarón de Next.js listo, conectado a tu base de datos en la nube y con todas las librerías base instaladas para no tener que frenar el desarrollo más adelante.

#### **1.1. Inicialización del Proyecto (Next.js App Router)**

En tu terminal de Ubuntu, navega a la carpeta donde guardas tus proyectos y ejecuta el comando de creación de Next.js.

Bash  
npx create-next-app@latest razors-crm

Durante la instalación, la consola te hará varias preguntas. Respóndelas **exactamente** así para mantener nuestra arquitectura:

* Would you like to use **TypeScript**? \-\> **Yes**  
* Would you like to use **ESLint**? \-\> **Yes**  
* Would you like to use **Tailwind CSS**? \-\> **Yes**  
* Would you like to use **`src/` directory**? \-\> **Yes** *(Mantiene todo ordenado)*  
* Would you like to use **App Router**? \-\> **Yes** *(Crucial para Server Components)*  
* Would you like to customize the default import alias (`@/*`)? \-\> **No**

Una vez termine, entra a la carpeta del proyecto:

Bash  
cd razors-crm

#### **1.2. Instalación de Dependencias Core (Dependencies)**

Vamos a instalar el "arsenal" que definimos en la fase de diseño. Ejecuta esto en tu terminal para instalar el manejador de estado (Zustand), los gráficos (Recharts) y los íconos (Lucide).

Bash  
npm install zustand recharts lucide-react date-fns

#### **1.3. Configuración de la Interfaz de Usuario (Shadcn UI)**

Usaremos Shadcn para tener componentes premium y accesibles (como el modal de vidrio y los dropdowns) sin tener que escribirlos desde cero. Inicializa Shadcn en tu proyecto:

Bash  
npx shadcn-ui@latest init

Responde a la configuración inicial así:

* Which style would you like to use? \-\> **Default**  
* Which color would you like to use as base color? \-\> **Slate** *(Nos da los grises oscuros premium)*  
* Would you like to use CSS variables for colors? \-\> **Yes**

#### **1.4. Creación del Backend en la Nube (Supabase Setup)**

Antes de configurar Prisma, necesitamos que la base de datos exista.

1. Ve a [supabase.com](https://supabase.com) e inicia sesión.  
2. Crea un nuevo proyecto llamado `razors-crm`.  
3. Genera una contraseña fuerte para la base de datos y **guárdala muy bien**.  
4. Selecciona la región más cercana (ej. *South America \- São Paulo* para menor latencia en Perú).  
5. Una vez creado, ve a *Project Settings \-\> Database* y copia tu **Transaction connection string** (URL de conexión).

#### **1.5. Configuración del ORM (Prisma Initialization)**

Ahora vamos a conectar tu código en VS Code con esa base de datos que acabas de crear en Supabase. Instala Prisma como dependencia de desarrollo e inicialízalo:

Bash  
npm install \-D prisma  
npx prisma init

Esto creará una carpeta `prisma/` y un archivo `.env` en la raíz de tu proyecto.

Abre el archivo `.env` y configura tus variables de entorno en inglés. Reemplaza los corchetes con los datos reales de Supabase:

Fragmento de código  
\# Database connection for Prisma  
DATABASE\_URL="postgresql://postgres:\[TU\_CONTRASEÑA\]@\[TU\_HOST\_DE\_SUPABASE\]:5432/postgres?pgbouncer=true"  
DIRECT\_URL="postgresql://postgres:\[TU\_CONTRASEÑA\]@\[TU\_HOST\_DE\_SUPABASE\]:5432/postgres"

\# Supabase Auth & Storage keys  
NEXT\_PUBLIC\_SUPABASE\_URL="https://\[TU\_ID\_DE\_PROYECTO\].supabase.co"  
NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY="\[TU\_LLAVE\_ANONIMA\]"

*(Nota: Prisma en Supabase requiere usar `DIRECT_URL` para las migraciones y `DATABASE_URL` con pgbouncer para las consultas regulares. Ajustaremos esto en el archivo `schema.prisma` en el siguiente paso).*

#### **1.6. Control de Versiones Inicial (Git & GitHub)**

Es fundamental respaldar este punto de partida limpio. Crea un nuevo repositorio en tu cuenta de GitHub (Zairex-Code) llamado `razors-crm`. Luego, vincula tu proyecto local:

Bash  
git add .  
git commit \-m "chore: initial setup with next.js, tailwind, prisma, and zustand"  
git branch \-M main  
git remote add origin https://github.com/Zairex-Code/razors-crm.git  
git push \-u origin main

**❓ What if... (Paso 1): ¿Qué pasa si ya había creado mi carpeta en mi escritorio y clonado un repositorio vacío allí?** 

Si ya tienes la carpeta `razors-crm` en tu escritorio, no debes ejecutar `npx create-next-app@latest razors-crm` porque creará una carpeta dentro de otra. Lo que debes hacer es abrir tu terminal, navegar a esa carpeta (`cd ~/Desktop/razors-crm`) y ejecutar el comando con un punto al final: `npx create-next-app@latest .` (el punto significa "instala Next.js en *este* directorio actual").

---

Con esto, el Paso 1 está liquidado. Tienes un proyecto moderno, tipado, con los cimientos de la base de datos listos para recibir el esquema relacional y respaldado en la nube.

# 2\. Esquema y Migración

### **Paso 2: Configuración del Esquema y Migración de la Base de Datos (Database Schema & Migration)**

El objetivo aquí es tomar ese diseño relacional que hicimos en papel y convertirlo en tablas reales en tu proyecto de Supabase usando Prisma.

#### **2.1. Configuración del Archivo Prisma (`schema.prisma`)**

Ve a tu proyecto en VS Code, abre la carpeta `prisma` y edita el archivo `schema.prisma`. Debemos configurarlo para que entienda que estamos usando PostgreSQL alojado en Supabase (que requiere una URL directa para evitar problemas con los *connection pools*).

Borra todo lo que haya en ese archivo y pega esta estructura exacta (con las tablas que definimos antes):

Fragmento de código

// prisma/schema.prisma

generator client {  
  provider \= "prisma-client-js"  
}

datasource db {  
  provider  \= "postgresql"  
  url       \= env("DATABASE\_URL")  
  directUrl \= env("DIRECT\_URL")  
}

enum Role {  
  ADMIN  
  BOSS  
  EMPLOYEE  
}

enum ImportStatus {  
  PLANNING  
  DISPATCHED  
  IN\_TRANSIT  
  DELIVERED  
}

enum SaleStatus {  
  PAID  
  PENDING  
  VOID  
}

model User {  
  id        String   @id @default(uuid())  
  name      String  
  email     String   @unique  
  password  String     
  role      Role     @default(EMPLOYEE)  
  isActive  Boolean  @default(true)   
  sales     Sale\[\]     
  createdAt DateTime @default(now())  
}

model Location {  
  id        String      @id @default(uuid())  
  name      String        
  inventory Inventory\[\]  
  sales     Sale\[\]  
}

model Product {  
  id          String        @id @default(uuid())  
  sku         String        @unique  
  name        String  
  category    String  
  pricePen    Float           
  inventory   Inventory\[\]  
  importItems ImportItem\[\]  
  saleItems   SaleItem\[\]  
}

model Inventory {  
  id         String   @id @default(uuid())  
  product    Product  @relation(fields: \[productId\], references: \[id\])  
  productId  String  
  location   Location @relation(fields: \[locationId\], references: \[id\])  
  locationId String  
  stock      Int      @default(0)

  @@unique(\[productId, locationId\])   
}

model Customer {  
  id        String   @id @default(uuid())  
  docType   String     
  docNumber String   @unique  
  name      String  
  email     String?  
  sales     Sale\[\]  
}

model Import {  
  id           String        @id @default(uuid())  
  provider     String  
  piNumber     String  
  eta          DateTime?  
  exchangeRate Float           
  status       ImportStatus  @default(PLANNING)  
  items        ImportItem\[\]    
  costs        ImportCost\[\]    
  documents    Document\[\]      
  createdAt    DateTime      @default(now())  
}

model ImportItem {  
  id           String   @id @default(uuid())  
  import       Import   @relation(fields: \[importId\], references: \[id\], onDelete: Cascade)  
  importId     String  
  product      Product  @relation(fields: \[productId\], references: \[id\])  
  productId    String  
  quantity     Int  
  unitPriceUsd Float  
}

model ImportCost {  
  id           String   @id @default(uuid())  
  import       Import   @relation(fields: \[importId\], references: \[id\], onDelete: Cascade)  
  importId     String  
  category     String     
  description  String  
  amount       Float      
  currency     String     
  exchangeRate Float?     
  voucherUrl   String?    
}

model Sale {  
  id            String     @id @default(uuid())  
  invoiceNumber String     @unique  
  date          DateTime   @default(now())  
  status        SaleStatus @default(PAID)  
  totalAmount   Float  
    
  user          User       @relation(fields: \[userId\], references: \[id\])  
  userId        String       
  customer      Customer   @relation(fields: \[customerId\], references: \[id\])  
  customerId    String  
  location      Location   @relation(fields: \[locationId\], references: \[id\])  
  locationId    String       
    
  items         SaleItem\[\]   
}

model SaleItem {  
  id        String  @id @default(uuid())  
  sale      Sale    @relation(fields: \[saleId\], references: \[id\], onDelete: Cascade)  
  saleId    String  
  product   Product @relation(fields: \[productId\], references: \[id\])  
  productId String  
  quantity  Int  
  unitPrice Float  
  subtotal  Float  
}

model Expense {  
  id          String   @id @default(uuid())  
  date        DateTime @default(now())  
  category    String     
  description String  
  amountPen   Float  
  status      String     
  voucherUrl  String?  
}

model Document {  
  id       String  @id @default(uuid())  
  import   Import? @relation(fields: \[importId\], references: \[id\], onDelete: Cascade)  
  importId String?  
  type     String    
  url      String    
}

#### **2.2. Empujar el Esquema a la Base de Datos (DB Push)**

Una vez guardado el archivo, vuelve a tu terminal y ejecuta el comando para sincronizar este código con tu proyecto de Supabase:

Bash  
npx prisma db push

**💡 Extra Tip:** Al usar `db push` en lugar de `migrate dev` en esta etapa temprana, podemos iterar más rápido. Si luego decides que olvidaste una columna, simplemente la agregas en el archivo `.prisma` y vuelves a hacer `push`. Más adelante, cuando el sistema esté en producción, cambiaremos a migraciones formales. Después de ejecutar el comando, entra al panel web de Supabase, ve a la pestaña "Table Editor" y verifica que tus tablas estén creadas allí. Es muy satisfactorio ver la arquitectura cobrando vida.

#### **2.3. Generar el Prisma Client**

Finalmente, necesitamos que Next.js entienda las tablas que acabamos de crear para darnos el autocompletado en TypeScript. Ejecuta:

Bash  
npx prisma generate

---

**❓ What if... me sale un error de "Authentication failed" o "Connection refused" al hacer el `npx prisma db push`?** Esto significa al 100% que las variables en tu archivo `.env` están mal escritas.

1. Revisa que hayas reemplazado los corchetes `[ ]` y que no haya espacios en blanco extra.  
2. Asegúrate de que la contraseña que pusiste en la URL es la contraseña *de la base de datos* de Supabase (la que creaste al iniciar el proyecto), no la contraseña de tu cuenta personal de GitHub o Google.  
3. Verifica que en tu `.env` estés usando `DIRECT_URL` con el puerto `5432` y sin parámetros extra para sortear las restricciones del *pooler* de conexiones.

# 📁 3\. Estructura de Carpetas

### **Paso 3: Estructura de Carpetas (Routing) y Estilos (Tweakcn)**

El objetivo de este paso es dejar lista la "columna vertebral" visual y de navegación del proyecto. Vamos a aplicar tus estilos premium y a crear las rutas de Next.js (App Router) para que coincidan exactamente con la barra lateral que diseñamos en Google Stitch.

#### **3.1. Inyectar la Estética Premium (Tweakcn)**

Como mencionaste, ya tienes archivos exportados desde Tweakcn. Vamos a usarlos para sobrescribir los estilos aburridos por defecto de Tailwind y Shadcn.

1. **Reemplazar el archivo global de CSS:** Ve a la carpeta `src/app/` y abre el archivo `globals.css`. Borra todo su contenido y pega **exactamente** el código CSS que exportaste de Tweakcn. Asegúrate de que las variables CSS (las que empiezan con `--background`, `--foreground`, etc.) que generan ese efecto oscuro y de vidrio líquido estén presentes en la clase `:root` o `.dark`.

**Forzar el Modo Oscuro:** Como "Razors" es una aplicación estrictamente oscura (dark mode), no necesitamos que el usuario ande cambiando temas. Ve a tu archivo `src/app/layout.tsx` y asegúrate de agregar la clase `dark` a la etiqueta `html`.  
TypeScript  
// src/app/layout.tsx  
// ... imports ...

export default function RootLayout({  
  children,  
}: Readonly\<{  
  children: React.ReactNode;  
}\>) {  
  return (  
    \<html lang="es" className="dark"\>  
      \<body className={inter.className}\>{children}\</body\>  
    \</html\>  
  );  
}

2.   
3. **Configurar Tailwind (Si aplica):** Si Tweakcn te generó un archivo `tailwind.config.ts` específico, reemplaza el que está en la raíz de tu proyecto. Asegúrate de que la configuración de `content` apunte correctamente a tus carpetas (`./src/components/**/*.{ts,tsx}`, `./src/app/**/*.{ts,tsx}`).

**💡 Extra Tip:** El Glassmorphism requiere desenfoque (blur) y opacidades. En Tailwind, usarás mucho clases como `bg-background/50` (fondo con 50% de opacidad) combinado con `backdrop-blur-md` para lograr ese efecto de panel translúcido que dibujamos en los mockups.

#### **3.2. Arquitectura de Rutas (App Router)**

Next.js usa un sistema de enrutamiento basado en carpetas. Si creas una carpeta llamada `sales`, la URL será `razors.com/sales`. Vamos a crear las rutas exactas para tu panel B2B, protegiendo todas las vistas comerciales dentro de un "grupo" o carpeta base.

Dentro de la carpeta `src/app/`, crea la siguiente estructura de carpetas:

Plaintext  
src/app/  
├── (auth)/                 // Grupo de rutas (los paréntesis indican que no sale en la URL)  
│   └── login/  
│       └── page.tsx        // Ruta: /login  
├── dashboard/              // El contenedor principal del sistema  
│   ├── layout.tsx          // Aquí irá la barra lateral (Sidebar) y el Header superior  
│   ├── page.tsx            // Ruta: /dashboard (La vista general de la empresa)  
│   ├── inventory/  
│   │   └── page.tsx        // Ruta: /dashboard/inventory  
│   ├── imports/  
│   │   └── page.tsx        // Ruta: /dashboard/imports  
│   ├── customers/  
│   │   └── page.tsx        // Ruta: /dashboard/customers  
│   ├── sales/  
│   │   └── page.tsx        // Ruta: /dashboard/sales  
│   ├── expenses/  
│   │   └── page.tsx        // Ruta: /dashboard/expenses  
│   └── reports/  
│       └── page.tsx        // Ruta: /dashboard/reports  
└── globals.css

**Nota:** Para cada carpeta que hayas creado (ej. `sales`), debes crear un archivo llamado **exactamente** `page.tsx`. Por ahora, solo pon un componente básico adentro para que no dé error al compilar, algo así:

TypeScript  
// Ejemplo para src/app/dashboard/sales/page.tsx  
export default function SalesPage() {  
  return (  
    \<div className="p-8 text-white"\>  
      \<h1 className="text-2xl font-bold"\>Sales History\</h1\>  
      {/\* Aquí irá la tabla de ventas después \*/}  
    \</div\>  
  )  
}

#### **3.3. El Layout Principal (`dashboard/layout.tsx`)**

El archivo `layout.tsx` dentro de la carpeta `dashboard` es especial. Todo lo que pongas aquí (como tu barra lateral oscura con iconos cyan) permanecerá constante, mientras que solo el contenido del centro (`children`) cambiará al navegar entre rutas.

Por ahora, solo crea la estructura base. Más adelante insertaremos los componentes de navegación condicionales.

TypeScript  
// src/app/dashboard/layout.tsx  
export default function DashboardLayout({  
  children,  
}: {  
  children: React.ReactNode;  
}) {  
  return (  
    \<div className="flex h-screen bg-black overflow-hidden"\>  
      {/\* Sidebar Component (Lo crearemos en el Paso 4\) \*/}  
      \<aside className="w-64 border-r border-cyan-500/20 bg-background/50 backdrop-blur-md hidden md:flex flex-col"\>  
          \<div className="p-6 text-xl font-bold text-cyan-400 tracking-wider"\>RAZORS\</div\>  
          {/\* Navegación aquí \*/}  
      \</aside\>

      {/\* Main Content Area \*/}  
      \<main className="flex-1 flex flex-col relative overflow-y-auto"\>  
        {children}  
      \</main\>  
    \</div\>  
  );  
}

---

**❓ What if... (Paso 3): ¿Qué pasa si al probar el Glassmorphism, el panel se ve negro sólido y no "translúcido"?** Esto suele pasar por dos razones:

1. No tienes un fondo (background) detrás del panel que se pueda difuminar. Si todo el fondo de tu página es `bg-black` sólido, un panel translúcido encima también se verá negro. Necesitas un fondo ligeramente texturizado o con formas abstractas tenues (como vimos en el login de Stitch) detrás de los contenedores principales.  
2. Olvidaste la clase `backdrop-blur-md` o `backdrop-blur-lg`. Poner solo `bg-gray-900/50` (opacidad) no crea el efecto de vidrio, solo lo hace transparente; el `backdrop-blur` es el que genera la distorsión del cristal.

# 🧠 4\. El Cerebro del Sistema

### **Paso 4: El Cerebro del Sistema (Seguridad y Middleware)**

El objetivo de este paso es conectar el sistema de autenticación de Supabase con Next.js y crear un guardián que verifique quién entra, qué rol tiene, y a qué rutas puede acceder, bloqueando cualquier intento de acceso no autorizado.

#### **4.1. Instalación del Cliente de Autenticación (Supabase SSR)**

Para manejar sesiones seguras (Cookies) en los Server Components de Next.js, necesitamos la librería oficial de Supabase para Server-Side Rendering. En tu terminal de Ubuntu, ejecuta:

Bash  
npm install @supabase/supabase-js @supabase/ssr

#### **4.2. Utilidades de Conexión (Supabase Clients)**

Debemos crear funciones auxiliares para que Next.js pueda hablar con Supabase de forma segura, ya sea desde el cliente (navegador) o desde el servidor.

Crea una nueva carpeta llamada `utils` dentro de `src/`, y dentro otra llamada `supabase`. Allí crearemos un archivo para el servidor.

Plaintext  
src/  
└── utils/  
    └── supabase/  
        └── server.ts

Dentro de `server.ts`, pega este código que configura el cliente de Supabase para leer y escribir cookies en el servidor:

TypeScript  
// src/utils/supabase/server.ts  
import { createServerClient, type CookieOptions } from '@supabase/ssr'  
import { cookies } from 'next/headers'

export function createClient() {  
  const cookieStore \= cookies()

  return createServerClient(  
    process.env.NEXT\_PUBLIC\_SUPABASE\_URL\!,  
    process.env.NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY\!,  
    {  
      cookies: {  
        get(name: string) {  
          return cookieStore.get(name)?.value  
        },  
        set(name: string, value: string, options: CookieOptions) {  
          try {  
            cookieStore.set({ name, value, ...options })  
          } catch (error) {  
            // Manejo de errores para componentes de servidor  
          }  
        },  
        remove(name: string, options: CookieOptions) {  
          try {  
            cookieStore.set({ name, value: '', ...options })  
          } catch (error) {  
            // Manejo de errores  
          }  
        },  
      },  
    }  
  )  
}

#### 

#### **4.3. Implementación del Middleware (El Guardián)**

Ahora crearemos el archivo que interceptará todas las peticiones web. Crea un archivo llamado **exactamente** `middleware.ts` dentro de la carpeta `src/` (al mismo nivel que la carpeta `app/`).

Este código bloquea a los usuarios no logueados y aplica el RBAC (Role-Based Access Control) para los empleados.

TypeScript  
// src/middleware.ts  
import { NextResponse, type NextRequest } from 'next/server'  
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {  
  let response \= NextResponse.next({  
    request: {  
      headers: request.headers,  
    },  
  })

  const supabase \= createServerClient(  
    process.env.NEXT\_PUBLIC\_SUPABASE\_URL\!,  
    process.env.NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY\!,  
    {  
      cookies: {  
        get(name: string) {  
          return request.cookies.get(name)?.value  
        },  
        set(name: string, value: string, options: CookieOptions) {  
          request.cookies.set({ name, value, ...options })  
          response \= NextResponse.next({  
            request: { headers: request.headers },  
          })  
          response.cookies.set({ name, value, ...options })  
        },  
        remove(name: string, options: CookieOptions) {  
          request.cookies.set({ name, value: '', ...options })  
          response \= NextResponse.next({  
            request: { headers: request.headers },  
          })  
          response.cookies.set({ name, value: '', ...options })  
        },  
      },  
    }  
  )

  // 1\. Obtener la sesión actual  
  const { data: { session } } \= await supabase.auth.getSession()

  const path \= request.nextUrl.pathname

  // 2\. Proteger rutas del Dashboard (Si no hay sesión, al login)  
  if (path.startsWith('/dashboard') && \!session) {  
    return NextResponse.redirect(new URL('/login', request.url))  
  }

  // 3\. Reglas de Negocio Estrictas (RBAC)  
  if (session && path.startsWith('/dashboard')) {  
    // Nota: En producción, el rol debería venir de tu tabla 'User' en Prisma  
    // Aquí asumimos que lo tienes en la metadata del usuario de Supabase  
    const userRole \= session.user.user\_metadata?.role || 'EMPLOYEE'

    const restrictedPathsForEmployees \= \[  
      '/dashboard/imports',  
      '/dashboard/expenses',  
      '/dashboard/reports',  
      '/dashboard/system-settings' // Rutas de Super Admin  
    \]

    const isTryingToAccessRestrictedPath \= restrictedPathsForEmployees.some(  
      (restrictedPath) \=\> path.startsWith(restrictedPath)  
    )

    if (userRole \=== 'EMPLOYEE' && isTryingToAccessRestrictedPath) {  
      // Si el empleado intenta entrar a Finanzas, lo mandamos a Ventas  
      return NextResponse.redirect(new URL('/dashboard/sales', request.url))  
    }  
  }

  // Si está logueado e intenta ir a login, enviarlo al dashboard  
  if (path \=== '/login' && session) {  
    return NextResponse.redirect(new URL('/dashboard', request.url))  
  }

  return response  
}

// Optimización: Solo ejecutar el middleware en estas rutas  
export const config \= {  
  matcher: \[  
    '/((?\!\_next/static|\_next/image|favicon.ico|.\*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).\*)',  
  \],  
}

**💡 Extra Tip:** Presta mucha atención al `matcher` al final del código. Ese bloque de expresión regular (`Regex`) le dice a Next.js: *"Ejecuta este middleware en todas las páginas, EXCEPTO en las imágenes, íconos y archivos estáticos"*. Esto hace que tu sistema cargue muchísimo más rápido, ya que el middleware no gasta recursos de servidor revisando permisos cada vez que la página pide cargar el logo de Razors.

---

**❓ What if... (Paso 4): ¿Qué pasa si al probar el sistema la pantalla se queda en blanco y el navegador dice "Too many redirects" (Demasiados redireccionamientos)?** Este es el error número uno al configurar middlewares. Significa que creaste un ciclo infinito (Bucle). Por ejemplo: El usuario no está logueado, así que el middleware lo envía a `/login`. PERO, si olvidaste decirle al middleware que *ignore* la ruta `/login`, interceptará esa misma redirección, verá que no está logueado, y lo volverá a enviar a `/login` eternamente. La solución es asegurarte de tener la lógica condicional que frena el bucle, como la que escribimos arriba: si la ruta actual *ya es* `/login`, y no hay sesión, simplemente deja pasar la petición con `return response`.

# 🦥 5\. Zustand Stores

### **Paso 5: Arquitectura del Estado Global (Zustand Stores)**

El objetivo de este paso es crear la memoria a corto plazo de tu aplicación. Aquí guardaremos los productos que el empleado va escaneando o los pasos que tu mamá va llenando en la importación, antes de enviarlos definitivamente a la base de datos (Supabase).

#### **5.1. Estructura de Carpetas para el Estado**

Dentro de `src/`, crea una carpeta llamada `store`. Aquí vivirá toda la lógica de memoria global.

Plaintext  
src/  
└── store/  
    ├── usePOSStore.ts       // Memoria del carrito de ventas  
    └── useImportStore.ts    // Memoria del formulario por pasos

#### **5.2. El "Cerebro" del Punto de Venta (POS Store)**

Crea el archivo `usePOSStore.ts`. Este almacén guardará qué cliente está comprando, de qué almacén sale la mercancía y la lista de productos seleccionados (el carrito).

TypeScript  
// src/store/usePOSStore.ts  
import { create } from 'zustand'

// Definimos las interfaces (TypeScript estricto)  
export interface CartItem {  
  productId: string  
  sku: string  
  name: string  
  unitPrice: number  
  quantity: number  
}

interface POSState {  
  customerId: string | null  
  locationId: string | null  
  cart: CartItem\[\]  
    
  // Acciones (Mutators)  
  setCustomer: (id: string) \=\> void  
  setLocation: (id: string) \=\> void  
  addToCart: (item: Omit\<CartItem, 'quantity'\>) \=\> void  
  removeFromCart: (productId: string) \=\> void  
  updateQuantity: (productId: string, quantity: number) \=\> void  
  clearCart: () \=\> void  
    
  // Computed (Getters)  
  getSubtotal: () \=\> number  
  getTotal: () \=\> number // Incluye IGV (18%)  
}

export const usePOSStore \= create\<POSState\>((set, get) \=\> ({  
  customerId: null,  
  locationId: null, // Debería inicializarse con el almacén por defecto del empleado  
  cart: \[\],

  setCustomer: (id) \=\> set({ customerId: id }),  
  setLocation: (id) \=\> set({ locationId: id }),

  addToCart: (newItem) \=\> set((state) \=\> {  
    const existingItem \= state.cart.find(item \=\> item.productId \=== newItem.productId)  
    if (existingItem) {  
      // Si el producto ya está, suma 1 a la cantidad  
      return {  
        cart: state.cart.map(item \=\>   
          item.productId \=== newItem.productId   
            ? { ...item, quantity: item.quantity \+ 1 }   
            : item  
        )  
      }  
    }  
    // Si es nuevo, lo agrega con cantidad 1  
    return { cart: \[...state.cart, { ...newItem, quantity: 1 }\] }  
  }),

  removeFromCart: (productId) \=\> set((state) \=\> ({  
    cart: state.cart.filter(item \=\> item.productId \!== productId)  
  })),

  updateQuantity: (productId, quantity) \=\> set((state) \=\> ({  
    cart: state.cart.map(item \=\>   
      item.productId \=== productId ? { ...item, quantity } : item  
    )  
  })),

  clearCart: () \=\> set({ cart: \[\], customerId: null }),

  getSubtotal: () \=\> {  
    const { cart } \= get()  
    return cart.reduce((total, item) \=\> total \+ (item.unitPrice \* item.quantity), 0\)  
  },

  getTotal: () \=\> {  
    const subtotal \= get().getSubtotal()  
    return subtotal \* 1.18 // Agrega 18% de IGV  
  }  
}))

#### **5.3. El "Cerebro" del Wizard de Importaciones (Import Store)**

Crea el archivo `useImportStore.ts`. Las importaciones son complejas; este almacén retendrá la información temporal mientras tu mamá navega entre el Paso 1 (Proforma) y el Paso 4 (Costos Extra).

TypeScript  
// src/store/useImportStore.ts  
import { create } from 'zustand'

interface ImportDraftState {  
  // Paso 1: Info Base  
  provider: string  
  piNumber: string  
  exchangeRate: number  
    
  // Paso 2: Productos  
  items: Array\<{ productId: string, quantity: number, unitPriceUsd: number }\>  
    
  // Paso 3: Documentos (URLs temporales o archivos a subir)  
  documents: Array\<{ type: string, file: File | null }\>  
    
  // Paso 4: Costos Extra  
  costs: Array\<{ category: string, amount: number, currency: string }\>

  // Controladores de estado  
  setBaseInfo: (info: { provider: string, piNumber: string, exchangeRate: number }) \=\> void  
  setItems: (items: any\[\]) \=\> void  
  addCost: (cost: any) \=\> void  
  clearDraft: () \=\> void  
}

export const useImportStore \= create\<ImportDraftState\>((set) \=\> ({  
  provider: '',  
  piNumber: '',  
  exchangeRate: 3.75, // Valor por defecto  
  items: \[\],  
  documents: \[\],  
  costs: \[\],

  setBaseInfo: (info) \=\> set((state) \=\> ({ ...state, ...info })),  
  setItems: (items) \=\> set({ items }),  
  addCost: (cost) \=\> set((state) \=\> ({ costs: \[...state.costs, cost\] })),  
    
  clearDraft: () \=\> set({  
    provider: '',  
    piNumber: '',  
    items: \[\],  
    documents: \[\],  
    costs: \[\]  
  })  
}))

**💡 Extra Tip:** Como Zustand maneja interactividad del lado del cliente, **cualquier componente de React donde importes `usePOSStore` o `useImportStore` deberá llevar obligatoriamente la directiva `"use client"`** en la primera línea del archivo. Si olvidas esto, Next.js te lanzará un error indicando que estás intentando usar React Hooks en un Server Component.

---

**❓ What if... (Paso 5): ¿Qué pasa si el vendedor está a mitad de una venta gigante de 50 productos, y por error recarga la página (F5)?** Con el código actual, ¡perdería todo el carrito\! Porque el estado de Zustand vive en la memoria RAM (efímera). Para evitar esta tragedia en un entorno B2B, los Ingenieros Seniors usan el middleware `persist` que trae Zustand. Este middleware guarda automáticamente una copia del carrito en el `localStorage` del navegador. Si la página se recarga, Zustand inyecta automáticamente los datos guardados antes de renderizar la pantalla, y el empleado ni se entera de que hubo un reinicio. *(Solo debes envolver tu función `create(...)` con `persist(..., { name: 'pos-storage' })` y listo).*

# 🏞️ 6\. UI Base

**Paso 6: Construcción de la UI Base (Sidebar & Layout)**

El objetivo de este paso es crear un componente de navegación reutilizable que lea la ruta actual para iluminarse con el acento cyan cuando esté activo, y que oculte opciones si el usuario es un empleado.

#### **6.1. Creación del Componente Sidebar (`src/components/Sidebar.tsx`)**

Crea una nueva carpeta llamada `components` dentro de `src/`, y dentro crea el archivo `Sidebar.tsx`.

Aquí aplicaremos estrictamente tu requerimiento de mantener las etiquetas HTML/JSX en una sola línea para un código más compacto, y todo en inglés.

TypeScript  
// src/components/Sidebar.tsx  
"use client"

import Link from 'next/link'  
import { usePathname } from 'next/navigation'  
import { LayoutDashboard, Package, Truck, Users, Activity, Receipt, BarChart3, Settings, ShieldAlert } from 'lucide-react'

// Dummy role for now. In Step 7 we will get this from Supabase session.  
const CURRENT\_USER\_ROLE \= 'ADMIN' // Change to 'EMPLOYEE' to test RBAC UI

const ROUTES \= \[  
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: \['ADMIN', 'BOSS', 'EMPLOYEE'\] },  
  { name: 'Inventory', path: '/dashboard/inventory', icon: Package, roles: \['ADMIN', 'BOSS', 'EMPLOYEE'\] },  
  { name: 'Imports', path: '/dashboard/imports', icon: Truck, roles: \['ADMIN', 'BOSS'\] },  
  { name: 'Customers', path: '/dashboard/customers', icon: Users, roles: \['ADMIN', 'BOSS', 'EMPLOYEE'\] },  
  { name: 'Sales', path: '/dashboard/sales', icon: Activity, roles: \['ADMIN', 'BOSS', 'EMPLOYEE'\] },  
  { name: 'Expenses', path: '/dashboard/expenses', icon: Receipt, roles: \['ADMIN', 'BOSS'\] },  
  { name: 'Reports', path: '/dashboard/reports', icon: BarChart3, roles: \['ADMIN', 'BOSS'\] },  
\]

const ADMIN\_ROUTES \= \[  
  { name: 'User Management', path: '/dashboard/users', icon: Users, roles: \['ADMIN'\] },  
  { name: 'System Settings', path: '/dashboard/settings', icon: Settings, roles: \['ADMIN'\] },  
  { name: 'Security Logs', path: '/dashboard/logs', icon: ShieldAlert, roles: \['ADMIN'\] },  
\]

export default function Sidebar() {  
  const pathname \= usePathname()  
  const allowedRoutes \= ROUTES.filter(route \=\> route.roles.includes(CURRENT\_USER\_ROLE))  
  const allowedAdminRoutes \= ADMIN\_ROUTES.filter(route \=\> route.roles.includes(CURRENT\_USER\_ROLE))

  return (  
    \<aside className="w-64 border-r border-cyan-500/20 bg-background/50 backdrop-blur-xl hidden md:flex flex-col h-full"\>  
      \<div className="p-6 flex items-center gap-3"\>\<div className="w-8 h-8 rounded bg-cyan-500 flex items-center justify-center text-black font-bold"\>R\</div\>\<span className="text-xl font-bold text-white tracking-widest"\>RAZORS\</span\>\</div\>  
        
      \<nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto"\>  
        {allowedRoutes.map((route) \=\> {  
          const isActive \= pathname \=== route.path  
          return (  
            \<Link key={route.path} href={route.path} className={\`flex items-center gap-3 p-3 rounded-lg transition-all ${isActive ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 shadow-\[0\_0\_15px\_rgba(0,247,255,0.1)\]' : 'text-gray-400 hover:text-white hover:bg-white/5'}\`}\>\<route.icon className="w-5 h-5" /\>\<span className="font-medium"\>{route.name}\</span\>\</Link\>  
          )  
        })}

        {allowedAdminRoutes.length \> 0 && (  
          \<div className="mt-8 pt-4 border-t border-gray-800"\>  
            \<span className="px-3 text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2 block"\>System Admin\</span\>  
            {allowedAdminRoutes.map((route) \=\> {  
              const isActive \= pathname \=== route.path  
              return (  
                \<Link key={route.path} href={route.path} className={\`flex items-center gap-3 p-3 rounded-lg transition-all ${isActive ? 'bg-purple-500/10 text-purple-400 border border-purple-500/50 shadow-\[0\_0\_15px\_rgba(168,85,247,0.1)\]' : 'text-gray-400 hover:text-white hover:bg-white/5'}\`}\>\<route.icon className="w-5 h-5" /\>\<span className="font-medium"\>{route.name}\</span\>\</Link\>  
              )  
            })}  
          \</div\>  
        )}  
      \</nav\>

      \<div className="p-4 border-t border-gray-800"\>\<div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-gray-800"\>\<div className={\`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${CURRENT\_USER\_ROLE \=== 'ADMIN' ? 'bg-purple-600' : CURRENT\_USER\_ROLE \=== 'BOSS' ? 'bg-cyan-600' : 'bg-gray-600'}\`}\>Z\</div\>\<div\>\<p className="text-sm font-medium text-white"\>Zairex\</p\>\<p className="text-xs text-gray-500"\>{CURRENT\_USER\_ROLE}\</p\>\</div\>\</div\>\</div\>  
    \</aside\>  
  )  
}

#### **6.2. Integración en el Layout Principal (`src/app/dashboard/layout.tsx`)**

Ahora, tomaremos el layout base que hicimos en el Paso 3 y le inyectaremos este nuevo componente interactivo. Actualiza tu archivo `layout.tsx`:

TypeScript  
// src/app/dashboard/layout.tsx  
import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({  
  children,  
}: {  
  children: React.ReactNode;  
}) {  
  return (  
    \<div className="flex h-screen bg-black overflow-hidden relative"\>\<div className="absolute inset-0 bg-\[radial-gradient(circle\_at\_center,rgba(0,247,255,0.03)\_0,transparent\_100%)\] pointer-events-none" /\>\<Sidebar /\>\<main className="flex-1 flex flex-col relative overflow-y-auto z-10 p-8"\>{children}\</main\>\</div\>  
  );  
}

**💡 Extra Tip:** Nota cómo el archivo `Sidebar.tsx` tiene `"use client"` en la primera línea. Esto es obligatorio porque usamos el hook `usePathname()`, el cual necesita acceder a la URL del navegador del usuario. Sin embargo, el archivo `layout.tsx` NO tiene `"use client"`. Esto es un patrón avanzado llamado **Client Components in Server Components**: mantenemos el layout padre súper rápido en el servidor, y solo el trozo de la barra lateral se ejecuta en el cliente.

**❓ What if... (Paso 6): ¿Qué pasa si abro el sistema desde mi celular? La barra lateral tiene la clase `hidden md:flex`.** Exactamente. Al usar `hidden md:flex`, le estamos diciendo a Tailwind que esconda la barra lateral en pantallas pequeñas (celulares) y la muestre solo en tablets o monitores grandes. Si intentas abrirlo en un móvil, no verás cómo navegar. La solución arquitectónica para esto es crear un componente extra (ej. un `MobileNavbar.tsx` con un menú de "hamburguesa") que tenga la clase `flex md:hidden`, y colocarlo en tu `layout.tsx` justo arriba del `<main>`. Así tendrás una UI adaptativa perfecta.

# 🚪 7\. Autenticación y Gestión de Sesiones

Hasta ahora, nuestro `middleware` y el `Sidebar` están funcionando con datos "falsos" (hardcodeados). El objetivo de este paso es conectar la interfaz de Login que diseñaste en Stitch con Supabase, usando **Server Actions** para que el inicio de sesión sea ultra seguro (sin exponer contraseñas en el navegador) y dinámico.

---

### **Paso 7: Autenticación y Gestión de Sesiones (Authentication & Session Management)**

#### **7.1. Crear las Server Actions de Autenticación**

En lugar de hacer peticiones `fetch` tradicionales, Next.js usa Server Actions. Estas son funciones que viven en el servidor pero que puedes llamar directamente desde un botón.

Crea una carpeta llamada `actions` dentro de `src/` y crea el archivo `auth.ts`.

TypeScript  
// src/actions/auth.ts  
"use server"

import { revalidatePath } from 'next/cache'  
import { redirect } from 'next/navigation'  
import { createClient } from '@/utils/supabase/server'

export async function loginAction(formData: FormData) {  
  const email \= formData.get('email') as string  
  const password \= formData.get('password') as string  
  const supabase \= createClient()

  const { error } \= await supabase.auth.signInWithPassword({  
    email,  
    password,  
  })

  if (error) {  
    return { error: error.message }  
  }

  revalidatePath('/dashboard')  
  redirect('/dashboard')  
}

export async function logoutAction() {  
  const supabase \= createClient()  
  await supabase.auth.signOut()  
  redirect('/login')  
}

#### 

#### **7.2. Construir la Vista de Login (`src/app/(auth)/login/page.tsx`)**

Ahora vamos a traducir ese diseño oscuro y premium del portal de Razors a código React. Usaremos la Server Action `loginAction` que acabamos de crear.

Nota cómo respeto tu regla de mantener las etiquetas JSX compactas en una sola línea para evitar la fragmentación visual del código.

TypeScript  
// src/app/(auth)/login/page.tsx  
"use client"

import { useState } from 'react'  
import { loginAction } from '@/actions/auth'  
import { Lock, Mail } from 'lucide-react'

export default function LoginPage() {  
  const \[error, setError\] \= useState\<string | null\>(null)  
  const \[isPending, setIsPending\] \= useState(false)

  async function handleSubmit(formData: FormData) {  
    setIsPending(true)  
    setError(null)  
    const result \= await loginAction(formData)  
    if (result?.error) setError(result.error)  
    setIsPending(false)  
  }

  return (  
    \<div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden"\>\<div className="absolute inset-0 bg-\[radial-gradient(circle\_at\_center,rgba(0,247,255,0.05)\_0,transparent\_50%)\] pointer-events-none" /\>\<div className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-gray-950/80 backdrop-blur-xl border border-cyan-500/30 shadow-\[0\_0\_40px\_rgba(0,247,255,0.1)\] flex flex-col items-center"\>\<div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6 shadow-\[0\_0\_15px\_rgba(0,247,255,0.4)\]"\>\<Lock className="w-8 h-8 text-cyan-400" /\>\</div\>\<h1 className="text-2xl font-bold text-white mb-2 tracking-widest"\>RAZORS\</h1\>\<p className="text-gray-400 mb-8 font-medium"\>Bienvenido al Portal Razors\</p\>\<form action={handleSubmit} className="w-full flex flex-col gap-4"\>\<div className="relative"\>\<Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" /\>\<input type="email" name="email" placeholder="Correo Electrónico" required className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" /\>\</div\>\<div className="relative"\>\<Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" /\>\<input type="password" name="password" placeholder="Contraseña" required className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" /\>\</div\>{error && \<p className="text-red-400 text-sm text-center font-medium"\>{error}\</p\>}\<button type="submit" disabled={isPending} className="w-full mt-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-lg py-3 rounded-xl transition-all shadow-\[0\_0\_20px\_rgba(0,247,255,0.3)\] disabled:opacity-50"\>{isPending ? 'Verificando...' : 'Inicio de Sesión Seguro'}\</button\>\</form\>\<p className="mt-8 text-xs text-gray-600 text-center uppercase tracking-widest"\>Sistema de Gestión B2B de Sede Única de Razors\</p\>\</div\>\</div\>  
  )  
}

#### 

#### **7.3. Conectar el Sidebar con la Sesión Real**

Vuelve al archivo `src/components/Sidebar.tsx` (del Paso 6). Vamos a quitar el `CURRENT_USER_ROLE` falso y a leer los datos reales del usuario logueado.

*Nota: Como el Sidebar actual es un Client Component (`"use client"`), no podemos usar el cliente de servidor. La mejor práctica de arquitectura es crear un componente envoltorio en el servidor o pasarle el rol como 'prop' desde el `layout.tsx`.*

Actualiza tu `src/app/dashboard/layout.tsx` para leer la sesión en el servidor y pasarle el rol al Sidebar:

TypeScript  
// src/app/dashboard/layout.tsx  
import Sidebar from '@/components/Sidebar'  
import { createClient } from '@/utils/supabase/server'  
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {  
  const supabase \= createClient()  
  const { data: { session } } \= await supabase.auth.getSession()

  if (\!session) {  
    redirect('/login')  
  }

  // Obtenemos el rol desde los metadatos del usuario. Si no hay, es EMPLOYEE.  
  const userRole \= session.user.user\_metadata?.role || 'EMPLOYEE'  
  const userName \= session.user.user\_metadata?.name || 'Usuario'

  return (  
    \<div className="flex h-screen bg-black overflow-hidden relative"\>\<div className="absolute inset-0 bg-\[radial-gradient(circle\_at\_center,rgba(0,247,255,0.03)\_0,transparent\_100%)\] pointer-events-none" /\>\<Sidebar userRole={userRole} userName={userName} /\>\<main className="flex-1 flex flex-col relative overflow-y-auto z-10 p-8"\>{children}\</main\>\</div\>  
  );  
}

Ahora modifica la primera línea de tu `Sidebar.tsx` para aceptar esos `props`:

TypeScript  
// En src/components/Sidebar.tsx, cambia la firma de la función a:  
export default function Sidebar({ userRole, userName }: { userRole: string, userName: string }) {  
  // Elimina la constante CURRENT\_USER\_ROLE y usa 'userRole' en su lugar para los filtros  
  // ...

---

**❓ What if... (Paso 7): ¿Qué pasa si intento hacer login con un usuario recién creado en Supabase y me sale el error "Email not confirmed"?** Este es un "dolor de cabeza" clásico al iniciar con Supabase. Por defecto, Supabase exige que el usuario confirme su correo electrónico haciendo clic en un enlace antes de dejarlo iniciar sesión. **Solución para Desarrollo:** Como estás construyendo el sistema internamente, ve a tu panel de Supabase en la web \-\> *Authentication* \-\> *Providers* \-\> *Email*. Desactiva la opción **"Confirm email"** y dale a Guardar. Esto te permitirá crear usuarios de prueba y loguearte de inmediato sin revisar la bandeja de entrada.

# 💸 8\. Módulo de Ventas

Este módulo es vital para la operación diaria. Aquí implementaremos esa regla de diseño estricta: nada de íconos de "Ojo" aislados. Toda la fila será un contenedor clickeable que se expande hacia abajo revelando los productos exactos que se vendieron en esa transacción, manteniendo el Glassmorphism premium.

---

### **Paso 8: Módulo de Ventas (Sales History & Master-Detail)**

El objetivo aquí es mezclar el poder de lectura rápida de los **Server Components** con la interactividad de los **Client Components** para el acordeón, asegurándonos de que todo el código esté en inglés y con las etiquetas JSX en una sola línea.

#### **8.1. La Server Action para Anular Ventas (`src/actions/sales.ts`)**

Respetando tus reglas de negocio, una venta nunca se elimina de la base de datos, se anula (estado `VOID`) y el stock regresa. Crea el archivo para manejar esta lógica en el backend.

TypeScript  
// src/actions/sales.ts  
"use server"

import { revalidatePath } from 'next/cache'  
import { PrismaClient } from '@prisma/client'

const prisma \= new PrismaClient()

export async function voidSaleAction(saleId: string) {  
  // 1\. Get the sale and its items  
  const sale \= await prisma.sale.findUnique({  
    where: { id: saleId },  
    include: { items: true }  
  })

  if (\!sale || sale.status \=== 'VOID') throw new Error('Sale not found or already voided')

  // 2\. Transaction: Void sale and return stock  
  await prisma.$transaction(async (tx) \=\> {  
    await tx.sale.update({  
      where: { id: saleId },  
      data: { status: 'VOID', totalAmount: 0 }  
    })

    for (const item of sale.items) {  
      await tx.inventory.update({  
        where: {  
          productId\_locationId: {  
            productId: item.productId,  
            locationId: sale.locationId  
          }  
        },  
        data: { stock: { increment: item.quantity } }  
      })  
    }  
  })

  revalidatePath('/dashboard/sales')  
}

#### 

#### **8.2. El Componente Maestro-Detalle (`src/components/sales/SalesTable.tsx`)**

Crea una carpeta `sales` dentro de `src/components/` y añade este archivo. Aquí manejaremos el estado `expandedId` para saber qué fila está abierta. He comprimido el JSX en una sola línea tal como lo prefieres.

TypeScript  
// src/components/sales/SalesTable.tsx  
"use client"

import { useState } from 'react'  
import { voidSaleAction } from '@/actions/sales'  
import { FileText, Printer, Ban } from 'lucide-react'

// Types based on Prisma schema  
type SaleItem \= { id: string, product: { name: string }, quantity: number, unitPrice: number, subtotal: number }  
type Sale \= { id: string, invoiceNumber: string, date: Date, status: string, totalAmount: number, customer: { name: string }, items: SaleItem\[\] }

export default function SalesTable({ sales }: { sales: Sale\[\] }) {  
  const \[expandedId, setExpandedId\] \= useState\<string | null\>(null)  
  const \[isVoiding, setIsVoiding\] \= useState\<string | null\>(null)

  const handleVoid \= async (saleId: string) \=\> {  
    if (\!confirm('Are you sure you want to void this sale? Stock will be returned.')) return  
    setIsVoiding(saleId)  
    await voidSaleAction(saleId)  
    setIsVoiding(null)  
  }

  return (  
    \<div className="w-full bg-background/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl overflow-hidden shadow-\[0\_0\_30px\_rgba(0,247,255,0.05)\]"\>\<table className="w-full text-left border-collapse"\>\<thead className="bg-black/60 border-b border-gray-800 text-gray-400 text-sm uppercase tracking-widest"\>\<tr\>\<th className="p-4 font-medium"\>Invoice\</th\>\<th className="p-4 font-medium"\>Date\</th\>\<th className="p-4 font-medium"\>Customer\</th\>\<th className="p-4 font-medium"\>Status\</th\>\<th className="p-4 font-medium text-right"\>Total (PEN)\</th\>\</tr\>\</thead\>\<tbody className="text-gray-200"\>  
      {sales.map((sale) \=\> (  
        \<optgroup key={sale.id} className="contents"\>  
          \<tr onClick={() \=\> setExpandedId(expandedId \=== sale.id ? null : sale.id)} className={\`border-b border-gray-800/50 hover:bg-cyan-900/10 transition-colors cursor-pointer ${expandedId \=== sale.id ? 'bg-cyan-900/20' : ''}\`}\>\<td className="p-4 font-medium text-cyan-400"\>{sale.invoiceNumber}\</td\>\<td className="p-4"\>{new Date(sale.date).toLocaleDateString()}\</td\>\<td className="p-4"\>{sale.customer.name}\</td\>\<td className="p-4"\>\<span className={\`px-3 py-1 rounded-full text-xs font-bold tracking-wider border ${sale.status \=== 'PAID' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}\`}\>{sale.status}\</span\>\</td\>\<td className="p-4 text-right font-bold text-white"\>S/ {sale.totalAmount.toFixed(2)}\</td\>\</tr\>  
          {expandedId \=== sale.id && (  
            \<tr\>\<td colSpan={5} className="p-0 border-b border-cyan-500/30"\>\<div className="bg-black/80 p-6 flex flex-col gap-4 shadow-inner"\>\<h4 className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-2"\>Order Details\</h4\>\<div className="w-full border border-gray-800 rounded-xl overflow-hidden"\>\<table className="w-full text-sm"\>\<thead className="bg-gray-900/50 text-gray-500 border-b border-gray-800"\>\<tr\>\<th className="p-3"\>Product\</th\>\<th className="p-3 text-center"\>QTY\</th\>\<th className="p-3 text-right"\>Unit Price\</th\>\<th className="p-3 text-right"\>Subtotal\</th\>\</tr\>\</thead\>\<tbody\>{sale.items.map(item \=\> (\<tr key={item.id} className="border-b border-gray-800/50 last:border-0"\>\<td className="p-3 text-gray-300"\>{item.product.name}\</td\>\<td className="p-3 text-center text-gray-400"\>{item.quantity}\</td\>\<td className="p-3 text-right text-gray-400"\>S/ {item.unitPrice.toFixed(2)}\</td\>\<td className="p-3 text-right text-white font-medium"\>S/ {item.subtotal.toFixed(2)}\</td\>\</tr\>))}\</tbody\>\</table\>\</div\>\<div className="flex items-center justify-end gap-4 mt-2"\>\<button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg transition-all"\>\<Printer className="w-4 h-4" /\>Print Receipt\</button\>\<button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-950/30 hover:bg-cyan-900/50 border border-cyan-900 rounded-lg transition-all"\>\<FileText className="w-4 h-4" /\>Download PDF\</button\>{sale.status \!== 'VOID' && (\<button onClick={() \=\> handleVoid(sale.id)} disabled={isVoiding \=== sale.id} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-900/50 border border-red-900 rounded-lg transition-all"\>\<Ban className="w-4 h-4" /\>{isVoiding \=== sale.id ? 'Voiding...' : 'Void Sale'}\</button\>)}\</div\>\</div\>\</td\>\</tr\>  
          )}  
        \</optgroup\>  
      ))}  
    \</tbody\>\</table\>\</div\>  
  )  
}

#### 

#### **8.3. La Vista Principal del Servidor (`src/app/dashboard/sales/page.tsx`)**

Finalmente, conectamos todo en la página. Este componente se ejecuta en el servidor, lee Prisma y le pasa los datos limpios al componente de la tabla.

TypeScript  
// src/app/dashboard/sales/page.tsx  
import { PrismaClient } from '@prisma/client'  
import SalesTable from '@/components/sales/SalesTable'  
import { Plus } from 'lucide-react'

const prisma \= new PrismaClient()

export default async function SalesPage() {  
  // Fetch latest 50 sales with related customer and items  
  const salesData \= await prisma.sale.findMany({  
    take: 50,  
    orderBy: { date: 'desc' },  
    include: {  
      customer: true,  
      items: {  
        include: { product: true }  
      }  
    }  
  })

  return (  
    \<div className="flex flex-col gap-8 w-full max-w-7xl mx-auto"\>\<div className="flex items-center justify-between"\>\<h1 className="text-3xl font-bold text-white tracking-wide"\>Sales \<span className="text-cyan-500"\>History\</span\>\</h1\>\<button className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-3 rounded-xl font-bold transition-all shadow-\[0\_0\_20px\_rgba(0,247,255,0.2)\]"\>\<Plus className="w-5 h-5" /\>New POS Sale\</button\>\</div\>\<SalesTable sales={salesData} /\>\</div\>  
  )  
}

---

**💡 Extra Tip:** En el componente `SalesTable`, utilicé la etiqueta `<optgroup className="contents">` como envoltorio (wrapper) transparente. En HTML estricto, no puedes poner un `<div>` directo dentro de un `<tbody>` para agrupar dos `<tr>` (la fila principal y la fila de detalles expandida). Usar `contents` nos permite agruparlas lógicamente para React sin romper la semántica de la tabla del navegador.

**❓ What if... (Paso 8): ¿Qué pasa si el negocio crece y tienen 10,000 ventas registradas?** Con el código actual (`take: 50`), solo cargaríamos las últimas 50\. Si intentáramos traer las 10,000 de golpe, la base de datos sufriría y la página tardaría en cargar. **Solución Arquitectónica:** Tendríamos que implementar **Paginación del lado del servidor**. En la URL enviaríamos un parámetro como `?page=2`, el servidor leería ese parámetro, usaría el comando `skip` en Prisma (`skip: (page - 1) * 50`), y devolvería solo el siguiente bloque de datos.

# 💲 9\. Punto de Venta

Este es el módulo que el empleado usará el 90% de su día. Aquí conectaremos el almacén temporal que creamos en Zustand (Paso 5\) con una transacción segura en Prisma que descuente el inventario real.

---

### **Paso 9: Módulo de Punto de Venta (POS \- Point of Sale)**

El objetivo de este paso es crear una interfaz de dos columnas: a la izquierda, el catálogo de productos disponibles; a la derecha, el "carrito" de compras en vivo calculado con Zustand.

#### **9.1. La Server Action de Pago (`src/actions/checkout.ts`)**

Cuando el empleado le da al botón "Cobrar", no podemos simplemente hacer varios `inserts` sueltos. Si se va el internet a la mitad, podríamos cobrar la venta pero olvidar descontar el stock. Para evitar esto, usaremos una **Transacción de Prisma** (`$transaction`). Si un paso falla, todo se revierte automáticamente.

Crea el archivo `checkout.ts` en tu carpeta `actions`:

TypeScript  
// src/actions/checkout.ts  
"use server"

import { revalidatePath } from 'next/cache'  
import { redirect } from 'next/navigation'  
import { PrismaClient } from '@prisma/client'

const prisma \= new PrismaClient()

type CheckoutData \= { customerId: string; locationId: string; userId: string; totalAmount: number; items: { productId: string; quantity: number; unitPrice: number }\[\] }

export async function processCheckoutAction(data: CheckoutData) {  
  // Generate a random invoice number for this example  
  const invoiceNumber \= \`INV-${Date.now().toString().slice(-6)}\`

  await prisma.$transaction(async (tx) \=\> {  
    // 1\. Create the main Sale record  
    const sale \= await tx.sale.create({  
      data: { invoiceNumber, totalAmount: data.totalAmount, customerId: data.customerId, locationId: data.locationId, userId: data.userId }  
    })

    // 2\. Create items and decrement stock  
    for (const item of data.items) {  
      await tx.saleItem.create({  
        data: { saleId: sale.id, productId: item.productId, quantity: item.quantity, unitPrice: item.unitPrice, subtotal: item.quantity \* item.unitPrice }  
      })

      // Decrement inventory. This will throw an error if stock goes below 0 if DB constraints are set.  
      await tx.inventory.update({  
        where: { productId\_locationId: { productId: item.productId, locationId: data.locationId } },  
        data: { stock: { decrement: item.quantity } }  
      })  
    }  
  })

  revalidatePath('/dashboard/sales')  
  revalidatePath('/dashboard/inventory')  
  redirect('/dashboard/sales')  
}

#### **9.2. El Componente POS Cliente (`src/components/sales/POSSystem.tsx`)**

Aquí consumimos el estado de Zustand (`usePOSStore`). Recuerda que respeto estrictamente tu regla de escribir las etiquetas JSX agrupadas en una sola línea y el código íntegramente en inglés.

TypeScript  
// src/components/sales/POSSystem.tsx  
"use client"

import { useState } from 'react'  
import { usePOSStore } from '@/store/usePOSStore'  
import { processCheckoutAction } from '@/actions/checkout'  
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle } from 'lucide-react'

type Product \= { id: string; name: string; sku: string; pricePen: number }  
type Customer \= { id: string; name: string }

export default function POSSystem({ products, customers, userId, defaultLocationId }: { products: Product\[\], customers: Customer\[\], userId: string, defaultLocationId: string }) {  
  const { cart, customerId, setCustomer, setLocation, addToCart, removeFromCart, updateQuantity, clearCart, getSubtotal, getTotal } \= usePOSStore()  
  const \[isProcessing, setIsProcessing\] \= useState(false)

  // Initialize location if not set  
  if (\!usePOSStore.getState().locationId) setLocation(defaultLocationId)

  const handleCheckout \= async () \=\> {  
    if (\!customerId || cart.length \=== 0\) return alert('Select a customer and add items first.')  
    setIsProcessing(true)  
    try {  
      await processCheckoutAction({ customerId, locationId: defaultLocationId, userId, totalAmount: getTotal(), items: cart.map(i \=\> ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })) })  
      clearCart()  
    } catch (error) {  
      alert('Checkout failed. Stock might be insufficient.')  
      setIsProcessing(false)  
    }  
  }

  return (  
    \<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full h-\[calc(100vh-8rem)\]"\>\<div className="lg:col-span-2 flex flex-col gap-6 bg-background/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-\[0\_0\_30px\_rgba(0,247,255,0.05)\] overflow-y-auto"\>\<h2 className="text-xl font-bold text-white tracking-wide mb-4"\>Product \<span className="text-cyan-500"\>Catalog\</span\>\</h2\>\<div className="grid grid-cols-2 md:grid-cols-3 gap-4"\>{products.map(p \=\> (\<button key={p.id} onClick={() \=\> addToCart({ productId: p.id, name: p.name, sku: p.sku, unitPrice: p.pricePen })} className="flex flex-col items-start p-4 bg-gray-900/50 hover:bg-cyan-900/20 border border-gray-800 hover:border-cyan-500/50 rounded-xl transition-all text-left"\>\<span className="text-xs text-cyan-400 font-mono mb-1"\>{p.sku}\</span\>\<span className="text-sm font-medium text-white mb-2 line-clamp-2"\>{p.name}\</span\>\<span className="text-lg font-bold text-cyan-300 mt-auto"\>S/ {p.pricePen.toFixed(2)}\</span\>\</button\>))}\</div\>\</div\>\<div className="flex flex-col bg-black/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-2xl relative"\>\<div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-800"\>\<ShoppingCart className="w-6 h-6 text-cyan-400" /\>\<h2 className="text-xl font-bold text-white"\>Current Order\</h2\>\</div\>\<div className="mb-6"\>\<label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2"\>Select Customer\</label\>\<select value={customerId || ''} onChange={(e) \=\> setCustomer(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:border-cyan-500 focus:outline-none"\>\<option value="" disabled\>-- Choose Customer \--\</option\>{customers.map(c \=\> (\<option key={c.id} value={c.id}\>{c.name}\</option\>))}\</select\>\</div\>\<div className="flex-1 overflow-y-auto flex flex-col gap-4 mb-6"\>{cart.length \=== 0 ? (\<p className="text-gray-500 text-center my-auto italic"\>Cart is empty\</p\>) : cart.map(item \=\> (\<div key={item.productId} className="flex flex-col gap-2 p-3 bg-gray-900/50 rounded-xl border border-gray-800"\>\<div className="flex justify-between items-start"\>\<span className="text-sm font-medium text-white"\>{item.name}\</span\>\<button onClick={() \=\> removeFromCart(item.productId)} className="text-gray-500 hover:text-red-400"\>\<Trash2 className="w-4 h-4" /\>\</button\>\</div\>\<div className="flex justify-between items-center mt-2"\>\<div className="flex items-center gap-3 bg-black rounded-lg border border-gray-800 p-1"\>\<button onClick={() \=\> updateQuantity(item.productId, Math.max(1, item.quantity \- 1))} className="p-1 text-gray-400 hover:text-white"\>\<Minus className="w-3 h-3" /\>\</button\>\<span className="text-sm font-bold text-white w-4 text-center"\>{item.quantity}\</span\>\<button onClick={() \=\> updateQuantity(item.productId, item.quantity \+ 1)} className="p-1 text-gray-400 hover:text-white"\>\<Plus className="w-3 h-3" /\>\</button\>\</div\>\<span className="text-sm font-bold text-cyan-400"\>S/ {(item.unitPrice \* item.quantity).toFixed(2)}\</span\>\</div\>\</div\>))}\</div\>\<div className="mt-auto pt-6 border-t border-gray-800 flex flex-col gap-3"\>\<div className="flex justify-between text-gray-400"\>\<span className="text-sm"\>Subtotal\</span\>\<span className="text-sm"\>S/ {getSubtotal().toFixed(2)}\</span\>\</div\>\<div className="flex justify-between text-gray-400"\>\<span className="text-sm"\>IGV (18%)\</span\>\<span className="text-sm"\>S/ {(getTotal() \- getSubtotal()).toFixed(2)}\</span\>\</div\>\<div className="flex justify-between text-white font-bold text-xl mb-4"\>\<span\>Total\</span\>\<span className="text-cyan-400"\>S/ {getTotal().toFixed(2)}\</span\>\</div\>\<button onClick={handleCheckout} disabled={isProcessing || cart.length \=== 0 || \!customerId} className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl flex justify-center items-center gap-2 transition-all disabled:opacity-50 shadow-\[0\_0\_20px\_rgba(0,247,255,0.2)\]"\>{isProcessing ? 'Processing...' : \<\>\<CheckCircle className="w-5 h-5" /\> Checkout Order\</\>}\</button\>\</div\>\</div\>  
  )  
}

#### 

#### **9.3. La Página del Servidor (`src/app/dashboard/pos/page.tsx`)**

Finalmente, creamos la ruta `/dashboard/pos` que cargará los datos de la base de datos antes de pintar el componente cliente.

TypeScript  
// src/app/dashboard/pos/page.tsx  
import { PrismaClient } from '@prisma/client'  
import { createClient } from '@/utils/supabase/server'  
import POSSystem from '@/components/sales/POSSystem'

const prisma \= new PrismaClient()

export default async function POSPage() {  
  const supabase \= createClient()  
  const { data: { session } } \= await supabase.auth.getSession()  
  const userId \= session?.user.id || 'default-user-id' // Ideally from DB match

  // Fetch available products and customers  
  const products \= await prisma.product.findMany({  
    select: { id: true, name: true, sku: true, pricePen: true }  
  })  
    
  const customers \= await prisma.customer.findMany({  
    select: { id: true, name: true }  
  })

  // For simplicity, we assume a default location. In reality, get this from user profile.  
  const defaultLocation \= await prisma.location.findFirst()

  return (  
    \<div className="w-full max-w-\[1600px\] mx-auto flex flex-col gap-6"\>\<h1 className="text-3xl font-bold text-white tracking-wide"\>Point of \<span className="text-cyan-500"\>Sale\</span\>\</h1\>\<POSSystem products={products} customers={customers} userId={userId} defaultLocationId={defaultLocation?.id || ''} /\>\</div\>  
  )  
}

---

**💡 Extra Tip:** En un entorno de producción B2B donde tu mamá podría tener 2,000 productos de barbería, no es óptimo cargar todos los productos en el `findMany` del `page.tsx` (Paso 9.3) y pasarlos al componente. Lo correcto sería agregar una barra de búsqueda (`<input>`) en el componente `POSSystem` y hacer llamadas a una API interna usando *Debounce* (para que solo busque en Prisma cuando el vendedor termine de tipear el nombre de la peinilla).

**❓ What if... (Paso 9): ¿Qué pasa si dos vendedores (en computadoras distintas) intentan vender la ÚLTIMA peinilla azul exactamente en el mismo segundo?** A esto se le llama "Race Condition" (Condición de Carrera). Con el código actual, si el vendedor A abre su carrito y ve 1 peinilla, y el vendedor B hace lo mismo, ambos le dan a cobrar. Prisma intentará hacer un `-1` dos veces, dejando el stock en `-1`. **Solución:** En tu archivo `schema.prisma` que hicimos en el Paso 2, debes asegurarte de que el campo `stock` esté configurado a nivel de base de datos para no aceptar números negativos (ej. usando un `CHECK constraint` en PostgreSQL a través de Supabase). Así, la transacción del vendedor B fallará devolviendo un error de "Stock Insuficiente" y protegiendo tu inventario.

# 🛳️ 10\. Módulo de Importaciones

¡Excelente disciplina, Dylan\! Este documento que estás armando vale oro puro. Entramos al **Paso 10: El Wizard de Importaciones (Flujo de 4 Pasos)**.

Este es el verdadero núcleo financiero para tu mamá (la Jefa). Las importaciones son complejas porque no suceden en un solo día; involucran proformas, costos aduaneros que llegan semanas después, y tipos de cambio fluctuantes.

Para resolver esto sin agobiar al usuario, usamos el patrón "Wizard" (Asistente por pasos), consumiendo el almacén temporal (`useImportStore`) que configuramos en el Paso 5\.

---

### **Paso 10: Módulo de Importaciones (4-Step Wizard & Cost Distribution)**

El objetivo de este paso es recolectar toda la información de la importación en la memoria RAM del navegador y, solo al llegar al último paso, enviarlo todo en un bloque consolidado (Transacción) a la base de datos.

#### 

#### **10.1. La Server Action de Importación (`src/actions/imports.ts`)**

Aquí está la regla de negocio más importante: **Crear una importación NO suma stock**. La importación nace con el estado `PLANNING`. El stock solo se sumará semanas después, cuando tu mamá cambie el estado a `DELIVERED` en otra pantalla.

TypeScript  
// src/actions/imports.ts  
"use server"

import { revalidatePath } from 'next/cache'  
import { redirect } from 'next/navigation'  
import { PrismaClient } from '@prisma/client'

const prisma \= new PrismaClient()

type ImportItemData \= { productId: string; quantity: number; unitPriceUsd: number }  
type ImportCostData \= { category: string; description: string; amount: number; currency: string; exchangeRate: number }

type ImportData \= {  
  provider: string;  
  piNumber: string;  
  exchangeRate: number;  
  items: ImportItemData\[\];  
  costs: ImportCostData\[\];  
}

export async function createImportAction(data: ImportData) {  
  await prisma.$transaction(async (tx) \=\> {  
    // 1\. Create the main Import record (defaults to 'PLANNING' status)  
    const newImport \= await tx.import.create({  
      data: {  
        provider: data.provider,  
        piNumber: data.piNumber,  
        exchangeRate: data.exchangeRate,  
      }  
    })

    // 2\. Insert all products linked to this import  
    if (data.items.length \> 0\) {  
      await tx.importItem.createMany({  
        data: data.items.map(item \=\> ({  
          importId: newImport.id,  
          productId: item.productId,  
          quantity: item.quantity,  
          unitPriceUsd: item.unitPriceUsd  
        }))  
      })  
    }

    // 3\. Insert all extra costs (Shipping, Customs, etc.)  
    if (data.costs.length \> 0\) {  
      await tx.importCost.createMany({  
        data: data.costs.map(cost \=\> ({  
          importId: newImport.id,  
          category: cost.category,  
          description: cost.description,  
          amount: cost.amount,  
          currency: cost.currency,  
          exchangeRate: cost.exchangeRate  
        }))  
      })  
    }  
  })

  revalidatePath('/dashboard/imports')  
  redirect('/dashboard/imports')  
}

#### **10.2. El Componente Wizard Cliente (`src/components/imports/ImportWizard.tsx`)**

Aquí crearemos el formulario visual por pasos. Mantengo estrictamente tu directiva de colapsar las etiquetas JSX en una sola línea para evitar la fragmentación vertical que no te gusta.

TypeScript  
// src/components/imports/ImportWizard.tsx  
"use client"

import { useState } from 'react'  
import { useImportStore } from '@/store/useImportStore'  
import { createImportAction } from '@/actions/imports'  
import { ArrowRight, ArrowLeft, CheckCircle, Upload } from 'lucide-react'

export default function ImportWizard() {  
  const \[step, setStep\] \= useState(1)  
  const \[isSaving, setIsSaving\] \= useState(false)  
    
  // Zustand state  
  const { provider, piNumber, exchangeRate, items, costs, setBaseInfo, clearDraft } \= useImportStore()

  const handleComplete \= async () \=\> {  
    if (\!provider || \!piNumber) return alert('Provider and PI Number are required.')  
    setIsSaving(true)  
    try {  
      await createImportAction({ provider, piNumber, exchangeRate, items, costs })  
      clearDraft()  
      // Action handles redirect  
    } catch (error) {  
      alert('Failed to save import. Please try again.')  
      setIsSaving(false)  
    }  
  }

  return (  
    \<div className="w-full max-w-4xl mx-auto bg-background/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 shadow-\[0\_0\_40px\_rgba(0,247,255,0.05)\]"\>\<div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6"\>\<div className={\`flex flex-col items-center gap-2 ${step \>= 1 ? 'text-cyan-400' : 'text-gray-600'}\`}\>\<div className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step \>= 1 ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400' : 'bg-gray-900 border border-gray-800'}\`}\>1\</div\>\<span className="text-xs uppercase tracking-widest font-bold"\>Info Base\</span\>\</div\>\<div className={\`h-px flex-1 mx-4 ${step \>= 2 ? 'bg-cyan-500/50' : 'bg-gray-800'}\`} /\>\<div className={\`flex flex-col items-center gap-2 ${step \>= 2 ? 'text-cyan-400' : 'text-gray-600'}\`}\>\<div className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step \>= 2 ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400' : 'bg-gray-900 border border-gray-800'}\`}\>2\</div\>\<span className="text-xs uppercase tracking-widest font-bold"\>Products\</span\>\</div\>\<div className={\`h-px flex-1 mx-4 ${step \>= 3 ? 'bg-cyan-500/50' : 'bg-gray-800'}\`} /\>\<div className={\`flex flex-col items-center gap-2 ${step \>= 3 ? 'text-cyan-400' : 'text-gray-600'}\`}\>\<div className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step \>= 3 ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400' : 'bg-gray-900 border border-gray-800'}\`}\>3\</div\>\<span className="text-xs uppercase tracking-widest font-bold"\>Documents\</span\>\</div\>\<div className={\`h-px flex-1 mx-4 ${step \>= 4 ? 'bg-cyan-500/50' : 'bg-gray-800'}\`} /\>\<div className={\`flex flex-col items-center gap-2 ${step \>= 4 ? 'text-cyan-400' : 'text-gray-600'}\`}\>\<div className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step \>= 4 ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400' : 'bg-gray-900 border border-gray-800'}\`}\>4\</div\>\<span className="text-xs uppercase tracking-widest font-bold"\>Costs\</span\>\</div\>\</div\>\<div className="min-h-\[300px\]"\>  
      {step \=== 1 && (\<div className="flex flex-col gap-6"\>\<h3 className="text-xl text-white font-bold mb-2"\>Proforma Details\</h3\>\<input type="text" placeholder="Provider / Brand Name (e.g., Wahl, Babyliss)" value={provider} onChange={(e) \=\> setBaseInfo({ provider: e.target.value, piNumber, exchangeRate })} className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-cyan-500 focus:outline-none" /\>\<input type="text" placeholder="Proforma Invoice Number (PI)" value={piNumber} onChange={(e) \=\> setBaseInfo({ provider, piNumber: e.target.value, exchangeRate })} className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-cyan-500 focus:outline-none" /\>\<div className="flex items-center gap-4"\>\<span className="text-gray-400"\>Initial USD/PEN Exchange Rate:\</span\>\<input type="number" step="0.01" value={exchangeRate} onChange={(e) \=\> setBaseInfo({ provider, piNumber, exchangeRate: parseFloat(e.target.value) })} className="w-32 bg-black/50 border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-cyan-500 focus:outline-none" /\>\</div\>\</div\>)}  
      {step \=== 2 && (\<div className="flex flex-col gap-6"\>\<h3 className="text-xl text-white font-bold mb-2"\>Add Products\</h3\>\<p className="text-gray-500 text-sm"\>Product selection table goes here (connected to items array in Zustand).\</p\>\</div\>)}  
      {step \=== 3 && (\<div className="flex flex-col gap-6"\>\<h3 className="text-xl text-white font-bold mb-2"\>Upload PI & Vouchers\</h3\>\<div className="border-2 border-dashed border-gray-800 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 hover:border-cyan-500/50 transition-colors cursor-pointer"\>\<Upload className="w-10 h-10 text-gray-500" /\>\<p className="text-gray-400"\>Drag and drop PDFs or images here\</p\>\</div\>\</div\>)}  
      {step \=== 4 && (\<div className="flex flex-col gap-6"\>\<h3 className="text-xl text-white font-bold mb-2"\>Additional Import Costs\</h3\>\<p className="text-gray-500 text-sm"\>Form to add Shipping, Customs, and Mobility costs dynamically.\</p\>\</div\>)}  
      \</div\>\<div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-800"\>{step \> 1 ? (\<button onClick={() \=\> setStep(step \- 1)} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 transition-all"\>\<ArrowLeft className="w-5 h-5" /\> Back\</button\>) : (\<div /\>)}{step \< 4 ? (\<button onClick={() \=\> setStep(step \+ 1)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-bold transition-all"\>Next Step \<ArrowRight className="w-5 h-5" /\>\</button\>) : (\<button onClick={handleComplete} disabled={isSaving} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all shadow-\[0\_0\_20px\_rgba(0,247,255,0.3)\] disabled:opacity-50"\>{isSaving ? 'Processing...' : \<\>\<CheckCircle className="w-5 h-5" /\> Save Import Pipeline\</\>}\</button\>)}\</div\>\</div\>  
  )  
}

#### 

#### **10.3. La Página del Servidor (`src/app/dashboard/imports/new/page.tsx`)**

En Next.js, como usamos la estructura de carpetas, crear la subcarpeta `new` con su `page.tsx` nos dará automáticamente la ruta `/dashboard/imports/new` para alojar este Wizard, manteniendo la ruta `/dashboard/imports` limpia para mostrar la tabla de las importaciones ya hechas.

TypeScript  
// src/app/dashboard/imports/new/page.tsx  
import ImportWizard from '@/components/imports/ImportWizard'

export default function NewImportPage() {  
  return (  
    \<div className="flex flex-col gap-8 w-full max-w-7xl mx-auto"\>\<div className="flex flex-col"\>\<h1 className="text-3xl font-bold text-white tracking-wide"\>New \<span className="text-cyan-500"\>Import Pipeline\</span\>\</h1\>\<p className="text-gray-500 mt-2"\>Create a new container or shipment tracker.\</p\>\</div\>\<ImportWizard /\>\</div\>  
  )  
}

---

**💡 Extra Tip:** En el **Paso 3 (Documentos)** del Wizard, la mejor práctica en el ecosistema Supabase es *no* subir el archivo físico directamente a Prisma (PostgreSQL). Lo que harás cuando desarrolles esa función completa será: usar `supabase.storage.from('documents').upload(...)`, esto guardará el PDF en un Storage Bucket de Amazon S3 administrado por Supabase. Ese método te devolverá un link público/seguro (ej. `https://supabase.co/storage/.../factura.pdf`). Ese simple texto (URL) es lo *único* que guardarás en Prisma bajo la tabla `Document`. Tu base de datos se mantendrá ligera y rapidísima.

**❓ What if... (Paso 10): ¿Qué pasa si el tipo de cambio varía radicalmente entre el día que se aprueba la Proforma (Paso 1\) y el día que llega el contenedor a la aduana peruana (Paso 4)?** Excelente pregunta financiera. Si te fijas en la arquitectura Prisma que hicimos en el Paso 2, la tabla matriz `Import` tiene un `exchangeRate` (para cuadrar el costo de los productos en dólares), pero la tabla `ImportCost` *también* tiene un campo `exchangeRate` propio. La regla de negocio es: Cuando tu mamá pague la naviera o la SUNAT 30 días después, el sistema usará el tipo de cambio exacto de *ese día específico* (Paso 4\) para calcular el costo de aduanas, mientras mantiene el tipo de cambio original para calcular el precio de compra de los artículos al proveedor. Esta es la única forma de tener un prorrateo (costeo) real al centavo en soles.

# 🕵️ 11\. Buscador Inteligente

A este patrón de diseño se le conoce como **"Creatable Combobox"** (o Autocompletado con Creación). Si dejas un `<input type="text">` libre, tu mamá escribirá "Peinilla Roja", el vendedor "Peine Rojo", y la base de datos se llenará de basura duplicada, arruinando el control de inventario.

Esta lógica es vital y la aplicaremos en tres lugares críticos:

1. **Importaciones:** Para buscar/crear productos al armar el contenedor.  
2. **Punto de Venta (POS):** Para buscar/crear clientes nuevos en el mostrador.  
3. **Gastos (Expenses):** Para buscar/crear proveedores o categorías de gasto.

Vamos a empaquetar esto en nuestro siguiente paso.

---

### **Paso 11: El Buscador Inteligente Antiduplicados (Creatable Combobox)**

El objetivo de este paso es construir un componente reutilizable que busque en la base de datos mientras el usuario teclea. Si encuentra el producto, lo selecciona; si no, despliega un botón para crear el registro en la base de datos sin obligar al usuario a salir del *Wizard*.

#### 

#### **11.1. El Componente Buscador Inteligente (`src/components/ui/SmartProductSearch.tsx`)**

Usaremos un patrón de "dropdown" dinámico. Respeto tu regla estricta: código 100% en inglés y las etiquetas JSX anidadas en una sola línea para mantenerlo compacto.

TypeScript  
// src/components/ui/SmartProductSearch.tsx  
"use client"

import { useState, useRef, useEffect } from 'react'  
import { Search, Plus, Package } from 'lucide-react'

// Typically, 'products' would come from a real-time API query (e.g., using SWR or React Query),   
// but for simplicity we pass the initial list as props.  
type ProductList \= { id: string; name: string; sku: string }\[\]

export default function SmartProductSearch({ products, onSelectProduct }: { products: ProductList, onSelectProduct: (prod: any) \=\> void }) {  
  const \[query, setQuery\] \= useState('')  
  const \[isOpen, setIsOpen\] \= useState(false)  
  const \[showCreateModal, setShowCreateModal\] \= useState(false)  
  const wrapperRef \= useRef\<HTMLDivElement\>(null)

  // Filter products based on user input  
  const filteredProducts \= products.filter(p \=\> p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()))  
  const exactMatchExists \= products.some(p \=\> p.name.toLowerCase() \=== query.toLowerCase())

  // Close dropdown when clicking outside  
  useEffect(() \=\> {  
    function handleClickOutside(event: MouseEvent) { if (wrapperRef.current && \!wrapperRef.current.contains(event.target as Node)) setIsOpen(false) }  
    document.addEventListener("mousedown", handleClickOutside); return () \=\> document.removeEventListener("mousedown", handleClickOutside);  
  }, \[\])

  const handleCreateNew \= async (e: React.FormEvent\<HTMLFormElement\>) \=\> {  
    e.preventDefault()  
    const formData \= new FormData(e.currentTarget)  
    // 1\. Here you would trigger a Server Action: createProductAction(formData)  
    // 2\. Mocking the new DB object:  
    const newProduct \= { id: \`new-${Date.now()}\`, name: formData.get('name') as string, sku: formData.get('sku') as string }  
      
    // 3\. Auto-select the newly created product and close modal  
    onSelectProduct(newProduct)  
    setShowCreateModal(false)  
    setQuery('')  
  }

  return (  
    \<div ref={wrapperRef} className="relative w-full"\>  
      \<div className="relative flex items-center w-full"\>\<Search className="absolute left-4 w-5 h-5 text-cyan-500" /\>\<input type="text" value={query} onChange={(e) \=\> { setQuery(e.target.value); setIsOpen(true) }} onFocus={() \=\> setIsOpen(true)} placeholder="Search product by name or SKU..." className="w-full bg-black/60 border border-gray-800 focus:border-cyan-500 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 outline-none transition-all" /\>\</div\>  
        
      {isOpen && query.length \> 0 && (  
        \<div className="absolute z-50 w-full mt-2 bg-gray-950 border border-gray-800 rounded-xl shadow-\[0\_0\_30px\_rgba(0,0,0,0.8)\] overflow-hidden flex flex-col max-h-64 overflow-y-auto"\>  
          {filteredProducts.map(p \=\> (\<button key={p.id} onClick={() \=\> { onSelectProduct(p); setIsOpen(false); setQuery('') }} className="w-full text-left px-4 py-3 hover:bg-cyan-900/30 border-b border-gray-900 last:border-0 flex items-center gap-3 transition-colors"\>\<Package className="w-4 h-4 text-gray-500" /\>\<div\>\<p className="text-white text-sm font-medium"\>{p.name}\</p\>\<p className="text-cyan-600 text-xs font-mono"\>{p.sku}\</p\>\</div\>\</button\>))}  
            
          {\!exactMatchExists && (  
            \<button onClick={() \=\> { setShowCreateModal(true); setIsOpen(false) }} className="w-full text-left px-4 py-3 bg-cyan-950/20 hover:bg-cyan-900/40 text-cyan-400 text-sm font-bold flex items-center gap-2 transition-colors"\>\<Plus className="w-4 h-4" /\> Register new product: "{query}"\</button\>  
          )}  
        \</div\>  
      )}

      {/\* CREATE NEW PRODUCT MODAL (Glassmorphism) \*/}  
      {showCreateModal && (  
        \<div className="fixed inset-0 z-\[100\] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"\>\<div className="w-full max-w-md bg-gray-950 border border-cyan-500/30 rounded-2xl p-6 shadow-\[0\_0\_40px\_rgba(0,247,255,0.15)\] flex flex-col gap-4"\>\<h3 className="text-xl font-bold text-white tracking-wide border-b border-gray-800 pb-4"\>Register New \<span className="text-cyan-500"\>Product\</span\>\</h3\>\<form onSubmit={handleCreateNew} className="flex flex-col gap-4"\>\<input type="text" name="name" defaultValue={query} placeholder="Product Name" required className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-cyan-500 outline-none" /\>\<input type="text" name="sku" placeholder="SKU (e.g. WHL-123)" required className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-cyan-500 outline-none" /\>\<div className="flex justify-end gap-3 mt-4"\>\<button type="button" onClick={() \=\> setShowCreateModal(false)} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors"\>Cancel\</button\>\<button type="submit" className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all shadow-\[0\_0\_15px\_rgba(0,247,255,0.3)\]"\>Save Product\</button\>\</div\>\</form\>\</div\>\</div\>  
      )}  
    \</div\>  
  )  
}

#### **11.2. Integración en el Paso 2 del Wizard de Importaciones**

Ahora, volvemos a tu archivo `ImportWizard.tsx` (del Paso 10\) y actualizamos la sección donde decíamos *"Product selection table goes here"*.

Conectaremos el buscador inteligente para que, al elegir un producto, lo agregue a la lista temporal de la importación y le permita a tu mamá ponerle el precio en dólares.

TypeScript  
// Dentro de src/components/imports/ImportWizard.tsx (Reemplazar la sección del step \=== 2\)

{step \=== 2 && (  
  \<div className="flex flex-col gap-6"\>  
    \<h3 className="text-xl text-white font-bold mb-2"\>Add Products\</h3\>  
      
    {/\* Implementación del buscador inteligente \*/}  
    \<SmartProductSearch   
      products={availableProductsFromDB}   
      onSelectProduct={(newProd) \=\> setItems(\[...items, { productId: newProd.id, name: newProd.name, quantity: 1, unitPriceUsd: 0 }\])}   
    /\>

    {/\* Tabla de productos agregados a la importación actual \*/}  
    {items.length \> 0 && (  
      \<div className="w-full border border-gray-800 rounded-xl overflow-hidden mt-4"\>\<table className="w-full text-sm text-left"\>\<thead className="bg-gray-900/50 text-gray-500 border-b border-gray-800 uppercase tracking-wider text-xs"\>\<tr\>\<th className="p-4"\>Product\</th\>\<th className="p-4 w-32"\>QTY\</th\>\<th className="p-4 w-40"\>Unit Price (USD)\</th\>\<th className="p-4 text-right"\>Total\</th\>\</tr\>\</thead\>\<tbody className="text-gray-300"\>  
        {items.map((item, index) \=\> (  
          \<tr key={index} className="border-b border-gray-800/50 last:border-0"\>\<td className="p-4 font-medium"\>{item.name}\</td\>\<td className="p-4"\>\<input type="number" min="1" value={item.quantity} onChange={(e) \=\> { const newItems \= \[...items\]; newItems\[index\].quantity \= parseInt(e.target.value); setItems(newItems) }} className="w-full bg-black/50 border border-gray-800 rounded-lg py-2 px-3 text-white focus:border-cyan-500 outline-none" /\>\</td\>\<td className="p-4"\>\<div className="relative"\>\<span className="absolute left-3 top-2 text-gray-500"\>$\</span\>\<input type="number" step="0.01" value={item.unitPriceUsd} onChange={(e) \=\> { const newItems \= \[...items\]; newItems\[index\].unitPriceUsd \= parseFloat(e.target.value); setItems(newItems) }} className="w-full bg-black/50 border border-gray-800 rounded-lg py-2 pl-7 pr-3 text-white focus:border-cyan-500 outline-none" /\>\</div\>\</td\>\<td className="p-4 text-right font-bold text-cyan-400"\>${(item.quantity \* item.unitPriceUsd).toFixed(2)}\</td\>\</tr\>  
        ))}  
      \</tbody\>\</table\>\</div\>  
    )}  
  \</div\>  
)}

---

**💡 Extra Tip:** Este componente modal de "Creación Rápida" dentro del buscador es un salvavidas de UX. Imagina que tu mamá está registrando una importación de 30 productos, va por el número 29 y se da cuenta de que olvidó registrar una tijera nueva en el inventario maestro. Si la obligas a salir del Wizard, ir a la página de "Inventario", crear la tijera y volver... perderá todo su progreso y se frustrará. Con este modal flotante, crea la tijera en 5 segundos, la base de datos se actualiza por detrás, el componente la selecciona automáticamente y ella continúa en el Wizard como si nada.

**❓ What if... (Paso 11): ¿Qué pasa si el sistema tiene 5,000 productos registrados? ¿Le paso los 5,000 por `props` al componente?** No, pasar un Array tan gigante desde el servidor al cliente colapsaría la memoria del navegador. Cuando tu base de datos crezca, la evolución de este componente es no recibir `products` por props. En su lugar, el `<input>` usará un `useEffect` con un "Debounce" (un temporizador de 300ms). Cuando el usuario termine de escribir "Peini...", el cliente hará una petición `fetch` oculta al servidor (`/api/search?q=Peini`), el servidor buscará en PostgreSQL usando `ILIKE '%Peini%'` y devolverá solo un Array máximo de 5 resultados. Eso mantiene el sistema rápido sin importar si tienes 10 o 100,000 productos.

# 💰 12\. Gastos Operativos

Ahora nos toca abordar el módulo que separa las finanzas puras de la logística: **Paso 12: Módulo de Gastos Operativos (Operational Expenses)**.

Recuerda nuestra regla de negocio fundamental: los gastos como el alquiler, la luz o el marketing **no** se mezclan con los costos de importación de la naviera, ya que distorsionarían el costo unitario real de las peinillas o máquinas. Este módulo vive en su propio ecosistema.

---

### **Paso 12: Módulo de Gastos Operativos (Operational Expenses)**

El objetivo de este paso es crear una vista rápida para que tu mamá o el administrador puedan registrar salidas de dinero del día a día, categorizarlas y marcar si ya se pagaron o si están pendientes.

#### **12.1. La Server Action de Gastos (`src/actions/expenses.ts`)**

Crearemos la lógica de backend para insertar el gasto en la base de datos usando `FormData` nativo de HTML, lo que nos ahorra tener que crear estados complejos (`useState`) solo para un formulario simple.

TypeScript  
// src/actions/expenses.ts  
"use server"

import { revalidatePath } from 'next/cache'  
import { PrismaClient } from '@prisma/client'

const prisma \= new PrismaClient()

export async function createExpenseAction(formData: FormData) {  
  const category \= formData.get('category') as string  
  const description \= formData.get('description') as string  
  const amountPen \= parseFloat(formData.get('amountPen') as string)  
  const status \= formData.get('status') as string

  // Note: In production, you'd add try/catch and input validation (e.g., Zod)  
  await prisma.expense.create({  
    data: {  
      category,  
      description,  
      amountPen,  
      status,  
    }  
  })

  // Refresh the server component to show the new data instantly  
  revalidatePath('/dashboard/expenses')  
}

export async function toggleExpenseStatusAction(id: string, currentStatus: string) {  
  const newStatus \= currentStatus \=== 'PAID' ? 'PENDING' : 'PAID'  
    
  await prisma.expense.update({  
    where: { id },  
    data: { status: newStatus }  
  })

  revalidatePath('/dashboard/expenses')  
}

#### **12.2. El Componente de UI Principal (`src/app/dashboard/expenses/page.tsx`)**

Dado que esta vista es un poco más sencilla que el POS o las Importaciones, podemos combinar la tabla (Server Component) y el formulario de creación rápida en el mismo archivo para mayor velocidad de desarrollo. Mantengo el JSX en una sola línea.

TypeScript  
// src/app/dashboard/expenses/page.tsx  
import { PrismaClient } from '@prisma/client'  
import { createExpenseAction, toggleExpenseStatusAction } from '@/actions/expenses'  
import { Receipt, Plus, CheckCircle, Clock } from 'lucide-react'

const prisma \= new PrismaClient()

export default async function ExpensesPage() {  
  // Fetch latest expenses from DB  
  const expenses \= await prisma.expense.findMany({  
    orderBy: { date: 'desc' },  
    take: 100  
  })

  // Calculate quick metrics  
  const totalPaid \= expenses.filter(e \=\> e.status \=== 'PAID').reduce((sum, e) \=\> sum \+ e.amountPen, 0\)  
  const totalPending \= expenses.filter(e \=\> e.status \=== 'PENDING').reduce((sum, e) \=\> sum \+ e.amountPen, 0\)

  return (  
    \<div className="flex flex-col gap-8 w-full max-w-7xl mx-auto"\>\<div className="flex items-center justify-between"\>\<h1 className="text-3xl font-bold text-white tracking-wide"\>Operational \<span className="text-cyan-500"\>Expenses\</span\>\</h1\>\</div\>\<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4"\>\<div className="bg-black/60 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 flex flex-col gap-2"\>\<span className="text-sm font-semibold text-gray-500 uppercase tracking-widest"\>Total Paid (PEN)\</span\>\<span className="text-3xl font-bold text-white"\>S/ {totalPaid.toFixed(2)}\</span\>\</div\>\<div className="bg-black/60 backdrop-blur-xl border border-red-900/30 rounded-2xl p-6 flex flex-col gap-2"\>\<span className="text-sm font-semibold text-red-500/70 uppercase tracking-widest"\>Pending Payment (PEN)\</span\>\<span className="text-3xl font-bold text-red-400"\>S/ {totalPending.toFixed(2)}\</span\>\</div\>\</div\>\<div className="grid grid-cols-1 lg:grid-cols-3 gap-8"\>\<div className="lg:col-span-1 bg-background/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-\[0\_0\_30px\_rgba(0,247,255,0.05)\] h-fit"\>\<div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800"\>\<Plus className="w-5 h-5 text-cyan-400" /\>\<h2 className="text-xl font-bold text-white"\>New Expense\</h2\>\</div\>\<form action={createExpenseAction} className="flex flex-col gap-4"\>\<select name="category" required className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-cyan-500 outline-none appearance-none"\>\<option value="" disabled selected\>Select Category\</option\>\<option value="RENT"\>Rent & Utilities\</option\>\<option value="MARKETING"\>Marketing & Ads\</option\>\<option value="PAYROLL"\>Payroll / Salaries\</option\>\<option value="SUPPLIES"\>Office Supplies\</option\>\<option value="OTHER"\>Other\</option\>\</select\>\<input type="text" name="description" placeholder="Description (e.g., Facebook Ads June)" required className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-cyan-500 outline-none" /\>\<div className="relative"\>\<span className="absolute left-4 top-3 text-gray-500"\>S/\</span\>\<input type="number" name="amountPen" step="0.10" placeholder="0.00" required className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 outline-none" /\>\</div\>\<select name="status" required className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-cyan-500 outline-none appearance-none"\>\<option value="PAID"\>Already Paid\</option\>\<option value="PENDING"\>Pending Payment\</option\>\</select\>\<button type="submit" className="w-full mt-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl transition-all shadow-\[0\_0\_20px\_rgba(0,247,255,0.3)\]"\>Register Expense\</button\>\</form\>\</div\>\<div className="lg:col-span-2 bg-background/50 backdrop-blur-xl border border-gray-800 rounded-2xl overflow-hidden shadow-\[0\_0\_30px\_rgba(0,0,0,0.5)\]"\>\<table className="w-full text-left"\>\<thead className="bg-black/60 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-widest"\>\<tr\>\<th className="p-4"\>Date\</th\>\<th className="p-4"\>Category & Desc\</th\>\<th className="p-4"\>Status\</th\>\<th className="p-4 text-right"\>Amount\</th\>\<th className="p-4 text-center"\>Action\</th\>\</tr\>\</thead\>\<tbody className="text-gray-300"\>{expenses.length \=== 0 ? (\<tr\>\<td colSpan={5} className="p-8 text-center text-gray-500 italic"\>No operational expenses recorded yet.\</td\>\</tr\>) : expenses.map((expense) \=\> (\<tr key={expense.id} className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors"\>\<td className="p-4 whitespace-nowrap"\>{new Date(expense.date).toLocaleDateString()}\</td\>\<td className="p-4"\>\<div className="flex flex-col"\>\<span className="text-xs font-bold text-cyan-500/70 mb-1"\>{expense.category}\</span\>\<span className="text-sm text-white"\>{expense.description}\</span\>\</div\>\</td\>\<td className="p-4"\>\<span className={\`px-3 py-1 rounded-full text-xs font-bold tracking-wider border flex items-center gap-1 w-max ${expense.status \=== 'PAID' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}\`}\>{expense.status \=== 'PAID' ? \<CheckCircle className="w-3 h-3"/\> : \<Clock className="w-3 h-3"/\>} {expense.status}\</span\>\</td\>\<td className="p-4 text-right font-bold text-white whitespace-nowrap"\>S/ {expense.amountPen.toFixed(2)}\</td\>\<td className="p-4 text-center"\>\<form action={toggleExpenseStatusAction.bind(null, expense.id, expense.status)}\>\<button type="submit" className="text-xs text-gray-400 hover:text-cyan-400 underline decoration-gray-600 underline-offset-4 transition-colors"\>{expense.status \=== 'PAID' ? 'Mark Pending' : 'Mark Paid'}\</button\>\</form\>\</td\>\</tr\>))}\</tbody\>\</table\>\</div\>\</div\>\</div\>  
  )  
}

---

**💡 Extra Tip:** Nota cómo usamos `toggleExpenseStatusAction.bind(null, expense.id, expense.status)` en el botón de la tabla. En Server Actions dentro de Next.js, no puedes pasar argumentos directamente usando `onClick={() => myAction(id)}` en un Server Component. El método `.bind()` es el truco oficial de React para inyectarle parámetros (como el ID del gasto) a la función del servidor antes de que se envíe el formulario.

**❓ What if... (Paso 12): ¿Qué pasa si mi mamá quiere adjuntar la foto del recibo de luz (Voucher) al registrar el gasto?** Actualmente, nuestro esquema tiene un campo `voucherUrl` opcional, pero el formulario no tiene un input de tipo `<input type="file">`. **Solución Arquitectónica:** No puedes pasar archivos binarios pesados a través de Server Actions de forma eficiente sin complicar el código. Lo ideal es usar un *Client Component* que primero suba el PDF o imagen directamente al Storage de Supabase usando el cliente `@supabase/supabase-js`. Una vez que Supabase te devuelva la URL segura de esa imagen (ej. `https://.../recibo-luz.png`), tomas ese string (texto) y lo envías en tu Server Action para guardarlo en la columna `voucherUrl` de PostgreSQL. Así mantienes tu base de datos relacional ligera y rápida.

# 📊 13\. Business Intelligence

Este es el módulo exclusivo para los roles `BOSS` y `ADMIN`. Aquí tomaremos todos los datos transaccionales (ventas pagadas, gastos operativos y costos de importación) y los transformaremos en información visual mediante gráficos. Para esto, usaremos la librería `recharts` que instalamos en el Paso 1\.

---

### **Paso 13: Business Intelligence (Reportes Financieros)**

El objetivo de este paso es cruzar la información de múltiples tablas de la base de datos de forma eficiente en el servidor, calcular la rentabilidad real y pasar esos números a un componente de cliente que dibuje un gráfico interactivo.

#### **13.1. El Componente del Gráfico (Client Component)**

Dado que los gráficos necesitan interactividad (mostrar un *tooltip* o etiqueta al pasar el mouse), obligatoriamente deben ser componentes de cliente.

Crea la carpeta `reports` dentro de `src/components/` y añade este archivo:

TypeScript  
// src/components/reports/SalesChart.tsx  
"use client"

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

type ChartData \= { name: string; total: number }\[\]

export default function SalesChart({ data }: { data: ChartData }) {  
  return (  
    \<div className="w-full h-\[400px\] mt-6"\>\<ResponsiveContainer width="100%" height="100%"\>\<AreaChart data={data} margin={{ top: 10, right: 10, left: \-20, bottom: 0 }}\>\<defs\>\<linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1"\>\<stop offset="5%" stopColor="\#00f7ff" stopOpacity={0.3}/\>\<stop offset="95%" stopColor="\#00f7ff" stopOpacity={0}/\>\</linearGradient\>\</defs\>\<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="\#1f2937" /\>\<XAxis dataKey="name" stroke="\#6b7280" fontSize={12} tickLine={false} axisLine={false} /\>\<YAxis stroke="\#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) \=\> \`S/${value}\`} /\>\<Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '12px', border: '1px solid rgba(0,247,255,0.2)', backdropFilter: 'blur(8px)', color: '\#fff' }} itemStyle={{ color: '\#00f7ff', fontWeight: 'bold' }} cursor={{ stroke: 'rgba(0,247,255,0.2)', strokeWidth: 2 }} /\>\<Area type="monotone" dataKey="total" stroke="\#00f7ff" strokeWidth={3} fillOpacity={1} fill="url(\#colorTotal)" activeDot={{ r: 6, fill: '\#00f7ff', stroke: '\#000', strokeWidth: 2 }} /\>\</AreaChart\>\</ResponsiveContainer\>\</div\>  
  )  
}

#### 

#### **13.2. El Motor de Agregación (Server Component)**

Aquí es donde ocurre la magia financiera. En lugar de hacer que el navegador del usuario sume miles de facturas, haremos que el servidor (Node.js/Prisma) consolide los totales antes de enviarlos.

Crea la ruta para los reportes: `src/app/dashboard/reports/page.tsx`.

TypeScript  
// src/app/dashboard/reports/page.tsx  
import { PrismaClient } from '@prisma/client'  
import SalesChart from '@/components/reports/SalesChart'  
import { DollarSign, TrendingUp, CreditCard, Wallet } from 'lucide-react'

const prisma \= new PrismaClient()

export default async function ReportsPage() {  
  // Fetch only PAID sales and expenses  
  const sales \= await prisma.sale.findMany({ where: { status: 'PAID' }, select: { totalAmount: true, date: true } })  
  const expenses \= await prisma.expense.findMany({ where: { status: 'PAID' }, select: { amountPen: true } })  
  // In a real scenario, you'd also fetch import costs here  
    
  // Calculate global KPIs  
  const totalRevenue \= sales.reduce((sum, sale) \=\> sum \+ sale.totalAmount, 0\)  
  const totalExpenses \= expenses.reduce((sum, exp) \=\> sum \+ exp.amountPen, 0\)  
  const netProfit \= totalRevenue \- totalExpenses

  // Aggregate sales by month for the chart (Simple example grouping by month index)  
  const monthlyData \= Array(6).fill(0).map((\_, i) \=\> {  
    const d \= new Date(); d.setMonth(d.getMonth() \- (5 \- i));  
    return { name: d.toLocaleString('en-US', { month: 'short' }), total: 0 }  
  })

  sales.forEach(sale \=\> {  
    const saleMonth \= sale.date.toLocaleString('en-US', { month: 'short' })  
    const monthIndex \= monthlyData.findIndex(m \=\> m.name \=== saleMonth)  
    if (monthIndex \!== \-1) monthlyData\[monthIndex\].total \+= sale.totalAmount  
  })

  return (  
    \<div className="flex flex-col gap-8 w-full max-w-7xl mx-auto"\>\<h1 className="text-3xl font-bold text-white tracking-wide"\>Financial \<span className="text-cyan-500"\>Intelligence\</span\>\</h1\>\<div className="grid grid-cols-1 md:grid-cols-3 gap-6"\>\<div className="bg-black/60 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 relative overflow-hidden"\>\<div className="absolute \-right-4 \-top-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl" /\>\<div className="flex items-center gap-3 mb-4"\>\<div className="p-2 bg-cyan-500/20 rounded-lg"\>\<TrendingUp className="w-5 h-5 text-cyan-400" /\>\</div\>\<span className="text-sm font-bold text-gray-400 uppercase tracking-widest"\>Gross Revenue\</span\>\</div\>\<span className="text-3xl font-bold text-white"\>S/ {totalRevenue.toFixed(2)}\</span\>\</div\>\<div className="bg-black/60 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 relative overflow-hidden"\>\<div className="absolute \-right-4 \-top-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl" /\>\<div className="flex items-center gap-3 mb-4"\>\<div className="p-2 bg-red-500/20 rounded-lg"\>\<CreditCard className="w-5 h-5 text-red-400" /\>\</div\>\<span className="text-sm font-bold text-gray-400 uppercase tracking-widest"\>Op. Expenses\</span\>\</div\>\<span className="text-3xl font-bold text-white"\>S/ {totalExpenses.toFixed(2)}\</span\>\</div\>\<div className="bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 relative overflow-hidden shadow-\[0\_0\_30px\_rgba(0,247,255,0.1)\]"\>\<div className="absolute \-right-4 \-top-4 w-24 h-24 bg-cyan-500/20 rounded-full blur-3xl" /\>\<div className="flex items-center gap-3 mb-4"\>\<div className="p-2 bg-cyan-500/20 rounded-lg"\>\<Wallet className="w-5 h-5 text-cyan-400" /\>\</div\>\<span className="text-sm font-bold text-cyan-500 uppercase tracking-widest"\>Net Profit\</span\>\</div\>\<span className="text-4xl font-black text-cyan-400"\>S/ {netProfit.toFixed(2)}\</span\>\</div\>\</div\>\<div className="w-full bg-background/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-\[0\_0\_40px\_rgba(0,0,0,0.5)\]"\>\<div className="flex items-center justify-between mb-4"\>\<h2 className="text-xl font-bold text-white tracking-wide"\>Revenue Trend \<span className="text-gray-500 text-sm font-medium ml-2"\>(Last 6 Months)\</span\>\</h2\>\<button className="px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 rounded-lg text-sm transition-all font-medium"\>Export to Excel\</button\>\</div\>\<SalesChart data={monthlyData} /\>\</div\>\</div\>  
  )  
}

---

**💡 Extra Tip:** Presta atención a cómo generamos el arreglo `monthlyData`. En lugar de hacer consultas complejas de agrupación (`GROUP BY`) directo en la base de datos (lo cual puede ser complicado con fechas en Prisma y diferentes zonas horarias), traemos las ventas relevantes y usamos JavaScript para agruparlas en un arreglo de 6 meses. Es un patrón muy útil para dashboards rápidos.

**❓ What if... (Paso 13): ¿Qué pasa si el botón de "Export to Excel" se necesita con urgencia para la contadora del negocio?** Para evitar instalar librerías pesadas en el servidor, puedes manejarlo 100% en el cliente. Creas un *Client Component* para ese botón que reciba el JSON de los datos. Al hacer clic, usas la API nativa del navegador para convertir ese JSON a formato CSV (texto separado por comas) y fuerzas la descarga creando un elemento `<a href="data:text/csv;charset=utf-8,..." download="report.csv">` de forma dinámica. ¡Cero costo de servidor y compatible con cualquier Excel\!

# 🧏 14\. Panel de System Admin

**Paso 14: Panel de System Admin (Gestión de Usuarios y Seguridad)**.

Aquí es donde tú, como el Arquitecto del Sistema, tienes el control absoluto. En este módulo podrás crearle la cuenta a tu mamá (`BOSS`), a tus socios o amigos que te ayuden en el proyecto (como Daniel o Adrian), o a los futuros empleados, asignándoles sus niveles de acceso (RBAC).

---

### **Paso 14: Panel de System Admin (User Management)**

El objetivo de este paso es construir la tabla de control central donde verás a todos los usuarios registrados en "Razors" y podrás revocarles el acceso instantáneamente con un solo clic en caso de emergencia, sin borrar su historial de ventas.

#### **14.1. La Server Action de Gestión de Usuarios (`src/actions/users.ts`)**

Crearemos la función que te permite "apagar" o "encender" la cuenta de un usuario. Esto cambia la propiedad `isActive` en Prisma.

TypeScript  
// src/actions/users.ts  
"use server"

import { revalidatePath } from 'next/cache'  
import { PrismaClient } from '@prisma/client'

const prisma \= new PrismaClient()

export async function toggleUserStatusAction(userId: string, currentStatus: boolean) {  
  // Prevent the admin from disabling their own account accidentally  
  // In production, compare with the currently logged-in session ID  
    
  await prisma.user.update({  
    where: { id: userId },  
    data: { isActive: \!currentStatus }  
  })

  revalidatePath('/dashboard/users')  
}

export async function changeUserRoleAction(userId: string, newRole: 'ADMIN' | 'BOSS' | 'EMPLOYEE') {  
  await prisma.user.update({  
    where: { id: userId },  
    data: { role: newRole }  
  })

  revalidatePath('/dashboard/users')  
}

#### 

#### **14.2. El Componente de Directorio de Usuarios (`src/app/dashboard/users/page.tsx`)**

Esta vista está fuertemente protegida. Recuerda que en nuestro `middleware.ts` (Paso 4), ya bloqueamos el acceso para que ningún `EMPLOYEE` pueda entrar a `/dashboard/users`.

Aquí implementaremos la tabla con los "tags" de colores brillantes para diferenciar rápidamente quién es quién. Las etiquetas JSX se mantienen en una sola línea.

TypeScript  
// src/app/dashboard/users/page.tsx  
import { PrismaClient } from '@prisma/client'  
import { toggleUserStatusAction } from '@/actions/users'  
import { ShieldAlert, UserPlus, Power } from 'lucide-react'

const prisma \= new PrismaClient()

export default async function UserManagementPage() {  
  const users \= await prisma.user.findMany({  
    orderBy: { createdAt: 'desc' }  
  })

  return (  
    \<div className="flex flex-col gap-8 w-full max-w-7xl mx-auto"\>\<div className="flex items-center justify-between"\>\<div className="flex flex-col"\>\<h1 className="text-3xl font-bold text-white tracking-wide"\>User \<span className="text-purple-500"\>Management\</span\>\</h1\>\<p className="text-gray-500 mt-2 flex items-center gap-2"\>\<ShieldAlert className="w-4 h-4 text-purple-500" /\> System Administrator Area\</p\>\</div\>\<button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-\[0\_0\_20px\_rgba(168,85,247,0.3)\]"\>\<UserPlus className="w-5 h-5" /\> Add New User\</button\>\</div\>\<div className="w-full bg-background/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl overflow-hidden shadow-\[0\_0\_40px\_rgba(168,85,247,0.05)\]"\>\<table className="w-full text-left"\>\<thead className="bg-black/80 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-widest"\>\<tr\>\<th className="p-5"\>User Profile\</th\>\<th className="p-5"\>Role\</th\>\<th className="p-5"\>Status\</th\>\<th className="p-5"\>Joined Date\</th\>\<th className="p-5 text-right"\>Actions\</th\>\</tr\>\</thead\>\<tbody className="text-gray-300"\>  
      {users.map((user) \=\> (  
        \<tr key={user.id} className="border-b border-gray-800/50 hover:bg-purple-900/10 transition-colors"\>\<td className="p-5"\>\<div className="flex items-center gap-4"\>\<div className={\`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${user.role \=== 'ADMIN' ? 'bg-purple-600' : user.role \=== 'BOSS' ? 'bg-cyan-600' : 'bg-gray-700'}\`}\>{user.name.charAt(0).toUpperCase()}\</div\>\<div className="flex flex-col"\>\<span className="text-sm font-bold text-white"\>{user.name}\</span\>\<span className="text-xs text-gray-500"\>{user.email}\</span\>\</div\>\</div\>\</td\>\<td className="p-5"\>\<span className={\`px-3 py-1 rounded-full text-xs font-bold tracking-wider border ${user.role \=== 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : user.role \=== 'BOSS' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-gray-800 text-gray-300 border-gray-700'}\`}\>{user.role}\</span\>\</td\>\<td className="p-5"\>\<div className="flex items-center gap-2"\>\<div className={\`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500 shadow-\[0\_0\_8px\_rgba(34,197,94,0.8)\]' : 'bg-red-500 shadow-\[0\_0\_8px\_rgba(239,68,68,0.8)\]'}\`} /\>\<span className="text-sm font-medium"\>{user.isActive ? 'Active' : 'Inactive'}\</span\>\</div\>\</td\>\<td className="p-5 text-sm text-gray-400"\>{new Date(user.createdAt).toLocaleDateString()}\</td\>\<td className="p-5 text-right"\>\<form action={toggleUserStatusAction.bind(null, user.id, user.isActive)}\>\<button type="submit" className={\`p-2 rounded-lg transition-all ${user.isActive ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300' : 'text-green-400 hover:bg-green-500/10 hover:text-green-300'}\`} title={user.isActive ? 'Deactivate User' : 'Activate User'}\>\<Power className="w-5 h-5" /\>\</button\>\</form\>\</td\>\</tr\>  
      ))}  
    \</tbody\>\</table\>\</div\>\</div\>  
  )  
}

---

**💡 Extra Tip:** El color morado (`purple-500`) que usamos aquí no es solo estético. Es una convención psicológica en UX/UI. Al cambiar el acento principal de Cyan (operaciones comerciales) a Morado (configuraciones del sistema), tu cerebro recibe una señal visual subconsciente que dice: *"Atención, estás tocando la configuración del núcleo, procede con cautela"*.

**❓ What if... (Paso 14): ¿Qué pasa si desactivo a un vendedor (`isActive: false`), pero la sesión de Supabase Auth sigue abierta en su celular?** Nuestra tabla de Prisma marca `isActive: false`, pero el token JWT de Supabase en su navegador aún podría ser válido por unas horas. **Solución Arquitectónica:** En tu archivo `middleware.ts` (Paso 4), tienes que añadir una pequeña consulta rápida. Si el usuario intenta acceder a una ruta protegida, el middleware debe revisar en la base de datos si su `isActive` es `true`. Si es `false`, el middleware fuerza un deslogueo (`supabase.auth.signOut()`) y lo redirige a la pantalla de login con un mensaje de "Cuenta Suspendida". De esta forma, el bloqueo es instantáneo y absoluto.

# 🛫 15\. Migración y Despliegue

**Paso 15: El "Día Cero" (Migración de Datos y Despliegue en Producción)**.

De nada sirve el código más limpio del mundo si vive atrapado en tu `localhost`. Este paso final trata sobre preparar el terreno para que el sistema nazca en internet de forma segura, con los datos base pre-cargados para que tu equipo (tu mamá, Daniel, Adrian o los vendedores) puedan entrar y empezar a operar desde el primer minuto.

---

### 

### **Paso 15: El "Día Cero" (Migración y Despliegue)**

### **15.1. El Script de Siembra (`prisma/seed.ts`)**

No podemos mandar a producción una base de datos vacía. Necesitamos que, al nacer, el sistema ya tenga tu cuenta de Admin, la cuenta de Boss de tu mamá, y el almacén principal configurado.Crea un archivo llamado `seed.ts` dentro de tu carpeta `prisma/`.

TypeScript  
// prisma/seed.ts  
import { PrismaClient } from '@prisma/client'  
// In production, use a proper hashing library like bcrypt for passwords  
// import bcrypt from 'bcrypt'

const prisma \= new PrismaClient()

async function main() {  
  console.log('🌱 Starting database seed...')

  // 1\. Create Default Locations  
  const centralWarehouse \= await prisma.location.upsert({  
    where: { id: 'loc-central-001' },  
    update: {},  
    create: {  
      id: 'loc-central-001',  
      name: 'Almacén Central',  
    },  
  })  
    
  const mainStore \= await prisma.location.upsert({  
    where: { id: 'loc-store-001' },  
    update: {},  
    create: {  
      id: 'loc-store-001',  
      name: 'Tienda Principal',  
    },  
  })

  // 2\. Create Initial Users (RBAC Foundation)  
  // const hashedAdminPassword \= await bcrypt.hash('zairex-admin-2026', 10\)  
  const hashedAdminPassword \= 'hashed-password-here' // Replace with actual hash logic

  const systemAdmin \= await prisma.user.upsert({  
    where: { email: 'admin@zentech.com' },  
    update: {},  
    create: {  
      name: 'Dylan Florez',  
      email: 'admin@zentech.com',  
      password: hashedAdminPassword,  
      role: 'ADMIN',  
    },  
  })

  const businessBoss \= await prisma.user.upsert({  
    where: { email: 'boss@razors.com' },  
    update: {},  
    create: {  
      name: 'Jefa Razors',  
      email: 'boss@razors.com',  
      password: 'hashed-password-here',   
      role: 'BOSS',  
    },  
  })

  const partnerAdmin \= await prisma.user.upsert({  
    where: { email: 'daniel@zentech.com' },  
    update: {},  
    create: {  
      name: 'Daniel Singer',  
      email: 'daniel@zentech.com',  
      password: 'hashed-password-here',  
      role: 'ADMIN',  
    },  
  })

  // 3\. (Optional) Read products from an Excel/JSON and loop here to insert them

  console.log('✅ Seed completed successfully\!')  
  console.log({ centralWarehouse, systemAdmin, businessBoss })  
}

main()  
  .catch((e) \=\> {  
    console.error(e)  
    process.exit(1)  
  })  
  .finally(async () \=\> {  
    await prisma.$disconnect()  
  })

#### **15.2. Configurar el comando de Siembra**

Para que Prisma sepa cómo ejecutar ese archivo, abre tu `package.json` (en la raíz de tu proyecto) y añade este bloque de código al final (antes de la última llave `}`):

JSON  
 "prisma": {  
    "seed": "ts-node \--compiler-options {\\"module\\":\\"CommonJS\\"} prisma/seed.ts"  
  }

*(Nota: Asegúrate de instalar `ts-node` ejecutando `npm install -D ts-node` en tu terminal).*

Ahora, si ejecutas `npx prisma db seed` en tu Ubuntu, tu base de datos de Supabase se llenará instantáneamente con esos usuarios y almacenes.

#### **15.3. Despliegue en Vercel (Producción)**

Dado que estamos usando Next.js (App Router), Vercel es el ecosistema natural y más rápido para desplegar.

**Sube tu código a GitHub:**  
Bash  
git add .  
git commit \-m "feat: complete razors system ready for production"  
git push origin main

1.   
2. **Conecta con Vercel:**  
   * Entra a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub (`Zairex-Code`).  
   * Haz clic en **"Add New..." \-\> "Project"**.  
   * Selecciona tu repositorio `razors-crm` y dale a "Import".  
3. **Configura las Variables de Entorno (¡CRÍTICO\!):**  
   * Antes de darle al botón de desplegar, abre la pestaña **"Environment Variables"**.  
   * Copia exactamente las variables que tienes en tu archivo `.env` local (`DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) y pégalas ahí. Sin esto, Vercel no podrá hablar con Supabase.  
4. **¡Deploy\!** Haz clic en el botón de "Deploy" y Vercel se encargará de compilar tu TypeScript y montar los Server Actions en su infraestructura global. En un par de minutos tendrás tu URL en vivo (ej. `razors-crm.vercel.app`).

---

**💡 Extra Tip (El Corte de Caja):** El día del lanzamiento, reúnanse en la tienda. Cierren las puertas o háganlo un domingo. Cuenten físicamente el inventario y ajusten los números directamente en la base de datos de "Razors". Al día siguiente, el cuaderno físico o los Excels antiguos quedan estrictamente prohibidos. Esa transición radical de un solo golpe (Big Bang) es mucho más efectiva que intentar llevar la contabilidad en ambos sistemas a la vez, lo cual solo genera estrés y duplicación de datos.

**❓ What if... (Paso 15): ¿Qué pasa si el despliegue en Vercel falla y me tira un error rojo gigante que dice "Build Failed"?** El 99% de las veces esto ocurre por un error de tipado estricto en TypeScript o un error en ESLint que no notaste en desarrollo. Vercel es implacable y no subirá código con errores. **Solución:** En tu terminal local de Ubuntu, ejecuta el comando `npm run build`. Esto simulará el proceso exacto que hace Vercel. La consola te mostrará en qué archivo y en qué línea exacta está el error (quizás olvidaste tipar un `prop` o una variable puede ser `null`). Lo corriges en VS Code, haces un `git push`, y Vercel automáticamente reintentará el despliegue.

# 🗺️ Ruta de aprendizaje

### **Fase 1: Los Cimientos del Lenguaje**

No puedes correr en Next.js si no sabes caminar en JavaScript.

1. **JavaScript Moderno (ES6+):** Repasa conceptos clave como *Arrow functions* (`=>`), desestructuración (`const { nombre } = usuario`), métodos de arreglos (`map`, `filter`, `reduce`), y asincronía (`Promises`, `async/await`).  
2. **TypeScript:** Es JavaScript pero con superpoderes. Aprende a tipar tus variables, crear interfaces (para definir la forma de un Producto o una Venta) y entender qué son los genéricos. En VS Code, TypeScript brillará y te autocompletará el código, evitándote miles de errores.

### **Fase 2: La Interfaz y la Lógica Visual**

Una vez que domines el lenguaje, pasamos a dibujar en la pantalla. 3\. **Tailwind CSS:** Olvídate del CSS tradicional por un momento. Aprende cómo usar clases utilitarias (`flex`, `p-4`, `bg-black`, `text-white`) para maquetar rápido. Entiende bien cómo funciona Flexbox y Grid. 4\. **React (Fundamentos):** Este es el corazón visual. Aprende qué es un Componente, cómo pasar información entre ellos (*Props*) y cómo usar los *Hooks* principales: `useState` (para variables que cambian en la pantalla) y `useEffect` (para ejecutar acciones cuando el componente carga).

### 

### **Fase 3: Los Datos y el Servidor**

Aquí conectamos la interfaz con la realidad del negocio. 5\. **PostgreSQL (Bases de Datos Relacionales):** Entiende cómo se relacionan las tablas (llaves primarias y foráneas). 6\. **Prisma ORM:** Es la herramienta que te permitirá hablarle a PostgreSQL usando TypeScript en lugar de escribir consultas SQL puras. Aprende a crear un esquema (`schema.prisma`) y hacer un CRUD (Crear, Leer, Actualizar, Borrar). 7\. **Supabase:** Aprende a navegar por su panel de control, entender cómo funciona su sistema de autenticación de usuarios y cómo guardar archivos en su Storage.

### **Fase 4: El Framework Maestro**

8. **Next.js (App Router):** Esta es la pieza que une todo lo anterior. Aquí debes aprender la diferencia entre *Server Components* (rápidos, seguros, para leer bases de datos) y *Client Components* (interactivos, con `"use client"`). Domina también las *Server Actions* (las funciones seguras que ejecutan la lógica del lado del servidor).

### **Fase 5: Las Herramientas Especializadas (Los Detalles Finos)**

Una vez domines las cuatro fases anteriores, estas herramientas serán muy fáciles de adaptar: 9\. **Zustand:** Para manejar la memoria a corto plazo de tu aplicación (como el carrito del POS). 10\. **Shadcn UI & Recharts:** No necesitas "aprenderlas" a fondo, sino entender cómo copiar, pegar y adaptar sus componentes (como los gráficos o los modales de vidrio) en tu proyecto de React.

### **Fase 1: Los Cimientos Lógicos**

**Tecnologías:** JavaScript Moderno (ES6+), Node.js (para ejecutar en terminal).

**Proyecto A: Hardware Store Inventory**

* **El objetivo:** Dominar la manipulación de datos en memoria.  
* **Puntos a desarrollar:**  
  * Crear un arreglo de objetos que represente el inventario (incluyendo piezas como un Ryzen 5 5600 o una RX 7600 XT).  
  * Usar `.filter()` para extraer los componentes de gama alta.  
  * Usar `.reduce()` para calcular el valor total económico del inventario disponible.  
* **Entregable:** Un script `inventory.js` que imprima los resultados correctos en la consola.

**Proyecto B: Art Gallery Explorer**

* **El objetivo:** Entender la asincronía y cómo el código "espera" por información.  
* **Puntos a desarrollar:**  
  * Crear una función que simule conectarse a un servidor usando `setTimeout` envuelto en una `Promise`.  
  * Usar `async/await` para pedir la lista de obras de arte.  
  * Implementar un bloque `try/catch` para manejar el escenario donde la obra no existe.  
* **Entregable:** Un script `gallery.js` que simule la carga y muestre los datos o el error.

---

### **Fase 2: Estructura y Seguridad**

**Tecnologías:** TypeScript, Node.js (con `ts-node`).

**Proyecto: Car Dealership Management**

* **El objetivo:** Proteger el código con tipado estricto para evitar errores en tiempo de ejecución.  
* **Puntos a desarrollar:**  
  * Definir una `interface` llamada `Vehicle` con propiedades exactas (marca, modelo, año, precio).  
  * Crear un `type` específico para `EngineStatus` (New, Used, Damaged).  
  * Desarrollar una clase genérica `SalesManager<T>` que permita registrar ventas, asegurando que solo acepte datos con la estructura correcta.  
* **Entregable:** Un archivo `dealership.ts` que no arroje ninguna alerta de error en el editor de VS Code.

---

### **Fase 3: La Interfaz y la Experiencia**

**Tecnologías:** React, Tailwind CSS, Vite (para inicializar el entorno).

**Proyecto: Vet Clinic Dashboard**

* **El objetivo:** Unir la lógica con la pantalla y empezar a mezclar el diseño visual con la interactividad.  
* **Puntos a desarrollar:**  
  * **Formulario de Admisión:** Crear un componente usando `useState` para capturar el nombre y síntomas de la mascota. Diseñar el formulario usando clases de Tailwind CSS.  
  * **Sala de Espera:** Crear un componente que use `useEffect` para cargar una lista inicial de pacientes.  
  * **Interactividad:** Agregar un botón de "Atendido" que elimine visualmente al paciente de la lista.  
* **Entregable:** Una aplicación web corriendo en local donde se puedan agregar y dar de alta a los pacientes con una interfaz limpia.

---

### **Fase 4: La Conexión con la Realidad**

**Tecnologías:** PostgreSQL, Prisma ORM, Supabase (Auth & Database).

**Proyecto: Smart Parking System**

* **El objetivo:** Modelar la realidad en una base de datos relacional y conectar un sistema de usuarios.  
* **Puntos a desarrollar:**  
  * **Esquema:** Escribir un archivo `schema.prisma` definiendo los modelos `User` y `ParkingSpot`, creando una relación de uno a muchos.  
  * **Migración:** Empujar ese esquema a la base de datos alojada en Supabase.  
  * **Autenticación:** Crear un pequeño script para registrar un usuario en Supabase Auth y guardar un "ticket" de estacionamiento vinculado a su ID.  
* **Entregable:** Ver los datos y los usuarios reflejados en el panel de control web de Supabase.

---

### **Fase 5: El Ecosistema Completo**

**Tecnologías:** Next.js (App Router), React, Tailwind CSS, Prisma.

**Proyecto: Coworking Space Booking**

* **El objetivo:** Orquestar el frontend y el backend en un solo lugar utilizando el framework moderno.  
* **Puntos a desarrollar:**  
  * **Rutas Dinámicas:** Crear un catálogo de oficinas. Al entrar a `/workspace/[id]`, usar un `Server Component` para leer los datos de esa oficina directamente desde Prisma.  
  * **Server Actions:** Crear el botón de "Reservar". Al hacer clic, ejecutar una función segura en el servidor que guarde la reserva en la base de datos sin necesidad de crear una API externa.  
* **Entregable:** Una aplicación de Next.js navegable, donde la información fluya desde la base de datos hasta la pantalla en milisegundos.

### **Fase 6: La Memoria del Sistema (Días 11-12)**

**Tecnologías:** Zustand, Next.js.

**Proyecto: QuickBite Delivery (Carrito Global)**

* **El objetivo:** Gestionar un estado complejo (productos, cantidades y totales) que debe persistir mientras el usuario navega por la app.  
* **Puntos a desarrollar:**  
  * **The Global Store (El Cerebro):** Crear un archivo `cartStore.ts` con Zustand. Debe permitir añadir platos, aumentar/disminuir cantidades y eliminar productos.  
  * **Persistent UI (Sincronización):** Implementar un componente `NavbarCart` que muestre el total de productos y el precio acumulado. Este componente debe actualizarse instantáneamente aunque el usuario esté en la página de "Perfil" o "Explorar".  
  * **Logic Check:** Crear una función dentro del Store que calcule automáticamente el costo de envío basado en el total del carrito.  
* **Entregable:** Una experiencia de usuario fluida donde el carrito no se "pierda" al navegar y reaccione en tiempo real.

---

### **Resumen Final de tus Proyectos por Tecnología:**

1. **JavaScript:** Hardware Store (Inventario) & Art Gallery (Buscador Asíncrono).  
2. **TypeScript:** Car Dealership (Gestión de Ventas con Tipado).  
3. **React & Tailwind:** Vet Clinic (Dashboard de Pacientes).  
4. **Prisma & Supabase:** Smart Parking (Base de Datos y Auth).  
5. **Next.js (App Router):** Coworking Space (Reservas con Server Actions).  
6. **Zustand:** Food Delivery (Carrito de Compras Global).

**Puntos clave que incluiremos en cada ejercicio:**

* **Clean Code:** Nombres de variables descriptivos en inglés.  
* **Folder Structure:** Organización profesional de carpetas (`components`, `hooks`, `services`, `types`).  
* **Error Handling:** Que la app no se rompa si algo sale mal (especialmente con Supabase y Prisma).

# Aprendiendo Js

**Proyecto A: Hardware Store Inventory**

