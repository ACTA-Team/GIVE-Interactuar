import React from 'react';
import {
  Clock,
  TrendingUp,
  Users,
  GraduationCap,
  Lightbulb,
  Leaf,
} from 'lucide-react';

export const BADGE_ICONS_SMALL: Record<string, React.ReactNode> = {
  punctual: <Clock className="h-3 w-3" />,
  growth: <TrendingUp className="h-3 w-3" />,
  community: <Users className="h-3 w-3" />,
  training: <GraduationCap className="h-3 w-3" />,
  innovation: <Lightbulb className="h-3 w-3" />,
  sustainable: <Leaf className="h-3 w-3" />,
};

export const BADGE_ICONS: Record<string, React.ReactNode> = {
  punctual: <Clock className="h-5 w-5" />,
  growth: <TrendingUp className="h-5 w-5" />,
  community: <Users className="h-5 w-5" />,
  training: <GraduationCap className="h-5 w-5" />,
  innovation: <Lightbulb className="h-5 w-5" />,
  sustainable: <Leaf className="h-5 w-5" />,
};

export const BADGE_ICONS_LARGE: Record<string, React.ReactNode> = {
  punctual: <Clock className="h-8 w-8" />,
  growth: <TrendingUp className="h-8 w-8" />,
  community: <Users className="h-8 w-8" />,
  training: <GraduationCap className="h-8 w-8" />,
  innovation: <Lightbulb className="h-8 w-8" />,
  sustainable: <Leaf className="h-8 w-8" />,
};

export type BadgeColorsDetail = {
  bg: string;
  border: string;
  glow: string;
  solid: string;
};

const NAVY = {
  bg: 'from-[#002E5C]/20 to-[#002E5C]/10',
  border: 'border-[#002E5C]/40',
  glow: 'shadow-[#002E5C]/20',
  solid: 'bg-[#002E5C]',
};
const ORANGE = {
  bg: 'from-[#F15A24]/20 to-[#F15A24]/10',
  border: 'border-[#F15A24]/40',
  glow: 'shadow-[#F15A24]/20',
  solid: 'bg-[#F15A24]',
};
const SKY = {
  bg: 'from-[#ADD8E6]/40 to-[#ADD8E6]/20',
  border: 'border-[#ADD8E6]/60',
  glow: 'shadow-[#ADD8E6]/30',
  solid: 'bg-[#ADD8E6]',
};

/** Full color set for detail views (cards, dialogs). */
export const BADGE_COLORS: Record<string, BadgeColorsDetail> = {
  punctual: NAVY,
  growth: ORANGE,
  community: SKY,
  training: NAVY,
  innovation: ORANGE,
  sustainable: SKY,
};

const DEFAULT_COLORS: BadgeColorsDetail = {
  bg: 'from-gray-500/20 to-gray-600/20',
  border: 'border-gray-500/50',
  glow: 'shadow-gray-500/20',
  solid: 'bg-gray-500',
};

export function getBadgeColors(badgeId: string): BadgeColorsDetail {
  return BADGE_COLORS[badgeId] ?? DEFAULT_COLORS;
}

/** Single-class string for list page badge pills. */
export const BADGE_LIST_CLASSES: Record<string, string> = {
  punctual: 'bg-[#002E5C]/15 text-[#002E5C] border-[#002E5C]/30',
  growth: 'bg-[#F15A24]/15 text-[#F15A24] border-[#F15A24]/30',
  community: 'bg-[#ADD8E6]/40 text-[#002E5C] border-[#ADD8E6]/60',
  training: 'bg-[#002E5C]/15 text-[#002E5C] border-[#002E5C]/30',
  innovation: 'bg-[#F15A24]/15 text-[#F15A24] border-[#F15A24]/30',
  sustainable: 'bg-[#ADD8E6]/40 text-[#002E5C] border-[#ADD8E6]/60',
};
