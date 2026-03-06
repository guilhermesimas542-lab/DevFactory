/**
 * Component with status badge
 */
export interface Component {
  id: string;
  name: string;
  status: 'pending' | 'partial' | 'implemented';
}

interface ComponentsListProps {
  components: Component[];
}

const STATUS_COLORS = {
  pending: { bg: 'bg-gray-100', text: 'text-gray-700', badge: 'bg-gray-200' },
  partial: { bg: 'bg-yellow-100', text: 'text-yellow-700', badge: 'bg-yellow-200' },
  implemented: { bg: 'bg-green-100', text: 'text-green-700', badge: 'bg-green-200' },
};

const STATUS_LABELS = {
  pending: 'Pendente',
  partial: 'Parcial',
  implemented: 'Implementado',
};

/**
 * List of components with status indicators
 */
export default function ComponentsList({ components }: ComponentsListProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Componentes</h4>
      {components.length === 0 ? (
        <p className="text-sm text-gray-500 italic">Nenhum componente</p>
      ) : (
        <ul className="space-y-2">
          {components.map((component) => (
            <li
              key={component.id}
              className={`p-2 rounded border ${STATUS_COLORS[component.status].bg}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-sm font-medium ${STATUS_COLORS[component.status].text}`}>
                  {component.name}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded font-medium ${STATUS_COLORS[component.status].badge}`}
                >
                  {STATUS_LABELS[component.status]}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
