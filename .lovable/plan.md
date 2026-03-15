
## Why You Can't Upload to Supabase Storage

The `generated-images` bucket is missing an INSERT (upload) RLS policy. Looking at the existing policies:

- avatars bucket: has an INSERT policy for authenticated users
- product-images bucket: has an INSERT policy for authenticated users  
- generated-images bucket: only has a SELECT (read) policy — NO INSERT policy exists

This means nobody can upload files to `generated-images`, even from the Supabase dashboard.

---

## What Will Be Fixed

### 1. Add an INSERT policy to `generated-images` bucket
A new SQL migration will create an RLS policy that allows uploads to the `generated-images` bucket. Since this bucket is used for demo/AI-generated content (not user-private files), we'll allow any authenticated user to upload:

```sql
CREATE POLICY "Authenticated users can upload to generated-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'generated-images');
```

We'll also add a policy to allow the Supabase service role (dashboard uploads) to upload as well:

```sql
CREATE POLICY "Service role can upload to generated-images"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'generated-images');
```

### 2. Update the dashboard code to use Supabase video URLs
Once you've uploaded the 4 videos into the `demo-clips/` folder, I'll update `src/components/dashboard/SimplifiedDashboard.tsx` to:

- Replace Google Drive `<iframe>` with HTML5 `<video>` tag
- Use the Supabase public URL for each clip: `https://mkwinxbualpcivkujlfd.supabase.co/storage/v1/object/public/generated-images/demo-clips/clip1.mp4`
- Use `object-fit: cover` so the video fills the portrait frame perfectly with zero black bars
- The `dummyClips` array keeps the title, tags, and score metadata — the filename is just a pointer to the video file

### Upload Steps (after policy fix)

1. Go to Supabase Storage → `generated-images` bucket
2. Create a folder called `demo-clips`
3. Upload your 4 MP4 files named: `clip1.mp4`, `clip2.mp4`, `clip3.mp4`, `clip4.mp4`
4. Tell me when done — I'll update the code

### Files to Change
- **SQL migration** — add INSERT policy on `generated-images` bucket
- **`src/components/dashboard/SimplifiedDashboard.tsx`** — replace iframe with `<video>` tags using Supabase URLs
