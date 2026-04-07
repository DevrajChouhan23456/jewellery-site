import { defineField, defineType } from "sanity";

export const homePageDocument = defineType({
  name: "homePage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({
      name: "heroSlides",
      title: "Hero Slides",
      type: "array",
      of: [{ type: "heroSlide" }],
    }),
    defineField({
      name: "categorySection",
      title: "Category Section",
      type: "homePageSection",
    }),
    defineField({
      name: "categoryCards",
      title: "Category Cards",
      type: "array",
      of: [{ type: "homePageCard" }],
    }),
    defineField({
      name: "trendingSection",
      title: "Trending Section",
      type: "homePageSection",
    }),
    defineField({
      name: "trendingCards",
      title: "Trending Cards",
      type: "array",
      of: [{ type: "homePageCard" }],
    }),
    defineField({
      name: "arrivalSection",
      title: "Arrival Section",
      type: "homePageSection",
    }),
    defineField({
      name: "arrivalCards",
      title: "Arrival Cards",
      type: "array",
      of: [{ type: "homePageCard" }],
    }),
    defineField({
      name: "genderSection",
      title: "Gender Section",
      type: "homePageSection",
    }),
    defineField({
      name: "genderCards",
      title: "Gender Cards",
      type: "array",
      of: [{ type: "homePageCard" }],
    }),
    defineField({
      name: "servicePillars",
      title: "Service Pillars",
      type: "array",
      of: [{ type: "homePageInfoCard" }],
    }),
    defineField({
      name: "reassuranceHighlights",
      title: "Reassurance Highlights",
      type: "array",
      of: [{ type: "homePageInfoCard" }],
    }),
    defineField({
      name: "conciergeEyebrow",
      title: "Concierge Eyebrow",
      type: "string",
    }),
    defineField({
      name: "conciergeTitle",
      title: "Concierge Title",
      type: "string",
    }),
    defineField({
      name: "conciergeActions",
      title: "Concierge Actions",
      type: "array",
      of: [{ type: "homePageActionCard" }],
    }),
    defineField({
      name: "stylingJournalEyebrow",
      title: "Styling Journal Eyebrow",
      type: "string",
    }),
    defineField({
      name: "stylingJournalTitle",
      title: "Styling Journal Title",
      type: "string",
    }),
    defineField({
      name: "stylingTips",
      title: "Styling Tips",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Homepage",
        subtitle: "Primary storefront landing page",
      };
    },
  },
});
