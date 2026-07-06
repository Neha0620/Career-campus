import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { analyzeSkillGap, generateRoadmap } from '@/lib/llm';

const OnboardingSchema = z.object({
  currentRole: z.string().min(1),
  targetRole: z.string().min(1),
  experienceYears: z.number().int().min(0).max(50),
  resumeText: z.string().min(20, 'Paste a bit more of your resume so the analysis has something to work with.'),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json();
  const parsed = OnboardingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { currentRole, targetRole, experienceYears, resumeText } = parsed.data;

  try {
    const analysis = await analyzeSkillGap(resumeText, currentRole, targetRole);

    const profile = await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        currentRole,
        targetRole,
        experienceYears,
        resumeText,
        currentSkills: analysis.currentSkills,
        missingSkills: analysis.missingSkills,
        matchScore: analysis.matchScore,
      },
      update: {
        currentRole,
        targetRole,
        experienceYears,
        resumeText,
        currentSkills: analysis.currentSkills,
        missingSkills: analysis.missingSkills,
        matchScore: analysis.matchScore,
      },
    });

    const milestones = await generateRoadmap(currentRole, targetRole, analysis.missingSkills);

    const roadmap = await prisma.roadmap.create({
      data: {
        userId,
        targetRole,
        milestones: {
          create: milestones.map((m, i) => ({
            title: m.title,
            description: m.description,
            estWeeks: m.estWeeks,
            order: i,
          })),
        },
      },
      include: { milestones: true },
    });

    return NextResponse.json({ profile, analysis, roadmap });
  } catch (err) {
    console.error('Onboarding analysis failed', err);
    return NextResponse.json(
      { error: 'Analysis failed — check ANTHROPIC_API_KEY and try again.' },
      { status: 500 }
    );
  }
}
