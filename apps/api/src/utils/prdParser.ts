import { ParsedPRD, ParsedModule, ParsedStory, HierarchyLevel } from '../types/index';

/**
 * Parse a PRD markdown document and extract structure
 * Uses regex and string manipulation for deterministic extraction
 */
export function parsePRDMarkdown(content: string): ParsedPRD {
  const warnings: string[] = [];
  let title = '';
  let vision = '';
  const modules: ParsedModule[] = [];
  const stories: ParsedStory[] = [];

  // Step 1: Extract title (first H1)
  const titleMatch = content.match(/^#\s+(.+?)$/m);
  if (titleMatch) {
    title = titleMatch[1].trim();
  } else {
    warnings.push('No H1 title found in document');
  }

  // Step 2: Extract vision (content between H1 and first H2)
  if (titleMatch) {
    const visionMatch = content.match(
      new RegExp(`^#\\s+.+?$([\\s\\S]*?)^##\\s+`, 'm')
    );
    if (visionMatch) {
      vision = visionMatch[1]
        .trim()
        .replace(/^\n+|\n+$/g, '');
    }
  }

  // Step 3: Extract modules from H3/H4 headers with hierarchy keywords
  const hierarchyPatterns: { regex: RegExp; level: HierarchyLevel }[] = [
    { regex: /crítico|must\s+have|mandatory/i, level: 'critico' },
    { regex: /importante|should\s+have|significant/i, level: 'importante' },
    { regex: /necessário|could\s+have|necessary/i, level: 'necessario' },
    { regex: /desejável|nice\s+to\s+have|desirable/i, level: 'desejavel' },
    { regex: /opcional|won't\s+have|optional/i, level: 'opcional' },
  ];

  // Split content into sections by H3 or H4 headers
  const headerRegex = /^###\s+(.+?)$|^####\s+(.+?)$/gm;
  let headerMatch;
  const headerPositions: { pos: number; name: string }[] = [];

  while ((headerMatch = headerRegex.exec(content)) !== null) {
    const headerName = (headerMatch[1] || headerMatch[2]).trim();
    headerPositions.push({ pos: headerMatch.index, name: headerName });
  }

  // Process each header section
  for (let i = 0; i < headerPositions.length; i++) {
    const current = headerPositions[i];
    const next = headerPositions[i + 1];
    const endPos = next ? next.pos : content.length;
    const sectionContent = content.substring(current.pos, endPos);

    // Find hierarchy level
    let hierarchyLevel: HierarchyLevel | null = null;
    for (const pattern of hierarchyPatterns) {
      if (pattern.regex.test(sectionContent)) {
        hierarchyLevel = pattern.level;
        break;
      }
    }

    if (hierarchyLevel) {
      // Extract description (text after header until bullet points)
      const descMatch = sectionContent.match(/^###\s+(.+?)$\n([\s\S]*?)(?=\n\s*-|\n\s*\*|$)/m);
      const descMatch2 = sectionContent.match(/^####\s+(.+?)$\n([\s\S]*?)(?=\n\s*-|\n\s*\*|$)/m);
      const description = (descMatch || descMatch2)?.[2]?.trim() || '';

      // Extract components (bullet points)
      const components: string[] = [];
      const bulletRegex = /^\s*[-*]\s+(.+?)$/gm;
      let bulletMatch;
      while ((bulletMatch = bulletRegex.exec(sectionContent)) !== null) {
        components.push(bulletMatch[1].trim());
      }

      modules.push({
        name: current.name,
        hierarchy: hierarchyLevel,
        description,
        components,
      });
    }
  }

  // Step 4: Extract stories (STORY-NNN pattern or ## STORY- sections)
  const storyRegex = /(?:^##\s+)?STORY-(\d+)[:\s]+(.+?)$/gm;
  let storyMatch;
  while ((storyMatch = storyRegex.exec(content)) !== null) {
    // For now, create minimal story object
    // In future iterations, more details can be extracted
    stories.push({
      title: `STORY-${storyMatch[1]}: ${storyMatch[2]}`,
      epic: 'EPIC-TBD',
      description: '',
      dependencies: [],
    });
  }

  return {
    title,
    vision,
    modules,
    stories,
    warnings,
  };
}
