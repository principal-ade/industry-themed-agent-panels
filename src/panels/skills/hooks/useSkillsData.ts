import { useState, useEffect, useCallback, useRef } from 'react';
import type { FileTree } from '@principal-ai/repository-abstraction';
import type { PanelContextValue } from '../../../types';

export type SkillSource =
  | 'project-universal'  // ./.agent/skills/ (from fileTree)
  | 'global-universal'   // ~/.agent/skills/ (from globalSkills slice)
  | 'project-claude'     // ./.claude/skills/ (from fileTree)
  | 'global-claude'      // ~/.claude/skills/ (from globalSkills slice)
  | 'project-other';     // any other location in project (from fileTree)

export interface SkillMetadata {
  installedFrom?: string;
  skillPath?: string;
  owner?: string;
  repo?: string;
  branch?: string;
  installedAt?: string;
  destination?: string;
  sha?: string;
  files?: string[];
}

export interface FrontmatterValidation {
  isValid: boolean;
  hasStructure: boolean; // Has --- delimiters
  missingFields: string[]; // Array of missing required fields
  errorMessage?: string; // Human-readable error message
}

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
  // Installation metadata (from .metadata.json)
  metadata?: SkillMetadata;
  // Frontmatter validation
  frontmatterValidation: FrontmatterValidation;
}

// Stable empty array to prevent unnecessary re-renders
const EMPTY_SKILLS_ARRAY: Skill[] = [];

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
 * Helper function to find skill markdown files from the FileTree's allFiles array
 * Looks for any .md files in .agent/skills/ or .claude/skills/ directories (local mode)
 * or SKILL.md files anywhere in the tree (browser mode for GitHub repositories)
 */
const findSkillFiles = (fileTree: FileTree, isBrowserMode: boolean = false): string[] => {
  // Filter allFiles for .md files in skill directories
  const skillFiles = fileTree.allFiles.filter(file => {
    const path = file.relativePath;
    const isMarkdown = file.name.endsWith('.md');

    // Exclude metadata files
    const isMetadata = file.name === '.metadata.json' || file.name.startsWith('.');

    if (isMetadata) {
      return false;
    }

    // In browser mode (GitHub repos), look for SKILL.md files anywhere
    if (isBrowserMode) {
      return file.name === 'SKILL.md' || file.name.toLowerCase() === 'skill.md';
    }

    // In local mode, look for .md files in .agent/skills/ or .claude/skills/
    const isInSkillDir = path.includes('.agent/skills/') || path.includes('.claude/skills/');
    return isMarkdown && isInSkillDir;
  });

  // Return their relative paths
  return skillFiles.map(file => file.relativePath);
};

/**
 * Helper function to analyze skill folder structure
 */
const analyzeSkillStructure = (fileTree: FileTree, skillPath: string) => {
  // Get skill directory path (parent of skill markdown file)
  const skillDir = skillPath.substring(0, skillPath.lastIndexOf('/'));
  const pathParts = skillPath.split('/');
  const parentDir = pathParts[pathParts.length - 2];

  // Check if this is a standalone file directly in the skills directory
  const isStandaloneFile = parentDir === 'skills';

  // For standalone files, there's no skill-specific folder structure
  if (isStandaloneFile) {
    return {
      skillFolderPath: skillDir,
      hasScripts: false,
      hasReferences: false,
      hasAssets: false,
      scriptFiles: [],
      referenceFiles: [],
      assetFiles: [],
    };
  }

  // For skills in subdirectories, analyze the folder structure
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
 * Helper function to validate YAML frontmatter structure and required fields
 * Now validates gracefully - considers skills valid even with missing required fields
 */
const validateFrontmatter = (content: string): FrontmatterValidation => {
  const trimmedContent = content.trim();

  // Check if content starts with ---
  if (!trimmedContent.startsWith('---')) {
    return {
      isValid: true, // Still valid, just has warnings
      hasStructure: false,
      missingFields: [],
      errorMessage: 'Missing YAML frontmatter (must start with ---)',
    };
  }

  const lines = trimmedContent.split('\n');

  // Find closing ---
  let frontmatterEnd = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      frontmatterEnd = i;
      break;
    }
  }

  // Valid frontmatter must have closing ---
  if (frontmatterEnd <= 0) {
    return {
      isValid: true, // Still valid, just has warnings
      hasStructure: false,
      missingFields: [],
      errorMessage: 'Missing closing --- delimiter for frontmatter',
    };
  }

  // Extract frontmatter content
  const frontmatterLines = lines.slice(1, frontmatterEnd);
  const frontmatterText = frontmatterLines.join('\n');

  // Check for required fields: name and description
  const missingFields: string[] = [];

  const hasName = /^name:\s*.+/m.test(frontmatterText);
  const hasDescription = /^description:\s*.+/m.test(frontmatterText);

  if (!hasName) {
    missingFields.push('name');
  }
  if (!hasDescription) {
    missingFields.push('description');
  }

  // Construct warning message if there are missing fields
  let errorMessage: string | undefined;
  if (missingFields.length > 0) {
    const fieldList = missingFields.map(f => `'${f}'`).join(', ');
    errorMessage = `Missing required field${missingFields.length > 1 ? 's' : ''}: ${fieldList}`;
  }

  return {
    isValid: true, // Always valid - we show warnings but don't block rendering
    hasStructure: true,
    missingFields,
    errorMessage,
  };
};

/**
 * Helper function to parse skill markdown content and extract metadata
 */
const parseSkillContent = async (
  content: string,
  path: string,
  fileTree: FileTree,
  fileSystemAdapter?: any,
  isBrowserMode: boolean = false
): Promise<Skill> => {
  // Extract skill name from path
  const pathParts = path.split('/');
  const fileName = pathParts[pathParts.length - 1];
  const parentDir = pathParts[pathParts.length - 2];

  // If the file is directly in a skills directory, use the filename as the skill name
  // Otherwise, use the parent directory name (for skills in subdirectories)
  const isDirectlyInSkillsDir = parentDir === 'skills';
  const skillDirName = isDirectlyInSkillsDir
    ? fileName.replace(/\.md$/, '') // Remove .md extension
    : parentDir;

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

  // Try to read .metadata.json if it exists (only in local mode)
  // In browser mode, metadata files don't exist in remote repositories
  let metadata: SkillMetadata | undefined;
  if (!isBrowserMode && fileSystemAdapter && structure.skillFolderPath) {
    try {
      const metadataPath = `${structure.skillFolderPath}/.metadata.json`;
      const metadataContent = await fileSystemAdapter.readFile(metadataPath);
      metadata = JSON.parse(metadataContent);
      console.log('[useSkillsData] Loaded metadata for skill:', skillDirName, metadata);
    } catch (error) {
      // .metadata.json doesn't exist or couldn't be read - this is fine
      console.debug('[useSkillsData] No metadata file for skill:', skillDirName);
    }
  }

  // Validate frontmatter
  const frontmatterValidation = validateFrontmatter(content);

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
    metadata,
    frontmatterValidation,
  };
};

/**
 * Hook to discover and read SKILL.md files from the file tree
 */
export const useSkillsData = ({
  context,
}: UseSkillsDataParams): UseSkillsDataReturn => {
  const [skills, setSkills] = useState<Skill[]>(EMPTY_SKILLS_ARRAY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract stable references from context to avoid unnecessary re-renders
  const fileTreeSlice = context.getSlice<FileTree>('fileTree');
  const fileTree = fileTreeSlice?.data;
  const fileTreeSha = fileTree?.sha; // Use SHA as stable identity
  const globalSkillsSlice = context.getSlice<GlobalSkillsSlice>('globalSkills');
  const globalSkills = globalSkillsSlice?.data?.skills ?? EMPTY_SKILLS_ARRAY;
  const globalSkillsCount = globalSkills.length; // Use count as stable primitive
  const repoPath = context.currentScope.repository?.path;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fileSystem = (context as any).adapters?.fileSystem;

  // Track the last loaded SHA to prevent redundant loads
  const lastLoadedSha = useRef<string | undefined>(undefined);
  const lastGlobalSkillsCount = useRef<number>(0);

  const loadSkills = useCallback(async () => {
    // Skip if we've already loaded this exact data
    if (fileTreeSha === lastLoadedSha.current && globalSkillsCount === lastGlobalSkillsCount.current) {
      console.log('[useSkillsData] Skipping reload - data unchanged (SHA:', fileTreeSha, 'globalCount:', globalSkillsCount, ')');
      return;
    }

    console.log('[useSkillsData] Loading skills - SHA changed:', fileTreeSha !== lastLoadedSha.current, 'globalCount changed:', globalSkillsCount !== lastGlobalSkillsCount.current);

    setIsLoading(true);
    setError(null);

    try {
      let localSkills: Skill[] = [];

      if (fileTree && fileSystem?.readFile && repoPath) {
        // Detect browser mode: GitHub repos have paths like "owner/repo" instead of absolute paths
        const isBrowserMode = !repoPath.startsWith('/');

        // eslint-disable-next-line no-console
        console.log('[useSkillsData] fileTree:', fileTree);
        // eslint-disable-next-line no-console
        console.log('[useSkillsData] typeof fileTree:', typeof fileTree);
        // eslint-disable-next-line no-console
        console.log('[useSkillsData] fileTree keys:', Object.keys(fileTree));
        // eslint-disable-next-line no-console
        console.log('[useSkillsData] Browser mode:', isBrowserMode);

        // Find all SKILL.md files in project
        const skillPaths = findSkillFiles(fileTree, isBrowserMode);

        // eslint-disable-next-line no-console
        console.log('[useSkillsData] Found skill paths:', skillPaths);

        // Read content for each local skill
        const skillPromises = skillPaths.map(async (skillPath) => {
          try {
            // In browser mode, use the relative path directly (GitHub adapter expects this)
            // In local mode, prepend the absolute repo path
            const fullPath = isBrowserMode ? skillPath : `${repoPath}/${skillPath}`;
            const content = await fileSystem.readFile(fullPath);
            return parseSkillContent(content as string, skillPath, fileTree, fileSystem, isBrowserMode);
          } catch (err) {
            console.error(`Failed to read skill at ${skillPath}:`, err);
            return null;
          }
        });

        localSkills = (await Promise.all(skillPromises)).filter(
          (skill): skill is Skill => skill !== null
        );
      }

      // eslint-disable-next-line no-console
      console.log('[useSkillsData] Global skills:', globalSkills);

      // Merge local and global skills
      const allSkills = [...localSkills, ...globalSkills];

      // eslint-disable-next-line no-console
      console.log('[useSkillsData] Total skills:', allSkills.length);

      setSkills(allSkills);

      // Update tracking refs
      lastLoadedSha.current = fileTreeSha;
      lastGlobalSkillsCount.current = globalSkillsCount;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load skills';
      setError(errorMessage);
      console.error('Error loading skills:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fileTree, fileTreeSha, globalSkills, globalSkillsCount, repoPath, fileSystem]);

  const refreshSkills = useCallback(async () => {
    // Force reload by clearing the tracking refs
    lastLoadedSha.current = undefined;
    lastGlobalSkillsCount.current = -1;
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
