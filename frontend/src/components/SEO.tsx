import React from 'react';
import { Helmet } from 'react-helmet-async';
import { metaTags, twitterCardDefaults } from '../config/metaTags';

interface SEOProps {
  page: keyof typeof metaTags;
}

/**
 * SEO Component - Manages all meta tags for a page
 * Usage: <SEO page="homepage" />
 */
export const SEO: React.FC<SEOProps> = ({ page }) => {
  const tags = metaTags[page];

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{tags.title}</title>
      <meta name="description" content={tags.description} />
      <meta name="keywords" content={tags.keywords} />
      <link rel="canonical" href={tags.canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={tags.canonical} />
      <meta property="og:title" content={tags.ogTitle} />
      <meta property="og:description" content={tags.ogDescription} />
      <meta property="og:image" content={tags.ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCardDefaults.card} />
      <meta name="twitter:site" content={twitterCardDefaults.site} />
      <meta name="twitter:creator" content={twitterCardDefaults.creator} />
      <meta name="twitter:title" content={tags.ogTitle} />
      <meta name="twitter:description" content={tags.ogDescription} />
      <meta name="twitter:image" content={tags.ogImage} />
    </Helmet>
  );
};
