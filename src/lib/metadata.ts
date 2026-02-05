import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thesession.ie';

export function generateMetadata({
  title,
  description,
  path = '',
  keywords,
  image,
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
}): Metadata {
  const fullTitle = `${title} | The Session`;
  const url = `${siteUrl}${path}`;
  const ogImage = image || `${siteUrl}/og-image.jpg`;

  return {
    title: fullTitle,
    description,
    keywords,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: 'The Session',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_IE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
  };
}

export const defaultKeywords = [
  'Dublin pubs',
  'pint prices',
  'Guinness price',
  'pub deals',
  'Dublin nightlife',
  'Irish pubs',
  'best pubs Dublin',
  'pub reviews',
  'craft beer Dublin',
  'happy hour Dublin',
];
