import ProgressBar from './ProgressBar';

interface ModuleCardProps {
  name: string;
  hierarchy: 'critico' | 'importante' | 'necessario' | 'desejavel' | 'opcional';
  progress: number; // 0-100
  componentCount: number;
  deviations?: Array<{
    gap: number;
    expectedProgress: number;
  }>;
  onClick?: () => void;
}

export default function ModuleCard({ name, hierarchy, progress, componentCount, deviations, onClick }: ModuleCardProps) {
  const hierarchyConfig = {
    critico: { label: '🔴 Crítico', color: 'border-red-400 bg-red-50', target: 100 },
    importante: { label: '🟠 Importante', color: 'border-orange-400 bg-orange-50', target: 80 },
    necessario: { label: '🔵 Necessário', color: 'border-blue-400 bg-blue-50', target: 60 },
    desejavel: { label: '🟢 Desejável', color: 'border-green-400 bg-green-50', target: 40 },
    opcional: { label: '⚪ Opcional', color: 'border-gray-400 bg-gray-50', target: 20 },
  };

  const config = hierarchyConfig[hierarchy] ?? hierarchyConfig['necessario'];
  const isDeviated = deviations && deviations.length > 0;
  const deviation = deviations?.[0];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all ${onClick ? 'cursor-pointer' : ''} border-l-4 ${config.color.split(' ').filter(c => c.startsWith('border')).join(' ')}`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-600 mt-1">{config.label}</p>
          </div>
          {isDeviated && (
            <div className="flex-shrink-0 ml-2 px-2 py-1 bg-red-100 border border-red-300 rounded-full">
              <span className="text-xs font-medium text-red-700">Desvio</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <ProgressBar
            current={progress}
            target={config.target}
            showLabel={true}
            size="md"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded p-3">
            <p className="text-xs text-gray-600 font-medium">Componentes</p>
            <p className="text-lg font-bold text-gray-900">{componentCount}</p>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <p className="text-xs text-gray-600 font-medium">Status</p>
            <p className="text-lg font-bold text-gray-900">
              {progress === 100 ? '✓' : `${progress}%`}
            </p>
          </div>
        </div>

        {/* Deviation Info */}
        {isDeviated && deviation && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm">
            <p className="text-red-700 font-medium">
              ⚠️ Abaixo do esperado por {deviation.gap}%
            </p>
            <p className="text-red-600 text-xs mt-1">
              Esperado: {deviation.expectedProgress}% | Atual: {progress}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
