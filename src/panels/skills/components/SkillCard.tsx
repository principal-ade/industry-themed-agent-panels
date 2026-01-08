import React from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { FileText, ChevronRight, Code, BookOpen, Package } from 'lucide-react';
import type { Skill } from '../hooks/useSkillsData';

interface SkillCardProps {
  skill: Skill;
  onClick?: (skill: Skill) => void;
  isSelected?: boolean;
}

/**
 * SkillCard - Displays a single skill with its metadata
 */
export const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  onClick,
  isSelected = false,
}) => {
  const { theme } = useTheme();

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
      {/* Header with icon and name */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: theme.radii[1],
              background: `${theme.colors.primary}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileText size={20} color={theme.colors.primary} />
          </div>
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
        </div>
        {onClick && (
          <ChevronRight
            size={18}
            color={theme.colors.textSecondary}
            style={{ flexShrink: 0 }}
          />
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

      {/* Structure indicators */}
      {(skill.hasScripts || skill.hasReferences || skill.hasAssets) && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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

      {/* Path badge */}
      <div
        style={{
          fontSize: theme.fontSizes[0],
          color: theme.colors.textMuted,
          fontFamily: theme.fonts.monospace,
          background: theme.colors.backgroundSecondary,
          padding: '4px 8px',
          borderRadius: theme.radii[1],
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={skill.path}
      >
        {skill.path}
      </div>
    </div>
  );
};
