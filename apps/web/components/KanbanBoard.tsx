
interface Story {
  id: string;
  title: string;
  description: string | null;
  epic: string | null;
  status: string;
  agent_responsible: string | null;
}

interface KanbanBoardProps {
  stories: Story[];
  onUpdateStatus: (storyId: string, newStatus: string) => Promise<void>;
  onDelete: (storyId: string) => Promise<void>;
  loading?: boolean;
}

const getNextStatus = (currentStatus: string): string | null => {
  switch (currentStatus) {
    case 'pending':
      return 'in_progress';
    case 'in_progress':
      return 'completed';
    case 'completed':
      return null; // Already completed
    default:
      return null;
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Pendente';
    case 'in_progress':
      return 'Em Progresso';
    case 'completed':
      return 'Concluído';
    default:
      return status;
  }
};

const getStatusColor = (status: string): { bg: string; border: string; header: string; badge: string } => {
  switch (status) {
    case 'pending':
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        header: 'text-gray-700',
        badge: 'bg-gray-200 text-gray-700',
      };
    case 'in_progress':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        header: 'text-yellow-700',
        badge: 'bg-yellow-100 text-yellow-800',
      };
    case 'completed':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        header: 'text-green-700',
        badge: 'bg-green-100 text-green-800',
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        header: 'text-gray-700',
        badge: 'bg-gray-200 text-gray-700',
      };
  }
};

export default function KanbanBoard({
  stories,
  onUpdateStatus,
  onDelete,
  loading = false,
}: KanbanBoardProps) {
  const statuses = ['pending', 'in_progress', 'completed'];

  const handleMoveStory = async (storyId: string, currentStatus: string) => {
    const nextStatus = getNextStatus(currentStatus);
    if (nextStatus) {
      await onUpdateStatus(storyId, nextStatus);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {statuses.map((status) => {
        const statusStories = stories.filter((s) => s.status === status);
        const colors = getStatusColor(status);

        return (
          <div
            key={status}
            className={`${colors.bg} border-2 ${colors.border} rounded-lg p-4 min-h-96`}
          >
            {/* Column Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-bold ${colors.header}`}>{getStatusLabel(status)}</h3>
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold ${colors.badge} rounded`}
                >
                  {statusStories.length}
                </span>
              </div>
            </div>

            {/* Stories List */}
            <div className="space-y-3">
              {statusStories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">Nenhuma story</p>
                </div>
              ) : (
                statusStories.map((story) => (
                  <div
                    key={story.id}
                    className="bg-white rounded-lg shadow-sm p-3 border-l-4"
                    style={{
                      borderLeftColor:
                        status === 'completed'
                          ? '#10b981'
                          : status === 'in_progress'
                          ? '#f59e0b'
                          : '#9ca3af',
                    }}
                  >
                    {/* Story Title */}
                    <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                      {story.title}
                    </h4>

                    {/* Story Metadata */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {story.epic && (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                          📚 {story.epic}
                        </span>
                      )}
                      {story.agent_responsible && (
                        <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                          👤 {story.agent_responsible}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {getNextStatus(status) && (
                        <button
                          onClick={() => handleMoveStory(story.id, status)}
                          disabled={loading}
                          className="flex-1 px-2 py-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 text-gray-700 text-xs font-medium rounded transition-colors"
                        >
                          →
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que quer deletar esta story?')) {
                            onDelete(story.id);
                          }
                        }}
                        disabled={loading}
                        className="flex-1 px-2 py-1 bg-red-100 hover:bg-red-200 disabled:bg-gray-400 text-red-700 text-xs font-medium rounded transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
