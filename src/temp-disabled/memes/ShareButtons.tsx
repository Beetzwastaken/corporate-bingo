// ShareButtons Component - Professional Meme Sharing Interface
// Supports download, social sharing, and team collaboration features

import React, { useState } from 'react';

interface ShareButtonsProps {
  imageUrl: string;
  onDownload: () => void;
  memeData?: {
    template: string;
    painScore: number;
    category: string;
  };
  className?: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({
  imageUrl,
  onDownload,
  memeData,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && imageUrl) {
        await navigator.clipboard.writeText(imageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleShare = async (platform: string) => {
    if (!imageUrl) return;

    setIsSharing(true);

    const shareText = memeData 
      ? `Corporate Pain Level: ${memeData.painScore}/10 😅 Created with Corporate Bingo AI`
      : 'Check out this corporate bingo meme! 😅 Created with Corporate Bingo AI';

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(imageUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(imageUrl)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(imageUrl)}&title=${encodeURIComponent(shareText)}`,
      slack: `slack://channel?team=&id=&message=${encodeURIComponent(shareText + ' ' + imageUrl)}`,
      teams: `https://teams.microsoft.com/share?href=${encodeURIComponent(imageUrl)}&msgText=${encodeURIComponent(shareText)}`
    };

    try {
      if (platform === 'native' && navigator.share) {
        // Use Web Share API if available
        await navigator.share({
          title: 'Engineering Meme',
          text: shareText,
          url: imageUrl
        });
      } else if (shareUrls[platform as keyof typeof shareUrls]) {
        window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
      }
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownloadCustom = (format: 'png' | 'jpg' | 'webp') => {
    if (!imageUrl) return;

    // Create a canvas to convert format if needed
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (format === 'jpg') {
        // Fill white background for JPEG
        ctx!.fillStyle = '#ffffff';
        ctx!.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx!.drawImage(img, 0, 0);
      
      const mimeType = `image/${format === 'jpg' ? 'jpeg' : format}`;
      const quality = format === 'jpg' ? 0.9 : undefined;
      const dataUrl = canvas.toDataURL(mimeType, quality);
      
      const link = document.createElement('a');
      link.download = `corporate-bingo-meme-${Date.now()}.${format}`;
      link.href = dataUrl;
      link.click();
    };

    img.src = imageUrl;
  };

  const shareButtons = [
    { 
      key: 'twitter', 
      label: 'Twitter', 
      icon: '🐦', 
      color: 'bg-blue-400 hover:bg-blue-500' 
    },
    { 
      key: 'linkedin', 
      label: 'LinkedIn', 
      icon: '💼', 
      color: 'bg-blue-600 hover:bg-blue-700' 
    },
    { 
      key: 'reddit', 
      label: 'Reddit', 
      icon: '🤖', 
      color: 'bg-orange-500 hover:bg-orange-600' 
    },
    { 
      key: 'slack', 
      label: 'Slack', 
      icon: '💬', 
      color: 'bg-purple-500 hover:bg-purple-600' 
    },
    { 
      key: 'teams', 
      label: 'Teams', 
      icon: '👥', 
      color: 'bg-indigo-500 hover:bg-indigo-600' 
    }
  ];

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">📤</span>
        Share Your Suffering
      </h3>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={onDownload}
          className="engineer-button flex items-center justify-center space-x-2 py-3"
        >
          <span>💾</span>
          <span>Download PNG</span>
        </button>

        <button
          onClick={handleCopyLink}
          className={`flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-colors ${
            copied 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <span>{copied ? '✅' : '📋'}</span>
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      </div>

      {/* Format Options */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Download Format:</p>
        <div className="flex space-x-2">
          {['png', 'jpg', 'webp'].map(format => (
            <button
              key={format}
              onClick={() => handleDownloadCustom(format as 'png' | 'jpg' | 'webp')}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Social Sharing */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Share on Social:</p>
        <div className="grid grid-cols-2 gap-2">
          {shareButtons.map(button => (
            <button
              key={button.key}
              onClick={() => handleShare(button.key)}
              disabled={isSharing}
              className={`${button.color} text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50`}
            >
              <span>{button.icon}</span>
              <span>{button.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Native Share (if available) */}
      {navigator.share && (
        <button
          onClick={() => handleShare('native')}
          className="w-full bg-gradient-to-r from-engineer-blue to-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2 mb-4"
        >
          <span>📱</span>
          <span>Share via Device</span>
        </button>
      )}

      {/* Meme Statistics */}
      {memeData && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <h4 className="font-medium text-gray-800 mb-2">Meme Stats</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Template:</span>
              <p className="font-medium truncate">{memeData.template}</p>
            </div>
            <div>
              <span className="text-gray-600">Pain Level:</span>
              <p className="font-medium">{memeData.painScore}/10</p>
            </div>
            <div>
              <span className="text-gray-600">Category:</span>
              <p className="font-medium capitalize">{memeData.category}</p>
            </div>
            <div>
              <span className="text-gray-600">Created:</span>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Professional Use Notice */}
      <div className="bg-blue-50 rounded-lg p-3">
        <h4 className="font-medium text-blue-800 mb-1 flex items-center">
          <span className="mr-1">💼</span>
          Professional Use
        </h4>
        <p className="text-xs text-blue-700">
          This meme was created for workplace humor and team morale. 
          Share responsibly and ensure it aligns with your company's communication guidelines.
        </p>
      </div>

      {/* Quick Tips */}
      <div className="mt-4 p-3 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">💡 Sharing Tips</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Use in team Slack channels to boost morale</li>
          <li>• Share on engineering subreddits for community laughs</li>
          <li>• Add to presentations for ice-breakers</li>
          <li>• Include in retrospective meeting slides</li>
        </ul>
      </div>
    </div>
  );
};