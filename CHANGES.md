# Changes

## CCTV Monitor

- Updated the `#cctv` entry point and shell with full-height navigation, a centered content area, and shared active-alert counts.
- Split people and parking vehicle totals across five KPIs. The average density weights people cameras by capacity. Camera badges, alert borders, and alert cards use the same derived status.
- Added camera filters, severity sorting, persistent grid sizes, a shared live clock, count history, offline retry, and camera focus with snapshots, playback markers, and recent events.
- Added alert filtering, acknowledgment, camera links, and a responsive alert drawer.
- Replaced the generic remote streams with muted temple video loops. The camera frames use a dark monitoring surface, and out-of-view grid videos pause to reduce decoding load.
- Reworked Find a Person around a photo or description, camera and time scope, a required search reason, streamed demo results, movement history, CSV export, and an audit drawer.

### New files

- `src/lib/cctv-service.ts` owns camera, alert, and search fixtures, service types, and demo live updates.
- `src/lib/use-cctv.ts` loads and refreshes the shared CCTV data.
- `src/components/temple/cctv/` contains `LiveGrid.tsx`, `CameraTile.tsx`, `CameraFocusModal.tsx`, `AlertsPanel.tsx`, `PersonSearch.tsx`, `SearchFilters.tsx`, `SearchResults.tsx`, `presentation.ts`, and `cctv.css`.

- `src/assets/cctv/` contains four compressed demo clips and matching posters.

### Demo footage credits

- [Cultural ritual at a Hindu temple](https://www.pexels.com/video/cultural-ritual-at-hindu-temple-with-smoke-and-offerings-37155087/)
- [Temple interior with devotees](https://www.pexels.com/video/temple-interior-with-devotees-and-statue-34984962/)
- [Crowd at a historic temple entrance](https://www.pexels.com/video/crowd-at-historic-indian-temple-entrance-34764448/)
- [Hindu temple courtyard gathering](https://www.pexels.com/video/vibrant-hindu-temple-during-daytime-gathering-35040707/)

The clips are cropped, compressed, and used under the [Pexels license](https://www.pexels.com/license/).

### Connect the API

Replace the mock implementations in `src/lib/cctv-service.ts` while preserving the exported types and function signatures. Wire `getCameras`, `getAlerts`, `acknowledgeAlert`, and `retryCamera` to the camera and alert endpoints. Have `subscribeToCctv` notify listeners after mutations and on polling or stream updates. Connect `runPersonSearch` to camera-level progress and final results, preserve cancellation via its abort signal, and fetch audit entries through `getSearchAudit`. Supply stream metadata, playable stream URLs, and snapshot-ready poster URLs in the camera responses. Use same-origin or canvas-compatible video responses for frame snapshots. The UI continues to consume the same service contract.

### Demo limits

- Counts, tracking boxes, playback times, alerts, and search matches are simulated. Live tiles and focus playback use stock temple footage. Snapshots capture the displayed video frame when available and use a local poster otherwise.
- Volunteer notifications use an in-app toast, and PTZ is disabled. Alerts and acknowledgment state reset on reload.
- The audit log uses browser storage. It stores search metadata only. Reference photos and descriptions are held in the current UI session.

### Verification

The production build and TypeScript checks pass. ESLint passes for the CCTV implementation and shell. The repository-wide lint run reports 4,248 existing errors, primarily formatting violations.
