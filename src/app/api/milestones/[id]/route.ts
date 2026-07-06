import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { completed } = await req.json();

  // Ownership check: a milestone can only be toggled by the user whose
  // roadmap it belongs to — without this, any authenticated user could
  // PATCH any milestone ID.
  const existing = await prisma.milestone.findUnique({
    where: { id },
    include: { roadmap: true },
  });
  if (!existing || existing.roadmap.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const milestone = await prisma.milestone.update({
    where: { id },
    data: { completed },
  });
  return NextResponse.json({ milestone });
}
