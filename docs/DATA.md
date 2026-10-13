# Data sources

The app reads all schedule data in one normalized shape, defined in `src/data/schema.ts`. Three adapters produce it:

| Source | Config | Runtime refresh |
| --- | --- | --- |
| Sessionize | `{ source: "sessionize", sessionizeId: "..." }` | Yes |
| JSON file | `{ source: "json", url: "https://..." }` | Yes |
| Bundled only | `{ source: "bundled" }` | No |

All three use the bundled snapshot (`src/data/snapshot.json`) on first launch, so the app works offline. Run `bun run sync-data` to refresh the snapshot before a release.

## JSON schema

If you do not use Sessionize, host a JSON file in this shape and point `data.url` at it:

```json
{
  "sessions": [
    {
      "id": "1",
      "title": "Opening keynote",
      "description": "Optional longer text, or null.",
      "startsAt": "2027-05-20T09:00:00Z",
      "endsAt": "2027-05-20T10:00:00Z",
      "room": "Main Hall",
      "tags": ["Keynote"],
      "isServiceSession": false,
      "speakerIds": ["ada"]
    }
  ],
  "speakers": [
    {
      "id": "ada",
      "fullName": "Ada Lovelace",
      "bio": "Optional longer text, or null.",
      "tagLine": "Engineer",
      "profilePicture": "https://example.com/ada.jpg",
      "links": [
        { "title": "Website", "url": "https://example.com", "linkType": "Company_Website" }
      ],
      "sessionIds": ["1"]
    }
  ]
}
```

Notes:

- `startsAt` and `endsAt` are ISO timestamps. Use UTC (`Z`) or an explicit offset.
- Days in the schedule are derived from the session times in the venue timezone (`timezone` in `conference.config.ts`). You do not list days explicitly.
- `isServiceSession: true` marks breaks, registration, and similar slots. They render as simple rows without speakers.
- `links[].linkType` can be `Twitter`, `LinkedIn`, `Blog`, or `Company_Website`. Other values are ignored.
- The app caches the last fetched data on device. If a fetch fails, it keeps showing the previous data.
