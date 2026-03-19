

# Update Contact Form Role Options

## What
Replace the current contact form role options with the application's defined user roles from the Auth page.

## Change
**File: `src/pages/Contact.tsx` (line 18)**

Current:
```ts
const roleOptions = ["Inspector", "Building Owner", "Property Manager", "Contractor", "Other"] as const;
```

Updated:
```ts
const roleOptions = ["Inspector", "Appraiser", "Real Estate Agent", "Assessor", "Underwriter", "Other"] as const;
```

Single line change, no other modifications needed.

