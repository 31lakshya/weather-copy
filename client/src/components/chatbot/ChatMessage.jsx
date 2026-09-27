import React, { useState } from 'react';
import {
  CloudSun,
  User,
  AlertTriangle,
  Info,
  Thermometer,
  Cloud,
  Umbrella,
  Sun,
  Wind,
  Shirt,
  Droplet,
  Search,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Trees,
  Home,
  CloudRain,
} from 'lucide-react';

const ICON_MAP = {
  Thermometer,
  Cloud,
  Umbrella,
  Sun,
  Wind,
  Shirt,
  Droplet,
};

/**
 * Format simple markdown text (bold, quotes, bullets) into JSX
 */
function renderFormattedText(text) {
  if (!text) return null;

  const lines = text.split('\n');
  return lines.map((line, lIdx) => {
    // Blockquote
    if (line.startsWith('>')) {
      return (
        <blockquote key={lIdx} className="chat-blockquote">
          {line.replace(/^>\s*/, '')}
        </blockquote>
      );
    }

    // Bullet point
    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      const content = line.trim().replace(/^[•-]\s*/, '');
      return (
        <div key={lIdx} className="chat-bullet">
          <span className="bullet-dot">•</span>
          <span>{renderInlineFormatting(content)}</span>
        </div>
      );
    }

    // Empty line
    if (!line.trim()) {
      return <div key={lIdx} className="chat-spacer" />;
    }

    // Regular line
    return <p key={lIdx} className="chat-paragraph">{renderInlineFormatting(line)}</p>;
  });
}

function renderInlineFormatting(str) {
  // Regex to split by bold **text**
  const parts = str.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, pIdx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function ChatWeatherRiskFilterCard({ card }) {
  const [activeFilter, setActiveFilter] = useState(card.initialFilter || 'all');
  const activities = card.activities || [];

  const atRiskCount = activities.filter((a) => (a.rain ?? 0) > 50).length;
  const outdoorCount = activities.filter((a) => !a.indoor).length;
  const indoorCount = activities.filter((a) => a.indoor).length;
  const allCount = activities.length;

  // Filter activities based on weather risk / indoor vs outdoor.
  // Selecting "At-risk only" shows activities with rain >50% and hides the others.
  const filtered = activities.filter((item) => {
    const rain = item.rain ?? 0;
    if (activeFilter === 'at_risk') return rain > 50;
    if (activeFilter === 'outdoor') return !item.indoor;
    if (activeFilter === 'indoor') return item.indoor;
    return true;
  });

  return (
    <div className="chat-weather-filter-card">
      <div className="chat-filter-header-row">
        <div className="chat-filter-header-left">
          <div className="chat-filter-icon-badge">
            <Search size={15} />
          </div>
          <div>
            <div className="chat-filter-title">Weather-Risk Filtering</div>
            <div className="chat-filter-subtitle">Filter activities based on weather risk / indoor vs outdoor</div>
          </div>
        </div>
        <span className="chat-filter-city-pill">
          <MapPin size={11} />
          <span>{card.city || 'City'}</span>
        </span>
      </div>

      {/* Interactive Filter Buttons */}
      <div className="chat-filter-btn-group">
        <button
          type="button"
          className={`chat-filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          <span>All</span>
          <span className="filter-pill-badge">{allCount}</span>
        </button>

        <button
          type="button"
          className={`chat-filter-pill ${activeFilter === 'outdoor' ? 'active' : ''}`}
          onClick={() => setActiveFilter('outdoor')}
        >
          <Trees size={12} />
          <span>Outdoor</span>
          <span className="filter-pill-badge">{outdoorCount}</span>
        </button>

        <button
          type="button"
          className={`chat-filter-pill ${activeFilter === 'indoor' ? 'active' : ''}`}
          onClick={() => setActiveFilter('indoor')}
        >
          <Home size={12} />
          <span>Indoor</span>
          <span className="filter-pill-badge">{indoorCount}</span>
        </button>

        <button
          type="button"
          className={`chat-filter-pill at-risk-pill ${activeFilter === 'at_risk' ? 'active' : ''}`}
          onClick={() => setActiveFilter('at_risk')}
          title="Shows activities with rain >50% and hides the others"
        >
          <AlertTriangle size={12} />
          <span>At-risk only</span>
          <span className="filter-pill-badge at-risk-badge">{atRiskCount}</span>
        </button>
      </div>

      {/* Notice Banner */}
      {activeFilter === 'at_risk' && (
        <div className="chat-filter-status-banner">
          <AlertCircle size={13} />
          <span>
            Showing <strong>{filtered.length} activities with rain &gt; 50%</strong>. Other activities are hidden.
          </span>
        </div>
      )}

      {/* Activities Grid */}
      <div className="chat-activities-list">
        {filtered.map((item, idx) => {
          const isAtRisk = (item.rain ?? 0) > 50;
          return (
            <div
              key={item.id || idx}
              className={`chat-activity-item ${isAtRisk ? 'item-at-risk' : ''}`}
            >
              <div className="chat-act-header">
                <span className="chat-act-category">{item.category}</span>
                <div className="chat-act-pills">
                  <span className={`chat-act-venue ${item.indoor ? 'venue-indoor' : 'venue-outdoor'}`}>
                    {item.indoor ? '🏠 Indoor' : '🌳 Outdoor'}
                  </span>
                  <span className={`chat-act-risk ${isAtRisk ? 'risk-danger' : 'risk-safe'}`}>
                    {isAtRisk ? <CloudRain size={11} /> : <Sun size={11} />}
                    <span>Rain: {item.rain}% {isAtRisk ? '• At-Risk' : '• Low Risk'}</span>
                  </span>
                </div>
              </div>

              <div className="chat-act-title">{item.title}</div>

              <div className="chat-act-location">
                <MapPin size={11} />
                <span>{item.location}</span>
              </div>

              {item.description && (
                <div className="chat-act-desc">{item.description}</div>
              )}

              {item.rationale && (
                <div className="chat-act-rationale">
                  <div className="rationale-suitability">
                    {isAtRisk ? <AlertTriangle size={12} color="#ef4444" /> : <CheckCircle2 size={12} color="#10b981" />}
                    <span>{item.suitability}</span>
                  </div>
                  <div className="rationale-text">{item.rationale}</div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="chat-filter-empty-state">
            <CheckCircle2 size={18} color="#10b981" />
            <span>
              {activeFilter === 'at_risk'
                ? 'No activities currently have rain > 50%. Weather is clear and favorable!'
                : 'No activities found matching this filter.'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatMessage({ message, onFollowUpClick }) {
  const isBot = message.sender === 'bot';

  return (
    <div className={`chat-message-row ${isBot ? 'bot-row' : 'user-row'}`}>
      <div className="chat-avatar">
        {isBot ? (
          <div className="bot-avatar-badge">
            <CloudSun size={18} className="bot-avatar-icon" />
          </div>
        ) : (
          <div className="user-avatar-badge">
            <User size={16} />
          </div>
        )}
      </div>

      <div className="chat-bubble-container">
        <div className={`chat-bubble ${isBot ? 'bot-bubble' : 'user-bubble'}`}>
          {isBot && message.ageTone && (
            <div className="chat-age-badge-pill">
              {message.ageTone}
            </div>
          )}

          <div className="chat-text-body">
            {renderFormattedText(message.text)}
          </div>

          {/* Optional Rich Cards */}
          {message.cards && message.cards.length > 0 && (
            <div className="chat-cards-container">
              {message.cards.map((card, cIdx) => {
                if (card.type === 'weather_risk_filter') {
                  return <ChatWeatherRiskFilterCard key={cIdx} card={card} />;
                }

                if (card.type === 'metrics') {
                  return (
                    <div key={cIdx} className="chat-metrics-grid">
                      {card.items.map((item, iIdx) => {
                        const IconComponent = item.icon && ICON_MAP[item.icon] ? ICON_MAP[item.icon] : null;
                        return (
                          <div key={iIdx} className="chat-metric-cell">
                            {IconComponent && <IconComponent size={14} className="cell-icon" />}
                            <span className="cell-label">{item.label}</span>
                            <span className="cell-value">{item.value}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                if (card.type === 'alert') {
                  const isDanger = card.severity === 'danger';
                  return (
                    <div
                      key={cIdx}
                      className={`chat-alert-card ${isDanger ? 'alert-danger' : 'alert-warning'}`}
                    >
                      {isDanger ? <AlertTriangle size={18} /> : <Info size={18} />}
                      <div className="chat-alert-content">
                        <div className="chat-alert-title">{card.title}</div>
                        <div className="chat-alert-desc">{card.desc}</div>
                      </div>
                    </div>
                  );
                }

                if (card.type === 'clothing') {
                  return (
                    <div key={cIdx} className="chat-clothing-grid">
                      {card.items.map((item, iIdx) => (
                        <div key={iIdx} className="chat-clothing-cell">
                          <Shirt size={14} className="cell-icon" />
                          <span className="clothing-cell-label">{item.label}:</span>
                          <span className="clothing-cell-val">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  );
                }

                return null;
              })}
            </div>
          )}

          <div className="chat-meta-footer">
            <span className="chat-time">{message.timestamp || ''}</span>
          </div>
        </div>

        {/* Follow-up suggestion buttons */}
        {isBot && message.quickFollowUps && message.quickFollowUps.length > 0 && (
          <div className="chat-followup-chips">
            {message.quickFollowUps.map((prompt, fIdx) => (
              <button
                key={fIdx}
                type="button"
                className="followup-chip-btn"
                onClick={() => onFollowUpClick(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
