import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProjectLayout from '@/components/layouts/ProjectLayout';

interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  entryCount: number;
}

export default function LearnPage() {
  const router = useRouter();
  const { status } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchCategories();
    }
  }, [status, router]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/learning/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin inline-block h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          <p className="mt-4 text-gray-600">Carregando aprendizado...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 52px)', background: '#0C0C10', padding: '40px 20px' }}>
      <style>{`
        .learn-container { max-width: 1200px; margin: 0 auto; }
        .learn-header { margin-bottom: 40px; }
        .learn-title { font-size: 32px; font-weight: 700; color: #F1F1F3; margin-bottom: 8px; letter-spacing: -0.02em; }
        .learn-subtitle { font-size: 16px; color: #6B7280; }

        .learn-header-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .learn-exit-btn {
          padding: 10px 20px;
          background: #6366F1;
          border: none;
          border-radius: 8px;
          color: #F1F1F3;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background 200ms;
        }

        .learn-exit-btn:hover {
          background: #4F46E5;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }

        .category-card {
          background: #141418;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 24px;
          transition: all 200ms;
          cursor: pointer;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .category-card:hover {
          border-color: rgba(255,255,255,0.2);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 12px 32px rgba(0,0,0,0.5);
          transform: translateY(-2px);
        }

        .category-icon {
          font-size: 32px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
        }

        .category-info { flex: 1; }
        .category-name { font-size: 18px; font-weight: 600; color: #F1F1F3; }
        .category-desc { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.5; margin-top: 4px; }
        .category-meta { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 8px; font-family: 'JetBrains Mono'; }

        .error-box {
          background: rgba(239,68,68,0.1);
          border: 1px solid #EF4444;
          border-radius: 8px;
          padding: 16px;
          color: #EF4444;
          font-size: 14px;
        }
      `}</style>

      <div className="learn-container">
        <div className="learn-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className="learn-title">📚 Centro de Aprendizado</h1>
              <p className="learn-subtitle">Explore tópicos essenciais de desenvolvimento, arquitetura e DevOps</p>
            </div>
            <Link href="/" className="learn-exit-btn">
              🏠 Voltar ao Painel
            </Link>
          </div>
        </div>

        {error && <div className="error-box">❌ {error}</div>}

        {!loading && categories.length === 0 && !error && (
          <div style={{ textAlign: 'center', color: '#6B7280', marginTop: '40px' }}>
            Nenhuma categoria disponível
          </div>
        )}

        <div className="categories-grid">
          {categories.map(category => (
            <Link
              key={category.id}
              href={`/learn/${category.id}`}
              className="category-card"
            >
              <div className="category-icon" style={{ background: `${category.color}20` }}>
                {category.icon}
              </div>
              <div className="category-info">
                <div className="category-name">{category.title}</div>
                <div className="category-desc">{category.description}</div>
                <div className="category-meta">{category.entryCount} artigos e guias</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

LearnPage.getLayout = function getLayout(page: React.ReactElement) {
  return <ProjectLayout>{page}</ProjectLayout>;
};
