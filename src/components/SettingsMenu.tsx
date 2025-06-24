import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

interface SettingsMenuProps {
  onClose: () => void;
}

export default function SettingsMenu({ onClose }: SettingsMenuProps) {
  const { settings, updateSettings } = useSettings();

  const handleSettingChange = (key: string, value: any) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="gb-modal">
      <div className="gb-modal-content" style={{
        background: '#9BBB0F',
        border: '4px solid #0F380F',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          borderBottom: '2px solid #0F380F',
          paddingBottom: '16px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#0F380F',
            margin: 0,
            textTransform: 'uppercase',
            fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace"
          }}>
            Settings
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              color: '#0F380F',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ✕
          </button>
        </div>

        {/* Settings Content */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Display Settings */}
          <div style={{
            background: '#8BAC0F',
            border: '2px solid #0F380F',
            padding: '16px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#0F380F',
              margin: '0 0 16px 0',
              textTransform: 'uppercase'
            }}>
              Display
            </h3>
            
            {/* CRT Effect Toggle */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <label style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#0F380F'
              }}>
                CRT Screen Effect
              </label>
              <button
                onClick={() => handleSettingChange('crtEffect', !settings.crtEffect)}
                style={{
                  background: settings.crtEffect ? '#0F380F' : '#9BBB0F',
                  color: settings.crtEffect ? '#9BBB0F' : '#0F380F',
                  border: '2px solid #0F380F',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {settings.crtEffect ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Black/White Mode */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <label style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#0F380F'
              }}>
                Black & White Mode
              </label>
              <button
                onClick={() => handleSettingChange('blackWhiteMode', !settings.blackWhiteMode)}
                style={{
                  background: settings.blackWhiteMode ? '#0F380F' : '#9BBB0F',
                  color: settings.blackWhiteMode ? '#9BBB0F' : '#0F380F',
                  border: '2px solid #0F380F',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {settings.blackWhiteMode ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Gameplay Settings */}
          <div style={{
            background: '#8BAC0F',
            border: '2px solid #0F380F',
            padding: '16px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#0F380F',
              margin: '0 0 16px 0',
              textTransform: 'uppercase'
            }}>
              Gameplay
            </h3>
            
            {/* Animations Toggle */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <label style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#0F380F'
              }}>
                Animations
              </label>
              <button
                onClick={() => handleSettingChange('animations', !settings.animations)}
                style={{
                  background: settings.animations ? '#0F380F' : '#9BBB0F',
                  color: settings.animations ? '#9BBB0F' : '#0F380F',
                  border: '2px solid #0F380F',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {settings.animations ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Difficulty Selector */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <label style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#0F380F'
              }}>
                Default Difficulty
              </label>
              <select
                value={settings.difficulty}
                onChange={(e) => handleSettingChange('difficulty', e.target.value)}
                style={{
                  background: '#9BBB0F',
                  color: '#0F380F',
                  border: '2px solid #0F380F',
                  padding: '6px 8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace"
                }}
              >
                <option value="apprentice">Apprentice</option>
                <option value="scholar">Scholar</option>
                <option value="expert">Expert</option>
                <option value="master">Master</option>
                <option value="grandmaster">Grandmaster</option>
              </select>
            </div>

            {/* Auto-Save Toggle */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <label style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#0F380F'
              }}>
                Auto-Save Progress
              </label>
              <button
                onClick={() => handleSettingChange('autoSave', !settings.autoSave)}
                style={{
                  background: settings.autoSave ? '#0F380F' : '#9BBB0F',
                  color: settings.autoSave ? '#9BBB0F' : '#0F380F',
                  border: '2px solid #0F380F',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {settings.autoSave ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Audio Settings */}
          <div style={{
            background: '#8BAC0F',
            border: '2px solid #0F380F',
            padding: '16px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#0F380F',
              margin: '0 0 16px 0',
              textTransform: 'uppercase'
            }}>
              Audio
            </h3>
            
            {/* Sound Effects */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <label style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#0F380F'
              }}>
                Sound Effects
              </label>
              <button
                onClick={() => handleSettingChange('soundEffects', !settings.soundEffects)}
                style={{
                  background: settings.soundEffects ? '#0F380F' : '#9BBB0F',
                  color: settings.soundEffects ? '#9BBB0F' : '#0F380F',
                  border: '2px solid #0F380F',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {settings.soundEffects ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Background Music */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <label style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#0F380F'
              }}>
                Background Music
              </label>
              <button
                onClick={() => handleSettingChange('backgroundMusic', !settings.backgroundMusic)}
                style={{
                  background: settings.backgroundMusic ? '#0F380F' : '#9BBB0F',
                  color: settings.backgroundMusic ? '#9BBB0F' : '#0F380F',
                  border: '2px solid #0F380F',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {settings.backgroundMusic ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Fun Tweaks */}
          <div style={{
            background: '#8BAC0F',
            border: '2px solid #0F380F',
            padding: '16px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#0F380F',
              margin: '0 0 16px 0',
              textTransform: 'uppercase'
            }}>
              Fun Tweaks
            </h3>
            
            {/* Retro Mode */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <label style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#0F380F'
              }}>
                Retro Pixel Mode
              </label>
              <button
                onClick={() => handleSettingChange('retroMode', !settings.retroMode)}
                style={{
                  background: settings.retroMode ? '#0F380F' : '#9BBB0F',
                  color: settings.retroMode ? '#9BBB0F' : '#0F380F',
                  border: '2px solid #0F380F',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {settings.retroMode ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Screen Shake */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <label style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#0F380F'
              }}>
                Screen Shake Effects
              </label>
              <button
                onClick={() => handleSettingChange('screenShake', !settings.screenShake)}
                style={{
                  background: settings.screenShake ? '#0F380F' : '#9BBB0F',
                  color: settings.screenShake ? '#9BBB0F' : '#0F380F',
                  border: '2px solid #0F380F',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {settings.screenShake ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          marginTop: '24px',
          borderTop: '2px solid #0F380F',
          paddingTop: '16px'
        }}>
          <button
            onClick={() => {
              // Reset to defaults
              updateSettings({
                crtEffect: true,
                blackWhiteMode: false,
                animations: true,
                difficulty: 'apprentice',
                autoSave: true,
                soundEffects: true,
                backgroundMusic: false,
                retroMode: false,
                screenShake: true
              });
            }}
            className="gb-button"
            style={{
              background: '#8BAC0F',
              color: '#0F380F',
              border: '2px solid #0F380F',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Reset Defaults
          </button>
          
          <button
            onClick={onClose}
            className="gb-button"
            style={{
              background: '#0F380F',
              color: '#9BBB0F',
              border: '2px solid #0F380F',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 