import "@/styles/mail-loading.css";
import { useEffect, useState, useRef } from "react";

export default function Loading() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemCount, setItemCount] = useState(10);
  const ITEM_HEIGHT = 70;

  useEffect(() => {
    const resizeHandler = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.offsetHeight;
        const count = Math.floor(containerHeight / ITEM_HEIGHT);
        setItemCount(count);
      }
    };

    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  return (
    <div ref={containerRef} className="skeleton-list">
      {Array.from({ length: itemCount }).map((_, i) => (
        <div key={i} className="skeleton-item">
          <div className="skeleton-avatar" />
          <div className="skeleton-content">
            <div className="skeleton-line full" />
            <div className="skeleton-line short" />
          </div>
        </div>
      ))}
    </div>
  );
}
