// Seeds a demo account so reviewers (or you, in a live demo) can see the
// dashboard and roadmap fully populated without burning an API call or
// redoing onboarding. Run with: npm run db:seed
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@careercompass.dev' },
    create: { email: 'demo@careercompass.dev', name: 'Demo User', passwordHash },
    update: { passwordHash },
  });

  await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      currentRole: 'Junior Frontend Developer',
      targetRole: 'Senior Full-Stack Engineer',
      experienceYears: 2,
      resumeText:
        'Built and maintained React dashboards, wrote component tests with Jest, collaborated with designers on UI polish.',
      currentSkills: ['React', 'JavaScript', 'CSS', 'Git', 'REST APIs'],
      missingSkills: ['Node.js/Express', 'PostgreSQL', 'System design', 'Docker', 'CI/CD'],
      matchScore: 42,
    },
    update: {},
  });

  const existingRoadmap = await prisma.roadmap.findFirst({ where: { userId: user.id } });
  if (!existingRoadmap) {
    await prisma.roadmap.create({
      data: {
        userId: user.id,
        targetRole: 'Senior Full-Stack Engineer',
        milestones: {
          create: [
            {
              title: 'Solidify Node.js + Express fundamentals',
              description: 'Build a small REST API from scratch, including auth and error handling.',
              order: 0,
              estWeeks: 2,
            },
            {
              title: 'Learn relational data modeling',
              description: 'Design a normalized Postgres schema for a real project; practice with Prisma.',
              order: 1,
              estWeeks: 2,
            },
            {
              title: 'Ship one full-stack side project',
              description: 'End to end: frontend, API, database, deployed publicly.',
              order: 2,
              estWeeks: 3,
            },
            {
              title: 'Study system design basics',
              description: 'Caching, load balancing, database scaling — enough to reason about tradeoffs in interviews.',
              order: 3,
              estWeeks: 2,
            },
            {
              title: 'Add CI/CD to a project',
              description: 'Set up GitHub Actions to lint, test, and deploy automatically.',
              order: 4,
              estWeeks: 1,
            },
          ],
        },
      },
    });
  }

  console.log('Seeded demo account: demo@careercompass.dev / demo1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
