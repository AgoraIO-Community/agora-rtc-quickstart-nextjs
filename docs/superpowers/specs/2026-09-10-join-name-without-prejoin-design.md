# Join Name Without Pre-Join Design

## Goal

Remove automatic pre-join media capture, let each participant enter a display
name, and show that name to the other participant without adding RTM or storage.

## Runtime Flow

The room route initially renders a join form containing the display name and an
invite action. It does not request camera/microphone access.
After Join Call, the token route creates a unique ASCII RTC user account that
contains a reversible base64url-encoded display name plus a random suffix. The
browser registers RTC listeners, joins with that account, creates available
local tracks, publishes them, and enters the connected view.

Remote tiles decode the peer's RTC account and display the entered name. Token
renewal reuses the exact account. A camera or microphone failure preserves the
working track; failure to create both tracks leaves only the new session.

## Boundaries

- Keep room identity in the URL.
- Keep the App Certificate server-side.
- Use RTC string accounts consistently for token issue, join, and renewal.
- Do not add RTM, chat, authentication, or persistence.
- A duplicate display name remains safe because the random account suffix is
  part of RTC identity but is hidden from the UI.

## Verification

Tests cover identity encoding/decoding, token issue and renewal, join-before-
capture ordering, partial media, failed media cleanup,
no media access before Join Call, and local/remote display names. Run the focused tests, `pnpm run
verify`, and a production two-client browser check.
