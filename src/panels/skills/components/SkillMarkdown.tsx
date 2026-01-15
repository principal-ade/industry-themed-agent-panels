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
import { Code, BookOpen, Package } from 'lucide-react';
import React from 'react';

import { IndustryMarkdownSlide } from 'themed-markdown';

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
 * Render skill metadata section with support for partial metadata
 */
const SkillMetadataSection: React.FC<{
  metadata: PartialSkillMetadata;
  theme: Theme;
  structure?: SkillStructure;
}> = ({
  metadata,
  theme,
  structure,
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
}) => {
  const [parsed, setParsed] = React.useState<PartialParsedSkill | null>(null);

  React.useEffect(() => {
    const skill = parseSkillMarkdownGraceful(content);
    setParsed(skill);
    onParsed?.(skill);
    if (skill.warnings.length > 0) {
      onWarnings?.(skill.warnings);
    }
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
        <SkillMetadataSection metadata={parsed.metadata} theme={theme} structure={structure} />
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: theme.space[3], paddingTop: 0 }}>
        <div style={{ display: 'flex', gap: theme.space[4], alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <IndustryMarkdownSlide
              content={parsed.body}
              theme={theme}
              slideIdPrefix="skill-body"
              slideIndex={0}
              isVisible={true}
              containerWidth={containerWidth}
            />
          </div>
          {(parsed.metadata.compatibility ||
            parsed.metadata['allowed-tools'] ||
            parsed.metadata.metadata) && (
            <div
              style={{
                width: '300px',
                flexShrink: 0,
                padding: theme.space[3],
                background: theme.colors.background,
                position: 'sticky',
                top: theme.space[3],
              }}
            >
              {parsed.metadata.compatibility && (
                <div style={{ marginBottom: theme.space[3] }}>
                  <div
                    style={{
                      fontFamily: theme.fonts.heading,
                      fontWeight: 600,
                      fontSize: theme.fontSizes[0],
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: theme.colors.textSecondary,
                      marginBottom: theme.space[1],
                    }}
                  >
                    Compatibility
                  </div>
                  <div style={{ fontSize: theme.fontSizes[1], color: theme.colors.text, fontFamily: theme.fonts.body }}>
                    {parsed.metadata.compatibility}
                  </div>
                </div>
              )}

              {parsed.metadata['allowed-tools'] && parsed.metadata['allowed-tools'].length > 0 && (
                <div style={{ marginBottom: theme.space[3] }}>
                  <div
                    style={{
                      fontFamily: theme.fonts.heading,
                      fontWeight: 600,
                      fontSize: theme.fontSizes[0],
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: theme.colors.textSecondary,
                      marginBottom: theme.space[1],
                    }}
                  >
                    Allowed Tools
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.space[1] }}>
                    {parsed.metadata['allowed-tools'].map((tool, index) => (
                      <span
                        key={index}
                        style={{
                          display: 'inline-block',
                          paddingTop: theme.space[2],
                          paddingBottom: theme.space[2],
                          paddingLeft: theme.space[3],
                          paddingRight: theme.space[3],
                          background: theme.colors.primary,
                          color: theme.colors.background,
                          borderRadius: '4px',
                          fontSize: theme.fontSizes[0],
                          fontWeight: 500,
                          fontFamily: theme.fonts.monospace,
                        }}
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {parsed.metadata.metadata && Object.keys(parsed.metadata.metadata).length > 0 && (
                <div>
                  <div
                    style={{
                      fontFamily: theme.fonts.heading,
                      fontWeight: 600,
                      fontSize: theme.fontSizes[0],
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: theme.colors.textSecondary,
                      marginBottom: theme.space[1],
                    }}
                  >
                    Metadata
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: theme.space[1] }}>
                    {Object.entries(parsed.metadata.metadata)
                      .filter(([key]) => key !== 'last-updated')
                      .map(([key, value]) => (
                        <div key={key}>
                          <div
                            style={{
                              fontSize: theme.fontSizes[0],
                              fontWeight: 600,
                              color: theme.colors.textSecondary,
                              fontFamily: theme.fonts.body,
                            }}
                          >
                            {key}:
                          </div>
                          <div
                            style={{
                              fontSize: theme.fontSizes[1],
                              color: theme.colors.text,
                              fontFamily: theme.fonts.monospace,
                            }}
                          >
                            {value}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillMarkdown;
