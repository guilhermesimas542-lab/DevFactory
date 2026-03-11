
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

interface ArchitectureDrawerProps {
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

export default function ArchitectureDrawer({
  nodeId,
  nodes,
  onClose,
}: ArchitectureDrawerProps) {
  const node = nodes.find(n => n.id === nodeId);

  if (!node) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{node.label}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-bold text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Type Badge */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Tipo</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(node.type)}`}>
              {node.type}
            </span>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Descrição</p>
            <p className="text-gray-900">{node.description}</p>
          </div>

          {/* Why Chosen */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Por que foi escolhido?</p>
            <p className="text-gray-900 text-sm leading-relaxed">{node.why}</p>
          </div>

          {/* Components */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-3">
              Componentes ({node.components.length})
            </p>
            {node.components.length > 0 ? (
              <div className="space-y-2">
                {node.components.map((component, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-gray-900">
                        {component.name}
                      </h4>
                      <span
                        className={`text-xs px-2 py-1 rounded ${getStatusColor(
                          component.status
                        )}`}
                      >
                        {component.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
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
    </>
  );
}
