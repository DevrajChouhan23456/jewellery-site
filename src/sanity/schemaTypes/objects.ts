import { homePageIconOptions } from "@/lib/storefront-homepage-defaults";

import { defineField, defineType } from "sanity";

import { validateImageSource, validateInternalPath } from "./validation";

export const heroSlideType = defineType({
  name: "heroSlide",
  title: "Hero Slide",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "imageUrl",
      title: "Image URL Fallback",
      description:
        "Use a site-relative path like /images/example.jpg or an absolute https:// URL when you do not want to upload an asset.",
      type: "string",
      validation: (Rule) => Rule.custom(validateImageSource),
    }),
    defineField({
      name: "badge",
      title: "Badge",
      type: "string",
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "ctaLabel",
      title: "CTA Label",
      type: "string",
    }),
    defineField({
      name: "ctaHref",
      title: "CTA Link",
      type: "string",
      validation: (Rule) => Rule.custom(validateInternalPath),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "ctaLabel",
      media: "image",
    },
  },
});

export const homePageSectionType = defineType({
  name: "homePageSection",
  title: "Homepage Section",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "ctaLabel",
      title: "CTA Label",
      type: "string",
    }),
    defineField({
      name: "ctaHref",
      title: "CTA Link",
      type: "string",
      validation: (Rule) => Rule.custom(validateInternalPath),
    }),
    defineField({
      name: "backgroundImage",
      title: "Background Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "backgroundImageUrl",
      title: "Background Image URL Fallback",
      description:
        "Use a site-relative path like /images/example.jpg or an absolute https:// URL when you do not want to upload an asset.",
      type: "string",
      validation: (Rule) => Rule.custom(validateImageSource),
    }),
  ],
});

export const homePageCardType = defineType({
  name: "homePageCard",
  title: "Homepage Card",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "imageUrl",
      title: "Image URL Fallback",
      description:
        "Use a site-relative path like /images/example.jpg or an absolute https:// URL when you do not want to upload an asset.",
      type: "string",
      validation: (Rule) => Rule.custom(validateImageSource),
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "string",
      validation: (Rule) => Rule.required().custom(validateInternalPath),
    }),
    defineField({
      name: "badge",
      title: "Badge",
      type: "string",
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "link",
      media: "image",
    },
  },
});

export const homePageInfoCardType = defineType({
  name: "homePageInfoCard",
  title: "Homepage Info Card",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      options: {
        list: homePageIconOptions,
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "icon",
    },
  },
});

export const homePageActionCardType = defineType({
  name: "homePageActionCard",
  title: "Homepage Action Card",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "href",
      title: "Link",
      type: "string",
      validation: (Rule) => Rule.required().custom(validateInternalPath),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      options: {
        list: homePageIconOptions,
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "href",
    },
  },
});

export const shopFeatureType = defineType({
  name: "shopFeature",
  title: "Shop Feature",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "imageUrl",
      title: "Image URL Fallback",
      description:
        "Use a site-relative path like /images/example.jpg or an absolute https:// URL when you do not want to upload an asset.",
      type: "string",
      validation: (Rule) => Rule.custom(validateImageSource),
    }),
    defineField({
      name: "href",
      title: "Link",
      type: "string",
      validation: (Rule) => Rule.required().custom(validateInternalPath),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "href",
      media: "image",
    },
  },
});
