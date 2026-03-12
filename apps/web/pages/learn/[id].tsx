import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProjectLayout from '@/components/layouts/ProjectLayout';
import ReactMarkdown from 'react-markdown';

interface Entry {
  id: string;
  title: string;
  content: string;
  type: 'article' | 'tip' | 'guide' | 'example' | 'faq';
  order: number;
  created_at: string;
}

interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  entries: Entry[];
}

const TYPE_LABEL: Record<string, string> = {
  article: 'Artigo',
  tip: '💡 Dica',
  guide: '📖 Guia',
  example: '💻 Exemplo',
  faq: '❓ FAQ',
};

export default function CategoryPage() {
  const router = useRouter();
  const { id } = router.query;
  const { status } = useSession();
  const [category, setCategory] = useState<Category | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && id) {
      fetchCategory();
    }
  }, [status, id, router]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/learning/categories/${id}`);
      if (!response.ok) throw new Error('Failed to fetch category');
      const data = await response.json();
      setCategory(data.data);
      // Select first entry by default
      if (data.data?.entries?.length > 0) {
        setSelectedEntry(data.data.entries[0]);
      }
    } catch (err) {
      console.error('Error fetching category:', err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin inline-block h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div style={{ minHeight: 'calc(100vh - 52px)', background: '#0C0C10', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', color: '#6B7280' }}>
          <p>Categoria não encontrada</p>
          <Link href="/learn" style={{ color: '#6366F1', marginTop: '20px', display: 'inline-block' }}>
            ← Voltar ao Centro de Aprendizado
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 52px)', background: '#0C0C10' }}>
      <style>{`
        .learn-layout { display: flex; height: 100%; }
        .learn-sidebar {
          width: 300px;
          background: #141418;
          border-right: 1px solid rgba(255,255,255,0.08);
          overflow-y: auto;
          padding: 24px 0;
        }

        .sidebar-header {
          padding: 0 20px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .sidebar-back {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6B7280;
          font-size: 13px;
          text-decoration: none;
          margin-bottom: 16px;
          transition: color 200ms;
        }

        .sidebar-back:hover { color: #F1F1F3; }

        .sidebar-title {
          font-size: 16px;
          font-weight: 600;
          color: #F1F1F3;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sidebar-entry {
          padding: 12px 20px;
          cursor: pointer;
          border-left: 3px solid transparent;
          color: rgba(255,255,255,0.5);
          font-size: 13px;
          transition: all 200ms;
          text-decoration: none;
          display: block;
        }

        .sidebar-entry:hover {
          color: #F1F1F3;
          background: rgba(255,255,255,0.04);
        }

        .sidebar-entry.active {
          border-left-color: #6366F1;
          background: rgba(99,102,241,0.1);
          color: #F1F1F3;
          font-weight: 500;
        }

        .entry-type {
          font-size: 11px;
          color: #6B7280;
          margin-top: 2px;
          font-family: 'JetBrains Mono';
        }

        .learn-content {
          flex: 1;
          overflow-y: auto;
          padding: 40px;
        }

        .entry-header {
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .entry-meta {
          font-size: 12px;
          color: #6B7280;
          margin-bottom: 12px;
          font-family: 'JetBrains Mono';
        }

        .entry-title {
          font-size: 28px;
          font-weight: 700;
          color: #F1F1F3;
          letter-spacing: -0.02em;
        }

        .entry-body {
          color: rgba(255,255,255,0.65);
          line-height: 1.8;
          font-size: 15px;
        }

        .entry-body h1, .entry-body h2, .entry-body h3 {
          color: #F1F1F3;
          margin-top: 24px;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .entry-body h1 { font-size: 24px; }
        .entry-body h2 { font-size: 20px; }
        .entry-body h3 { font-size: 16px; }

        .entry-body ul, .entry-body ol {
          margin: 16px 0;
          padding-left: 24px;
        }

        .entry-body li {
          margin-bottom: 8px;
        }

        .entry-body code {
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'JetBrains Mono';
          font-size: 13px;
          color: #A78BFA;
        }

        .entry-body pre {
          background: rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 16px;
          overflow-x: auto;
          margin: 16px 0;
        }

        .entry-body pre code {
          background: none;
          border: none;
          padding: 0;
          display: block;
        }

        @media (max-width: 768px) {
          .learn-layout { flex-direction: column; }
          .learn-sidebar { width: 100%; height: auto; max-height: 200px; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08); }
          .learn-content { padding: 24px; }
        }
      `}</style>

      <div className="learn-layout">
        {/* Sidebar */}
        <div className="learn-sidebar">
          <div className="sidebar-header">
            <Link href="/learn" className="sidebar-back">
              ← Voltar
            </Link>
            <div className="sidebar-title">
              <span>{category.icon}</span>
              {category.title}
            </div>
          </div>

          {/* Entries list */}
          <div>
            {category.entries.map(entry => (
              <button
                key={entry.id}
                className={`sidebar-entry ${selectedEntry?.id === entry.id ? 'active' : ''}`}
                onClick={() => setSelectedEntry(entry)}
                style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer' }}
              >
                <div>{entry.title}</div>
                <div className="entry-type">{TYPE_LABEL[entry.type] || entry.type}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="learn-content">
          {selectedEntry ? (
            <>
              <div className="entry-header">
                <div className="entry-meta">
                  {TYPE_LABEL[selectedEntry.type]} • {new Date(selectedEntry.created_at).toLocaleDateString('pt-BR')}
                </div>
                <h1 className="entry-title">{selectedEntry.title}</h1>
              </div>

              <div className="entry-body">
                <ReactMarkdown>{selectedEntry.content}</ReactMarkdown>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#6B7280', marginTop: '40px' }}>
              Selecione um artigo para começar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

CategoryPage.getLayout = function getLayout(page: React.ReactElement) {
  return <ProjectLayout>{page}</ProjectLayout>;
};
