import { useEffect, useRef, useState } from "react";

export default function Counter({ value, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 } // 40% visible triggers animation
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let start = 0;
    const end = parseInt(value);
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutCubic (super smooth)
      const eased = 1 - Math.pow(1 - progress, 3);

      const currentValue = Math.floor(start + (end - start) * eased);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [hasStarted, value, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString("en-US")}
    </span>
  );
}
