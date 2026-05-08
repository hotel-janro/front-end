import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../../api.js';
import { UtensilsCrossed } from 'lucide-react';

export function ImageWithFallback(props) {
  const [didError, setDidError] = useState(false);
  const { src, alt, className, style, ...rest } = props;

  // Reset error state when source changes
  useEffect(() => {
    setDidError(false);
  }, [src]);

  const handleError = () => {
    setDidError(true);
  };

  // Resolve backend images
  const resolvedSrc = getImageUrl(src);

  return didError || !src ? (
    <div className={`flex items-center justify-center bg-slate-50 text-slate-200 ${className ?? ''}`} style={style}>
      <UtensilsCrossed className="w-1/3 h-1/3 opacity-20" />
    </div>
  ) : (
    <img src={resolvedSrc} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  );
}
