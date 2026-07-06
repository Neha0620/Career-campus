import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const userId = session.user.id;

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const roadmap = await prisma.roadmap.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { milestones: { orderBy: { order: 'asc' } } },
  });

  if (!profile) return NextResponse.json({ error: 'No profile yet' }, { status: 404 });

  return NextResponse.json({ profile, roadmap });
}
