import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { streamAdvisorChat } from '@/lib/llm';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const userId = session.user.id;

  const { messages } = await req.json();

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const profileContext = profile
    ? `Currently a ${profile.currentRole} with ${profile.experienceYears} years experience, ` +
      `targeting ${profile.targetRole}. Missing skills: ${profile.missingSkills.join(', ') || 'none logged yet'}.`
    : 'No profile on file yet — ask a clarifying question if that matters.';

  const stream = streamAdvisorChat(messages, profileContext);

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      let fullText = '';
      stream.on('text', (delta) => {
        fullText += delta;
        controller.enqueue(encoder.encode(delta));
      });
      stream.on('end', async () => {
        await prisma.chatMessage.create({
          data: { userId, role: 'assistant', content: fullText },
        });
        controller.close();
      });
      stream.on('error', (err) => controller.error(err));
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
