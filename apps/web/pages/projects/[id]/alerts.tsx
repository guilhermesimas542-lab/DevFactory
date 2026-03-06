import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { getAlerts, checkAlerts, updateAlert, deleteAlert } from '@/lib/api';

interface Alert {
  id: string;
  project_id: string;
  type: string;
  severity: string;
  message: string;
  module_id: string | null;
  is_read: boolean;
  created_at: string;
}

export default function AlertsList() {
  const router = useRouter();
  const { status } = useSession();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string | undefined>();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (router.isReady && status === 'authenticated') {
      loadAlerts();
    }
  }, [router.isReady, status, filterSeverity, showUnreadOnly]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { id } = router.query;

      if (!id || typeof id !== 'string') {
        setError('Invalid project ID');
        return;
      }

      const result = await getAlerts(id, showUnreadOnly);

      if (result.success && result.data) {
        let filteredAlerts = result.data;

        if (filterSeverity) {
          filteredAlerts = filteredAlerts.filter(a => a.severity === filterSeverity);
        }

        setAlerts(filteredAlerts);
      } else {
        setError(result.error || 'Failed to load alerts');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAlerts = async () => {
    try {
      setChecking(true);

      const { id } = router.query;

      if (!id || typeof id !== 'string') {
        setError('Invalid project ID');
        return;
      }

      const result = await checkAlerts(id);

      if (result.success) {
        setError(null);
        await loadAlerts();
      } else {
        setError(result.error || 'Failed to check alerts');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
    } finally {
      setChecking(false);
    }
  };

  const handleToggleRead = async (alertId: string, currentlyRead: boolean) => {
    try {
      const result = await updateAlert(alertId, !currentlyRead);

      if (result.success) {
        await loadAlerts();
      } else {
        setError(result.error || 'Failed to update alert');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('Tem certeza que quer deletar este alerta?')) return;

    try {
      const result = await deleteAlert(alertId);

      if (result.success) {
        await loadAlerts();
      } else {
        setError(result.error || 'Failed to delete alert');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return '🔴 Alta';
      case 'medium':
        return '🟠 Média';
      case 'low':
        return '🔵 Baixa';
      default:
        return severity;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'story_without_code':
        return '📝 Story sem código';
      case 'code_without_story':
        return '💻 Código sem story';
      case 'stagnation':
        return '⏸️ Estagnação';
      default:
        return type;
    }
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin inline-block h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          <p className="mt-4 text-gray-600">Carregando alertas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Alertas</h1>
              <p className="text-gray-600 mt-2">Acompanhe problemas e desvios do seu projeto</p>
            </div>
            <button
              onClick={handleCheckAlerts}
              disabled={checking}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {checking ? '🔄 Verificando...' : '🔍 Verificar Agora'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">⚠️ {error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 font-medium">Total de Alertas</p>
            <p className="text-3xl font-bold text-gray-900">{alerts.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 font-medium">Não Lidos</p>
            <p className="text-3xl font-bold text-red-600">{unreadCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 font-medium">Críticos</p>
            <p className="text-3xl font-bold text-orange-600">
              {alerts.filter(a => a.severity === 'high').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showUnreadOnly
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {showUnreadOnly ? '✓ Não Lidos' : 'Todos'}
          </button>

          {['high', 'medium', 'low'].map(severity => (
            <button
              key={severity}
              onClick={() => setFilterSeverity(filterSeverity === severity ? undefined : severity)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterSeverity === severity
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {getSeverityBadge(severity)}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600 text-lg">✨ Nenhum alerta no momento</p>
            <p className="text-gray-500 text-sm mt-2">Seu projeto está em bom estado!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 transition-all ${
                  alert.is_read ? 'opacity-75' : 'opacity-100'
                } ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-lg">{getTypeLabel(alert.type)}</span>
                      <span className="text-xs font-medium px-2 py-1 bg-black bg-opacity-20 rounded-full">
                        {getSeverityBadge(alert.severity)}
                      </span>
                      {!alert.is_read && (
                        <span className="text-xs font-bold px-2 py-1 bg-blue-500 text-white rounded-full">
                          Não Lido
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-2">{alert.message}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {new Date(alert.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>

                  <div className="ml-4 flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleRead(alert.id, alert.is_read)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
                    >
                      {alert.is_read ? '👁️ Marcar como Novo' : '✓ Marcar como Lido'}
                    </button>
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Tipos de Alertas</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>📝 <strong>Story sem código:</strong> Story marcada como concluída mas sem código implementado</p>
            <p>💻 <strong>Código sem story:</strong> Novo código encontrado que não está mapeado em nenhuma story</p>
            <p>⏸️ <strong>Estagnação:</strong> Módulo com 0% progresso por mais de 7 dias</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push(`/projects/${router.query.id}`)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            ← Voltar para Detalhes
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            → Ir para Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
