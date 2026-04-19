import { PrismaClient, SaleStatus, ImportStatus } from '@prisma/client'
import { hash } from 'bcryptjs'
import { subDays, subMonths, format, addDays } from 'date-fns'

const prisma = new PrismaClient()

const PROVIDERS = [
  'Wahl Professional',
  'BaBylissPRO',
  'Andis Company',
  'Kemei Official',
  'Doka Professional'
]

const PRODUCTS = [
  { sku: 'WH-CLP-SNR', name: 'Wahl Senior Clipper', category: 'Máquinas', pricePen: 450.00 },
  { sku: 'WH-CLP-MGC', name: 'Wahl Magic Clip Cordless', category: 'Máquinas', pricePen: 420.00 },
  { sku: 'WH-CLP-5ST', name: 'Wahl 5-Star Magic Clip', category: 'Máquinas', pricePen: 395.00 },
  { sku: 'WH-CLP-DTL', name: 'Wahl Detailer Lipper', category: 'Máquinas', pricePen: 285.00 },
  { sku: 'BB-PRO-TTL', name: 'BaBylissPRO Titanium 1.25"', category: 'Planchas', pricePen: 320.00 },
  { sku: 'BB-PRO-ROT', name: 'BaBylissPRO Tourmaline Rotating', category: 'Secadores', pricePen: 280.00 },
  { sku: 'AN-AGR-MTR', name: 'Andis AG UltraEdge Motor', category: 'Máquinas', pricePen: 380.00 },
  { sku: 'AN-SUPER-L', name: 'Andis Supera Liner', category: 'Máquinas', pricePen: 265.00 },
  { sku: 'KM-GRDPRO-2', name: 'Kemei Professional KM-2008', category: 'Máquinas', pricePen: 125.00 },
  { sku: 'DK-SHR-PRO', name: 'Doka Professional Hair Clipper', category: 'Máquinas', pricePen: 145.00 },
  { sku: 'CB-RED-CAR', name: 'Carbon Comb Red Series', category: 'Peinillas', pricePen: 25.00 },
  { sku: 'CB-BLU-CAR', name: 'Carbon Comb Blue Series', category: 'Peinillas', pricePen: 25.00 },
  { sku: 'CB-BLK-CAR', name: 'Carbon Comb Black Series', category: 'Peinillas', pricePen: 28.00 },
  { sku: 'RZ-PLT-100', name: 'Razor Platinum 100 uds', category: 'Cuchillas', pricePen: 85.00 },
  { sku: 'RZ-FLI-50', name: 'Razor Flixon 50 uds', category: 'Cuchillas', pricePen: 45.00 },
  { sku: 'SH-GEL-BLU', name: 'Shaving Gel Blue Ice 250ml', category: 'Cosméticos', pricePen: 35.00 },
  { sku: 'SH-GEL-NAT', name: 'Shaving Gel Natural 250ml', category: 'Cosméticos', pricePen: 32.00 },
  { sku: 'SP-FIX-CLR', name: 'Spray Fijador Clarifier', category: 'Cosméticos', pricePen: 28.00 },
  { sku: 'BR-AFE-PRO', name: 'Brocha Afeitar Premium', category: 'Brochas', pricePen: 65.00 },
  { sku: 'BR-AFE-BAS', name: 'Brocha Afeitar Basic', category: 'Brochas', pricePen: 38.00 },
  { sku: 'SB-BRB-INS', name: 'Sable Barbero Inoxidable', category: 'Sables', pricePen: 95.00 },
  { sku: 'AP-LTH-BRN', name: 'Delantal Cuero Brown', category: 'Accesorios', pricePen: 180.00 },
  { sku: 'TIJ-PRO-7', name: 'Tijeras Professional 7"', category: 'Tijeras', pricePen: 150.00 },
  { sku: 'TIJ-SET-6', name: 'Tijeras Set 6" + 6.5"', category: 'Tijeras', pricePen: 220.00 },
  { sku: 'NS-DST-BLK', name: 'Neck Duster Black', category: 'Accesorios', pricePen: 42.00 },
]

const CUSTOMERS = [
  { docType: 'RUC', docNumber: '20123456789', name: 'Barbería El Rey S.A.C.', email: 'ventas@barberiaelrey.com' },
  { docType: 'RUC', docNumber: '20987654321', name: 'Estética Masculina Plus E.I.R.L.', email: 'contacto@esteticaplus.com' },
  { docType: 'RUC', docNumber: '20111222333', name: 'Salón Belleza Style S.A.C.', email: 'info@salonstyle.com' },
  { docType: 'DNI', docNumber: '76543210', name: 'Carlos Mendoza Flores', email: 'carlos.mendoza@gmail.com' },
  { docType: 'DNI', docNumber: '71234567', name: 'Juan Pérez García', email: 'juan.perez@outlook.com' },
  { docType: 'DNI', docNumber: '72345678', name: 'María Rodríguez López', email: 'maria.rodriguez@hotmail.com' },
  { docType: 'DNI', docNumber: '73456789', name: 'Pedro Sánchez Ruiz', email: 'pedro.sanchez@yahoo.com' },
  { docType: 'RUC', docNumber: '20654321098', name: 'Distribuidora Barber Pro S.A.C.', email: 'ventas@barberpro.pe' },
  { docType: 'DNI', docNumber: '74567890', name: 'Luis Hernández Martínez', email: 'luis.hdez@gmail.com' },
  { docType: 'DNI', docNumber: '75678901', name: 'Ana García López', email: 'ana.garcia@outlook.com' },
]

const LOCATIONS = [
  { id: 'loc-almacen-central', name: 'Almacén Central' },
  { id: 'loc-tienda-miraflores', name: 'Tienda Miraflores' },
  { id: 'loc-tienda-san-isidro', name: 'Tienda San Isidro' },
]

const EXPENSE_CATEGORIES = ['RENT', 'UTILITIES', 'SUPPLIES', 'MARKETING', 'SALARIES', 'LOGISTICS', 'MAINTENANCE']

const EXPENSE_DESCRIPTIONS: Record<string, string[]> = {
  RENT: ['Alquiler local Miraflores', 'Alquiler local San Isidro', 'Alquiler almacén central'],
  UTILITIES: ['Electricidad tienda', 'Agua potable', 'Internet corporativo', 'Teléfono fijo'],
  SUPPLIES: ['Material de limpieza', 'Papel toalla', 'Bolsas personalizadas', 'Cajas de cartón'],
  MARKETING: ['Facebook Ads', 'Instagram Ads', 'Google Ads', 'Volantes publicitarios'],
  SALARIES: ['Planilla empleados', 'Bono productividad', 'Gratificaciones'],
  LOGISTICS: ['Delivery clientes', 'Combustible movilidad', 'Courier paquetes'],
  MAINTENANCE: ['Mantenimiento equipos', 'Reparación local', 'Pintura fachada'],
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals))
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function main() {
  console.log('🌱 Starting Razors CRM seed...\n')

  console.log('📦 Creating locations...')
  for (const loc of LOCATIONS) {
    await prisma.location.upsert({
      where: { id: loc.id },
      update: {},
      create: loc,
    })
  }
  console.log(`   ✅ ${LOCATIONS.length} locations created`)

  console.log('\n👥 Creating users...')
  const hashedPassword = await hash('razors123', 12)

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'boss@razors.com' },
      update: {},
      create: { name: 'Dylan Florez', email: 'boss@razors.com', password: hashedPassword, role: 'BOSS', isActive: true },
    }),
    prisma.user.upsert({
      where: { email: 'admin@razors.com' },
      update: {},
      create: { name: 'Administrador Sistema', email: 'admin@razors.com', password: hashedPassword, role: 'ADMIN', isActive: true },
    }),
    prisma.user.upsert({
      where: { email: 'empleado1@razors.com' },
      update: {},
      create: { name: 'Carlos Venta', email: 'empleado1@razors.com', password: hashedPassword, role: 'EMPLOYEE', isActive: true },
    }),
    prisma.user.upsert({
      where: { email: 'empleado2@razors.com' },
      update: {},
      create: { name: 'Ana Atención', email: 'empleado2@razors.com', password: hashedPassword, role: 'EMPLOYEE', isActive: true },
    }),
  ])
  console.log(`   ✅ ${users.length} users created`)

  console.log('\n🏭 Creating providers (via imports)...')
  const threeMonthsAgo = subMonths(new Date(), 3)

  for (let i = 0; i < 3; i++) {
    const importDate = subDays(threeMonthsAgo, -randomBetween(5, 25) * i)
    const provider = PROVIDERS[i]

    await prisma.import.upsert({
      where: { id: `import-${i + 1}` },
      update: {},
      create: {
        id: `import-${i + 1}`,
        provider,
        piNumber: `PI-2024-${100 + i}`,
        eta: addDays(importDate, 30),
        exchangeRate: randomFloat(3.7, 3.9),
        status: 'DELIVERED',
        createdAt: importDate,
      },
    })
  }
  console.log(`   ✅ ${3} imports (providers) created`)

  console.log('\n📦 Creating products...')
  const createdProducts = []
  for (const prod of PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: prod,
    })
    createdProducts.push(product)

    for (const loc of LOCATIONS) {
      const baseStock = prod.category === 'Máquinas' ? randomBetween(5, 25) : randomBetween(30, 150)
      await prisma.inventory.upsert({
        where: { productId_locationId: { productId: product.id, locationId: loc.id } },
        update: {},
        create: { productId: product.id, locationId: loc.id, stock: baseStock },
      })
    }
  }
  console.log(`   ✅ ${PRODUCTS.length} products created with inventory`)

  console.log('\n👤 Creating customers...')
  const createdCustomers = []
  for (const cust of CUSTOMERS) {
    const customer = await prisma.customer.upsert({
      where: { docNumber: cust.docNumber },
      update: {},
      create: cust,
    })
    createdCustomers.push(customer)
  }
  console.log(`   ✅ ${CUSTOMERS.length} customers created`)

  console.log('\n💰 Creating sales history (last 3 months)...')
  let salesCreated = 0

  for (let month = 0; month < 3; month++) {
    const monthStart = subMonths(new Date(), month)
    const daysInMonth = month === 0 ? new Date().getDate() : 30

    for (let day = 1; day <= daysInMonth; day += randomBetween(1, 3)) {
      if (Math.random() > 0.7) continue

      const saleDate = new Date(monthStart)
      saleDate.setDate(day)
      saleDate.setHours(randomBetween(9, 19), randomBetween(0, 59), 0, 0)

      const numItems = randomBetween(1, 5)
      const selectedProducts = randomElement(createdProducts.filter(p => p.category === 'Máquinas' || p.category === 'Cuchillas'))
      const saleItems = []
      let totalAmount = 0

      for (let i = 0; i < numItems; i++) {
        const product = randomElement(createdProducts)
        const quantity = randomBetween(1, 8)
        const subtotal = product.pricePen * quantity
        totalAmount += subtotal
        saleItems.push({
          productId: product.id,
          quantity,
          unitPrice: product.pricePen,
          subtotal,
        })
      }

      const statuses: SaleStatus[] = ['PAID', 'PAID', 'PAID', 'PENDING', 'VOID']
      const status = randomElement(statuses)

      const invoicePrefix = status === 'VOID' ? 'NC' : 'INV'
      const invoiceNumber = `${invoicePrefix}-${format(saleDate, 'yyyyMM')}-${String(randomBetween(100, 999)).padStart(3, '0')}`

      try {
        await prisma.sale.create({
          data: {
            invoiceNumber,
            date: saleDate,
            status,
            totalAmount: status === 'VOID' ? 0 : totalAmount,
            userId: randomElement(users.filter(u => u.role !== 'ADMIN')).id,
            customerId: randomElement(createdCustomers).id,
            locationId: randomElement(LOCATIONS).id,
            items: {
              create: saleItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.subtotal,
              })),
            },
          },
        })
        salesCreated++
      } catch (e) {
        // Skip duplicate invoice numbers
      }
    }
  }
  console.log(`   ✅ ${salesCreated} sales created`)

  console.log('\n💸 Creating expenses (last 3 months)...')
  let expensesCreated = 0

  for (let month = 0; month < 3; month++) {
    const monthStart = subMonths(new Date(), month)
    const daysInMonth = month === 0 ? new Date().getDate() : 28

    for (let day = 1; day <= daysInMonth; day += randomBetween(2, 5)) {
      const expenseDate = new Date(monthStart)
      expenseDate.setDate(day)
      expenseDate.setHours(randomBetween(8, 17), 0, 0, 0)

      const category = randomElement(EXPENSE_CATEGORIES)
      const descriptions = EXPENSE_DESCRIPTIONS[category]
      const description = randomElement(descriptions)

      const amountRanges: Record<string, [number, number]> = {
        RENT: [3500, 5000],
        UTILITIES: [200, 800],
        SUPPLIES: [150, 600],
        MARKETING: [300, 1500],
        SALARIES: [8000, 15000],
        LOGISTICS: [100, 400],
        MAINTENANCE: [200, 1200],
      }
      const [min, max] = amountRanges[category]
      const amount = randomFloat(min, max)

      const statuses = ['PAID', 'PAID', 'PENDING']
      const status = randomElement(statuses)

      try {
        await prisma.expense.create({
          data: {
            date: expenseDate,
            category,
            description,
            amountPen: amount,
            status,
          },
        })
        expensesCreated++
      } catch (e) {
        console.error('Error creating expense:', e)
      }
    }
  }
  console.log(`   ✅ ${expensesCreated} expenses created`)

  console.log('\n' + '='.repeat(50))
  console.log('🎉 Seed completed successfully!')
  console.log('='.repeat(50))
  console.log('\n📋 Login credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('BOSS:     boss@razors.com / razors123')
  console.log('ADMIN:    admin@razors.com / razors123')
  console.log('EMPLOYEE: empleado1@razors.com / razors123')
  console.log('EMPLOYEE: empleado2@razors.com / razors123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n📊 Data summary:')
  console.log(`   • ${LOCATIONS.length} locations`)
  console.log(`   • ${users.length} users`)
  console.log(`   • ${PRODUCTS.length} products`)
  console.log(`   • ${CUSTOMERS.length} customers`)
  console.log(`   • 3 imports (providers established)`)
  console.log(`   • ${salesCreated} sales (last 3 months)`)
  console.log(`   • ${expensesCreated} expenses (last 3 months)`)
  console.log('')
}

main()
  .catch((e) => {
    console.error('\n❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
