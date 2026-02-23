import {
  Code2,
  PenLine,
  Megaphone,
  Palette,
  Briefcase,
  BookOpen,
  Zap,
  Lightbulb,
  FlaskConical,
  Layers,
} from 'lucide-react'
import type { PromptCategory } from '@/types/database'

export const CATEGORY_META: Record<
  PromptCategory,
  { label: string; Icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  coding:       { label: 'Coding',       Icon: Code2,        color: 'text-blue-500' },
  writing:      { label: 'Writing',      Icon: PenLine,      color: 'text-green-500' },
  marketing:    { label: 'Marketing',    Icon: Megaphone,    color: 'text-orange-500' },
  design:       { label: 'Design',       Icon: Palette,      color: 'text-pink-500' },
  business:     { label: 'Business',     Icon: Briefcase,    color: 'text-amber-500' },
  education:    { label: 'Education',    Icon: BookOpen,     color: 'text-indigo-500' },
  productivity: { label: 'Productivity', Icon: Zap,          color: 'text-yellow-500' },
  creative:     { label: 'Creative',     Icon: Lightbulb,    color: 'text-purple-500' },
  research:     { label: 'Research',     Icon: FlaskConical, color: 'text-teal-500' },
  other:        { label: 'Other',        Icon: Layers,       color: 'text-muted-foreground' },
}
