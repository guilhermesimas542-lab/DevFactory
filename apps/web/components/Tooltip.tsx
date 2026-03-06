'use client';

interface TooltipProps {
  content: string;
  visible: boolean;
  x: number;
  y: number;
}

export default function Tooltip({ content, visible, x, y }: TooltipProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className="fixed bg-gray-900 text-white px-3 py-2 rounded shadow-lg text-sm z-50 pointer-events-none whitespace-nowrap"
      style={{
        left: `${x + 12}px`,
        top: `${y - 8}px`,
      }}
    >
      {content}
      {/* Arrow */}
      <div
        className="absolute w-2 h-2 bg-gray-900 transform -rotate-45"
        style={{
          left: '-4px',
          top: '8px',
        }}
      />
    </div>
  );
}
