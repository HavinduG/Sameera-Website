This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## WordPress content

All home page content comes from the WordPress REST API (ACF fields on the `home-page` page):

```
GET {WORDPRESS_URL}/wp-json/wp/v2/pages?slug=home-page&acf_format=standard&_fields=id,acf
```

In ACF, open the field group and turn on **Show in REST API**. An optional extra field is
`whatsapp_url` (URL, shows the floating chat button).

### Environment (`.env`)

| Variable | Purpose |
| --- | --- |
| `WORDPRESS_URL` | Base URL of the WordPress site, e.g. `http://sameera.local` |
| `WP_HOME_SLUG` | Slug of the home page (default `home-page`) |
| `REVALIDATE_SECRET` | Shared secret for the revalidation webhook |

If WordPress can't be reached, the site uses the snapshot in `src/lib/fallback-content.ts`, so builds still pass.

### Instant updates

Content is cached and refreshed every 60 seconds. To make edits appear immediately, have WordPress call
`POST /api/revalidate` on save. Add this to the theme's `functions.php` (or a Code Snippets plugin):

```php
add_action('acf/save_post', function ($post_id) {
    if (wp_is_post_revision($post_id) || get_post_type($post_id) !== 'page') return;

    wp_remote_post('https://YOUR-NEXT-SITE/api/revalidate', [
        'headers'  => ['x-revalidate-secret' => 'SAME_VALUE_AS_REVALIDATE_SECRET'],
        'timeout'  => 5,
        'blocking' => false,
    ]);
}, 20);
```

Test it manually with:

```bash
curl -X POST http://localhost:3000/api/revalidate -H "x-revalidate-secret: $REVALIDATE_SECRET"
```
