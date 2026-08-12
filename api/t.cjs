require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const docs = await p.doctor.findMany({ select: { id: true, specialization: true }, take: 2 });
  console.log('BEFORE:', JSON.stringify(docs));
  await p.doctor.update({ where: { id: docs[0].id }, data: { specialization: 'Cardiology' } });
  await p.doctor.update({ where: { id: docs[1].id }, data: { specialization: 'Dermatology' } });
  console.log('set two specialities temporarily');
  await p.$disconnect();
})().catch(e => { console.error('ERR:', e.message); process.exit(1); });
