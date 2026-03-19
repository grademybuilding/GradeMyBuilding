

# Remove "Question Category" from Contact Form

## Change
**File: `src/pages/Contact.tsx`**

1. Remove `categoryOptions` constant (line ~20)
2. Remove `category` from the zod schema
3. Remove `category` from `defaultValues`
4. Remove the `category` field from the form submission body (or send empty string)
5. Remove the entire `<FormField>` block for the "category" field (~15 lines)
6. Remove the `Tag` icon import if unused elsewhere

Single file change, straightforward removal.

