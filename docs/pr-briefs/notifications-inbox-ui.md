# Draft PR Brief: Notifications Inbox UI (Phase 2)

Status: Draft planning PR for collaboration this week.

## Goal
Ship user-facing notifications UX on top of merged backend foundation.

## Scope
- Add `/notifications` page with paginated list.
- Add notification item rendering:
  - `like`: actor + prompt title link
  - `follow`: actor + profile link
- Add `mark as read` per item.
- Add `mark all as read` action.
- Add unread badge in navigation (desktop + mobile).
- Poll unread endpoint (`/api/notifications/unread`) every 30-60s in client nav.

## Files likely touched
- `src/app/(main)/notifications/page.tsx`
- `src/components/layout/navbar.tsx`
- `src/components/layout/mobile-bottom-nav.tsx`
- `src/components/notifications/*`
- `src/lib/actions/notifications.ts`
- `src/lib/queries/notifications.ts`

## Acceptance Criteria
- Logged-in users can see notifications sorted newest first.
- Unread count decreases after marking read.
- Unread badge appears in nav and updates.
- No notification data leaks across users.

## Validation
- `npm run lint`
- `npx tsc --noEmit`
- Manual test: like/follow from account A -> visible on account B.
