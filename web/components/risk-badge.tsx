import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const RISK_LEVELS = ['low', 'medium', 'high'] as const;
type RiskLevel = (typeof RISK_LEVELS)[number];

const riskColors: Record<RiskLevel, string> = {
  low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
  medium:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
};

interface RiskBadgeProps {
  level: string;
  label?: string;
}

export function RiskBadge({ level, label }: RiskBadgeProps) {
  const safeLevel = RISK_LEVELS.includes(level as RiskLevel)
    ? (level as RiskLevel)
    : null;
  return (
    <Badge
      variant='outline'
      className={cn(
        'border-transparent text-xs',
        safeLevel && riskColors[safeLevel]
      )}
    >
      {label ? `${label}: ${level}` : level}
    </Badge>
  );
}
