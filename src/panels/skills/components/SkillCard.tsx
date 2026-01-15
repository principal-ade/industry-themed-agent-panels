import React from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { Code, BookOpen, Package, Globe, Folder, Github, AlertTriangle } from 'lucide-react';
import type { Skill, SkillSource } from '../hooks/useSkillsData';

interface SkillCardProps {
  skill: Skill;
  onClick?: (skill: Skill) => void;
  isSelected?: boolean;
}

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
 * SkillCard - Displays a single skill with its metadata
 */
export const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  onClick,
  isSelected = false,
}) => {
  const { theme } = useTheme();
  const sourceConfig = getSourceConfig(skill.source);
  const [pathCopied, setPathCopied] = React.useState(false);

  const handleCopyPath = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering card onClick
    try {
      await navigator.clipboard.writeText(skill.path);
      setPathCopied(true);
      setTimeout(() => setPathCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy path:', err);
    }
  };

  return (
    <div
      onClick={() => onClick?.(skill)}
      style={{
        padding: '16px',
        background: isSelected ? `${theme.colors.primary}10` : theme.colors.surface,
        border: `1px solid ${isSelected ? theme.colors.primary : theme.colors.border}`,
        borderRadius: theme.radii[2],
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        ...(isSelected && {
          boxShadow: `0 0 0 1px ${theme.colors.primary}`,
        }),
      }}
      onMouseEnter={(e) => {
        if (onClick && !isSelected) {
          e.currentTarget.style.borderColor = theme.colors.primary + '80';
          e.currentTarget.style.background = theme.colors.backgroundSecondary;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick && !isSelected) {
          e.currentTarget.style.borderColor = theme.colors.border;
          e.currentTarget.style.background = theme.colors.surface;
        }
      }}
    >
      {/* Header with name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
          <h3
            style={{
              margin: 0,
              fontSize: theme.fontSizes[2],
              fontWeight: theme.fontWeights.semibold,
              color: theme.colors.text,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textTransform: 'capitalize',
            }}
          >
            {skill.name}
          </h3>
          {/* Source badge */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
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
                width: 'fit-content',
              }}
              title={`Source: ${skill.source}`}
            >
              <sourceConfig.icon size={10} />
              <span>{sourceConfig.label}</span>
            </div>

            {/* GitHub source badge (if installed from GitHub) */}
            {skill.metadata?.owner && skill.metadata?.repo && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 6px',
                  borderRadius: theme.radii[1],
                  backgroundColor: `${theme.colors.textSecondary}15`,
                  border: `1px solid ${theme.colors.textSecondary}30`,
                  fontSize: theme.fontSizes[0],
                  color: theme.colors.textSecondary,
                  fontWeight: 500,
                  fontFamily: theme.fonts.monospace,
                  width: 'fit-content',
                }}
                title={`From: ${skill.metadata.installedFrom}\nInstalled: ${skill.metadata.installedAt ? new Date(skill.metadata.installedAt).toLocaleString() : 'Unknown'}`}
              >
                <Github size={10} />
                <span>{skill.metadata.owner}/{skill.metadata.repo}</span>
              </div>
            )}

            {/* Frontmatter validation badge */}
            {!skill.frontmatterValidation.isValid && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 6px',
                  borderRadius: theme.radii[1],
                  backgroundColor: '#f59e0b15', // warning amber
                  border: '1px solid #f59e0b30',
                  fontSize: theme.fontSizes[0],
                  color: '#f59e0b',
                  fontWeight: 500,
                  width: 'fit-content',
                }}
                title={skill.frontmatterValidation.errorMessage || 'Invalid frontmatter'}
              >
                <AlertTriangle size={10} />
                <span>
                  {skill.frontmatterValidation.hasStructure
                    ? skill.frontmatterValidation.missingFields.length > 0
                      ? `Missing: ${skill.frontmatterValidation.missingFields.join(', ')}`
                      : 'Invalid Frontmatter'
                    : 'No Frontmatter'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Structure indicators */}
        {(skill.hasScripts || skill.hasReferences || skill.hasAssets) && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flexShrink: 0 }}>
            {skill.hasScripts && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: theme.radii[1],
                  backgroundColor: `${theme.colors.primary}15`,
                  border: `1px solid ${theme.colors.primary}30`,
                  fontSize: theme.fontSizes[0],
                  color: theme.colors.primary,
                  fontWeight: 500,
                }}
                title={`Scripts: ${skill.scriptFiles?.join(', ')}`}
              >
                <Code size={12} />
                <span>{skill.scriptFiles?.length || 0}</span>
              </div>
            )}
            {skill.hasReferences && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: theme.radii[1],
                  backgroundColor: `${theme.colors.secondary}15`,
                  border: `1px solid ${theme.colors.secondary}30`,
                  fontSize: theme.fontSizes[0],
                  color: theme.colors.secondary,
                  fontWeight: 500,
                }}
                title={`References: ${skill.referenceFiles?.join(', ')}`}
              >
                <BookOpen size={12} />
                <span>{skill.referenceFiles?.length || 0}</span>
              </div>
            )}
            {skill.hasAssets && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: theme.radii[1],
                  backgroundColor: `${theme.colors.accent}15`,
                  border: `1px solid ${theme.colors.accent}30`,
                  fontSize: theme.fontSizes[0],
                  color: theme.colors.accent,
                  fontWeight: 500,
                }}
                title={`Assets: ${skill.assetFiles?.join(', ')}`}
              >
                <Package size={12} />
                <span>{skill.assetFiles?.length || 0}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {skill.description && (
        <p
          style={{
            margin: 0,
            fontSize: theme.fontSizes[1],
            color: theme.colors.textSecondary,
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {skill.description}
        </p>
      )}

      {/* Capabilities */}
      {skill.capabilities && skill.capabilities.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {skill.capabilities.map((capability, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              <span
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: theme.colors.primary,
                  marginTop: '7px',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: theme.fontSizes[1],
                  color: theme.colors.textSecondary,
                  lineHeight: '1.4',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {capability}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Path badge */}
      <div
        onClick={handleCopyPath}
        style={{
          fontSize: theme.fontSizes[0],
          color: pathCopied ? theme.colors.success : theme.colors.textMuted,
          fontFamily: theme.fonts.monospace,
          background: pathCopied ? `${theme.colors.success}15` : theme.colors.backgroundSecondary,
          padding: '4px 8px',
          borderRadius: theme.radii[1],
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          border: `1px solid ${pathCopied ? theme.colors.success : 'transparent'}`,
        }}
        title={pathCopied ? 'Copied!' : 'Click to copy path'}
        onMouseEnter={(e) => {
          if (!pathCopied) {
            e.currentTarget.style.background = theme.colors.backgroundTertiary || theme.colors.border;
          }
        }}
        onMouseLeave={(e) => {
          if (!pathCopied) {
            e.currentTarget.style.background = theme.colors.backgroundSecondary;
          }
        }}
      >
        {pathCopied ? 'Copied!' : skill.path}
      </div>
    </div>
  );
};
