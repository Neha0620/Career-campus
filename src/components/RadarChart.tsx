'use client';

import {
  Radar,
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { RadarSkill } from '@/types';

export function SkillRadar({ data }: { data: RadarSkill[] }) {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <ReRadarChart data={data} outerRadius="70%">
        <PolarGrid stroke="#26364B" />
        <PolarAngleAxis dataKey="skill" tick={{ fill: '#9AA5B4', fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9AA5B4', fontSize: 10 }} />
        <Radar name="Have" dataKey="have" stroke="#4FA88C" fill="#4FA88C" fillOpacity={0.35} />
        <Radar name="Need" dataKey="need" stroke="#E3A64F" fill="#E3A64F" fillOpacity={0.15} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#9AA5B4' }} />
      </ReRadarChart>
    </ResponsiveContainer>
  );
}
