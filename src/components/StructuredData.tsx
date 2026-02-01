import type { Pub } from '@/types';

interface StructuredDataProps {
  type: 'pub' | 'website';
  data?: Pub;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  let jsonLd: object;

  if (type === 'website') {
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'The Session',
      description: 'Find the best pint prices in Dublin',
      url: 'https://the-session.vercel.app',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://the-session.vercel.app/pubs?search={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    };
  } else if (type === 'pub' && data) {
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BarOrPub',
      name: data.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: data.address,
        addressLocality: 'Dublin',
        addressCountry: 'IE',
        ...(data.eircode && { postalCode: data.eircode }),
      },
      ...(data.latitude && data.longitude && {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: data.latitude,
          longitude: data.longitude,
        },
      }),
      ...(data.phone && { telephone: data.phone }),
      ...(data.website && { url: data.website }),
      ...(data.email && { email: data.email }),
      servesCuisine: data.has_food ? 'Pub Food' : undefined,
      amenityFeature: [
        ...(data.has_outdoor_seating ? [{ '@type': 'LocationFeatureSpecification', name: 'Outdoor Seating' }] : []),
        ...(data.has_live_music ? [{ '@type': 'LocationFeatureSpecification', name: 'Live Music' }] : []),
        ...(data.shows_sports ? [{ '@type': 'LocationFeatureSpecification', name: 'Sports TV' }] : []),
        ...(data.has_pool ? [{ '@type': 'LocationFeatureSpecification', name: 'Pool Table' }] : []),
        ...(data.has_darts ? [{ '@type': 'LocationFeatureSpecification', name: 'Darts' }] : []),
      ],
      // Opening hours in schema format
      ...(data.hours_monday_open && {
        openingHoursSpecification: buildOpeningHours(data),
      }),
    };
  } else {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function buildOpeningHours(pub: Pub) {
  const days = [
    { day: 'Monday', open: pub.hours_monday_open, close: pub.hours_monday_close },
    { day: 'Tuesday', open: pub.hours_tuesday_open, close: pub.hours_tuesday_close },
    { day: 'Wednesday', open: pub.hours_wednesday_open, close: pub.hours_wednesday_close },
    { day: 'Thursday', open: pub.hours_thursday_open, close: pub.hours_thursday_close },
    { day: 'Friday', open: pub.hours_friday_open, close: pub.hours_friday_close },
    { day: 'Saturday', open: pub.hours_saturday_open, close: pub.hours_saturday_close },
    { day: 'Sunday', open: pub.hours_sunday_open, close: pub.hours_sunday_close },
  ];

  return days
    .filter(d => d.open && d.close)
    .map(d => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: d.day,
      opens: d.open,
      closes: d.close,
    }));
}
