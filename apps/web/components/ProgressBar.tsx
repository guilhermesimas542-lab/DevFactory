interface ProgressBarProps {
  current: number; // 0-100
  target?: number; // Optional target percentage
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ProgressBar({ current, target, showLabel = true, size = 'md', className = '' }: ProgressBarProps) {
  const normalizedCurrent = Math.min(Math.max(current, 0), 100);
  const normalizedTarget = target ? Math.min(Math.max(target, 0), 100) : undefined;

  // Determine color based on progress
  const getColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getBackgroundColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100';
    if (percentage >= 60) return 'bg-blue-100';
    if (percentage >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const heightClass = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }[size];

  const labelClass = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];

  return (
    <div className={className}>
      <div className={`relative w-full ${getBackgroundColor(normalizedCurrent)} rounded-full overflow-hidden`}>
        {/* Target line (if provided) */}
        {normalizedTarget && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-gray-400 opacity-70"
            style={{ left: `${normalizedTarget}%` }}
            title={`Target: ${normalizedTarget}%`}
          />
        )}

        {/* Progress fill */}
        <div
          className={`${heightClass} ${getColor(normalizedCurrent)} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${normalizedCurrent}%` }}
        />
      </div>

      {showLabel && (
        <div className={`mt-1 flex items-center justify-between ${labelClass}`}>
          <span className="font-medium text-gray-700">{normalizedCurrent}%</span>
          {normalizedTarget && (
            <span className="text-gray-600">Meta: {normalizedTarget}%</span>
          )}
        </div>
      )}
    </div>
  );
}
