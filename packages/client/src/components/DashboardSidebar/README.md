# DashboardSidebar Component

## Overview

The `DashboardSidebar` component is a navigation sidebar designed for the dashboard section of the IntelliCircle application. It provides users with easy access to different sections of their dashboard, such as profile, settings, chat rooms, and other user-specific features.

## Location

This component is located at:
`packages/client/src/components/DashboardSidebar/`

## Usage

To use the DashboardSidebar component in your application:

```tsx
import DashboardSidebar from '@/components/DashboardSidebar';

function DashboardLayout() {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 overflow-hidden">
        {/* Main dashboard content */}
      </div>
    </div>
  );
}
```

## Props

The DashboardSidebar component accepts the following props:

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | Additional CSS classes to apply to the sidebar |
| `collapsed` | `boolean` | Whether the sidebar should be in collapsed state (showing only icons) |

## Features

- Responsive design that adapts to different screen sizes
- Collapsible mode for compact sidebar view
- Active link highlighting
- Smooth hover and focus states
- Accessible navigation with proper ARIA attributes

## Styling

The component uses Tailwind CSS for styling and follows the IntelliCircle design system:
- Primary color: Electric Indigo (`#4F46E5`)
- Dark mode support
- Responsive breakpoints

## Implementation Notes

This component is intended for use in authenticated dashboard views where users need persistent access to navigation options. It typically appears alongside a main content area that changes based on the selected navigation item.

## Related Components

- `Header` - Top navigation bar used throughout the application
- `MobileDrawer` - Mobile navigation drawer for smaller screens
- Various page-specific components in the `/app/(app)/` directory

## Contributing

When modifying this component, please ensure:
1. Changes align with the existing design system
2. Accessibility standards are maintained (WCAG 2.1 AA)
3. Responsive behavior is tested across screen sizes
4. Component remains reusable and flexible for different dashboard views

## Assisted-by: Claude Code
