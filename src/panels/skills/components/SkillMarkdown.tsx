/**
 * SkillMarkdown component for rendering Agent Skills (SKILL.md files)
 * Parses frontmatter and renders skill metadata with markdown body
 */

import { Theme } from '@principal-ade/industry-theme';
import {
  parseSkillMarkdownGraceful,
  type PartialParsedSkill,
  type PartialSkillMetadata,
  type ValidationWarning,
} from '@principal-ade/markdown-utils';
import { Code, BookOpen, Package, Globe, Folder, AlertTriangle } from 'lucide-react';
import React from 'react';

import { IndustryMarkdownSlide } from 'themed-markdown';

import type { Skill, SkillSource } from '../hooks/useSkillsData';
import { extractHeaders, type MarkdownHeader } from '../utils/extractHeaders';
import { SkillSidebar } from './SkillSidebar';

export interface SkillStructure {
  hasScripts?: boolean;
  hasReferences?: boolean;
  hasAssets?: boolean;
  scriptFiles?: string[];
  referenceFiles?: string[];
  assetFiles?: string[];
}

export interface SkillMarkdownProps {
  /** Raw SKILL.md content with frontmatter */
  content: string;
  /** Theme object for styling */
  theme: Theme;
  /** Optional class name for styling */
  className?: string;
  /** Optional callback when skill is parsed */
  onParsed?: (skill: PartialParsedSkill) => void;
  /** Optional callback when parsing has warnings */
  onWarnings?: (warnings: ValidationWarning[]) => void;
  /** Show raw content on parse error instead of error message */
  showRawOnError?: boolean;
  /** Container width to pass to IndustryMarkdownSlide (skips ResizeObserver if provided) */
  containerWidth?: number;
  /** Optional skill structure information (scripts, references, assets) */
  structure?: SkillStructure;
  /** Optional full skill object for displaying installation locations */
  skill?: Skill;
}

/**
 * Convert date string to relative time (e.g., "2 days ago", "3 months ago")
 */
const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  } catch {
    return dateString; // Return original string if parsing fails
  }
};

/**
 * Helper to get source badge configuration
 */
const getSourceConfig = (source: SkillSource) => {
  switch (source) {
    case 'global-universal':
      return {
        label: 'Global',
        icon: Globe,
        color: '#7c3aed', // purple
        bgColor: '#7c3aed15',
        borderColor: '#7c3aed30',
      };
    case 'global-claude':
      return {
        label: 'Global Claude',
        icon: Globe,
        color: '#0891b2', // cyan
        bgColor: '#0891b215',
        borderColor: '#0891b230',
      };
    case 'project-universal':
      return {
        label: 'Project',
        icon: Folder,
        color: '#16a34a', // green
        bgColor: '#16a34a15',
        borderColor: '#16a34a30',
      };
    case 'project-claude':
      return {
        label: 'Project Claude',
        icon: Folder,
        color: '#0284c7', // blue
        bgColor: '#0284c715',
        borderColor: '#0284c730',
      };
    case 'project-other':
      return {
        label: 'Project',
        icon: Folder,
        color: '#64748b', // slate
        bgColor: '#64748b15',
        borderColor: '#64748b30',
      };
  }
};

/**
 * Render skill metadata section with support for partial metadata
 */
const SkillMetadataSection: React.FC<{
  metadata: PartialSkillMetadata;
  theme: Theme;
  structure?: SkillStructure;
  skill?: Skill;
}> = ({
  metadata,
  theme,
  structure,
  skill,
}) => {
  const [expandedSections, setExpandedSections] = React.useState<{
    scripts: boolean;
    references: boolean;
    assets: boolean;
  }>({
    scripts: false,
    references: false,
    assets: false,
  });

  const toggleSection = (section: 'scripts' | 'references' | 'assets') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div style={{
      borderBottom: `2px solid ${theme.colors.border}`,
      paddingBottom: theme.space[3],
      marginBottom: theme.space[2],
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.space[2] }}>
          <h1
            style={{
              fontSize: theme.fontSizes[6],
              fontWeight: 700,
              margin: 0,
              color: metadata.name ? theme.colors.text : theme.colors.textSecondary,
              fontFamily: theme.fonts.heading,
            }}
          >
            {metadata.name || '(Unnamed Skill)'}
          </h1>
          {(metadata.metadata?.['last-updated'] || metadata.license) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: theme.space[1], marginLeft: theme.space[3], marginTop: theme.space[1] }}>
              {metadata.metadata?.['last-updated'] && (
                <span
                  style={{
                    fontSize: theme.fontSizes[0],
                    color: theme.colors.textSecondary,
                    fontFamily: theme.fonts.monospace,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatRelativeTime(metadata.metadata['last-updated'])}
                </span>
              )}
              {metadata.license && (
                <span
                  style={{
                    fontSize: theme.fontSizes[1],
                    color: theme.colors.textSecondary,
                    fontFamily: theme.fonts.monospace,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {metadata.license}
                </span>
              )}
            </div>
          )}
        </div>
        {metadata.description ? (
          <p
            style={{
              fontSize: theme.fontSizes[3],
              color: theme.colors.textSecondary,
              margin: 0,
              lineHeight: 1.5,
              fontFamily: theme.fonts.body,
            }}
          >
            {metadata.description}
          </p>
        ) : (
          <p
            style={{
              fontSize: theme.fontSizes[3],
              color: theme.colors.textSecondary,
              margin: 0,
              lineHeight: 1.5,
              fontFamily: theme.fonts.body,
              fontStyle: 'italic',
            }}
          >
            (No description provided)
          </p>
        )}
        {structure && (structure.hasScripts || structure.hasReferences || structure.hasAssets) && (
          <div style={{
            marginTop: theme.space[3],
          }}>
            <div style={{
              display: 'flex',
              gap: theme.space[2],
              flexWrap: 'wrap',
            }}>
              {structure.hasScripts && (
                <button
                  onClick={() => toggleSection('scripts')}
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.background,
                    fontSize: theme.fontSizes[0],
                    fontFamily: theme.fonts.body,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <Code size={14} />
                  <span>Scripts ({structure.scriptFiles?.length || 0})</span>
                  <span style={{ fontSize: '10px' }}>{expandedSections.scripts ? '▼' : '▶'}</span>
                </button>
              )}
              {structure.hasReferences && (
                <button
                  onClick={() => toggleSection('references')}
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    backgroundColor: theme.colors.secondary,
                    color: theme.colors.background,
                    fontSize: theme.fontSizes[0],
                    fontFamily: theme.fonts.body,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <BookOpen size={14} />
                  <span>References ({structure.referenceFiles?.length || 0})</span>
                  <span style={{ fontSize: '10px' }}>{expandedSections.references ? '▼' : '▶'}</span>
                </button>
              )}
              {structure.hasAssets && (
                <button
                  onClick={() => toggleSection('assets')}
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    backgroundColor: theme.colors.accent,
                    color: theme.colors.background,
                    fontSize: theme.fontSizes[0],
                    fontFamily: theme.fonts.body,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <Package size={14} />
                  <span>Assets ({structure.assetFiles?.length || 0})</span>
                  <span style={{ fontSize: '10px' }}>{expandedSections.assets ? '▼' : '▶'}</span>
                </button>
              )}
            </div>

            {/* Expanded file lists */}
            {expandedSections.scripts && structure.scriptFiles && structure.scriptFiles.length > 0 && (
              <div style={{
                marginTop: theme.space[2],
                padding: theme.space[2],
                backgroundColor: `${theme.colors.primary}15`,
                borderRadius: '8px',
                borderLeft: `3px solid ${theme.colors.primary}`,
              }}>
                <div style={{
                  fontSize: theme.fontSizes[0],
                  fontWeight: 600,
                  color: theme.colors.text,
                  marginBottom: theme.space[1],
                  fontFamily: theme.fonts.heading,
                }}>
                  Script Files
                </div>
                <ul style={{
                  margin: 0,
                  paddingLeft: theme.space[3],
                  listStyle: 'none',
                }}>
                  {structure.scriptFiles.map((file, idx) => (
                    <li key={idx} style={{
                      fontSize: theme.fontSizes[1],
                      color: theme.colors.text,
                      fontFamily: theme.fonts.monospace,
                      padding: '2px 0',
                    }}>
                      • {file}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {expandedSections.references && structure.referenceFiles && structure.referenceFiles.length > 0 && (
              <div style={{
                marginTop: theme.space[2],
                padding: theme.space[2],
                backgroundColor: `${theme.colors.secondary}15`,
                borderRadius: '8px',
                borderLeft: `3px solid ${theme.colors.secondary}`,
              }}>
                <div style={{
                  fontSize: theme.fontSizes[0],
                  fontWeight: 600,
                  color: theme.colors.text,
                  marginBottom: theme.space[1],
                  fontFamily: theme.fonts.heading,
                }}>
                  Reference Files
                </div>
                <ul style={{
                  margin: 0,
                  paddingLeft: theme.space[3],
                  listStyle: 'none',
                }}>
                  {structure.referenceFiles.map((file, idx) => (
                    <li key={idx} style={{
                      fontSize: theme.fontSizes[1],
                      color: theme.colors.text,
                      fontFamily: theme.fonts.monospace,
                      padding: '2px 0',
                    }}>
                      • {file}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {expandedSections.assets && structure.assetFiles && structure.assetFiles.length > 0 && (
              <div style={{
                marginTop: theme.space[2],
                padding: theme.space[2],
                backgroundColor: `${theme.colors.accent}15`,
                borderRadius: '8px',
                borderLeft: `3px solid ${theme.colors.accent}`,
              }}>
                <div style={{
                  fontSize: theme.fontSizes[0],
                  fontWeight: 600,
                  color: theme.colors.text,
                  marginBottom: theme.space[1],
                  fontFamily: theme.fonts.heading,
                }}>
                  Asset Files
                </div>
                <ul style={{
                  margin: 0,
                  paddingLeft: theme.space[3],
                  listStyle: 'none',
                }}>
                  {structure.assetFiles.map((file, idx) => (
                    <li key={idx} style={{
                      fontSize: theme.fontSizes[1],
                      color: theme.colors.text,
                      fontFamily: theme.fonts.monospace,
                      padding: '2px 0',
                    }}>
                      • {file}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Installation Locations section */}
        {skill?.installedLocations && skill.installedLocations.length > 1 && (
          <div style={{
            marginTop: theme.space[3],
            paddingTop: theme.space[3],
            borderTop: `1px solid ${theme.colors.border}`,
          }}>
            <div style={{
              fontSize: theme.fontSizes[1],
              fontWeight: 600,
              color: theme.colors.text,
              marginBottom: theme.space[2],
              fontFamily: theme.fonts.heading,
            }}>
              Installed Locations ({skill.installedLocations.length})
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.space[2],
            }}>
              {skill.installedLocations.map((location, idx) => {
                const isPrimary = location.path === skill.path;
                const sourceConfig = getSourceConfig(location.source);

                return (
                  <div
                    key={idx}
                    style={{
                      padding: theme.space[2],
                      backgroundColor: isPrimary
                        ? `${theme.colors.primary}08`
                        : theme.colors.backgroundSecondary,
                      borderRadius: '6px',
                      border: `1px solid ${isPrimary
                        ? theme.colors.primary + '40'
                        : theme.colors.border}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: theme.space[1],
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.space[2] }}>
                      {/* Source badge */}
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 6px',
                          borderRadius: theme.radii[1],
                          backgroundColor: sourceConfig.bgColor,
                          border: `1px solid ${sourceConfig.borderColor}`,
                          fontSize: theme.fontSizes[0],
                          color: sourceConfig.color,
                          fontWeight: 500,
                        }}
                      >
                        <sourceConfig.icon size={10} />
                        <span>{sourceConfig.label}</span>
                      </div>

                      {/* Primary indicator */}
                      {isPrimary && (
                        <span style={{
                          fontSize: theme.fontSizes[0],
                          color: theme.colors.primary,
                          fontWeight: 600,
                          fontFamily: theme.fonts.body,
                        }}>
                          (Active)
                        </span>
                      )}
                    </div>

                    {/* Path */}
                    <div style={{
                      fontSize: theme.fontSizes[0],
                      color: theme.colors.textSecondary,
                      fontFamily: theme.fonts.monospace,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {location.path}
                    </div>

                    {/* Metadata info if available */}
                    {location.metadata?.installedAt && (
                      <div style={{
                        fontSize: theme.fontSizes[0],
                        color: theme.colors.textMuted,
                        fontFamily: theme.fonts.body,
                      }}>
                        Installed: {formatRelativeTime(location.metadata.installedAt)}
                      </div>
                    )}

                    {/* SHA if different from primary */}
                    {location.metadata?.sha && skill.metadata?.sha &&
                     location.metadata.sha !== skill.metadata.sha && (
                      <div style={{
                        fontSize: theme.fontSizes[0],
                        color: '#f59e0b', // warning color
                        fontFamily: theme.fonts.monospace,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        <AlertTriangle size={10} />
                        <span>Different version (SHA: {location.metadata.sha.substring(0, 7)})</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </div>
  );
};

/**
 * SkillMarkdown component
 *
 * Renders Agent Skills markdown with frontmatter parsing
 *
 * @example
 * ```tsx
 * <SkillMarkdown
 *   content={skillContent}
 *   onParsed={(skill) => console.log('Parsed:', skill.metadata.name)}
 * />
 * ```
 */
export const SkillMarkdown: React.FC<SkillMarkdownProps> = ({
  content,
  theme,
  className = '',
  onParsed,
  onWarnings,
  showRawOnError = false,
  containerWidth,
  structure,
  skill,
}) => {
  const [parsed, setParsed] = React.useState<PartialParsedSkill | null>(null);
  const [headers, setHeaders] = React.useState<MarkdownHeader[]>([]);

  React.useEffect(() => {
    const skill = parseSkillMarkdownGraceful(content);
    setParsed(skill);
    onParsed?.(skill);
    if (skill.warnings.length > 0) {
      onWarnings?.(skill.warnings);
    }

    // Extract headers for table of contents
    const extractedHeaders = extractHeaders(skill.body);
    setHeaders(extractedHeaders);
  }, [content, onParsed, onWarnings]);

  // Safety check for theme
  if (!theme || !theme.space) {
    return (
      <div className={className} style={{ width: '100%', height: '100%' }}>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#856404' }}>
          Error: Theme not available. Wrap component in ThemeProvider.
        </div>
      </div>
    );
  }

  if (!parsed) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          padding: theme.space[4],
          color: theme.colors.textSecondary,
          fontStyle: 'italic',
          background: theme.colors.background,
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.colors.background,
      }}
    >
      <div style={{ padding: theme.space[3], paddingBottom: 0 }}>
        <SkillMetadataSection metadata={parsed.metadata} theme={theme} structure={structure} skill={skill} />
      </div>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <SkillSidebar
          headers={headers}
          metadata={parsed.metadata}
          theme={theme}
        />
        <div style={{ flex: 1, overflow: 'auto', padding: theme.space[3], paddingTop: 0 }}>
          <IndustryMarkdownSlide
            content={parsed.body}
            theme={theme}
            slideIdPrefix="skill-body"
            slideIndex={0}
            isVisible={true}
            containerWidth={containerWidth}
          />
        </div>
      </div>
    </div>
  );
};

export default SkillMarkdown;
