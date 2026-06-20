## Goal
Let users write, type, or paste their own Hook and Script directly in each Day card, instead of only viewing an AI-generated, read-only preview. AI generation stays available but becomes optional.

## Changes (all in `src/components/tools/CreativeWorkflow.tsx`)

### 1. Make the per-day Scripting block editable
Currently the "Script preview" block (lines ~758-790) shows `day.hook` and `day.body` as read-only text. Replace the read-only paragraphs with editable fields:

- **Hook**: an `Input` bound to `day.hook`, `onChange` → `patchDay(day.id, { hook: e.target.value })`, placeholder "Write or paste your hook...".
- **Script body**: a small `Textarea` bound to `day.body`, `onChange` → `patchDay(day.id, { body: e.target.value })`, placeholder "Write or paste your script...".

Both persist via the existing `patchDay` (which already saves `hook`/`body` to the database).

### 2. Reposition the AI generate button as optional
Keep the existing "Generate Hook & Script" / "Regenerate Script" button below the editable fields, relabeled so it's clearly optional (e.g. button text stays, plus helper text "Or generate with AI"). When AI returns, it fills the same editable fields the user can then tweak.

### 3. Expand Script dialog
The dialog already has editable scene `visual`/`voiceover` textareas. Add editable Hook and Body fields at the top of the dialog (bound to `scriptDay.hook` / `scriptDay.body`, updating both `setScriptDay` local state and `patchDay`) so the full script can be authored there too, consistent with the inline card.

## Result
Each Day box supports three flows: (a) type/paste your own hook + script, (b) generate with AI then edit, (c) leave blank. Nothing is forced; all fields are free-form and saved automatically.

## Technical notes
- No database or edge-function changes needed — `hook`, `body`, `scenes` columns and `patchDay` persistence already exist.
- Pure frontend/presentation edit to one component.