# Fix the Careers application form + application delivery

## What's broken today

The form on `/careers/apply` looks complete, but submissions never save. The applications table was created without database access grants, so every public submit is rejected with a permission error. The database currently holds **0 applications**, so any applications people have tried to send were lost.

Two other gaps:
- The form never asks for an **email address**, so even a saved application has no way to reply to the candidate (only a phone number).
- Nobody is notified when an application arrives, so it depends on someone opening the admin panel.

Good news: the vacancy tagging already works. The apply link passes the job title and the type (Full-Time or Internship), and both are stored with the application, so each entry is tagged with the exact vacancy chosen.

## What will be built

1. **Make submissions actually save**
   - Add the missing database access grants so the public form can insert an application and admins can read/update/delete them.
   - Verify the CV upload path works for non-logged-in visitors too.

2. **Add an email field to the form**
   - Required "Email Address" input with validation, stored alongside the application and shown in the admin panel.

3. **Where applications land: both**
   - **Admin dashboard** (already exists): `/admin` → "Careers" tab lists every application with vacancy, type, phone, CV download, portfolio link, self-described persona, cover letter, and a status selector (new / reviewed / shortlisted / rejected). This will now be populated once grants are fixed, plus the new email column.
   - **Email notification** (new): each submission triggers an email to `hello.viralin@gmail.com` from `noreply@viralin.ai` containing the vacancy applied for, type, name, email, phone, persona, portfolio link, and cover letter, with a link to open the admin panel.

4. **End-to-end verification**
   - Submit a real test application through the browser against the live preview, confirm the row is stored with the correct vacancy tag, confirm it appears in the admin Careers tab, and confirm the notification email is dispatched. Remove the test row afterwards.

## Technical notes

- Migration: `GRANT INSERT ON public.career_applications TO anon, authenticated;` plus `SELECT, UPDATE, DELETE` for `authenticated` and `ALL` for `service_role`; add an `email text` column. Existing RLS policies (public insert, admin-only read/update/delete) stay as they are.
- New edge function `send-career-application` using the existing `RESEND_API_KEY`, called from `CareerApply.tsx` after a successful insert; a failed email never blocks the submission.
- Frontend edits limited to `src/pages/CareerApply.tsx` (email field) and `src/components/admin/AdminCareersSection.tsx` (email display).
