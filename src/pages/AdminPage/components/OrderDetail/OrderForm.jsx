import React from "react";
import {
  FULFILLMENT_OPTIONS,
  NOTE_TEMPLATES,
  NOTE_MAX_LENGTH,
  TRACKING_CARRIER_OPTIONS,
} from "../../adminConstants";
import { formatDateTime } from "../../adminUtils";

function OrderForm({
  order,
  editState,
  saveStatus,
  hasChanges,
  isBackwardStatus,
  onSave,
  onReset,
}) {
  const {
    status,
    note,
    tracking,
    trackingCarrier,
    setStatus,
    setNote,
    setTracking,
    setTrackingCarrier,
  } = editState;

  const { loading: saveLoading, error: saveError } = saveStatus;

  const handleNoteTemplate = (template) => {
    setNote((prev) => {
      const trimmed = prev.trim();
      let nextValue = "";
      if (!trimmed) {
        nextValue = template;
      } else if (trimmed.includes(template)) {
        return prev;
      } else {
        nextValue = `${trimmed}\n${template}`;
      }
      if (nextValue.length > NOTE_MAX_LENGTH) {
        return nextValue.slice(0, NOTE_MAX_LENGTH);
      }
      return nextValue;
    });
  };

  return (
    <div className="admin-card admin-form-card">
      <form className="admin-fulfillment-form" onSubmit={onSave}>
        <div className="admin-form-header">
          <div>
            <h3>Uppdatera status</h3>
            <p className="admin-muted">
              {order.fulfillmentUpdatedAt
                ? `Senast uppdaterad ${formatDateTime(
                    order.fulfillmentUpdatedAt
                  )}`
                : "Ingen uppdatering registrerad ännu."}
            </p>
          </div>
          {hasChanges && (
            <span className="admin-form-badge">Osparade ändringar</span>
          )}
        </div>

        {isBackwardStatus && (
          <p className="admin-warning">
            Du går tillbaka i status. Dubbelkolla att detta verkligen stämmer
            innan du sparar.
          </p>
        )}

        <div className="admin-form-row">
          <label className="admin-label" htmlFor="status">
            Fulfillment
          </label>
          <select
            id="status"
            className="admin-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {FULFILLMENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="admin-status-quick">
            {FULFILLMENT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`admin-status-btn ${
                  status === option.value ? "active" : ""
                }`}
                onClick={() => setStatus(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-form-row">
          <label className="admin-label" htmlFor="tracking">
            Spårningsnummer
          </label>
          <input
            id="tracking"
            type="text"
            className="admin-input"
            value={tracking}
            onChange={(event) => setTracking(event.target.value)}
            placeholder="T.ex. SE123456789"
          />
        </div>

        <div className="admin-form-row">
          <label className="admin-label" htmlFor="carrier">
            Transportör
          </label>
          <select
            id="carrier"
            className="admin-select"
            value={trackingCarrier}
            onChange={(event) => setTrackingCarrier(event.target.value)}
          >
            {TRACKING_CARRIER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-form-row">
          <label className="admin-label" htmlFor="note">
            Intern anteckning
          </label>
          <div className="admin-note-templates">
            {NOTE_TEMPLATES.map((template) => (
              <button
                key={template}
                type="button"
                className="admin-chip-btn"
                onClick={() => handleNoteTemplate(template)}
              >
                + {template}
              </button>
            ))}
          </div>
          <textarea
            id="note"
            className="admin-textarea"
            rows={4}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={NOTE_MAX_LENGTH}
            placeholder="Skriv en anteckning..."
          />
          <p className="admin-hint">Max {NOTE_MAX_LENGTH} tecken.</p>
        </div>

        {saveError && <p className="admin-error">{saveError}</p>}

        <div className="admin-form-actions">
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={onReset}
            disabled={!hasChanges || saveLoading}
          >
            Återställ
          </button>
          <button
            type="submit"
            className="admin-btn-primary"
            disabled={!hasChanges || saveLoading}
          >
            {saveLoading ? "Sparar..." : "Spara ändringar"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default OrderForm;
