/**
 * What "Play" starts, wherever it is offered (the cover, the contents page):
 * this device's last mode, else the newest non-daily run in history, else the
 * recommended first drill. One definition so Enter means the same everywhere.
 */
import { useMemo, useState } from "react";
import { useRunHistory } from "@/data";
import { customMode, getMode, type CustomConfig, type GameMode } from "@/game";
import { formatLine, modeTitle } from "@/features/play/describe";
import { runPath } from "@/features/play/links";
import { getLastMode } from "@/features/play/session";

/** The first drill for someone who has never played: untimed, with hints. */
export const RECOMMENDED_MODE = "nibbles:practice";

export interface StartTarget {
  path: string;
  modeId: string;
  custom?: CustomConfig;
  /** "Hex Bytes", "Custom drill"… */
  title: string;
  /** "Sprint · 60 s", "Practice · untimed"… */
  format: string;
  /** True when this resumes something the player chose before. */
  resume: boolean;
}

export function useStartTarget(): StartTarget {
  const [last] = useState(getLastMode);
  const { runs: recent } = useRunHistory({ limit: 1 });

  return useMemo(() => {
    let modeId = RECOMMENDED_MODE;
    let custom: CustomConfig | undefined;
    let resume = false;
    if (
      last &&
      (last.modeId === "custom" ? !!last.custom : !!getMode(last.modeId))
    ) {
      modeId = last.modeId;
      custom = last.custom;
      resume = true;
    } else {
      const r = recent[0];
      if (r && getMode(r.modeId) && !r.modeId.startsWith("daily:")) {
        modeId = r.modeId;
        resume = true;
      }
    }
    let mode: GameMode | undefined;
    try {
      mode =
        modeId === "custom" && custom ? customMode(custom) : getMode(modeId);
    } catch {
      mode = undefined;
    }
    if (!mode) {
      modeId = RECOMMENDED_MODE;
      custom = undefined;
      resume = false;
      mode = getMode(RECOMMENDED_MODE)!;
    }
    return {
      path: runPath(modeId, custom),
      modeId,
      custom,
      title: modeTitle(mode),
      format: formatLine(mode),
      resume,
    };
  }, [last, recent]);
}
