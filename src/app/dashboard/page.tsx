'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { SkillRadar } from '@/components/RadarChart';
import { RoadmapTimeline } from '@/components/RoadmapTimeline';
import type { Milestone } from '@/types';

interface DashboardData {
  profile: {
    currentRole: string;
    targetRole: string;
    matchScore: number | null;
    currentSkills: string[];
    missingSkills: string[];
  };
  roadmap: { id: string; milestones: Milestone[] } | null;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then(setData)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, []);

  async function toggleMilestone(id: string) {
    if (!data?.roadmap) return;
    const m = data.roadmap.milestones.find((x) => x.id === id);
    if (!m) return;
    const nextCompleted = !m.completed;
    setData({
      ...data,
      roadmap: {
        ...data.roadmap,
        milestones: data.roadmap.milestones.map((x) =>
          x.id === id ? { ...x, completed: nextCompleted } : x
        ),
      },
    });
    await fetch(`/api/milestones/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: nextCompleted }),
    });
  }

  if (loading) return <Centered>Reading the chart…</Centered>;

  if (notFound || !data) {
    return (
      <Centered>
        <p className="text-ink-dim mb-4">No route plotted yet.</p>
        <Link href="/onboarding" className="text-brass hover:underline">
          Start the onboarding quiz →
        </Link>
      </Centered>
    );
  }

  const { profile, roadmap } = data;
  const radarData = [
    ...profile.currentSkills.slice(0, 4).map((s) => ({ skill: s, have: 75, need: 40 })),
    ...profile.missingSkills.slice(0, 4).map((s) => ({ skill: s, have: 10, need: 85 })),
  ];

  return (
    <main>
      <Nav />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <p className="font-mono text-xs tracking-widest text-brass uppercase mb-2">
          {profile.currentRole} → {profile.targetRole}
        </p>
        <h1 className="font-display text-3xl mb-1">Your bearing</h1>
        <p className="text-ink-dim mb-10">
          {profile.matchScore ?? '—'}% aligned with {profile.targetRole}
        </p>

        <div className="grid md:grid-cols-2 gap-10 mb-16">
          <section className="bg-chart-panel border border-chart-line rounded-lg p-6">
            <h2 className="font-display text-xl mb-4">Skill gap radar</h2>
            {radarData.length > 0 ? (
              <SkillRadar data={radarData} />
            ) : (
              <p className="text-ink-dim text-sm">Not enough data yet.</p>
            )}
          </section>

          <section className="bg-chart-panel border border-chart-line rounded-lg p-6">
            <h2 className="font-display text-xl mb-4">Missing skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.missingSkills.length > 0 ? (
                profile.missingSkills.map((s) => (
                  <span
                    key={s}
                    className="font-mono text-xs bg-chart-bg border border-chart-line text-brass px-2.5 py-1 rounded-full"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <p className="text-ink-dim text-sm">None detected — nice.</p>
              )}
            </div>
          </section>
        </div>

        <section>
          <h2 className="font-display text-2xl mb-6">Your route</h2>
          {roadmap ? (
            <RoadmapTimeline milestones={roadmap.milestones} onToggle={toggleMilestone} />
          ) : (
            <p className="text-ink-dim text-sm">No roadmap generated yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center px-6">
      {children}
    </main>
  );
}
