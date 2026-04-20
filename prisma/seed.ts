import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

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
  ]);
  console.log('Tables cleaned');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@razorcrm.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const employee = await prisma.user.create({
    data: {
      name: 'Carlos Mendoza',
      email: 'carlos@razorcrm.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
    },
  });

  console.log('Users created');

  const location = await prisma.location.create({
    data: {
      name: 'Tienda Principal',
    },
  });

  const customer1 = await prisma.customer.create({
    data: {
      docType: 'RUC',
      docNumber: '20123456789',
      name: 'Barbería El Patrón',
      email: 'contacto@barberiaelpatron.com',
      phone: '987654321',
      address: 'Av. Ejemplo 123, Lima',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      docType: 'RUC',
      docNumber: '20987654321',
      name: 'Cortes & Estilos VIP',
      email: 'ventas@cortesvip.com',
      phone: '912345678',
      address: 'Jr. Lima 456, Callao',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      docType: 'DNI',
      docNumber: '47234567',
      name: 'Juan Pérez',
      email: 'juan.perez@gmail.com',
      phone: '998877665',
      address: 'Av. Peru 789, San Juan de Lurigancho',
    },
  });

  console.log('Customers created');

  const product1 = await prisma.product.create({
    data: {
      sku: 'WAHL-MGC-INC',
      name: 'Máquina Cortapelo',
      brand: 'Wahl',
      model: 'Magic Clip Inalámbrica',
      category: 'Máquinas',
      pricePen: 350.00,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      sku: 'AND-PRF-LIT',
      name: 'Shaver',
      brand: 'Andis',
      model: 'ProFoil Lithium',
      category: 'Shaver',
      pricePen: 260.00,
    },
  });

  const product3 = await prisma.product.create({
    data: {
      sku: 'BAB-SKE-GLD',
      name: 'Patillera Trimmer',
      brand: 'Babyliss',
      model: 'Pro Skeleton Gold',
      category: 'Trimmers',
      pricePen: 310.00,
    },
  });

  const product4 = await prisma.product.create({
    data: {
      sku: 'WAHL-GUI-02',
      name: 'Peineta Premium',
      brand: 'Wahl',
      model: 'Guía #2 (1/4")',
      category: 'Accesorios',
      pricePen: 25.00,
    },
  });

  const product5 = await prisma.product.create({
    data: {
      sku: 'AND-MTX-PRO',
      name: 'Máquina Cortapelo',
      brand: 'Andis',
      model: 'Master Variable Speed',
      category: 'Máquinas',
      pricePen: 420.00,
    },
  });

  await prisma.inventory.createMany({
    data: [
      { productId: product1.id, locationId: location.id, stock: 15 },
      { productId: product2.id, locationId: location.id, stock: 8 },
      { productId: product3.id, locationId: location.id, stock: 5 },
      { productId: product4.id, locationId: location.id, stock: 50 },
      { productId: product5.id, locationId: location.id, stock: 12 },
    ],
  });

  console.log('Products and inventory created');

  const sale1 = await prisma.sale.create({
    data: {
      invoiceNumber: 'INV-001',
      status: 'PAID',
      totalAmount: 350.00,
      paymentMethod: 'EFECTIVO',
      isDelivery: false,
      deliveryCost: 0,
      userId: employee.id,
      customerId: customer1.id,
      locationId: location.id,
    },
  });

  await prisma.saleItem.create({
    data: {
      saleId: sale1.id,
      productId: product1.id,
      quantity: 1,
      unitPrice: 350.00,
      basePrice: 350.00,
      subtotal: 350.00,
    },
  });

  const sale2 = await prisma.sale.create({
    data: {
      invoiceNumber: 'INV-002',
      status: 'PAID',
      totalAmount: 275.00,
      paymentMethod: 'YAPE',
      isDelivery: true,
      deliveryCost: 15.00,
      userId: employee.id,
      customerId: customer2.id,
      locationId: location.id,
    },
  });

  await prisma.saleItem.create({
    data: {
      saleId: sale2.id,
      productId: product2.id,
      quantity: 1,
      unitPrice: 260.00,
      basePrice: 260.00,
      subtotal: 260.00,
    },
  });

  const sale3 = await prisma.sale.create({
    data: {
      invoiceNumber: 'INV-003',
      status: 'PENDING',
      totalAmount: 310.00,
      paymentMethod: 'EFECTIVO',
      isDelivery: false,
      deliveryCost: 0,
      userId: employee.id,
      customerId: customer3.id,
      locationId: location.id,
    },
  });

  await prisma.saleItem.create({
    data: {
      saleId: sale3.id,
      productId: product3.id,
      quantity: 1,
      unitPrice: 310.00,
      basePrice: 310.00,
      subtotal: 310.00,
    },
  });

  console.log('Sales created');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
