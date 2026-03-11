
interface ArchitectureNode {
  id: string;
  label: string;
  type: string;
  description: string;
  why: string;
  parentId: string | null;
  components: Array<{
    name: string;
    description: string;
    status: string;
  }>;
}

interface ArchitectureModalProps {
  nodeId: string;
  nodes: ArchitectureNode[];
  onClose: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'implemented':
      return 'bg-green-100 text-green-800';
    case 'partial':
      return 'bg-yellow-100 text-yellow-800';
    case 'pending':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    frontend: 'bg-blue-100 text-blue-800',
    backend: 'bg-purple-100 text-purple-800',
    database: 'bg-green-100 text-green-800',
    auth: 'bg-yellow-100 text-yellow-800',
    infra: 'bg-red-100 text-red-800',
    integration: 'bg-pink-100 text-pink-800',
    other: 'bg-gray-100 text-gray-800',
  };
  return colors[type] || colors.other;
};

export default function ArchitectureModal({
  nodeId,
  nodes,
  onClose,
}: ArchitectureModalProps) {
  const node = nodes.find(n => n.id === nodeId);

  if (!node) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{node.label}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 font-bold text-xl"
            >
              ✕
            </button>
          </div>

          {/* Content - 2 Column Layout */}
          <div className="p-6 grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Type Badge */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Tipo</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(
                    node.type
                  )}`}
                >
                  {node.type}
                </span>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Descrição
                </p>
                <p className="text-gray-900 text-sm">{node.description}</p>
              </div>

              {/* Why Chosen */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Por que foi escolhido?
                </p>
                <p className="text-gray-900 text-sm leading-relaxed">
                  {node.why}
                </p>
              </div>
            </div>

            {/* Right Column - Components */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-3">
                Componentes ({node.components.length})
              </p>
              {node.components.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {node.components.map((component, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {component.name}
                        </h4>
                        <span
                          className={`text-xs px-2 py-1 rounded whitespace-nowrap ml-2 ${getStatusColor(
                            component.status
                          )}`}
                        >
                          {component.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {component.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Nenhum componente</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
