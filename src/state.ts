// state.ts — per-session state + transcript provenance.
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

export const ENTRY_TYPE = "pi-auto-name";

export interface RenameState {
  done: boolean; // initial rename completed or skipped
  inflight: boolean; // generation in progress
  lastAutoName: string | undefined; // last STORED title on the Pi session (echo suppression)
  lastAutoWindowName: string | undefined; // legacy field holding the same title for surface restore
  autoRenameLocked: boolean; // external rename latched: auto-renaming is locked off for the session (when respectExternalRenames)
  turnsSeen: number; // agent_settled counter (turn-interval re-rename; one settled user-facing turn = one unit)
  nameAtGenerationStart: string | undefined; // for the race guard
}

export function createState(): RenameState {
  return {
    done: false,
    inflight: false,
    lastAutoName: undefined,
    lastAutoWindowName: undefined,
    autoRenameLocked: false,
    turnsSeen: 0,
    nameAtGenerationStart: undefined,
  };
}

/**
 * Record a title: remember the STORED (normalized) session title for echo
 * suppression and persist the title in the legacy sessionName/windowName fields.
 * The stored name is re-read from pi so normalization inside setSessionName
 * (trim, newline collapse) cannot break the echo-equality check. The
 * session_info_changed echo is dispatched fire-and-forget, so lastAutoName is
 * set before the echo handler runs.
 */
export function recordAutoRename(
  pi: ExtensionAPI,
  state: RenameState,
  sessionName: string,
  windowName?: string,
): void {
  state.lastAutoName = sessionName;
  if (windowName) state.lastAutoWindowName = windowName;
  pi.appendEntry(ENTRY_TYPE, {
    sessionName,
    ...(windowName ? { windowName } : {}),
    at: new Date().toISOString(),
  });
}

/** Scan transcript for our entries so `lastAutoName`/`lastAutoWindowName` survive reload/resume. */
export function restoreProvenance(ctx: ExtensionContext, state: RenameState): void {
  for (const entry of ctx.sessionManager.getEntries()) {
    if (entry.type !== "custom" || entry.customType !== ENTRY_TYPE) continue;
    const data = entry.data as { sessionName?: string; windowName?: string } | undefined;
    if (!data) continue;
    if (typeof data.sessionName === "string") state.lastAutoName = data.sessionName;
    // Restored verbatim: old entries already contain the canonical surface
    // label. Re-compacting here would rewrite non-natural styles (the
    // topic-project separator or slug hyphens).
    if (typeof data.windowName === "string") state.lastAutoWindowName = data.windowName;
  }
}
