/**
 * Customer reviews shown on the home page.
 *
 * Source (July 2026): the store's Google Business Profile, transcribed at the
 * operator's request and superseding the earlier Facebook Marketplace
 * screenshots (docs D-012 → D-016). Only customer text is reproduced — the
 * store's own replies are intentionally left out.
 *
 * Google shows relative times ("2 days ago"); those were converted to posting
 * dates so the copy does not go stale. Reviews truncated by Google's "More"
 * link are transcribed up to the visible text and flagged.
 *
 * Do not add aggregate rating markup (JSON-LD) for these: Google's structured
 * data policy excludes reviews collected on third-party platforms.
 */

export type CustomerReview = {
  id: string;
  author: string;
  /** Posting date, formatted for display. */
  date: string;
  /** Star rating shown on the source review. */
  rating: number;
  quote: string;
  /** True when the source truncated the review with a "More" link. */
  truncated?: boolean;
};

export const REVIEWS_SOURCE_LABEL = 'Reviews from Google';

export const customerReviews: CustomerReview[] = [
  {
    id: 'sam-adams-2026-07-23',
    author: 'Sam Adams',
    date: 'Jul 23, 2026',
    rating: 5,
    quote:
      'I hardly ever leave reviews for anything, but I had to give a 5-star review here! My new couch is amazing, we got it for an incredible price, and the service we had was fantastic. For anyone looking to get a new piece of furniture, this should legitimately be your very first stop.',
  },
  {
    id: 'ludmila-graniso-2026-07-23',
    author: 'Ludmila Graniso',
    date: 'Jul 23, 2026',
    rating: 5,
    quote:
      'Excellent experience! We were treated exceptionally well from the very beginning, and everyone was incredibly attentive. We purchased a sofa, and the quality exceeded our expectations. Everything was perfect! I highly recommend them to everyone!',
  },
  {
    id: 'reese-adams-2026-07-23',
    author: 'Reese Adams',
    date: 'Jul 23, 2026',
    rating: 5,
    quote:
      'Alex and Jessica were so sweet! Their selection was perfect and had our dream couch! Delivery was very smooth and fast! Definitely recommend!',
  },
  {
    id: 'alessandro-aberle-2026-07-22',
    author: 'Alessandro Aberle',
    date: 'Jul 22, 2026',
    rating: 5,
    quote:
      'We had such a great experience with 801 Outlet! From the moment we walked in, everyone was friendly, patient, and genuinely interested in helping us find the right furniture. The quality exceeded our expectations, the prices were fantastic,',
    truncated: true,
  },
  {
    id: 'robin-hose-2026-07-22',
    author: 'Robin Hose',
    date: 'Jul 22, 2026',
    rating: 5,
    quote:
      'Just delivered my new couch! It is beautiful and I love it!! They took my old couch and chair out to garage and brought new one in and set up. Very comfortable and their customer service was awesome! Very honest and fair, give them a try. I will go back for anything I need!!',
  },
  {
    id: 'lucas-saccomanno-2026-07-22',
    author: 'Lucas Saccomanno',
    date: 'Jul 22, 2026',
    rating: 5,
    quote:
      'Great customer service! They answered all my questions and helped me find the perfect fit for my home. The furniture is high quality, the prices are great, and the delivery was incredibly fast. Thank you!',
  },
  {
    id: 'rafael-rena-2026-07-22',
    author: 'Rafael Rena',
    date: 'Jul 22, 2026',
    rating: 5,
    quote:
      "The sofa exceeded my expectations! It's very comfortable, well-made, and offers great value for the price. The delivery was completed on the same day, and it was fast and efficient, which made the whole shopping experience even better. I highly recommend both the product and the service!",
  },
  {
    id: 'isabel-lach-2026-07-22',
    author: 'Isabel Lach',
    date: 'Jul 22, 2026',
    rating: 5,
    quote:
      'Had a super easy time picking out a couch with a lot of great options. The owners were very helpful and made it easy to find the right one. Great prices and an incredibly easy delivery process. Could not be happier with the service and would recommend 801 to anyone!',
  },
];
