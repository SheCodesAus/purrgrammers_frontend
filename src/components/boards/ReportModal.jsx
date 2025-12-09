import { useState, useEffect } from "react";
import getReport from "../../api/get-report";
import "./ReportModal.css";

function ReportModal({ boardId, token, onClose }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const data = await getReport(boardId, token);
        setReport(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [boardId, token]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="report-modal-overlay" onClick={handleOverlayClick}>
      <div className="report-modal">
        <div className="report-modal-header">
          <h2>Board Report</h2>
          <button className="report-modal-close" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        {loading && (
          <div className="report-loading">
            <div className="report-loading-spinner"></div>
            <p>Generating report...</p>
          </div>
        )}

        {error && (
          <div className="report-modal-content">
            <div className="report-error">
              <span className="material-icons">error_outline</span>
              <h3>Unable to generate report</h3>
              <p>The report feature is temporarily unavailable. Please try again later or contact support if the issue persists.</p>
              <button className="report-error-btn" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}

        {report && !loading && (
          <div className="report-modal-content">
            {/* Summary Stats */}
            <div className="report-summary-stats">
              <div className="report-stat-card">
                <div className="report-stat-value">{report.board_summary?.total_cards || 0}</div>
                <div className="report-stat-label">Cards</div>
              </div>
              <div className="report-stat-card">
                <div className="report-stat-value">{report.board_summary?.total_votes || 0}</div>
                <div className="report-stat-label">Votes</div>
              </div>
              <div className="report-stat-card">
                <div className="report-stat-value">{report.board_summary?.total_participants || 0}</div>
                <div className="report-stat-label">Participants</div>
              </div>
            </div>

            {/* Columns & Tags */}
            <div className="report-grid">
              <div className="report-section">
                <h3>Columns</h3>
                {report.board_summary?.columns?.length > 0 ? (
                  <ul className="report-list">
                    {report.board_summary.columns.map((col, idx) => (
                      <li key={idx}>
                        <span>{col.title}</span>
                        <span className="report-list-count">{col.card_count}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="report-empty">No columns</p>
                )}
              </div>

              <div className="report-section">
                <h3>Tags</h3>
                {report.tag_summary?.length > 0 ? (
                  <ul className="report-list">
                    {report.tag_summary.map((tag, idx) => (
                      <li key={idx}>
                        <span>{tag.tag}</span>
                        <span className="report-list-count">{tag.card_count}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="report-empty">No tags used</p>
                )}
              </div>
            </div>

            {/* Top Voted Cards */}
            <div className="report-section">
              <h3>Top Voted Cards</h3>
              {report.top_voted_cards?.length > 0 ? (
                <ul className="top-voted-list">
                  {report.top_voted_cards.map((card, idx) => (
                    <li key={idx} className="top-voted-item">
                      <span className="top-voted-rank">{idx + 1}</span>
                      <div className="top-voted-content">
                        <div className="top-voted-text">{card.content}</div>
                        <div className="top-voted-meta">
                          <span className="top-voted-column">{card.column}</span>
                          {card.tags?.map((tag, tagIdx) => (
                            <span key={tagIdx} className="top-voted-tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="report-empty">No votes yet</p>
              )}
            </div>

            {/* User Engagement */}
            <div className="report-section">
              <h3>User Engagement</h3>
              {report.user_engagement?.length > 0 ? (
                <ul className="engagement-list">
                  {report.user_engagement.map((user, idx) => (
                    <li key={idx} className="engagement-item">
                      <span>{user.user}</span>
                      <div className="engagement-stats">
                        <span className="engagement-stat">
                          <span>{user.cards_created}</span> cards
                        </span>
                        <span className="engagement-stat">
                          <span>{user.votes_cast}</span> votes
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="report-empty">No user activity</p>
              )}
            </div>

            {/* Action Items */}
            <div className="report-section">
              <h3>Action Items</h3>
              {report.action_items?.total > 0 ? (
                <>
                  <div className="action-items-summary">
                    <div className="action-stat">
                      <div className="action-stat-value total">{report.action_items.total}</div>
                      <div className="action-stat-label">Total</div>
                    </div>
                    <div className="action-stat">
                      <div className="action-stat-value pending">{report.action_items.todo || 0}</div>
                      <div className="action-stat-label">To Do</div>
                    </div>
                    <div className="action-stat">
                      <div className="action-stat-value in-progress">{report.action_items.in_progress || 0}</div>
                      <div className="action-stat-label">In Progress</div>
                    </div>
                    <div className="action-stat">
                      <div className="action-stat-value completed">{report.action_items.completed || 0}</div>
                      <div className="action-stat-label">Completed</div>
                    </div>
                  </div>
                  {report.action_items.items?.length > 0 && (
                    <ul className="action-items-list">
                      {report.action_items.items.map((item, idx) => (
                        <li key={idx} className="action-item-row">
                          <span className="action-item-title">{item.content}</span>
                          <div className="action-item-meta">
                            <span className={`action-status ${item.status}`}>
                              {item.status.replace('_', ' ')}
                            </span>
                            {item.assignee && (
                              <span className="action-assignee">@{item.assignee}</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <p className="report-empty">No action items</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportModal;
