import { useEffect, useState } from "react";

function clockLabel(now: Date): string {
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutes} ${hours < 12 ? "AM" : "PM"}`;
}

/** A wall clock that shows the device's real time. */
export function KitchenClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 10_000);
    return () => window.clearInterval(id);
  }, []);

  const minutes = now.getMinutes();
  const hourAngle = ((now.getHours() % 12) + minutes / 60) * 30;
  const minuteAngle = minutes * 6;

  return (
    <div className="kitchen-clock" role="img" aria-label={`Clock, ${clockLabel(now)}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className="kitchen-clock__rim" cx="50" cy="50" r="47" />
        <circle className="kitchen-clock__face" cx="50" cy="50" r="41" />
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={i}
            className="kitchen-clock__tick"
            x1="50"
            y1="13"
            x2="50"
            y2={i % 3 === 0 ? 20 : 17}
            transform={`rotate(${i * 30} 50 50)`}
          />
        ))}
        <line
          className="kitchen-clock__hour"
          x1="50"
          y1="50"
          x2="50"
          y2="29"
          transform={`rotate(${hourAngle} 50 50)`}
        />
        <line
          className="kitchen-clock__minute"
          x1="50"
          y1="50"
          x2="50"
          y2="19"
          transform={`rotate(${minuteAngle} 50 50)`}
        />
        <circle className="kitchen-clock__pin" cx="50" cy="50" r="3" />
      </svg>
    </div>
  );
}
