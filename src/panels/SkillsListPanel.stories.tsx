/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PathsFileTreeBuilder } from '@principal-ai/repository-abstraction';
import { SkillsListPanel } from './SkillsListPanel';
import {
  MockPanelProvider,
  createMockContext,
  createMockActions,
  createMockEvents,
} from '../mocks/panelContext';
import type { DataSlice } from '../types';

/**
 * SkillsListPanel displays Agent Skills from SKILL.md files in the repository.
 * It shows skill metadata, descriptions, and capabilities.
 */
const meta = {
  title: 'Panels/SkillsListPanel',
  component: SkillsListPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A panel for displaying and managing Agent Skills from SKILL.md files. Shows skill cards with name, description, capabilities, and path.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', background: '#f5f5f5' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    context: createMockContext(),
    actions: createMockActions(),
    events: createMockEvents(),
  },
} satisfies Meta<typeof SkillsListPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock SKILL.md content
const createSkillContent = (
  title: string,
  description: string,
  capabilities: string[]
) => `# ${title}

${description}

## Capabilities

${capabilities.map((cap) => `- ${cap}`).join('\n')}

## Usage

This skill can be used by AI agents to ${description.toLowerCase()}.
`;

// Mock SKILL.md content with frontmatter
const createSkillContentWithFrontmatter = (
  title: string,
  description: string,
  capabilities: string[],
  extraFrontmatter?: Record<string, any>
) => `---
name: ${title}
description: ${description}
${extraFrontmatter ? Object.entries(extraFrontmatter).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n') : ''}
---

# ${title}

${description}

## Capabilities

${capabilities.map((cap) => `- ${cap}`).join('\n')}

## Usage

This skill can be used by AI agents to ${description.toLowerCase()}.
`;

// Create mock file tree using PathsFileTreeBuilder
const builder = new PathsFileTreeBuilder();
const mockFileTreeWithSkills = builder.build({
  files: [
    '.agent/skills/legal-review/SKILL.md',
    '.agent/skills/legal-review/references/contract-templates.md',
    '.agent/skills/legal-review/references/compliance-guide.md',
    '.agent/skills/data-analysis/SKILL.md',
    '.agent/skills/data-analysis/scripts/analyze.py',
    '.agent/skills/data-analysis/scripts/visualize.py',
    '.agent/skills/data-analysis/assets/template.xlsx',
    '.agent/skills/presentation-maker/SKILL.md',
    '.agent/skills/presentation-maker/scripts/generate-slides.js',
    '.agent/skills/presentation-maker/assets/theme-corporate.pptx',
    '.agent/skills/presentation-maker/assets/theme-modern.pptx',
    '.agent/skills/code-reviewer/SKILL.md',
    '.agent/skills/code-reviewer/references/best-practices.md',
    'src/index.ts',
    'README.md',
  ],
  rootPath: '/Users/developer/my-project',
});

// Mock file system adapter that returns skill content
const createMockFileSystemWithSkills = () => {
  const skillContents: Record<string, string> = {
    'legal-review/SKILL.md': createSkillContent(
      'Legal Review',
      'Review contracts and legal documents for potential issues and compliance',
      [
        'Identify contractual obligations and liabilities',
        'Check for regulatory compliance',
        'Flag ambiguous or problematic clauses',
      ]
    ),
    'data-analysis/SKILL.md': createSkillContent(
      'Data Analysis',
      'Analyze datasets to extract insights and generate visualizations',
      [
        'Statistical analysis and trend identification',
        'Data cleaning and preprocessing',
        'Generate charts and visualizations',
      ]
    ),
    'presentation-maker/SKILL.md': createSkillContent(
      'Presentation Maker',
      'Create professional presentations from content and data',
      [
        'Design slide layouts and themes',
        'Convert data into visual stories',
        'Generate speaker notes',
      ]
    ),
    'code-reviewer/SKILL.md': createSkillContent(
      'Code Reviewer',
      'Review code for quality, security, and best practices',
      [
        'Identify potential bugs and security vulnerabilities',
        'Suggest performance improvements',
        'Check adherence to coding standards',
      ]
    ),
  };

  return {
    readFile: async (path: string) => {
      // Extract the skill path from the full path
      const match = path.match(/\.agent\/skills\/([^/]+\/SKILL\.md)$/);
      if (match && skillContents[match[1]]) {
        return skillContents[match[1]];
      }
      throw new Error(`File not found: ${path}`);
    },
  };
};

/**
 * Default state with multiple skills
 */
export const Default: Story = {
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: mockFileTreeWithSkills,
      loading: false,
      error: null,
      refresh: async () => {},
    });

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          adapters: {
            fileSystem: createMockFileSystemWithSkills(),
          },
        } as any}
      >
        {(props) => <SkillsListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * No skills found in repository
 */
export const NoSkills: Story = {
  render: () => {
    const noSkillsTree = builder.build({
      files: ['src/index.ts', 'README.md'],
      rootPath: '/Users/developer/my-project',
    });

    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: noSkillsTree,
      loading: false,
      error: null,
      refresh: async () => {},
    });

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          adapters: {
            fileSystem: createMockFileSystemWithSkills(),
          },
        } as any}
      >
        {(props) => <SkillsListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Loading state
 */
export const Loading: Story = {
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: null,
      loading: true,
      error: null,
      refresh: async () => {},
    });

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          adapters: {
            fileSystem: {
              readFile: async () => {
                // Simulate slow loading
                await new Promise((resolve) => setTimeout(resolve, 10000));
                return '';
              },
            },
          },
        } as any}
      >
        {(props) => <SkillsListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Many skills (stress test)
 */
export const ManySkills: Story = {
  render: () => {
    // Generate a large file tree with many skills
    const manySkillsPaths = Array.from(
      { length: 20 },
      (_, i) => `.agent/skills/skill-${i + 1}/SKILL.md`
    );
    const manySkillsTree = builder.build({
      files: [...manySkillsPaths, 'src/index.ts', 'README.md'],
      rootPath: '/Users/developer/my-project',
    });

    const manySkillsAdapter = {
      readFile: async (path: string) => {
        const match = path.match(/skill-(\d+)\/SKILL\.md$/);
        if (match) {
          const num = match[1];
          return createSkillContent(
            `Skill ${num}`,
            `This is an example skill for testing purposes. Skill number ${num} demonstrates various capabilities.`,
            [
              `Primary capability for skill ${num}`,
              `Secondary capability for skill ${num}`,
              `Advanced feature for skill ${num}`,
            ]
          );
        }
        throw new Error(`File not found: ${path}`);
      },
    };

    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: manySkillsTree,
      loading: false,
      error: null,
      refresh: async () => {},
    });

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          adapters: {
            fileSystem: manySkillsAdapter,
          },
        } as any}
      >
        {(props) => <SkillsListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * No repository loaded
 */
export const NoRepository: Story = {
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: null,
      loading: false,
      error: null,
      refresh: async () => {},
    });

    return (
      <MockPanelProvider
        contextOverrides={{
          currentScope: {
            type: 'workspace',
            workspace: {
              name: 'my-workspace',
              path: '/Users/developer/my-workspace',
            },
          },
          slices: mockSlices,
        }}
      >
        {(props) => <SkillsListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * With search filtering
 */
export const WithSearch: Story = {
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: mockFileTreeWithSkills,
      loading: false,
      error: null,
      refresh: async () => {},
    });

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          adapters: {
            fileSystem: createMockFileSystemWithSkills(),
          },
        } as any}
      >
        {(props) => <SkillsListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Browse mode - for browsing GitHub repositories
 * Shows "Git Repo" instead of "Project" in filter
 */
export const BrowseMode: Story = {
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: mockFileTreeWithSkills,
      loading: false,
      error: null,
      refresh: async () => {},
    });

    // Mock some global skills
    const mockGlobalSkills = [
      {
        name: 'brand-guidelines',
        path: '/Users/developer/.agent/skills/brand-guidelines/SKILL.md',
        content: createSkillContent(
          'Brand Guidelines',
          'Apply brand guidelines and style standards to content',
          ['Ensure brand consistency', 'Apply color schemes', 'Maintain typography standards']
        ),
      },
    ];

    mockSlices.set('globalSkills', {
      scope: 'workspace',
      name: 'globalSkills',
      data: { skills: mockGlobalSkills },
      loading: false,
      error: null,
      refresh: async () => {},
    });

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          adapters: {
            fileSystem: createMockFileSystemWithSkills(),
          },
        } as any}
      >
        {(props) => <SkillsListPanel {...props} browseMode={true} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Browse mode with no repository loaded
 * Filters should be hidden
 */
export const BrowseModeNoRepo: Story = {
  render: () => {
    const mockSlices = new Map<string, DataSlice>();

    // No fileTree data
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: null,
      loading: false,
      error: null,
      refresh: async () => {},
    });

    // Only global skills
    const mockGlobalSkills = [
      {
        name: 'brand-guidelines',
        path: '/Users/developer/.agent/skills/brand-guidelines/SKILL.md',
        content: createSkillContent(
          'Brand Guidelines',
          'Apply brand guidelines and style standards to content',
          ['Ensure brand consistency', 'Apply color schemes', 'Maintain typography standards']
        ),
      },
      {
        name: 'meeting-summarizer',
        path: '/Users/developer/.claude/skills/meeting-summarizer/SKILL.md',
        content: createSkillContent(
          'Meeting Summarizer',
          'Summarize meeting notes and extract action items',
          ['Extract key decisions', 'Identify action items', 'Generate meeting summaries']
        ),
      },
    ];

    mockSlices.set('globalSkills', {
      scope: 'workspace',
      name: 'globalSkills',
      data: { skills: mockGlobalSkills },
      loading: false,
      error: null,
      refresh: async () => {},
    });

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          adapters: {
            fileSystem: {
              readFile: async (path: string) => {
                if (path.includes('brand-guidelines')) {
                  return createSkillContent(
                    'Brand Guidelines',
                    'Apply brand guidelines and style standards to content',
                    ['Ensure brand consistency', 'Apply color schemes', 'Maintain typography standards']
                  );
                }
                if (path.includes('meeting-summarizer')) {
                  return createSkillContent(
                    'Meeting Summarizer',
                    'Summarize meeting notes and extract action items',
                    ['Extract key decisions', 'Identify action items', 'Generate meeting summaries']
                  );
                }
                throw new Error(`File not found: ${path}`);
              },
            },
          },
        } as any}
      >
        {(props) => <SkillsListPanel {...props} browseMode={true} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Mix of skills with and without frontmatter
 * Shows the "No Frontmatter" warning badge on skills missing YAML frontmatter
 */
export const FrontmatterMix: Story = {
  render: () => {
    const frontmatterMixTree = builder.build({
      files: [
        '.agent/skills/code-review/SKILL.md',
        '.agent/skills/documentation/SKILL.md',
        '.agent/skills/testing/SKILL.md',
        '.agent/skills/deployment/SKILL.md',
        'src/index.ts',
        'README.md',
      ],
      rootPath: '/Users/developer/my-project',
    });

    const frontmatterMixAdapter = {
      readFile: async (path: string) => {
        if (path.includes('code-review')) {
          return createSkillContentWithFrontmatter(
            'Code Review',
            'Performs thorough code reviews with best practices',
            [
              'Check code quality and adherence to style guides',
              'Identify potential bugs and security issues',
              'Suggest improvements and optimizations',
            ],
            { tags: ['review', 'quality', 'testing'], version: '1.0.0' }
          );
        }
        if (path.includes('documentation')) {
          // No frontmatter - will show warning
          return createSkillContent(
            'Documentation Generator',
            'Generate documentation for your code',
            [
              'Generate API documentation from code comments',
              'Create README files with proper structure',
              'Add JSDoc comments to functions',
            ]
          );
        }
        if (path.includes('testing')) {
          return createSkillContentWithFrontmatter(
            'Test Generation',
            'Generates comprehensive unit and integration tests',
            [
              'Create unit tests for individual functions',
              'Generate integration tests for components',
              'Set up test fixtures and mocks',
            ],
            { tags: ['testing', 'quality-assurance'], author: 'Test Team' }
          );
        }
        if (path.includes('deployment')) {
          // No frontmatter - will show warning
          return createSkillContent(
            'Deployment Helper',
            'Assists with deployment and CI/CD tasks',
            [
              'Configure deployment pipelines',
              'Set up environment variables',
              'Manage cloud infrastructure',
            ]
          );
        }
        throw new Error(`File not found: ${path}`);
      },
    };

    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: frontmatterMixTree,
      loading: false,
      error: null,
      refresh: async () => {},
    });

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          adapters: {
            fileSystem: frontmatterMixAdapter,
          },
        } as any}
      >
        {(props) => <SkillsListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * All frontmatter validation scenarios
 * Shows different validation error messages for various invalid frontmatter cases
 */
export const FrontmatterValidation: Story = {
  render: () => {
    const validationTree = builder.build({
      files: [
        '.agent/skills/valid/SKILL.md',
        '.agent/skills/missing-name/SKILL.md',
        '.agent/skills/missing-description/SKILL.md',
        '.agent/skills/missing-both/SKILL.md',
        '.agent/skills/no-frontmatter/SKILL.md',
        'src/index.ts',
      ],
      rootPath: '/Users/developer/my-project',
    });

    const validationAdapter = {
      readFile: async (path: string) => {
        if (path.includes('valid/')) {
          return `---
name: valid-skill
description: "A skill with valid frontmatter that has both required fields"
---

# Valid Skill

This skill has proper frontmatter with both \`name\` and \`description\` fields.

## Features
- No validation warnings
- All required fields present
`;
        }
        if (path.includes('missing-name/')) {
          return `---
description: "A skill missing the name field"
version: "1.0.0"
---

# Missing Name

This skill is missing the required \`name\` field in frontmatter.

## Features
- Shows "Missing: name" badge
- Warning message displays in detail panel
`;
        }
        if (path.includes('missing-description/')) {
          return `---
name: missing-description
version: "1.0.0"
---

# Missing Description

This skill is missing the required \`description\` field in frontmatter.

## Features
- Shows "Missing: description" badge
- Warning message displays in detail panel
`;
        }
        if (path.includes('missing-both/')) {
          return `---
author: "Developer"
version: "1.0.0"
tags: ["example"]
---

# Missing Both Required Fields

This skill has frontmatter but is missing both \`name\` and \`description\`.

## Features
- Shows "Missing: name, description" badge
- Warning about both fields in detail panel
`;
        }
        if (path.includes('no-frontmatter/')) {
          return `# No Frontmatter

This skill has no YAML frontmatter at all.

## Features
- Shows "No Frontmatter" badge
- Warning about missing frontmatter structure
- The most common validation error
`;
        }
        throw new Error(`File not found: ${path}`);
      },
    };

    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: validationTree,
      loading: false,
      error: null,
      refresh: async () => {},
    });

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          adapters: {
            fileSystem: validationAdapter,
          },
        } as any}
      >
        {(props) => <SkillsListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Duplicate skills - shows deduplication in action
 * Same skill installed in both project and global locations
 */
export const DuplicateSkills: Story = {
  render: () => {
    // Project skills with metadata
    const duplicateSkillsTree = builder.build({
      files: [
        '.agent/skills/legal-review/SKILL.md',
        '.agent/skills/legal-review/.metadata.json',
        '.agent/skills/code-reviewer/SKILL.md',
        '.agent/skills/code-reviewer/.metadata.json',
        'src/index.ts',
      ],
      rootPath: '/Users/developer/my-project',
    });

    const duplicateSkillsAdapter = {
      readFile: async (path: string) => {
        if (path.includes('legal-review/SKILL.md')) {
          return createSkillContentWithFrontmatter(
            'Legal Review',
            'Review contracts and legal documents for potential issues and compliance',
            [
              'Identify contractual obligations and liabilities',
              'Check for regulatory compliance',
              'Flag ambiguous or problematic clauses',
            ]
          );
        }
        if (path.includes('legal-review/.metadata.json')) {
          return JSON.stringify({
            owner: 'skills-org',
            repo: 'legal-skills',
            skillPath: 'legal-review',
            sha: 'abc123def456',
            installedFrom: 'https://github.com/skills-org/legal-skills',
            installedAt: '2024-01-15T10:30:00Z',
            destination: 'project-universal',
          });
        }
        if (path.includes('code-reviewer/SKILL.md')) {
          return createSkillContentWithFrontmatter(
            'Code Reviewer',
            'Review code for quality, security, and best practices',
            [
              'Identify potential bugs and security vulnerabilities',
              'Suggest performance improvements',
              'Check adherence to coding standards',
            ]
          );
        }
        if (path.includes('code-reviewer/.metadata.json')) {
          return JSON.stringify({
            owner: 'skills-org',
            repo: 'dev-skills',
            skillPath: 'code-reviewer',
            sha: 'xyz789abc123',
            installedFrom: 'https://github.com/skills-org/dev-skills',
            installedAt: '2024-01-10T14:20:00Z',
            destination: 'project-universal',
          });
        }
        throw new Error(`File not found: ${path}`);
      },
    };

    // Mock global skills with SAME metadata (will be deduplicated)
    const mockGlobalSkills = [
      {
        id: '/Users/developer/.agent/skills/legal-review/SKILL.md',
        name: 'legal review',
        path: '/Users/developer/.agent/skills/legal-review/SKILL.md',
        description: 'Review contracts and legal documents for potential issues and compliance',
        skillFolderPath: '/Users/developer/.agent/skills/legal-review',
        source: 'global-universal' as const,
        priority: 2 as const,
        hasScripts: false,
        hasReferences: false,
        hasAssets: false,
        content: createSkillContentWithFrontmatter(
          'Legal Review',
          'Review contracts and legal documents for potential issues and compliance',
          [
            'Identify contractual obligations and liabilities',
            'Check for regulatory compliance',
            'Flag ambiguous or problematic clauses',
          ]
        ),
        metadata: {
          owner: 'skills-org',
          repo: 'legal-skills',
          skillPath: 'legal-review',
          sha: 'abc123def456', // Same SHA as project version
          installedFrom: 'https://github.com/skills-org/legal-skills',
          installedAt: '2024-01-01T08:00:00Z', // Older installation
          destination: 'global-universal',
        },
        frontmatterValidation: {
          isValid: true,
          hasStructure: true,
          missingFields: [],
        },
      },
      {
        id: '/Users/developer/.claude/skills/code-reviewer/SKILL.md',
        name: 'code reviewer',
        path: '/Users/developer/.claude/skills/code-reviewer/SKILL.md',
        description: 'Review code for quality, security, and best practices',
        skillFolderPath: '/Users/developer/.claude/skills/code-reviewer',
        source: 'global-claude' as const,
        priority: 4 as const,
        hasScripts: false,
        hasReferences: false,
        hasAssets: false,
        content: createSkillContentWithFrontmatter(
          'Code Reviewer',
          'Review code for quality, security, and best practices',
          [
            'Identify potential bugs and security vulnerabilities',
            'Suggest performance improvements',
            'Check adherence to coding standards',
          ]
        ),
        metadata: {
          owner: 'skills-org',
          repo: 'dev-skills',
          skillPath: 'code-reviewer',
          sha: 'xyz789abc123', // Same SHA
          installedFrom: 'https://github.com/skills-org/dev-skills',
          installedAt: '2023-12-20T16:45:00Z', // Even older
          destination: 'global-claude',
        },
        frontmatterValidation: {
          isValid: true,
          hasStructure: true,
          missingFields: [],
        },
      },
    ];

    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: duplicateSkillsTree,
      loading: false,
      error: null,
      refresh: async () => {},
    });

    mockSlices.set('globalSkills', {
      scope: 'workspace',
      name: 'globalSkills',
      data: { skills: mockGlobalSkills },
      loading: false,
      error: null,
      refresh: async () => {},
    });

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          adapters: {
            fileSystem: duplicateSkillsAdapter,
          },
        } as any}
      >
        {(props) => <SkillsListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Duplicate skills with SHA mismatch - different versions
 * Shows version warning when same skill has different SHAs
 */
export const DuplicateWithSHAMismatch: Story = {
  render: () => {
    const singleSkillTree = builder.build({
      files: [
        '.agent/skills/data-analysis/SKILL.md',
        '.agent/skills/data-analysis/.metadata.json',
        'src/index.ts',
      ],
      rootPath: '/Users/developer/my-project',
    });

    const shaAdapter = {
      readFile: async (path: string) => {
        if (path.includes('data-analysis/SKILL.md')) {
          return createSkillContentWithFrontmatter(
            'Data Analysis',
            'Analyze datasets to extract insights and generate visualizations (v2.0)',
            [
              'Statistical analysis and trend identification',
              'Data cleaning and preprocessing',
              'Generate charts and visualizations',
              'NEW: Machine learning predictions',
            ]
          );
        }
        if (path.includes('data-analysis/.metadata.json')) {
          return JSON.stringify({
            owner: 'analytics',
            repo: 'data-tools',
            skillPath: 'data-analysis',
            sha: 'new_version_456', // NEW version
            installedFrom: 'https://github.com/analytics/data-tools',
            installedAt: '2024-02-01T12:00:00Z',
            destination: 'project-universal',
          });
        }
        throw new Error(`File not found: ${path}`);
      },
    };

    // Global version with DIFFERENT SHA (older version)
    const mockGlobalSkills = [
      {
        id: '/Users/developer/.agent/skills/data-analysis/SKILL.md',
        name: 'data analysis',
        path: '/Users/developer/.agent/skills/data-analysis/SKILL.md',
        description: 'Analyze datasets to extract insights and generate visualizations (v1.0)',
        skillFolderPath: '/Users/developer/.agent/skills/data-analysis',
        source: 'global-universal' as const,
        priority: 2 as const,
        hasScripts: false,
        hasReferences: false,
        hasAssets: false,
        content: createSkillContentWithFrontmatter(
          'Data Analysis',
          'Analyze datasets to extract insights and generate visualizations (v1.0)',
          [
            'Statistical analysis and trend identification',
            'Data cleaning and preprocessing',
            'Generate charts and visualizations',
          ]
        ),
        metadata: {
          owner: 'analytics',
          repo: 'data-tools',
          skillPath: 'data-analysis',
          sha: 'old_version_123', // OLD version - different SHA!
          installedFrom: 'https://github.com/analytics/data-tools',
          installedAt: '2023-11-15T09:30:00Z',
          destination: 'global-universal',
        },
        frontmatterValidation: {
          isValid: true,
          hasStructure: true,
          missingFields: [],
        },
      },
    ];

    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: singleSkillTree,
      loading: false,
      error: null,
      refresh: async () => {},
    });

    mockSlices.set('globalSkills', {
      scope: 'workspace',
      name: 'globalSkills',
      data: { skills: mockGlobalSkills },
      loading: false,
      error: null,
      refresh: async () => {},
    });

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          adapters: {
            fileSystem: shaAdapter,
          },
        } as any}
      >
        {(props) => <SkillsListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Skill in multiple locations - 3+ installations
 * Shows "Also in:" with multiple location names
 */
export const MultipleLocations: Story = {
  render: () => {
    const multiLocationTree = builder.build({
      files: [
        '.agent/skills/test-generator/SKILL.md',
        '.agent/skills/test-generator/.metadata.json',
        '.claude/skills/test-generator/SKILL.md',
        '.claude/skills/test-generator/.metadata.json',
        'src/index.ts',
      ],
      rootPath: '/Users/developer/my-project',
    });

    const multiAdapter = {
      readFile: async (path: string) => {
        if (path.includes('test-generator/SKILL.md')) {
          return createSkillContentWithFrontmatter(
            'Test Generator',
            'Generates comprehensive unit and integration tests',
            [
              'Create unit tests for individual functions',
              'Generate integration tests for components',
              'Set up test fixtures and mocks',
            ]
          );
        }
        if (path.includes('.metadata.json')) {
          const isAgent = path.includes('.agent');
          return JSON.stringify({
            owner: 'testing',
            repo: 'test-tools',
            skillPath: 'test-generator',
            sha: 'test123abc',
            installedFrom: 'https://github.com/testing/test-tools',
            installedAt: isAgent ? '2024-01-25T11:00:00Z' : '2024-01-20T15:30:00Z',
            destination: isAgent ? 'project-universal' : 'project-claude',
          });
        }
        throw new Error(`File not found: ${path}`);
      },
    };

    // Two more global installations
    const mockGlobalSkills = [
      {
        id: '/Users/developer/.agent/skills/test-generator/SKILL.md',
        name: 'test generator',
        path: '/Users/developer/.agent/skills/test-generator/SKILL.md',
        description: 'Generates comprehensive unit and integration tests',
        skillFolderPath: '/Users/developer/.agent/skills/test-generator',
        source: 'global-universal' as const,
        priority: 2 as const,
        hasScripts: false,
        hasReferences: false,
        hasAssets: false,
        content: createSkillContentWithFrontmatter(
          'Test Generator',
          'Generates comprehensive unit and integration tests',
          [
            'Create unit tests for individual functions',
            'Generate integration tests for components',
            'Set up test fixtures and mocks',
          ]
        ),
        metadata: {
          owner: 'testing',
          repo: 'test-tools',
          skillPath: 'test-generator',
          sha: 'test123abc',
          installedFrom: 'https://github.com/testing/test-tools',
          installedAt: '2024-01-10T08:00:00Z',
          destination: 'global-universal',
        },
        frontmatterValidation: {
          isValid: true,
          hasStructure: true,
          missingFields: [],
        },
      },
      {
        id: '/Users/developer/.claude/skills/test-generator/SKILL.md',
        name: 'test generator',
        path: '/Users/developer/.claude/skills/test-generator/SKILL.md',
        description: 'Generates comprehensive unit and integration tests',
        skillFolderPath: '/Users/developer/.claude/skills/test-generator',
        source: 'global-claude' as const,
        priority: 4 as const,
        hasScripts: false,
        hasReferences: false,
        hasAssets: false,
        content: createSkillContentWithFrontmatter(
          'Test Generator',
          'Generates comprehensive unit and integration tests',
          [
            'Create unit tests for individual functions',
            'Generate integration tests for components',
            'Set up test fixtures and mocks',
          ]
        ),
        metadata: {
          owner: 'testing',
          repo: 'test-tools',
          skillPath: 'test-generator',
          sha: 'test123abc',
          installedFrom: 'https://github.com/testing/test-tools',
          installedAt: '2024-01-05T14:20:00Z',
          destination: 'global-claude',
        },
        frontmatterValidation: {
          isValid: true,
          hasStructure: true,
          missingFields: [],
        },
      },
    ];

    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: multiLocationTree,
      loading: false,
      error: null,
      refresh: async () => {},
    });

    mockSlices.set('globalSkills', {
      scope: 'workspace',
      name: 'globalSkills',
      data: { skills: mockGlobalSkills },
      loading: false,
      error: null,
      refresh: async () => {},
    });

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          adapters: {
            fileSystem: multiAdapter,
          },
        } as any}
      >
        {(props) => <SkillsListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};
