'use client';

interface SocialLinksProps {
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  twitter?: string | null;
}

export default function SocialLinks({ phone, email, website, facebook, instagram, twitter }: SocialLinksProps) {
  const hasAnyLink = phone || email || website || facebook || instagram || twitter;

  if (!hasAnyLink) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Phone */}
      {phone && (
        <a
          href={`tel:${phone}`}
          className="flex items-center gap-2 px-3 py-1.5 bg-stout-700 hover:bg-stout-600 rounded-lg transition-colors group"
          title="Call"
        >
          <svg className="w-4 h-4 text-irish-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="text-sm text-cream-100 group-hover:text-irish-green-400 transition-colors">{phone}</span>
        </a>
      )}

      {/* Email */}
      {email && (
        <a
          href={`mailto:${email}`}
          className="flex items-center gap-2 px-3 py-1.5 bg-stout-700 hover:bg-stout-600 rounded-lg transition-colors group"
          title="Email"
        >
          <svg className="w-4 h-4 text-irish-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-sm text-cream-100 group-hover:text-irish-green-400 transition-colors">Email</span>
        </a>
      )}

      {/* Website */}
      {website && (
        <a
          href={website.startsWith('http') ? website : `https://${website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 bg-stout-700 hover:bg-stout-600 rounded-lg transition-colors group"
          title="Website"
        >
          <svg className="w-4 h-4 text-irish-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <span className="text-sm text-cream-100 group-hover:text-irish-green-400 transition-colors">Website</span>
        </a>
      )}

      {/* Facebook */}
      {facebook && (
        <a
          href={facebook.startsWith('http') ? facebook : `https://facebook.com/${facebook}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-9 h-9 bg-stout-700 hover:bg-[#1877F2] rounded-lg transition-colors group"
          title="Facebook"
        >
          <svg className="w-5 h-5 text-[#1877F2] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>
      )}

      {/* Instagram */}
      {instagram && (
        <a
          href={instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-9 h-9 bg-stout-700 hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737] rounded-lg transition-all group"
          title="Instagram"
        >
          <svg className="w-5 h-5 text-[#E4405F] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>
      )}

      {/* Twitter/X */}
      {twitter && (
        <a
          href={twitter.startsWith('http') ? twitter : `https://twitter.com/${twitter.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-9 h-9 bg-stout-700 hover:bg-black rounded-lg transition-colors group"
          title="X (Twitter)"
        >
          <svg className="w-4 h-4 text-cream-100 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
      )}
    </div>
  );
}
