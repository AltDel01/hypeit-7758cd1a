# Careers: public access, mandatory CV, shareable job links

## Current state (verified)

- `/careers` and `/careers/apply` are already public routes with no auth guard, and the applications table plus the CV storage bucket both allow anonymous submissions and uploads. No sign-in is required today.
- CV upload is currently optional in the apply form.
- Job positions are NOT individually shareable: `/careers` always opens on the first position (tab state only, no URL parameter). Only the apply link carries the position (`/careers/apply?position=...&type=...`).

## Changes

1. **Keep public access explicit**
   - Add a short verification pass: confirm no redirect-to-login behavior on both pages while signed out, keeping them fully anonymous-friendly.

2. **Make CV upload mandatory**
   - Mark the Upload CV field as required in the form UI (asterisk on the label).
   - Block submission with a clear error toast when no file is attached.
   - Restrict accepted types to PDF/DOC/DOCX and validate file size (max 10 MB) before upload.

3. **Make each job position shareable**
   - Read a `?role=` query parameter on `/careers` and open that position's tab automatically.
   - Update the tab selection to write the current role into the URL, so copying the address bar shares that exact position.
   - Add a "Copy link" button next to the Apply buttons that copies the direct URL for the selected role.

## Technical notes

- Files touched: `src/pages/Careers.tsx` (URL sync + copy link), `src/pages/CareerApply.tsx` (required CV, validation).
- Role is matched by a URL-safe slug of the position title, with a fallback to the first position when the parameter is missing or unknown.
- No database or edge function changes needed.
