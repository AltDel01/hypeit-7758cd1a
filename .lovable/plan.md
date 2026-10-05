# Restore the "New sign-up" alert email

## Why it stopped
The sign-up alert is sent from the browser right after someone signs up. The sending service only accepts requests from a signed-in user. Since email verification was turned on, a new person is not signed in until they click the link, so the alert request is rejected and you get nothing.

## Fix
Send the alert from the server the moment a new account is created, instead of from the browser. This works whether or not the person has verified yet, and cannot be faked from outside.

- Add a database trigger on new account creation that calls the notification service with a secret server-only key (via `pg_net`), passing name and email.
- Update the notification service to accept signup alerts when that server key is present; keep requiring a signed-in user for all other calls.
- Remove the browser-side signup alert call so you don't get duplicates.
- Trigger is failsafe: if the email fails, signup still succeeds.

## Optional
Also send a second alert ("User verified email") when they confirm. Say if you want it.

## Technical notes
- Trigger on `auth.users` AFTER INSERT (or extend `handle_new_user`), wrapped in EXCEPTION block.
- Shared secret stored as an edge function secret and in Vault for the trigger.
- Remove `sendNotificationEmail({type:'signup'})` from `AuthContext.signUp`.
