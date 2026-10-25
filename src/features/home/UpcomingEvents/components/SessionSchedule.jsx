import { useState } from "react";
import PropTypes from "prop-types";
import { ChevronDown } from "lucide-react";
import { weekGrid } from "../../../../data/eventSeries.js";
import { useSiteCopy } from "../../../../hooks/usePageCopy.js";
import "./SessionSchedule.css";

// A course longer than this shows its first weeks and folds out the rest.
const VISIBLE_WEEKS = 5;

function Session({ session, label }) {
  const siteCopy = useSiteCopy();
  const state = session.cancelled ? " is-cancelled" : session.isPast ? " is-past" : "";
  return (
    <span className={`upcoming-schedule-session${state}`}>
      <span className="upcoming-schedule-day">{label}</span>
      {session.cancelled ? (
        <span className="upcoming-schedule-time">{siteCopy("ui.cancelled", "Inställt")}</span>
      ) : (
        session.time && <span className="upcoming-schedule-time">{session.time}</span>
      )}
    </span>
  );
}

/** A course's sessions as a small calendar: one column per weekday it meets, one row per week. */
function SessionSchedule({ sessions }) {
  const siteCopy = useSiteCopy();
  const [expanded, setExpanded] = useState(false);
  const upcoming = sessions.some((session) => !session.isPast);
  const { days, weeks: allWeeks } = weekGrid(sessions);
  // Weeks already behind us are gone; this week keeps its earlier sessions, shown as done.
  const weeks = upcoming ? allWeeks.filter((week) => week.cells.flat().some((session) => !session.isPast)) : allWeeks;
  const shown = expanded ? weeks : weeks.slice(0, VISIBLE_WEEKS);
  const toggle = weeks.length > VISIBLE_WEEKS && (
    <button type="button" className="upcoming-schedule-more" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
      {siteCopy("ui.all-sessions")}
      <ChevronDown size={16} aria-hidden="true" />
    </button>
  );

  // One weekday needs no calendar: the dates simply follow each other.
  if (days.length === 1) {
    const list = shown.flatMap((week) => week.cells[0]);
    return (
      <div className="upcoming-schedule">
        <ul className="upcoming-schedule-flow" aria-label={siteCopy("ui.all-sessions")}>
          {list.map((session) => (
            <li key={session.id}>
              <Session session={session} label={session.date} />
            </li>
          ))}
        </ul>
        {toggle}
      </div>
    );
  }

  return (
    <div className="upcoming-schedule">
      <table className="upcoming-schedule-grid">
        <caption className="visually-hidden">{siteCopy("ui.all-sessions")}</caption>
        <thead>
          <tr>
            {days.map((day) => (
              <th key={day} scope="col">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((week) => (
            <tr key={week.id}>
              {week.cells.map((cell, index) => (
                <td key={days[index]}>
                  {cell.map((session) => (
                    <Session key={session.id} session={session} label={session.day} />
                  ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {toggle}
    </div>
  );
}

SessionSchedule.propTypes = {
  sessions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      startAt: PropTypes.string.isRequired,
      date: PropTypes.string,
      day: PropTypes.string,
      time: PropTypes.string,
      isPast: PropTypes.bool,
      cancelled: PropTypes.bool,
    }),
  ).isRequired,
};

export default SessionSchedule;
