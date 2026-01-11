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

// Create mock file tree using PathsFileTreeBuilder
const builder = new PathsFileTreeBuilder();
const mockFileTreeWithSkills = builder.build({
  files: [
    '.skills/legal-review/SKILL.md',
    '.skills/legal-review/references/contract-templates.md',
    '.skills/legal-review/references/compliance-guide.md',
    '.skills/data-analysis/SKILL.md',
    '.skills/data-analysis/scripts/analyze.py',
    '.skills/data-analysis/scripts/visualize.py',
    '.skills/data-analysis/assets/template.xlsx',
    '.skills/presentation-maker/SKILL.md',
    '.skills/presentation-maker/scripts/generate-slides.js',
    '.skills/presentation-maker/assets/theme-corporate.pptx',
    '.skills/presentation-maker/assets/theme-modern.pptx',
    '.skills/code-reviewer/SKILL.md',
    '.skills/code-reviewer/references/best-practices.md',
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
      const match = path.match(/\.skills\/([^/]+\/SKILL\.md)$/);
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
      (_, i) => `.skills/skill-${i + 1}/SKILL.md`
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
