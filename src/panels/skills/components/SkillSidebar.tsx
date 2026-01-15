/**
 * SkillSidebar component with tabbed interface for TOC and Metadata
 */
import { Theme } from '@principal-ade/industry-theme';
import { type PartialSkillMetadata } from '@principal-ade/markdown-utils';
import React from 'react';

import type { MarkdownHeader } from '../utils/extractHeaders';
import { TableOfContents } from './TableOfContents';

type SidebarTab = 'toc' | 'metadata';

export interface SkillSidebarProps {
  /** Array of headers for table of contents */
  headers: MarkdownHeader[];
  /** Skill metadata */
  metadata: PartialSkillMetadata;
  /** Theme object for styling */
  theme: Theme;
  /** Optional class name for styling */
  className?: string;
  /** Optional callback when a header is clicked */
  onHeaderClick?: (header: MarkdownHeader) => void;
}

/**
 * SkillSidebar component
 *
 * Renders a tabbed sidebar with Table of Contents and Metadata views
 */
export const SkillSidebar: React.FC<SkillSidebarProps> = ({
  headers,
  metadata,
  theme,
  className = '',
  onHeaderClick,
}) => {
  const [activeTab, setActiveTab] = React.useState<SidebarTab>('toc');

  const hasMetadata =
    metadata.compatibility ||
    (metadata['allowed-tools'] && metadata['allowed-tools'].length > 0) ||
    (metadata.metadata && Object.keys(metadata.metadata).length > 0);

  // If no headers, default to metadata tab
  React.useEffect(() => {
    if (headers.length === 0 && hasMetadata) {
      setActiveTab('metadata');
    }
  }, [headers.length, hasMetadata]);

  // Don't render if we have neither headers nor metadata
  if (headers.length === 0 && !hasMetadata) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        width: '250px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid ${theme.colors.border}`,
      }}
    >
      {/* Tab Headers */}
      <div
        style={{
          display: 'flex',
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.background,
        }}
      >
        {headers.length > 0 && (
          <button
            onClick={() => setActiveTab('toc')}
            style={{
              flex: 1,
              padding: theme.space[2],
              background: activeTab === 'toc' ? theme.colors.background : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'toc'
                ? `2px solid ${theme.colors.primary}`
                : '2px solid transparent',
              color: activeTab === 'toc' ? theme.colors.primary : theme.colors.textSecondary,
              fontFamily: theme.fonts.heading,
              fontSize: theme.fontSizes[1],
              fontWeight: activeTab === 'toc' ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'toc') {
                e.currentTarget.style.color = theme.colors.text;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'toc') {
                e.currentTarget.style.color = theme.colors.textSecondary;
              }
            }}
          >
            Contents
          </button>
        )}
        {hasMetadata && (
          <button
            onClick={() => setActiveTab('metadata')}
            style={{
              flex: 1,
              padding: theme.space[2],
              background: activeTab === 'metadata' ? theme.colors.background : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'metadata'
                ? `2px solid ${theme.colors.primary}`
                : '2px solid transparent',
              color: activeTab === 'metadata' ? theme.colors.primary : theme.colors.textSecondary,
              fontFamily: theme.fonts.heading,
              fontSize: theme.fontSizes[1],
              fontWeight: activeTab === 'metadata' ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'metadata') {
                e.currentTarget.style.color = theme.colors.text;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'metadata') {
                e.currentTarget.style.color = theme.colors.textSecondary;
              }
            }}
          >
            Metadata
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {activeTab === 'toc' && headers.length > 0 && (
          <TableOfContents
            headers={headers}
            theme={theme}
            onHeaderClick={onHeaderClick}
          />
        )}

        {activeTab === 'metadata' && hasMetadata && (
          <div style={{ padding: theme.space[3] }}>
            {metadata.compatibility && (
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
                  {metadata.compatibility}
                </div>
              </div>
            )}

            {metadata['allowed-tools'] && metadata['allowed-tools'].length > 0 && (
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
                  {metadata['allowed-tools'].map((tool, index) => (
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

            {metadata.metadata && Object.keys(metadata.metadata).length > 0 && (
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
                  {Object.entries(metadata.metadata)
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
  );
};

export default SkillSidebar;
