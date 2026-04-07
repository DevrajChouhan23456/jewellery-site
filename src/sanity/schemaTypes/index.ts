import { homePageDocument } from "./documents/home-page";
import { shopPageDocument } from "./documents/shop-page";
import {
  heroSlideType,
  homePageActionCardType,
  homePageCardType,
  homePageInfoCardType,
  homePageSectionType,
  shopFeatureType,
} from "./objects";

export const schemaTypes = [
  heroSlideType,
  homePageSectionType,
  homePageCardType,
  homePageInfoCardType,
  homePageActionCardType,
  shopFeatureType,
  homePageDocument,
  shopPageDocument,
];
