import { defineQuery } from "next-sanity";

export const homepageContentQuery = defineQuery(`
  *[_type == "homePage"] | order(_updatedAt desc)[0]{
    "heroSlides": coalesce(heroSlides, [])[]{
      "id": coalesce(_key, title),
      "imageUrl": coalesce(image.asset->url, imageUrl),
      badge,
      title,
      subtitle,
      ctaLabel,
      ctaHref,
      order
    },
    "sections": {
      "category": categorySection{
        eyebrow,
        title,
        subtitle,
        description,
        ctaLabel,
        ctaHref,
        "backgroundImageUrl": coalesce(backgroundImage.asset->url, backgroundImageUrl)
      },
      "trending": trendingSection{
        eyebrow,
        title,
        subtitle,
        description,
        ctaLabel,
        ctaHref,
        "backgroundImageUrl": coalesce(backgroundImage.asset->url, backgroundImageUrl)
      },
      "arrival": arrivalSection{
        eyebrow,
        title,
        subtitle,
        description,
        ctaLabel,
        ctaHref,
        "backgroundImageUrl": coalesce(backgroundImage.asset->url, backgroundImageUrl)
      },
      "gender": genderSection{
        eyebrow,
        title,
        subtitle,
        description,
        ctaLabel,
        ctaHref,
        "backgroundImageUrl": coalesce(backgroundImage.asset->url, backgroundImageUrl)
      }
    },
    "categories": coalesce(categoryCards, [])[]{
      "id": coalesce(_key, title),
      title,
      subtitle,
      "image": coalesce(image.asset->url, imageUrl),
      link,
      badge,
      order
    },
    "trending": coalesce(trendingCards, [])[]{
      "id": coalesce(_key, title),
      title,
      subtitle,
      "image": coalesce(image.asset->url, imageUrl),
      link,
      badge,
      order
    },
    "arrivals": coalesce(arrivalCards, [])[]{
      "id": coalesce(_key, title),
      title,
      subtitle,
      "image": coalesce(image.asset->url, imageUrl),
      link,
      badge,
      order
    },
    "gender": coalesce(genderCards, [])[]{
      "id": coalesce(_key, title),
      title,
      subtitle,
      "image": coalesce(image.asset->url, imageUrl),
      link,
      badge,
      order
    },
    "servicePillars": coalesce(servicePillars, [])[]{
      title,
      description,
      icon
    },
    "reassuranceHighlights": coalesce(reassuranceHighlights, [])[]{
      title,
      description,
      icon
    },
    conciergeEyebrow,
    conciergeTitle,
    "conciergeActions": coalesce(conciergeActions, [])[]{
      title,
      description,
      href,
      icon
    },
    stylingJournalEyebrow,
    stylingJournalTitle,
    "stylingTips": coalesce(stylingTips, [])
  }
`);

export const shopPageContentQuery = defineQuery(`
  *[_type == "shopPage" && slug.current == $slug][0]{
    "id": _id,
    "slug": slug.current,
    title,
    subtitle,
    heroEyebrow,
    heroTitle,
    heroDescription,
    "heroImageUrl": coalesce(heroImage.asset->url, heroImageUrl),
    heroCtaLabel,
    heroCtaHref,
    "features": coalesce(features, [])[]{
      "id": coalesce(_key, title),
      title,
      "imageUrl": coalesce(image.asset->url, imageUrl),
      href,
      order
    }
  }
`);
