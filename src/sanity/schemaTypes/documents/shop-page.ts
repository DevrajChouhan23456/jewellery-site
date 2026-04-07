import { defineField, defineType } from "sanity";

import { validateImageSource, validateInternalPath } from "../validation";

export const shopPageDocument = defineType({
  name: "shopPage",
  title: "Shop Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "string",
    }),
    defineField({
      name: "heroEyebrow",
      title: "Hero Eyebrow",
      type: "string",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroDescription",
      title: "Hero Description",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "heroImageUrl",
      title: "Hero Image URL Fallback",
      description:
        "Use a site-relative path like /images/example.jpg or an absolute https:// URL when you do not want to upload an asset.",
      type: "string",
      validation: (Rule) => Rule.custom(validateImageSource),
    }),
    defineField({
      name: "heroCtaLabel",
      title: "Hero CTA Label",
      type: "string",
    }),
    defineField({
      name: "heroCtaHref",
      title: "Hero CTA Link",
      type: "string",
      validation: (Rule) => Rule.custom(validateInternalPath),
    }),
    defineField({
      name: "features",
      title: "Feature Cards",
      type: "array",
      of: [{ type: "shopFeature" }],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "slug.current",
      media: "heroImage",
    },
  },
});
