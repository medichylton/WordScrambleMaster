import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

interface SettingsMenuProps {
  onClose: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ onClose }) => {
  const { settings, updateSetting, resetSettings } = useSettings();

  const SettingToggle: React.FC<{
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
    description?: string;
  }> = ({ label, value, onChange, description }) => (
    <div style={{ marginBottom: '16px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4px'
      }}>
        <span style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: 'var(--color-text)',
          fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace"
        }}>
          {label}
        </span>
        <button
          onClick={() => onChange(!value)}
          style={{
            width: '40px',
            height: '20px',
            background: value ? 'var(--color-accent)' : 'var(--color-bg)',
            border: '2px solid var(--color-text)',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          <div style={{
            width: '16px',
            height: '16px',
            background: 'var(--color-text)',
            position: 'absolute',
            top: '0px',
            left: value ? '20px' : '0px',
            transition: 'left 0.2s ease'
          }} />
        </button>
      </div>
      {description && (
        <div style={{
          fontSize: '11px',
          color: 'var(--color-accent)',
          fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace"
        }}>
          {description}
        </div>
      )}
    </div>
  );

  const SettingSelect: React.FC<{
    label: string;
    value: string;
    options: Array<{ value: string; label: string; description?: string }>;
    onChange: (value: string) => void;
  }> = ({ label, value, options, onChange }) => (
    <div style={{ marginBottom: '16px' }}>
      <div style={{
        fontSize: '14px',
        fontWeight: 'bold',
        color: 'var(--color-text)',
        marginBottom: '8px',
        fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace"
      }}>
        {label}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '8px',
          background: 'var(--color-bg)',
          color: 'var(--color-text)',
          border: '2px solid var(--color-text)',
          fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
          fontSize: '12px'
        }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        background: 'var(--color-bg)',
        border: '3px solid var(--color-text)',
        padding: '20px',
        width: '100%'
      }}>
        <h2 style={{
          fontSize: '18px',
          marginBottom: '20px',
          textAlign: 'center',
          color: 'var(--color-text)',
          fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          [*] SETTINGS MENU
        </h2>

        {/* Visual Settings Section */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '16px',
            marginBottom: '12px',
            color: 'var(--color-accent)',
            fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
            fontWeight: 'bold',
            textTransform: 'uppercase',
            borderBottom: '2px solid var(--color-text)',
            paddingBottom: '4px'
          }}>
            VISUAL SETTINGS
          </h3>
          
          <SettingToggle
            label="CRT Effect"
            value={settings.crtEffect}
            onChange={(value) => updateSetting('crtEffect', value)}
            description="Enable authentic CRT screen effect"
          />
          
          <SettingToggle
            label="Animations"
            value={settings.animations}
            onChange={(value) => updateSetting('animations', value)}
            description="Enable smooth animations and transitions"
          />
          
          <SettingToggle
            label="Scanlines"
            value={settings.scanlines}
            onChange={(value) => updateSetting('scanlines', value)}
            description="Add retro scanline effect"
          />
          
          <SettingToggle
            label="Pixel Perfect"
            value={settings.pixelPerfect}
            onChange={(value) => updateSetting('pixelPerfect', value)}
            description="Enable pixel-perfect rendering"
          />
          
          <SettingSelect
            label="Color Scheme"
            value={settings.colorScheme}
            options={[
              { value: 'gameboy', label: 'Game Boy Green', description: 'Classic green palette' },
              { value: 'monochrome', label: 'Black & White', description: 'Clean monochrome theme' }
            ]}
            onChange={(value) => updateSetting('colorScheme', value as 'gameboy' | 'monochrome')}
          />
        </div>

        {/* Fun Tweaks Section */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '16px',
            marginBottom: '12px',
            color: 'var(--color-accent)',
            fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
            fontWeight: 'bold',
            textTransform: 'uppercase',
            borderBottom: '2px solid var(--color-text)',
            paddingBottom: '4px'
          }}>
            FUN TWEAKS
          </h3>
          
          <SettingToggle
            label="Flicker Effect"
            value={settings.flicker}
            onChange={(value) => updateSetting('flicker', value)}
            description="Add subtle screen flicker"
          />
          
          <SettingToggle
            label="Glitch Effect"
            value={settings.glitchEffect}
            onChange={(value) => updateSetting('glitchEffect', value)}
            description="Random glitch effects"
          />
          
          <SettingToggle
            label="Retro Mode"
            value={settings.retroMode}
            onChange={(value) => updateSetting('retroMode', value)}
            description="Ultra-authentic retro experience"
          />
        </div>

        {/* Gameplay Settings Section */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '16px',
            marginBottom: '12px',
            color: 'var(--color-accent)',
            fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
            fontWeight: 'bold',
            textTransform: 'uppercase',
            borderBottom: '2px solid var(--color-text)',
            paddingBottom: '4px'
          }}>
            GAMEPLAY SETTINGS
          </h3>
          
          <SettingSelect
            label="Default Difficulty"
            value={settings.difficulty}
            options={[
              { value: 'apprentice', label: 'Apprentice (1x multiplier)' },
              { value: 'scholar', label: 'Scholar (1.3x multiplier)' },
              { value: 'expert', label: 'Expert (1.6x multiplier)' },
              { value: 'master', label: 'Master (2.0x multiplier)' },
              { value: 'grandmaster', label: 'Grandmaster (2.5x multiplier)' }
            ]}
            onChange={(value) => updateSetting('difficulty', value as any)}
          />
        </div>

        {/* Audio Settings Section */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '16px',
            marginBottom: '12px',
            color: 'var(--color-accent)',
            fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
            fontWeight: 'bold',
            textTransform: 'uppercase',
            borderBottom: '2px solid var(--color-text)',
            paddingBottom: '4px'
          }}>
            AUDIO SETTINGS
          </h3>
          
          <SettingToggle
            label="Sound Effects"
            value={settings.soundEnabled}
            onChange={(value) => updateSetting('soundEnabled', value)}
            description="Enable game sound effects"
          />
          
          <SettingToggle
            label="Background Music"
            value={settings.musicEnabled}
            onChange={(value) => updateSetting('musicEnabled', value)}
            description="Enable background music"
          />
        </div>

        {/* Accessibility Section */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '16px',
            marginBottom: '12px',
            color: 'var(--color-accent)',
            fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
            fontWeight: 'bold',
            textTransform: 'uppercase',
            borderBottom: '2px solid var(--color-text)',
            paddingBottom: '4px'
          }}>
            ACCESSIBILITY
          </h3>
          
          <SettingToggle
            label="High Contrast"
            value={settings.highContrast}
            onChange={(value) => updateSetting('highContrast', value)}
            description="Enhanced contrast for better visibility"
          />
          
          <SettingToggle
            label="Large Text"
            value={settings.largeText}
            onChange={(value) => updateSetting('largeText', value)}
            description="Increase text size by 20%"
          />
          
          <SettingToggle
            label="Reduced Motion"
            value={settings.reducedMotion}
            onChange={(value) => updateSetting('reducedMotion', value)}
            description="Disable animations for motion sensitivity"
          />
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '20px'
        }}>
          <button
            onClick={resetSettings}
            className="gb-button"
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '14px',
              background: 'var(--color-accent)',
              color: 'var(--color-bg)',
              border: '3px solid var(--color-text)',
              fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
              fontWeight: 'bold',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            [R] RESET
          </button>
          
          <button
            onClick={onClose}
            className="gb-button"
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '14px',
              background: 'var(--color-accent)',
              color: 'var(--color-bg)',
              border: '3px solid var(--color-text)',
              fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
              fontWeight: 'bold',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            [B] BACK
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu; 