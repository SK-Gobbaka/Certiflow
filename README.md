# CertiFlow

Automate certificate generation and personalized email dispatch directly from your browser via Gmail API.

## Features

- **Client-Side Processing**: Zero server storage. Certificates and participant data are processed locally in your browser.
- **Participant Import**: Parse CSV and Excel (`.xlsx`, `.xls`) files with automatic email validation, deduplication, and custom column placeholder extraction.
- **Visual Certificate Designer**: Drag-and-drop name placeholder placement, custom fonts, typography sizes, colors, and live certificate preview.
- **Personalized Email Templates**: Dynamic placeholders (`{{name}}`, `{{email}}`, `{{role}}`, `{{department}}`, and custom CSV columns) for email subject and body.
- **Batch Dispatch & Export**: Send emails directly through your Google account via the Gmail API with rate-limiting protection, or download all generated certificates in a single ZIP file.

## Getting Started

1. Set up your environment variable:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Scripts:
   - `npm run dev`: Start Next.js development server
   - `npm run build`: Production build
   - `npm run start`: Start production server
   - `npm run lint`: Lint with Oxlint
   - `npm test`: Run unit tests
