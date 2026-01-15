'use client';

import { useState, useEffect } from 'react';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
  const [showToast, setShowToast] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [shareUrl, setShareUrl] = useState(url || '');

  // Set the URL on client side to avoid hydration mismatch
  useEffect(() => {
    if (!url) {
      setShareUrl(window.location.href);
    }
  }, [url]);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
      } catch (err) {
        // User cancelled or error - ignore
      }
    } else {
      setShowMenu(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
      setShowMenu(false);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
      setShowMenu(false);
    }
  };

  const shareToWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${shareUrl}`)}`;
    window.open(whatsappUrl, '_blank');
    setShowMenu(false);
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
    setShowMenu(false);
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank');
    setShowMenu(false);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-2 bg-stout-700 hover:bg-stout-600 text-cream-100 px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>

        {/* Fallback share menu for browsers without native share */}
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-2 bg-stout-800 border border-stout-700 rounded-lg shadow-lg z-50 py-2 min-w-[160px]">
              <button
                onClick={shareToWhatsApp}
                className="w-full px-4 py-2 text-left text-cream-100 hover:bg-stout-700 flex items-center gap-3"
              >
                <span className="text-lg">💬</span>
                WhatsApp
              </button>
              <button
                onClick={shareToTwitter}
                className="w-full px-4 py-2 text-left text-cream-100 hover:bg-stout-700 flex items-center gap-3"
              >
                <span className="text-lg">🐦</span>
                Twitter/X
              </button>
              <button
                onClick={shareToFacebook}
                className="w-full px-4 py-2 text-left text-cream-100 hover:bg-stout-700 flex items-center gap-3"
              >
                <span className="text-lg">📘</span>
                Facebook
              </button>
              <hr className="border-stout-700 my-1" />
              <button
                onClick={handleCopyLink}
                className="w-full px-4 py-2 text-left text-cream-100 hover:bg-stout-700 flex items-center gap-3"
              >
                <span className="text-lg">🔗</span>
                Copy Link
              </button>
            </div>
          </>
        )}
      </div>

      {/* Floating toast notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-irish-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Link copied to clipboard!</span>
          </div>
        </div>
      )}
    </>
  );
}
