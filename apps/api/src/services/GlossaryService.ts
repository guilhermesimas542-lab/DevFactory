import Groq from 'groq-sdk';
import { PrismaClient } from '@prisma/client';

export interface GlossaryTermInput {
  term: string;
  definition: string;
  analogy?: string;
  relevance?: string;
  category: string;
}

export interface ExtractGlossaryResult {
  success: boolean;
  data: {
    created: number;
    skipped: number;
    terms: GlossaryTermInput[];
  };
}

export class GlossaryService {
  private groq: Groq;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
    this.prisma = prisma;
  }

  /**
   * Extract glossary terms from PRD content using Groq AI
   */
  async extractTermsFromPRD(projectId: string): Promise<ExtractGlossaryResult> {
    try {
      // Fetch project with PRD content
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new Error(`Project not found: ${projectId}`);
      }

      if (!project.prd_original) {
        throw new Error(`No PRD content found for project: ${projectId}`);
      }

      // Extract raw content from prd_original (it's stored as JSON with rawContent)
      const prdContent = typeof project.prd_original === 'string'
        ? project.prd_original
        : (project.prd_original as any).rawContent || JSON.stringify(project.prd_original);

      // Call Groq AI to extract terms
      const extractedTerms = await this.callGroqForTermExtraction(prdContent);

      // Upsert terms into database
      const result = await this.upsertTerms(projectId, extractedTerms);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error extracting glossary terms:', error);
      throw error;
    }
  }

  /**
   * Call Groq API to extract and classify technical terms from PRD
   */
  private async callGroqForTermExtraction(prdContent: string): Promise<GlossaryTermInput[]> {
    const prompt = `Analyze the following requirements document and extract all relevant technical terms.

For each term, provide:
- term: name of the term
- definition: simple explanation (1-2 sentences, avoid jargon)
- analogy: real-world analogy to understand (e.g., "like a drawer in a cabinet")
- relevance: Critical | Important | Useful
- category: one of: tecnologia, arquitetura, banco_de_dados, seguranca, negocio, infraestrutura, geral

Return ONLY valid JSON (no markdown, no code blocks):
{ "terms": [ { "term": "...", "definition": "...", "analogy": "...", "relevance": "...", "category": "..." } ] }

Document to analyze:
${prdContent}`;

    const response = await (this.groq.chat.completions.create as any)({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = response.choices[0].message.content;

    // Parse JSON response - handle both with and without markdown formatting
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7); // Remove ```json
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3); // Remove ```
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3); // Remove trailing ```
    }

    const parsed = JSON.parse(jsonText);
    return parsed.terms || [];
  }

  /**
   * Upsert terms into database (create or update, no duplicates)
   */
  private async upsertTerms(
    projectId: string,
    terms: GlossaryTermInput[]
  ): Promise<{ created: number; skipped: number; terms: GlossaryTermInput[] }> {
    let created = 0;
    let skipped = 0;

    for (const term of terms) {
      try {
        await this.prisma.glossaryTerm.upsert({
          where: {
            project_id_term: {
              project_id: projectId,
              term: term.term,
            },
          },
          update: {
            definition: term.definition,
            analogy: term.analogy,
            relevance: term.relevance,
            category: term.category,
          },
          create: {
            project_id: projectId,
            term: term.term,
            definition: term.definition,
            analogy: term.analogy || null,
            relevance: term.relevance || null,
            category: term.category,
          },
        });
        created++;
      } catch (error) {
        console.warn(`Failed to upsert term "${term.term}":`, error);
        skipped++;
      }
    }

    return {
      created,
      skipped,
      terms,
    };
  }
}
