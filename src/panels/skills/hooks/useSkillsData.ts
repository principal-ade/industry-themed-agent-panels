import { useState, useEffect, useCallback } from 'react';
import type { FileTree } from '@principal-ai/repository-abstraction';
import type { PanelContextValue } from '../../../types';

export interface Skill {
  id: string;
  name: string;
  path: string;
  description?: string;
  content?: string;
  capabilities?: string[];
}

interface UseSkillsDataParams {
  context: PanelContextValue;
}

interface UseSkillsDataReturn {
  skills: Skill[];
  isLoading: boolean;
  error: string | null;
  refreshSkills: () => Promise<void>;
}

/**
 * Helper function to find SKILL.md files from the FileTree's allFiles array
 */
const findSkillFiles = (fileTree: FileTree): string[] => {
  // Filter allFiles for files named 'SKILL.md'
  const skillFiles = fileTree.allFiles.filter(file => file.name === 'SKILL.md');

  // Return their relative paths
  return skillFiles.map(file => file.relativePath);
};

/**
 * Helper function to parse SKILL.md content and extract metadata
 */
const parseSkillContent = (content: string, path: string): Skill => {
  // Extract skill name from directory (parent of SKILL.md)
  const pathParts = path.split('/');
  const skillDirName = pathParts[pathParts.length - 2] || 'Unknown Skill';

  // Try to extract description from the first paragraph after a heading
  let description = '';
  const lines = content.split('\n');
  let foundHeading = false;

  for (const line of lines) {
    if (line.startsWith('#')) {
      foundHeading = true;
      continue;
    }
    if (foundHeading && line.trim() && !line.startsWith('#')) {
      description = line.trim();
      break;
    }
  }

  // Extract capabilities (look for bullet points or numbered lists)
  const capabilities: string[] = [];
  for (const line of lines) {
    const bulletMatch = line.match(/^[\s]*[-*]\s+(.+)/);
    if (bulletMatch) {
      capabilities.push(bulletMatch[1].trim());
    }
  }

  return {
    id: path,
    name: skillDirName.replace(/-/g, ' ').replace(/_/g, ' '),
    path,
    description: description || 'No description available',
    content,
    capabilities: capabilities.slice(0, 3), // Limit to first 3 capabilities
  };
};

/**
 * Hook to discover and read SKILL.md files from the file tree
 */
export const useSkillsData = ({
  context,
}: UseSkillsDataParams): UseSkillsDataReturn => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSkills = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fileTreeSlice = context.getSlice<FileTree>('fileTree');
      const fileTree = fileTreeSlice?.data;

      if (!fileTree) {
        setSkills([]);
        setIsLoading(false);
        return;
      }

      // eslint-disable-next-line no-console
      console.log('[useSkillsData] Full context:', context);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileSystem = (context as any).adapters?.fileSystem;
      // eslint-disable-next-line no-console
      console.log('[useSkillsData] Adapters:', (context as any).adapters);
      // eslint-disable-next-line no-console
      console.log('[useSkillsData] FileSystem adapter:', fileSystem);
      // eslint-disable-next-line no-console
      console.log('[useSkillsData] fileSystem?.readFile:', fileSystem?.readFile);
      // eslint-disable-next-line no-console
      console.log('[useSkillsData] typeof fileSystem?.readFile:', typeof fileSystem?.readFile);
      // eslint-disable-next-line no-console
      console.log('[useSkillsData] Check result (!fileSystem?.readFile):', !fileSystem?.readFile);

      if (!fileSystem?.readFile) {
        console.error('[useSkillsData] FAILING CHECK - fileSystem:', fileSystem);
        throw new Error('File system adapter not available');
      }

      // eslint-disable-next-line no-console
      console.log('[useSkillsData] Check passed! Continuing...');

      const repoPath = context.currentScope.repository?.path;
      if (!repoPath) {
        throw new Error('Repository path not available');
      }

      // eslint-disable-next-line no-console
      console.log('[useSkillsData] fileTree:', fileTree);
      // eslint-disable-next-line no-console
      console.log('[useSkillsData] fileTree.allFiles:', fileTree.allFiles);
      // eslint-disable-next-line no-console
      console.log('[useSkillsData] typeof fileTree:', typeof fileTree);
      // eslint-disable-next-line no-console
      console.log('[useSkillsData] fileTree keys:', Object.keys(fileTree));

      // Find all SKILL.md files
      const skillPaths = findSkillFiles(fileTree);

      // eslint-disable-next-line no-console
      console.log('[useSkillsData] Found skill paths:', skillPaths);

      // Read content for each skill
      const skillPromises = skillPaths.map(async (skillPath) => {
        try {
          const fullPath = `${repoPath}/${skillPath}`;
          const content = await fileSystem.readFile(fullPath);
          return parseSkillContent(content as string, skillPath);
        } catch (err) {
          console.error(`Failed to read skill at ${skillPath}:`, err);
          return null;
        }
      });

      const loadedSkills = (await Promise.all(skillPromises)).filter(
        (skill): skill is Skill => skill !== null
      );

      setSkills(loadedSkills);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load skills';
      setError(errorMessage);
      console.error('Error loading skills:', err);
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const refreshSkills = useCallback(async () => {
    await loadSkills();
  }, [loadSkills]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  return {
    skills,
    isLoading,
    error,
    refreshSkills,
  };
};
