import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create Locations
  const almacenCentral = await prisma.location.upsert({
    where: { id: 'loc-almacen-central' },
    update: {},
    create: {
      id: 'loc-almacen-central',
      name: 'Almacén Central',
    },
  })

  const tiendaPrincipal = await prisma.location.upsert({
    where: { id: 'loc-tienda-principal' },
    update: {},
    create: {
      id: 'loc-tienda-principal',
      name: 'Tienda Principal',
    },
  })

  console.log('✅ Locations created')

  // Create Users
  const hashedPassword = await hash('razors123', 12)

  const boss = await prisma.user.upsert({
    where: { email: 'boss@razors.com' },
    update: {},
    create: {
      name: 'Dueña / Jefa',
      email: 'boss@razors.com',
      password: hashedPassword,
      role: 'BOSS',
      isActive: true,
    },
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@razors.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@razors.com',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })

  const employee = await prisma.user.upsert({
    where: { email: 'vendedor@razors.com' },
    update: {},
    create: {
      name: 'Vendedor',
      email: 'vendedor@razors.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      isActive: true,
    },
  })

  console.log('✅ Users created')

  // Create Products
  const products = [
    { sku: 'PEIN-001', name: 'Peinilla Roja', category: 'Peinillas', pricePen: 25.00 },
    { sku: 'PEIN-002', name: 'Peinilla Azul', category: 'Peinillas', pricePen: 25.00 },
    { sku: 'PEIN-003', name: 'Peinilla Negra', category: 'Peinillas', pricePen: 28.00 },
    { sku: 'MAQ-001', name: 'Máquina de Corte Pro', category: 'Máquinas', pricePen: 350.00 },
    { sku: 'MAQ-002', name: 'Máquina de Corte Basic', category: 'Máquinas', pricePen: 180.00 },
    { sku: 'SAB-001', name: 'Sable de Barbero Inox', category: 'Sables', pricePen: 85.00 },
    { sku: 'BRO-001', name: 'Brocha de Afeitar', category: 'Brochas', pricePen: 45.00 },
    { sku: 'ESP-001', name: 'Espuma de Afeitar 250ml', category: 'Cosméticos', pricePen: 18.00 },
    { sku: 'GEL-001', name: 'Gel Fijador Fuerte', category: 'Cosméticos', pricePen: 22.00 },
    { sku: 'COR-001', name: 'Cortaúnilas Profesional', category: 'Herramientas', pricePen: 35.00 },
  ]

  for (const prod of products) {
    const product = await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: {
        sku: prod.sku,
        name: prod.name,
        category: prod.category,
        pricePen: prod.pricePen,
      },
    })

    // Create inventory for each location
    await prisma.inventory.upsert({
      where: {
        productId_locationId: {
          productId: product.id,
          locationId: almacenCentral.id,
        },
      },
      update: {},
      create: {
        productId: product.id,
        locationId: almacenCentral.id,
        stock: Math.floor(Math.random() * 100) + 20,
      },
    })

    await prisma.inventory.upsert({
      where: {
        productId_locationId: {
          productId: product.id,
          locationId: tiendaPrincipal.id,
        },
      },
      update: {},
      create: {
        productId: product.id,
        locationId: tiendaPrincipal.id,
        stock: Math.floor(Math.random() * 50) + 5,
      },
    })
  }

  console.log('✅ Products and inventory created')

  // Create Sample Customers
  const customers = [
    { docType: 'RUC', docNumber: '20123456789', name: 'Barbería El Rey', email: 'ventas@barberiaelrey.com' },
    { docType: 'DNI', docNumber: '76543210', name: 'Carlos Mendoza', email: 'carlos.mendoza@gmail.com' },
    { docType: 'RUC', docNumber: '20987654321', name: 'Estética Masculina Plus', email: 'contacto@esteticaplus.com' },
    { docType: 'DNI', docNumber: '71234567', name: 'Juan Pérez', email: 'juan.perez@outlook.com' },
    { docType: 'RUC', docNumber: '20111222333', name: 'Salón de BellezaStyle', email: 'info@salonstyle.com' },
  ]

  for (const cust of customers) {
    await prisma.customer.upsert({
      where: { docNumber: cust.docNumber },
      update: {},
      create: cust,
    })
  }

  console.log('✅ Customers created')

  console.log('')
  console.log('🎉 Seed completed successfully!')
  console.log('')
  console.log('📋 Login credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('BOSS:     boss@razors.com / razors123')
  console.log('ADMIN:    admin@razors.com / razors123')
  console.log('EMPLOYEE: vendedor@razors.com / razors123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })