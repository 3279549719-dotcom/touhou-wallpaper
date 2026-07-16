import { useCallback, useEffect, useState } from "react";
import { strings } from "../../lib/strings";
import { downloadAssets } from "../../services";

interface DownloadScreenProps {
  onComplete: () => void;
}

export function DownloadScreen({ onComplete }: DownloadScreenProps) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({
    completed: 0,
    total: 591,
    currentFile: "",
    phase: "idle",
  });

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    (async () => {
      if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) {
        return;
      }
      const { listen } = await import("@tauri-apps/api/event");
      unlisten = await listen<{
        completed: number;
        total: number;
        current_file: string;
        phase: string;
      }>("download-progress", (event) => {
        const p = event.payload;
        setProgress({
          completed: p.completed,
          total: Math.max(p.total, 1),
          currentFile: p.current_file,
          phase: p.phase,
        });
      });
    })();
    return () => {
      unlisten?.();
    };
  }, []);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    setError(null);
    try {
      await downloadAssets();
      onComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setDownloading(false);
    }
  }, [onComplete]);

  const percent =
    progress.total > 0
      ? Math.min(100, Math.round((progress.completed / progress.total) * 100))
      : 0;

  return (
    <div className="download-screen panel">
      <h1 style={{ marginTop: 0 }}>{strings.windowTitle}</h1>
      <p className="muted">{strings.downloadWelcome}</p>
      <p>{strings.downloadExplain}</p>
      <ul className="download-checklist muted">
        <li>{strings.downloadCheckNetwork}</li>
        <li>{strings.downloadCheckDisk}</li>
        <li>{strings.downloadCheckTime}</li>
      </ul>

      {downloading ? (
        <div className="download-progress">
          <div className="download-progress-bar" style={{ width: `${percent}%` }} />
          <p className="muted">
            {strings.downloadProgress} {percent}% ({progress.completed}/
            {progress.total})
          </p>
          {progress.currentFile ? (
            <p className="muted">{progress.currentFile}</p>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          className="primary download-start-btn"
          onClick={() => void handleDownload()}
        >
          {strings.downloadStart}
        </button>
      )}

      {error ? <p className="download-error">{error}</p> : null}
      <p className="muted download-credit">{strings.downloadCredit}</p>
    </div>
  );
}
