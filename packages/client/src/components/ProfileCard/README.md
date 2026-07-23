# ProfileCard Component

A reusable component for displaying a user's profile information, including avatar, name, status, and optional stats.

## Usage

```tsx
import ProfileCard from './ProfileCard';

// Example usage
<ProfileCard 
  username="johndoe"
  initials="JD"
  status="online"
  stats={{ connections: 50, roomsJoined: 5 }}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `username` | `string` | The user's display name. |
| `initials` | `string` | The initials to display in the avatar (if no image). |
| `status` | `'online' \| 'offline' \| 'away'` | The user's online status. |
| `stats` | `{ connections?: number; roomsJoined?: number; }` | Optional statistics to display. |
| `avatarUrl` | `string` | Optional URL to the user's avatar image. If not provided, initials are shown. |

## Example

```tsx
<ProfileCard 
  username="Jane Doe"
  initials="JD"
  status="online"
  avatarUrl="https://example.com/avatar.jpg"
  stats={{ connections: 120, roomsJoined: 12 }}
/>
```

## Notes

- The component uses Tailwind CSS for styling.
- The avatar displays the user's image if `avatarUrl` is provided; otherwise, it shows the initials on a colored background.
- The status dot is color-coded: green for online, gray for offline, yellow for away.