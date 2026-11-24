/**
 * Seed script: creates test users, resources, upvotes, bookmarks, and flags.
 * Run: node prisma/seed.js  (from /server directory)
 *
 * Demonstrates:
 *  - 3 role-based users (student, faculty, admin)
 *  - 10 resources across semesters 1–4 (notes + PYQs)
 *  - Duplicate hash detection (2 "files" with same content → only 1 stored)
 *  - Pre-seeded upvotes, bookmarks, 1 flag, 1 verified resource
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');

function makeFakePdf(label) {
  // Minimal valid-looking PDF bytes; enough to test hash + storage
  return Buffer.from(`%PDF-1.4 fake-seed-content:${label}`);
}

function hashBuf(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function writeFakeFile(filename, buf) {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const dest = path.join(UPLOAD_DIR, filename);
  if (!fs.existsSync(dest)) fs.writeFileSync(dest, buf);
  return `/uploads/${filename}`;
}

async function main() {
  console.log('🌱 Seeding database...');

  // ── Clean slate ────────────────────────────────────────────────────────────
  await prisma.flag.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.upvote.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ──────────────────────────────────────────────────────────────────
  const [student, faculty, admin] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Rahul Sharma',
        email: 'student@test.com',
        passwordHash: await bcrypt.hash('password123', 12),
        role: 'student',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Dr. Priya Mehta',
        email: 'faculty@test.com',
        passwordHash: await bcrypt.hash('password123', 12),
        role: 'faculty',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@test.com',
        passwordHash: await bcrypt.hash('password123', 12),
        role: 'admin',
      },
    }),
  ]);

  console.log('✅ Users created');

  // ── Resources ──────────────────────────────────────────────────────────────
  const resourceDefs = [
    {
      title: 'Data Structures - Unit 1 Notes',
      type: 'notes',
      semester: 2,
      subjectCode: 'CS201',
      subjectName: 'Data Structures',
      unit: 1,
      examYear: null,
      uploadedBy: student.id,
      isVerified: true,
    },
    {
      title: 'Data Structures - Unit 2 Notes',
      type: 'notes',
      semester: 2,
      subjectCode: 'CS201',
      subjectName: 'Data Structures',
      unit: 2,
      examYear: null,
      uploadedBy: faculty.id,
      isVerified: true,
    },
    {
      title: 'Operating Systems PYQ 2023',
      type: 'pyq',
      semester: 4,
      subjectCode: 'CS401',
      subjectName: 'Operating Systems',
      unit: null,
      examYear: 2023,
      uploadedBy: faculty.id,
      isVerified: true,
    },
    {
      title: 'Operating Systems PYQ 2022',
      type: 'pyq',
      semester: 4,
      subjectCode: 'CS401',
      subjectName: 'Operating Systems',
      unit: null,
      examYear: 2022,
      uploadedBy: student.id,
      isVerified: false,
    },
    {
      title: 'Mathematics I - Unit 3 Notes',
      type: 'notes',
      semester: 1,
      subjectCode: 'MA101',
      subjectName: 'Mathematics I',
      unit: 3,
      examYear: null,
      uploadedBy: faculty.id,
      isVerified: true,
    },
    {
      title: 'Digital Electronics PYQ 2021',
      type: 'pyq',
      semester: 3,
      subjectCode: 'EC301',
      subjectName: 'Digital Electronics',
      unit: null,
      examYear: 2021,
      uploadedBy: student.id,
      isVerified: false,
    },
    {
      title: 'Digital Electronics - Unit 1 Notes',
      type: 'notes',
      semester: 3,
      subjectCode: 'EC301',
      subjectName: 'Digital Electronics',
      unit: 1,
      examYear: null,
      uploadedBy: admin.id,
      isVerified: true,
    },
    {
      title: 'Computer Networks PYQ 2023',
      type: 'pyq',
      semester: 4,
      subjectCode: 'CS402',
      subjectName: 'Computer Networks',
      unit: null,
      examYear: 2023,
      uploadedBy: student.id,
      isVerified: false,
    },
    {
      title: 'Physics - Unit 2 Notes',
      type: 'notes',
      semester: 1,
      subjectCode: 'PH101',
      subjectName: 'Engineering Physics',
      unit: 2,
      examYear: null,
      uploadedBy: faculty.id,
      isVerified: true,
    },
    {
      title: 'Database Management PYQ 2022',
      type: 'pyq',
      semester: 3,
      subjectCode: 'CS302',
      subjectName: 'Database Management Systems',
      unit: null,
      examYear: 2022,
      uploadedBy: student.id,
      isVerified: false,
    },
  ];

  const createdResources = [];

  for (const def of resourceDefs) {
    const buf = makeFakePdf(`${def.subjectCode}-${def.title}`);
    const hash = hashBuf(buf);
    const filename = `seed-${hash.slice(0, 12)}.pdf`;
    const fileUrl = writeFakeFile(filename, buf);

    const resource = await prisma.resource.create({
      data: {
        title: def.title,
        type: def.type,
        semester: def.semester,
        subjectCode: def.subjectCode,
        subjectName: def.subjectName,
        unit: def.unit,
        examYear: def.examYear,
        fileUrl,
        fileHash: hash,
        isVerified: def.isVerified,
        uploadedBy: def.uploadedBy,
      },
    });

    createdResources.push(resource);
  }

  console.log(`✅ ${createdResources.length} resources created`);

  // ── Demonstrate duplicate hash detection ───────────────────────────────────
  // The seed creates unique content per resource above.
  // The duplicate scenario is exercised via the POST /api/resources endpoint:
  // uploading the same PDF file twice will return a 409 with existingId.
  console.log('ℹ️  Duplicate hash detection: upload the same PDF twice via the API to see a 409 response.');

  // ── Upvotes ────────────────────────────────────────────────────────────────
  const upvoteTargets = [
    { userId: student.id, resourceId: createdResources[0].id },
    { userId: student.id, resourceId: createdResources[2].id },
    { userId: faculty.id, resourceId: createdResources[0].id },
    { userId: admin.id,   resourceId: createdResources[2].id },
    { userId: admin.id,   resourceId: createdResources[4].id },
  ];

  for (const uv of upvoteTargets) {
    await prisma.upvote.create({ data: uv });
    await prisma.resource.update({
      where: { id: uv.resourceId },
      data: { upvotesCount: { increment: 1 } },
    });
  }

  console.log('✅ Upvotes seeded');

  // ── Bookmarks ──────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.bookmark.create({ data: { userId: student.id, resourceId: createdResources[2].id } }),
    prisma.bookmark.create({ data: { userId: student.id, resourceId: createdResources[4].id } }),
    prisma.bookmark.create({ data: { userId: faculty.id, resourceId: createdResources[0].id } }),
  ]);

  console.log('✅ Bookmarks seeded');

  // ── Flags ──────────────────────────────────────────────────────────────────
  await prisma.flag.create({
    data: {
      userId: student.id,
      resourceId: createdResources[3].id,
      reason: 'Wrong semester — this is a Sem 3 paper, not Sem 4.',
    },
  });

  console.log('✅ Flag seeded');

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Seed complete! Test credentials:');
  console.log('   Student : student@test.com / password123');
  console.log('   Faculty : faculty@test.com / password123');
  console.log('   Admin   : admin@test.com   / password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
