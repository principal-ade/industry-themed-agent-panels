import { useState, useEffect, useCallback } from 'react';
import type { FileTree } from '@principal-ai/repository-abstraction';
import type { PanelContextValue } from '../../../types';

export type SkillSource =
  | 'project-universal'  // ./.agent/skills/ (from fileTree)
  | 'global-universal'   // ~/.agent/skills/ (from globalSkills slice)
  | 'project-claude'     // ./.claude/skills/ (from fileTree)
  | 'global-claude'      // ~/.claude/skills/ (from globalSkills slice)
  | 'project-other';     // any other location in project (from fileTree)

export interface Skill {
  id: string;
  name: string;
  path: string;
  description?: string;
  content?: string;
  capabilities?: string[];
  // Skill folder structure metadata
  skillFolderPath: string;
  hasScripts: boolean;
  hasReferences: boolean;
  hasAssets: boolean;
  scriptFiles?: string[];
  referenceFiles?: string[];
  assetFiles?: string[];
  // Source and priority metadata (for display purposes only)
  source: SkillSource;
  priority: 1 | 2 | 3 | 4 | 5;  // 1=project-universal, 2=global-universal, 3=project-claude, 4=global-claude, 5=project-other
}

/**
 * Global skills data provided by the host application
 */
export interface GlobalSkillsSlice {
  skills: Skill[];
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
 * Helper function to determine skill source and priority from path
 */
const determineSkillSource = (path: string): { source: SkillSource; priority: 1 | 2 | 3 | 4 | 5 } => {
  if (path.includes('.agent/skills/')) {
    return { source: 'project-universal', priority: 1 };
  } else if (path.includes('.claude/skills/')) {
    return { source: 'project-claude', priority: 3 };
  } else {
    return { source: 'project-other', priority: 5 };
  }
};

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
 * Helper function to analyze skill folder structure
 */
const analyzeSkillStructure = (fileTree: FileTree, skillPath: string) => {
  // Get skill directory path (parent of SKILL.md)
  const skillDir = skillPath.substring(0, skillPath.lastIndexOf('/'));

  // Find all files in the skill directory
  const skillFiles = fileTree.allFiles.filter(file =>
    file.relativePath.startsWith(`${skillDir}/`)
  );

  // Detect folder structure
  const scriptFiles = skillFiles
    .filter(f => f.relativePath.startsWith(`${skillDir}/scripts/`))
    .map(f => f.name);

  const referenceFiles = skillFiles
    .filter(f => f.relativePath.startsWith(`${skillDir}/references/`))
    .map(f => f.name);

  const assetFiles = skillFiles
    .filter(f => f.relativePath.startsWith(`${skillDir}/assets/`))
    .map(f => f.name);

  return {
    skillFolderPath: skillDir,
    hasScripts: scriptFiles.length > 0,
    hasReferences: referenceFiles.length > 0,
    hasAssets: assetFiles.length > 0,
    scriptFiles,
    referenceFiles,
    assetFiles,
  };
};

/**
 * Helper function to parse SKILL.md content and extract metadata
 */
const parseSkillContent = (content: string, path: string, fileTree: FileTree): Skill => {
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

  // Analyze skill folder structure
  const structure = analyzeSkillStructure(fileTree, path);

  // Determine source and priority
  const { source, priority } = determineSkillSource(path);

  return {
    id: path,
    name: skillDirName.replace(/-/g, ' ').replace(/_/g, ' '),
    path,
    description: description || 'No description available',
    content,
    capabilities: capabilities.slice(0, 3), // Limit to first 3 capabilities
    ...structure,
    source,
    priority,
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
      // Load local skills from fileTree
      const fileTreeSlice = context.getSlice<FileTree>('fileTree');
      const fileTree = fileTreeSlice?.data;
      let localSkills: Skill[] = [];

      if (fileTree) {
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

        // Find all SKILL.md files in project
        const skillPaths = findSkillFiles(fileTree);

        // eslint-disable-next-line no-console
        console.log('[useSkillsData] Found skill paths:', skillPaths);

        // Read content for each local skill
        const skillPromises = skillPaths.map(async (skillPath) => {
          try {
            const fullPath = `${repoPath}/${skillPath}`;
            const content = await fileSystem.readFile(fullPath);
            return parseSkillContent(content as string, skillPath, fileTree);
          } catch (err) {
            console.error(`Failed to read skill at ${skillPath}:`, err);
            return null;
          }
        });

        localSkills = (await Promise.all(skillPromises)).filter(
          (skill): skill is Skill => skill !== null
        );
      }

      // Load global skills from globalSkills slice
      const globalSkillsSlice = context.getSlice<GlobalSkillsSlice>('globalSkills');
      const globalSkills = globalSkillsSlice?.data?.skills || [];

      // eslint-disable-next-line no-console
      console.log('[useSkillsData] Global skills:', globalSkills);

      // Merge local and global skills
      const allSkills = [...localSkills, ...globalSkills];

      // eslint-disable-next-line no-console
      console.log('[useSkillsData] Total skills:', allSkills.length);

      setSkills(allSkills);
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
