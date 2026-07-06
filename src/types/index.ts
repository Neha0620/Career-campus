export interface RadarSkill {
  skill: string;
  have: number; // 0-100 self/AI estimated proficiency
  need: number; // 0-100 required for target role
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  order: number;
  estWeeks: number;
  completed: boolean;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}
