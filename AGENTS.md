# Agent guide

Guidance for AI coding agents working in a project created from this template.

## What this project is

A whitelabel conference app built with Expo (SDK 58, Expo Router, TypeScript, strict mode). Conference organizers customize it through one config file and one assets folder. The app code itself rarely needs changes.

## Golden rules

1. `conference.config.ts` is the single source of truth: name, colors, venue, data source, info cards, sponsors, and feature flags. When asked to change branding or content, edit the config, not components.
2. `src/data/snapshot.json` is generated. Refresh it with `bun run sync-data`. Only edit it by hand when `data.source` is `"bundled"`.
3. The images in `assets/brand/` are generated placeholders. Regenerate them with `bun run generate-brand-assets --force --color "#0a7ea4"`, or replace them with real artwork at the sizes listed in the README.
4. All session times display in the venue timezone (`timezone` in the config). Days in the schedule derive from the session data; there is no day list to maintain.
5. Expo Go is not supported. The app needs a development build (`bun run ios` / `bun run android`) because it uses custom native modules.

## Commands

- Install: `bun install`
- Run: `bun run ios` or `bun run android`
- Checks: `bun run typecheck && bun run lint && bun run test` (run all three before you finish any task)
- Auto-fix formatting: `bunx eslint --fix src/`
- Refresh the data snapshot: `bun run sync-data`
- Try an example conference: `bun run use-example` (no argument lists the options)

## How data flows

Adapters in `src/data/adapters/` fetch from Sessionize or a JSON URL and map to the normalized schema in `src/data/schema.ts` (documented for organizers in `docs/DATA.md`). The Zustand store in `src/store/conferenceStore.ts` embeds speakers into sessions and groups them into days. UI components read only from the store.

## Structure

- `src/app/`: Expo Router routes. Tabs: `(calendar)`, `bookmarks`, `speakers`, `info`. Detail screens: `talk/[talkId]`, `speaker/[speakerId]`.
- `src/components/`: shared UI. Platform variants use `.ios.tsx` suffixes.
- `src/theme.ts`: design tokens, derived from the config colors.
- `src/utils/devDatasets.ts`: dev-only dataset switcher, loaded behind `__DEV__`.
- `examples/`: complete configs with real conference data of different lengths.

## Testing changes

- In a dev build, open the dev menu (Cmd+D on iOS simulator, Cmd+M on Android) and use the "Dataset" entries to preview the bundled example schedules at runtime without touching the config.
- Changes to `app.config.ts`, icons, or native dependencies need `bunx expo prebuild` and a rebuild. A running Metro session only picks up JS changes.
- Deep links use the `scheme` from the config, for example `myconference:///talk/<session-id>`. Changing the scheme requires a native rebuild.

## Pitfalls

- `app.config.ts` imports `conference.config.ts` through a sucrase require hook. Keep `conference.config.ts` free of imports with side effects; type-only imports are safe.
- Keep `src/data/schema.ts` and the adapters free of React Native imports so Node scripts can use them.
- The schedule persists on device only when the data source is remote. Bundled data always re-derives from the snapshot on launch.
