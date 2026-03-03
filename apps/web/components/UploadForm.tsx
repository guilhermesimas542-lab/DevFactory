'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadPRD } from '@/lib/api';

interface UploadFormProps {
  onSuccess?: (projectId: string) => void;
}

export default function UploadForm({ onSuccess }: UploadFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['.md', '.txt'];
      const fileName = selectedFile.name.toLowerCase();
      const isValidType = validTypes.some(type => fileName.endsWith(type));

      if (!isValidType) {
        setError('Por favor, selecione um arquivo .md ou .txt');
        setFile(null);
        return;
      }

      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Arquivo muito grande (máximo 5MB)');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Por favor, selecione um arquivo');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await uploadPRD(file);

      if (result.success && result.data) {
        setSuccess(true);
        setFile(null);

        // Redirect to project detail page after 2 seconds
        setTimeout(() => {
          if (onSuccess) {
            onSuccess(result.data!.projectId);
          } else {
            router.push(`/projects/${result.data!.projectId}`);
          }
        }, 2000);
      } else {
        setError(result.error || 'Erro ao fazer upload do arquivo');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      console.error('Upload error:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Importar PRD</h2>

      {/* File Input */}
      <div className="mb-6">
        <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
          Selecione seu arquivo PRD (.md ou .txt):
        </label>
        <input
          type="file"
          id="file"
          accept=".md,.txt"
          onChange={handleFileChange}
          disabled={loading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {file && (
          <p className="mt-2 text-sm text-green-600 flex items-center">
            <span className="mr-2">✓</span>
            {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">⚠️ {error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">✓ Upload realizado com sucesso! Redirecionando...</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !file}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700
          disabled:bg-gray-400 disabled:cursor-not-allowed
          text-white font-medium rounded-md transition-colors
          flex items-center justify-center"
      >
        {loading ? (
          <>
            <span className="mr-2 inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Enviando...
          </>
        ) : (
          'Importar PRD'
        )}
      </button>

      {/* Info Text */}
      <p className="mt-4 text-xs text-gray-500 text-center">
        Formatos suportados: Markdown (.md) ou Texto (.txt)<br />
        Tamanho máximo: 5MB
      </p>
    </form>
  );
}
