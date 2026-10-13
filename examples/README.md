# Example conferences

Each folder holds a complete `conference.config.ts`, plus a `data.json` snapshot when the conference has no live data source. They show the template with real schedules of different lengths:

| Example | Days | Data source |
| --- | --- | --- |
| `nextjs-conf-2024` | 1 | bundled `data.json` |
| `react-conf-2025` | 2 | live Sessionize API |
| `appjs-conf-2025` | 3 | bundled `data.json` |

Apply one:

```bash
bun run use-example appjs-conf-2025
bun run ios
```

The script overwrites `conference.config.ts`, `src/data/snapshot.json`, and the placeholder images in `assets/brand/` (regenerated in the example's brand color). Commit or stash your own config before switching.

The schedule data comes from each conference's published agenda. It is sample content for development, not an official source.
