import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

export function ScrollControls() {
  const [scrollPosition, setScrollPosition] = useState("top");
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    let frameId;

    const updateScrollState = () => {
      cancelAnimationFrame(frameId);

      frameId = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const viewportHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        const maxScroll = Math.max(0, documentHeight - viewportHeight);

        setCanScroll(maxScroll > 10);

        if (scrollTop <= 10) {
          setScrollPosition("top");
        } else if (maxScroll - scrollTop <= 10) {
          setScrollPosition("bottom");
        } else {
          setScrollPosition("middle");
        }
      });
    };

    updateScrollState();

    window.addEventListener("scroll", updateScrollState, {
      passive: true,
    });

    window.addEventListener("resize", updateScrollState);

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(document.documentElement);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
      observer.disconnect();
    };
  }, []);

  if (!canScroll) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col gap-2 md:bottom-6 md:right-6">
      {scrollPosition !== "bottom" && (
        <button
          type="button"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
          title="Scroll to bottom"
          className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition-colors hover:bg-muted"
        >
          <Icon icon="solar:arrow-down-outline" className="size-6" />
        </button>
      )}

      {scrollPosition !== "top" && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          title="Scroll to top"
          className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition-colors hover:bg-muted"
        >
          <Icon icon="solar:arrow-up-outline" className="size-6" />
        </button>
      )}
    </div>
  );
}
