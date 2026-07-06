import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { analyzeSkillGap } from '@/lib/llm';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const userId = session.user.id;

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile || !profile.resumeText) {
    return NextResponse.json({ error: 'No profile/resume on file' }, { status: 404 });
  }

  const analysis = await analyzeSkillGap(profile.resumeText, profile.currentRole, profile.targetRole);

  const updated = await prisma.profile.update({
    where: { userId },
    data: {
      currentSkills: analysis.currentSkills,
      missingSkills: analysis.missingSkills,
      matchScore: analysis.matchScore,
    },
  });

  return NextResponse.json({ profile: updated, analysis });
}
