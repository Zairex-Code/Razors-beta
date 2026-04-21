import { PrismaClient, Role, ImportStatus, SaleStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

const prisma = new PrismaClient()

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createSupabaseAdmin(supabaseUrl, serviceRoleKey)
}

const CATEGORIES = {
  MACHINE: 'Máquinas de Corte',
  AUDIO: 'Audífonos',
  ACCESSORIES: 'Accesorios',
  REPAIRS: 'Repuestos',
}

const PAYMENT_METHODS = ['EFECTIVO', 'YAPE', 'PLIN', 'TARJETA', 'TRANSFERENCIA']

async function cleanupTables() {
  console.log('\n🧹 Limpiando tablas en orden correcto...')

  await prisma.$transaction([
    prisma.saleItem.deleteMany(),
    prisma.sale.deleteMany(),
    prisma.importCost.deleteMany(),
    prisma.importItem.deleteMany(),
    prisma.import.deleteMany(),
    prisma.expense.deleteMany(),
    prisma.document.deleteMany(),
    prisma.inventory.deleteMany(),
    prisma.product.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.user.deleteMany(),
    prisma.location.deleteMany(),
    prisma.systemSetting.deleteMany(),
  ])

  console.log('   ✓ Todas las tablas limpiadas')
}

async function createSupabaseAuthUser(email: string, password: string, name: string, role: Role): Promise<string> {
  console.log(`\n🔐 Creando usuario en Supabase Auth: ${email}`)

  const supabase = getSupabaseAdmin()

  // First check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existingUser = existingUsers?.users.find(u => u.email === email)

  if (existingUser) {
    console.log(`   ✓ Usuario Auth ya existe con ID: ${existingUser.id}`)
    return existingUser.id
  }

  // Create new user if doesn't exist
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
  })

  if (authError) {
    throw new Error(`Error creando usuario en Supabase Auth: ${authError.message}`)
  }

  if (!authUser?.user?.id) {
    throw new Error('No se recibió ID del usuario de Supabase Auth')
  }

  console.log(`   ✓ Usuario Auth creado con ID: ${authUser.user.id}`)
  return authUser.user.id
}

async function createUsers() {
  console.log('\n👥 Creando usuarios...')

  const hashedPassword = await bcrypt.hash('password123', 10)

  const adminAuthId = await createSupabaseAuthUser('admin@razors.com', 'password123', 'Administrador', 'ADMIN')

  await prisma.user.create({
    data: {
      id: adminAuthId,
      name: 'Administrador',
      email: 'admin@razors.com',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })

  const employeeAuthId = await createSupabaseAuthUser('vendedor@razors.com', 'password123', 'Carlos Mendoza', 'EMPLOYEE')

  await prisma.user.create({
    data: {
      id: employeeAuthId,
      name: 'Carlos Mendoza',
      email: 'vendedor@razors.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      isActive: true,
    },
  })

  const bossAuthId = await createSupabaseAuthUser('boss@razors.com', 'password123', 'Dylan Boss', 'BOSS')

  await prisma.user.create({
    data: {
      id: bossAuthId,
      name: 'Dylan Boss',
      email: 'boss@razors.com',
      password: hashedPassword,
      role: 'BOSS',
      isActive: true,
    },
  })

  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@razors.com' } })
  const employeeUser = await prisma.user.findUnique({ where: { email: 'vendedor@razors.com' } })
  const bossUser = await prisma.user.findUnique({ where: { email: 'boss@razors.com' } })

  console.log(`   ✓ Admin: ${adminUser?.id}`)
  console.log(`   ✓ Employee: ${employeeUser?.id}`)
  console.log(`   ✓ Boss: ${bossUser?.id}`)

  return { adminUser, employeeUser, bossUser }
}

async function createLocations() {
  console.log('\n📍 Creando ubicaciones...')

  const locations = await Promise.all([
    prisma.location.create({ data: { name: 'Tienda Principal', type: 'STORE' } }),
    prisma.location.create({ data: { name: 'Sucursal Miraflores', type: 'STORE' } }),
    prisma.location.create({ data: { name: 'Almacén Central', type: 'WAREHOUSE' } }),
  ])

  locations.forEach(loc => console.log(`   ✓ ${loc.name} (${loc.type})`))
  return locations
}

async function createSystemSettings() {
  console.log('\n⚙️ Creando configuraciones del sistema...')

  await prisma.systemSetting.upsert({
    where: { key: 'PROFIT_MARGIN' },
    update: { value: '30' },
    create: { key: 'PROFIT_MARGIN', value: '30' }
  })

  console.log('   ✓ PROFIT_MARGIN: 30%')
}

async function createCustomers() {
  console.log('\n🏪 Creando clientes...')

  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        docType: 'RUC',
        docNumber: '20497658123',
        name: 'Barbería El Patrón',
        email: 'contacto@barberiaelpatron.com',
        phone: '987654321',
        address: 'Av. Ejemplo 123, Lima',
      },
    }),
    prisma.customer.create({
      data: {
        docType: 'RUC',
        docNumber: '20987654321',
        name: 'Cortes & Estilos VIP',
        email: 'ventas@cortesvip.com',
        phone: '912345678',
        address: 'Jr. Lima 456, Callao',
      },
    }),
    prisma.customer.create({
      data: {
        docType: 'RUC',
        docNumber: '20512345678',
        name: 'Tech Barber Peru',
        email: 'info@techbarber.pe',
        phone: '923456789',
        address: 'Av. Brasil 789, Jesús María',
      },
    }),
    prisma.customer.create({
      data: {
        docType: 'RUC',
        docNumber: '20123456789',
        name: 'Barber Shop Express',
        email: 'reservas@bshopexpress.com',
        phone: '934567890',
        address: 'Av. Arenales 234, Lince',
      },
    }),
    prisma.customer.create({
      data: {
        docType: 'DNI',
        docNumber: '47234567',
        name: 'Juan Pérez',
        email: 'juan.perez@gmail.com',
        phone: '998877665',
        address: 'Av. Peru 789, San Juan de Lurigancho',
      },
    }),
    prisma.customer.create({
      data: {
        docType: 'RUC',
        docNumber: '20654321098',
        name: 'Duki Audio Store',
        email: 'ventas@dukimusic.pe',
        phone: '945678901',
        address: 'Calle Barcelona 567, San Miguel',
      },
    }),
  ])

  customers.forEach(c => console.log(`   ✓ ${c.name} (${c.docNumber})`))
  return customers
}

async function createProducts() {
  console.log('\n📦 Creando productos...')

  const products = await Promise.all([
    prisma.product.create({
      data: {
        sku: 'WAHL-MGC-001',
        name: 'Máquina VGR V-082 Inalámbrica',
        brand: 'Wahl',
        model: 'VGR V-082',
        category: CATEGORIES.MACHINE,
        pricePen: 459.90,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'KEM-TMR-009',
        name: 'Trimmer Kemei KM-009',
        brand: 'Kemei',
        model: 'KM-009',
        category: CATEGORIES.MACHINE,
        pricePen: 189.90,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'AND-PRF-001',
        name: 'Shaver Andis ProFoil Lithium',
        brand: 'Andis',
        model: 'ProFoil Lithium',
        category: CATEGORIES.REPAIRS,
        pricePen: 325.00,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'BAB-SKE-GLD',
        name: 'Patillera Babyliss Pro Skeleton',
        brand: 'Babyliss',
        model: 'Pro Skeleton Gold',
        category: CATEGORIES.MACHINE,
        pricePen: 399.90,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'DUK-HP-001',
        name: 'Audífonos Duki BT-500',
        brand: 'Duki',
        model: 'BT-500',
        category: CATEGORIES.AUDIO,
        pricePen: 249.90,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'SEN-HP-001',
        name: 'Audífonos Sennheiser HD 200',
        brand: 'Sennheiser',
        model: 'HD 200 PRO',
        category: CATEGORIES.AUDIO,
        pricePen: 549.90,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'WAHL-GUI-02',
        name: 'Peineta Guía #2 (1/4")',
        brand: 'Wahl',
        model: 'Guía #2',
        category: CATEGORIES.ACCESSORIES,
        pricePen: 35.00,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'WAHL-GUI-04',
        name: 'Peineta Guía #4 (1/2")',
        brand: 'Wahl',
        model: 'Guía #4',
        category: CATEGORIES.ACCESSORIES,
        pricePen: 35.00,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'SOP-DIS-001',
        name: 'Soporte Dispensador Aceite',
        brand: 'Generic',
        model: 'STD-001',
        category: CATEGORIES.ACCESSORIES,
        pricePen: 45.00,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'BAT-LI-001',
        name: 'Batería Lithium 2200mAh',
        brand: 'Generic',
        model: 'BAT-2200',
        category: CATEGORIES.REPAIRS,
        pricePen: 89.90,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'COR-BL-001',
        name: 'Cordón de Carga USB-C',
        brand: 'Generic',
        model: 'USB-C-001',
        category: CATEGORIES.ACCESSORIES,
        pricePen: 29.90,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'VGR-V10-001',
        name: 'Máquina VGR V-10',
        brand: 'VGR',
        model: 'V-10',
        category: CATEGORIES.MACHINE,
        pricePen: 529.90,
      },
    }),
  ])

  products.forEach(p => console.log(`   ✓ ${p.sku} - ${p.name} - S/ ${p.pricePen}`))
  return products
}

async function createInventory(products: Awaited<ReturnType<typeof createProducts>>, locations: Awaited<ReturnType<typeof createLocations>>) {
  console.log('\n📊 Creando inventario...')

  const mainLocation = locations[0]

  const inventoryItems = [
    { productIndex: 0, stock: 150 },
    { productIndex: 1, stock: 200 },
    { productIndex: 2, stock: 75 },
    { productIndex: 3, stock: 50 },
    { productIndex: 4, stock: 120 },
    { productIndex: 5, stock: 40 },
    { productIndex: 6, stock: 500 },
    { productIndex: 7, stock: 500 },
    { productIndex: 8, stock: 200 },
    { productIndex: 9, stock: 300 },
    { productIndex: 10, stock: 450 },
    { productIndex: 11, stock: 80 },
  ]

  for (const item of inventoryItems) {
    await prisma.inventory.create({
      data: {
        productId: products[item.productIndex].id,
        locationId: mainLocation.id,
        stock: item.stock,
      },
    })
    console.log(`   ✓ ${products[item.productIndex].sku}: ${item.stock} unidades`)
  }
}

async function createImports(products: Awaited<ReturnType<typeof createProducts>>) {
  console.log('\n🚢 Creando importaciones...')

  const import1 = await prisma.import.create({
    data: {
      provider: 'Guangzhou Trading Co.',
      piNumber: 'PI-2024-0891',
      eta: new Date('2024-04-15'),
      exchangeRate: 3.75,
      status: ImportStatus.DELIVERED,
      items: {
        create: [
          { productId: products[0].id, quantity: 100, unitPriceUsd: 45.00 },
          { productId: products[1].id, quantity: 200, unitPriceUsd: 18.00 },
        ],
      },
      costs: {
        create: [
          { category: 'SHIPPING', description: 'Flete marítimo Shanghai - Callao', amount: 850.00, currency: 'PEN' },
          { category: 'CUSTOMS', description: 'Agencia de aduanas SGS', amount: 1200.00, currency: 'PEN' },
        ],
      },
    },
  })

  const import2 = await prisma.import.create({
    data: {
      provider: 'Shenzhen Electronics Ltd.',
      piNumber: 'PI-2024-1156',
      eta: new Date('2024-05-20'),
      exchangeRate: 3.78,
      status: ImportStatus.IN_TRANSIT,
      items: {
        create: [
          { productId: products[4].id, quantity: 80, unitPriceUsd: 22.00 },
          { productId: products[5].id, quantity: 30, unitPriceUsd: 85.00 },
        ],
      },
      costs: {
        create: [
          { category: 'SHIPPING', description: 'Flete aéreo Guangzhou - Lima', amount: 1500.00, currency: 'PEN' },
          { category: 'CUSTOMS', description: 'Derechos arancelarios', amount: 850.00, currency: 'PEN' },
        ],
      },
    },
  })

  const import3 = await prisma.import.create({
    data: {
      provider: 'Wahl International Trading',
      piNumber: 'PI-2024-1203',
      eta: new Date('2024-06-10'),
      exchangeRate: 3.80,
      status: ImportStatus.DISPATCHED,
      items: {
        create: [
          { productId: products[6].id, quantity: 500, unitPriceUsd: 3.50 },
          { productId: products[7].id, quantity: 500, unitPriceUsd: 3.50 },
          { productId: products[8].id, quantity: 200, unitPriceUsd: 5.00 },
        ],
      },
      costs: {
        create: [
          { category: 'SHIPPING', description: 'Flete marítimo USA - Peru', amount: 1200.00, currency: 'PEN' },
          { category: 'CUSTOMS', description: 'Despacho aduanero', amount: 600.00, currency: 'PEN' },
          { category: 'MOBILITY', description: 'Transporte interno Callao - Lima', amount: 350.00, currency: 'PEN' },
        ],
      },
    },
  })

  console.log(`   ✓ ${import1.piNumber} - ${import1.status}`)
  console.log(`   ✓ ${import2.piNumber} - ${import2.status}`)
  console.log(`   ✓ ${import3.piNumber} - ${import3.status}`)

  return [import1, import2, import3]
}

async function createSales(
  products: Awaited<ReturnType<typeof createProducts>>,
  customers: Awaited<ReturnType<typeof createCustomers>>,
  locations: Awaited<ReturnType<typeof createLocations>>,
  adminUser: { id: string } | null,
  employeeUser: { id: string } | null
) {
  console.log('\n💰 Creando ventas...')

  const mainLocation = locations[0]
  const igvRate = 0.18

  async function createSaleWithItems(
    invoiceNumber: string,
    date: Date,
    status: SaleStatus,
    paymentMethod: string,
    customerIndex: number,
    items: Array<{ productIndex: number; quantity: number }>,
    userId: string,
    isDelivery: boolean = false,
    deliveryCost: number = 0
  ) {
    let subtotal = 0
    const saleItemsData = items.map(item => {
      const product = products[item.productIndex]
      const itemSubtotal = product.pricePen * item.quantity
      subtotal += itemSubtotal
      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.pricePen,
        basePrice: product.pricePen,
        subtotal: itemSubtotal,
      }
    })

    const igv = subtotal * igvRate
    const total = subtotal + igv + (isDelivery ? deliveryCost : 0)

    const sale = await prisma.sale.create({
      data: {
        invoiceNumber,
        date,
        status,
        totalAmount: total,
        paymentMethod,
        isDelivery,
        deliveryCost,
        userId,
        customerId: customers[customerIndex].id,
        locationId: mainLocation.id,
        items: {
          create: saleItemsData,
        },
      },
    })

    return sale
  }

  await createSaleWithItems(
    'B001-0001',
    new Date('2024-03-15'),
    SaleStatus.PAID,
    'EFECTIVO',
    0,
    [{ productIndex: 0, quantity: 2 }, { productIndex: 6, quantity: 10 }],
    employeeUser!.id
  )

  await createSaleWithItems(
    'B001-0002',
    new Date('2024-03-18'),
    SaleStatus.PAID,
    'YAPE',
    1,
    [{ productIndex: 4, quantity: 3 }, { productIndex: 9, quantity: 5 }],
    employeeUser!.id,
    true,
    15.00
  )

  await createSaleWithItems(
    'B001-0003',
    new Date('2024-03-22'),
    SaleStatus.PAID,
    'PLIN',
    2,
    [{ productIndex: 5, quantity: 1 }, { productIndex: 2, quantity: 2 }],
    adminUser!.id
  )

  await createSaleWithItems(
    'B001-0004',
    new Date('2024-04-01'),
    SaleStatus.PAID,
    'TARJETA',
    3,
    [{ productIndex: 1, quantity: 5 }, { productIndex: 6, quantity: 20 }, { productIndex: 7, quantity: 20 }],
    employeeUser!.id,
    true,
    20.00
  )

  await createSaleWithItems(
    'B001-0005',
    new Date('2024-04-05'),
    SaleStatus.PENDING,
    'TRANSFERENCIA',
    4,
    [{ productIndex: 11, quantity: 1 }],
    adminUser!.id
  )

  await createSaleWithItems(
    'B001-0006',
    new Date('2024-04-10'),
    SaleStatus.PAID,
    'EFECTIVO',
    5,
    [{ productIndex: 4, quantity: 2 }, { productIndex: 5, quantity: 1 }],
    employeeUser!.id
  )

  console.log('   ✓ 6 ventas creadas con sus items (IGV 18% incluido)')
}

async function createExpenses() {
  console.log('\n💸 Creando gastos...')

  const expenses = [
    { category: 'SERVICIOS', description: 'Pago internet Marzo 2024', amountPen: 150.00, status: 'PAID' },
    { category: 'ALQUILER', description: 'Alquiler local Tienda Principal', amountPen: 3500.00, status: 'PAID' },
    { category: 'SERVICIOS', description: 'Pago luz Marzo 2024', amountPen: 420.00, status: 'PAID' },
    { category: 'MANTENIMIENTO', description: 'Servicio técnico máquinas', amountPen: 280.00, status: 'PAID' },
    { category: 'INSUMOS', description: 'Aceite para mantenimiento', amountPen: 85.00, status: 'PENDING' },
  ]

  for (const exp of expenses) {
    await prisma.expense.create({
      data: {
        date: new Date(),
        ...exp,
      },
    })
    console.log(`   ✓ ${exp.category}: ${exp.description} - S/ ${exp.amountPen}`)
  }
}

async function main() {
  console.log('=================================================')
  console.log('  🚀 RAZORS CRM - SEED DE BASE DE DATOS')
  console.log('=================================================')
  console.log(`  📅 ${new Date().toLocaleString('es-PE')}`)
  console.log('=================================================')

  try {
    await cleanupTables()

    await createSystemSettings()
    const { adminUser, employeeUser, bossUser } = await createUsers()
    const locations = await createLocations()
    const customers = await createCustomers()
    const products = await createProducts()
    await createInventory(products, locations)
    await createImports(products)
    await createSales(products, customers, locations, adminUser, employeeUser)
    await createExpenses()

    console.log('\n=================================================')
    console.log('  ✅ SEED COMPLETADO EXITOSAMENTE')
    console.log('=================================================')
    console.log('\n📋 CREDENCIALES DE ACCESO:')
    console.log('   Admin:    admin@razors.com / password123')
    console.log('   Boss:     boss@razors.com / password123')
    console.log('   Vendedor: vendedor@razors.com / password123')
    console.log('=================================================\n')

  } catch (error) {
    console.error('\n❌ ERROR EN SEED:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
