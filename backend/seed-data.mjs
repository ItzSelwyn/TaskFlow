import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  try {
    const hash = await bcrypt.hash('password123', 12);
    
    // Create Org 1
    const org1 = await prisma.organization.create({
      data: {
        name: 'Acme Corp',
        slug: 'acme-corp-' + Date.now(),
        description: 'Building the future, one task at a time.',
      },
    });
    
    // Create Org 2
    const org2 = await prisma.organization.create({
      data: {
        name: 'Globex Inc',
        slug: 'globex-inc-' + Date.now(),
        description: 'Excellence in everything.',
      },
    });
    
    // Create users
    const alice = await prisma.user.create({
      data: { email: 'alice@acme.com', name: 'Alice Johnson', passwordHash: hash },
    });
    const bob = await prisma.user.create({
      data: { email: 'bob@acme.com', name: 'Bob Smith', passwordHash: hash },
    });
    const carol = await prisma.user.create({
      data: { email: 'carol@globex.com', name: 'Carol White', passwordHash: hash },
    });
    
    // Memberships
    await prisma.organizationMember.createMany({
      data: [
        { organizationId: org1.id, userId: alice.id, role: Role.ADMIN },
        { organizationId: org1.id, userId: bob.id, role: Role.MEMBER },
        { organizationId: org2.id, userId: carol.id, role: Role.ADMIN },
      ],
    });
    
    // Sample tasks
    await prisma.task.createMany({
      data: [
        { organizationId: org1.id, title: 'Design login page', createdById: alice.id, status: 'TODO', priority: 'HIGH' },
        { organizationId: org1.id, title: 'Setup database', createdById: alice.id, status: 'IN_PROGRESS', priority: 'HIGH', assignedToId: bob.id },
        { organizationId: org1.id, title: 'Write API docs', createdById: bob.id, status: 'TODO', priority: 'MEDIUM' },
        { organizationId: org2.id, title: 'Q1 Planning', createdById: carol.id, status: 'DONE', priority: 'HIGH' },
      ],
    });
    
    console.log('✅ Database seeded successfully!');
  } catch (e) {
    console.error('Error seeding:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
