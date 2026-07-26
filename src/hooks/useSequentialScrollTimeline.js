import { useEffect, useRef, useState } from "react";

function useSequentialScrollTimeline(stepCount) {
  const timelineRef = useRef(null);
  const [activeSteps, setActiveSteps] = useState(0);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline || stepCount < 1) return undefined;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const mobileLayout = window.matchMedia("(max-width: 767px)");
    let frameId = 0;

    const updateTimeline = () => {
      frameId = 0;

      if (reducedMotion.matches) {
        setActiveSteps(stepCount);
        return;
      }

      const viewportMidpoint = window.innerHeight / 2;
      let nextActiveSteps = 0;

      if (mobileLayout.matches) {
        nextActiveSteps = Array.from(timeline.children).filter(
          (item) => item.getBoundingClientRect().top <= viewportMidpoint
        ).length;
      } else {
        const timelineTop = timeline.getBoundingClientRect().top;
        const firstStepLine = window.innerHeight * 0.72;
        const lastStepLine = viewportMidpoint;
        const progress = Math.min(
          1,
          Math.max(
            0,
            (firstStepLine - timelineTop) / (firstStepLine - lastStepLine)
          )
        );

        if (timelineTop <= firstStepLine) {
          nextActiveSteps = 1 + Math.floor(progress * (stepCount - 1));
        }
      }

      setActiveSteps((current) =>
        current === nextActiveSteps ? current : nextActiveSteps
      );
    };

    const requestUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateTimeline);
    };

    updateTimeline();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    reducedMotion.addEventListener("change", requestUpdate);
    mobileLayout.addEventListener("change", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      reducedMotion.removeEventListener("change", requestUpdate);
      mobileLayout.removeEventListener("change", requestUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [stepCount]);

  const progress =
    activeSteps > 1 && stepCount > 1
      ? (activeSteps - 1) / (stepCount - 1)
      : 0;

  return { timelineRef, activeSteps, progress };
}

export default useSequentialScrollTimeline;
