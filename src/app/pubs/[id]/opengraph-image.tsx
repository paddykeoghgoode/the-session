import { ImageResponse } from 'next/og';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const runtime = 'edge';
export const alt = 'Pub details';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

async function getPubForOG(id: string) {
  const supabase = await createServerSupabaseClient();

  const { data: pub } = await supabase
    .from('pub_summaries')
    .select('*')
    .or(`id.eq.${id},slug.eq.${id}`)
    .single();

  return pub;
}

export default async function Image({ params }: { params: { id: string } }) {
  const pub = await getPubForOG(params.id);

  if (!pub) {
    // Return a fallback image
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <div style={{ fontSize: 80, marginBottom: 20 }}>🍺</div>
          <div style={{ fontSize: 48, fontWeight: 'bold', color: '#f5f5dc' }}>
            The Session
          </div>
          <div style={{ fontSize: 24, color: '#999', marginTop: 10 }}>
            Find the Best Pints in Dublin
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #16a34a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 50%, rgba(22, 163, 74, 0.3) 0%, transparent 50%)',
          }}
        />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', zIndex: 1 }}>
          {/* Badge */}
          {pub.avg_rating >= 4 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 20,
                background: 'rgba(22, 163, 74, 0.2)',
                padding: '10px 20px',
                borderRadius: 50,
                width: 'fit-content',
                border: '2px solid rgba(22, 163, 74, 0.5)',
              }}
            >
              <span style={{ fontSize: 28 }}>✓</span>
              <span style={{ fontSize: 20, color: '#16a34a', fontWeight: 'bold' }}>
                Highly Rated
              </span>
            </div>
          )}

          {/* Pub name */}
          <h1
            style={{
              fontSize: pub.name.length > 20 ? 60 : 72,
              fontWeight: 'bold',
              color: '#f5f5dc',
              marginBottom: 20,
              lineHeight: 1.1,
            }}
          >
            {pub.name}
          </h1>

          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 30 }}>
            <span style={{ fontSize: 28 }}>📍</span>
            <span style={{ fontSize: 28, color: '#999' }}>
              {pub.neighborhood || pub.address?.split(',')[0]}
            </span>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 40, marginBottom: 40 }}>
            {/* Rating */}
            {pub.avg_rating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 40 }}>⭐</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 48, fontWeight: 'bold', color: '#f5f5dc' }}>
                    {pub.avg_rating.toFixed(1)}
                  </span>
                  <span style={{ fontSize: 18, color: '#999' }}>
                    {pub.review_count} review{pub.review_count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}

            {/* Price */}
            {pub.cheapest_guinness && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 40 }}>🍺</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 48, fontWeight: 'bold', color: '#16a34a' }}>
                    €{pub.cheapest_guinness.toFixed(2)}
                  </span>
                  <span style={{ fontSize: 18, color: '#999' }}>Guinness</span>
                </div>
              </div>
            )}
          </div>

          {/* Amenities */}
          {(pub.has_wifi || pub.has_outdoor_seating || pub.has_live_music) && (
            <div style={{ display: 'flex', gap: 20, marginBottom: 40 }}>
              {pub.has_wifi && (
                <div
                  style={{
                    background: 'rgba(245, 245, 220, 0.1)',
                    padding: '8px 16px',
                    borderRadius: 20,
                    fontSize: 18,
                    color: '#f5f5dc',
                  }}
                >
                  📶 WiFi
                </div>
              )}
              {pub.has_outdoor_seating && (
                <div
                  style={{
                    background: 'rgba(245, 245, 220, 0.1)',
                    padding: '8px 16px',
                    borderRadius: 20,
                    fontSize: 18,
                    color: '#f5f5dc',
                  }}
                >
                  🌳 Outdoor
                </div>
              )}
              {pub.has_live_music && (
                <div
                  style={{
                    background: 'rgba(245, 245, 220, 0.1)',
                    padding: '8px 16px',
                    borderRadius: 20,
                    fontSize: 18,
                    color: '#f5f5dc',
                  }}
                >
                  🎵 Live Music
                </div>
              )}
            </div>
          )}

          {/* The Session branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 15,
              marginTop: 'auto',
            }}
          >
            <span style={{ fontSize: 48 }}>🍺</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 32, color: '#f5f5dc', fontWeight: 'bold' }}>
                The Session
              </span>
              <span style={{ fontSize: 18, color: '#999' }}>
                Find the Best Pints in Dublin
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
