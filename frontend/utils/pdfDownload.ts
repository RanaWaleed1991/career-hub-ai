/**
 * Mobile-friendly PDF download utility
 * Uses Web Share API on mobile devices for better UX
 * Falls back to standard download on desktop
 */

/**
 * Detect if the user is on a mobile device
 */
export const isMobileDevice = (): boolean => {
  // Check for mobile user agents
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  // Check for touch support
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Check screen size (mobile typically < 768px)
  const isMobileSize = window.innerWidth < 768;

  // Mobile device patterns
  const mobilePattern = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

  return mobilePattern.test(userAgent.toLowerCase()) || (hasTouch && isMobileSize);
};

/**
 * Check if Web Share API is available and supports files
 */
export const canUseWebShare = (): boolean => {
  return !!(navigator.share && navigator.canShare);
};

/**
 * Download or share PDF based on device type
 * @param pdfBlob - The PDF blob to download/share
 * @param filename - The filename for the PDF
 * @returns Promise that resolves when complete
 */
export const downloadOrSharePDF = async (
  pdfBlob: Blob,
  filename: string
): Promise<{ success: boolean; method: 'share' | 'download'; error?: string }> => {
  try {
    const isMobile = isMobileDevice();

    // Mobile device - try Web Share API first
    if (isMobile && canUseWebShare()) {
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });

      // Check if we can share this file
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: filename.replace('.pdf', ''),
            text: 'Your document is ready',
          });

          return { success: true, method: 'share' };
        } catch (shareError: any) {
          // User cancelled or share failed - fall back to download
          console.log('Share cancelled or failed, falling back to download:', shareError);
          // Continue to download method below
        }
      }
    }

    // Desktop or Web Share not available - use standard download
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    return { success: true, method: 'download' };
  } catch (error: any) {
    console.error('PDF download/share failed:', error);
    return {
      success: false,
      method: 'download',
      error: error.message || 'Failed to save PDF',
    };
  }
};

/**
 * Helper to show success message based on method used
 */
export const getPDFSuccessMessage = (method: 'share' | 'download', isMobile: boolean): string => {
  if (method === 'share') {
    return 'PDF shared successfully! You can now save it to your device.';
  }

  if (isMobile) {
    return 'PDF downloaded! Check your Downloads folder or browser notifications.';
  }

  return 'PDF downloaded successfully!';
};
