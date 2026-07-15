/**
 * Customer reviews shown on the home page.
 *
 * Source audit (July 2026): the live Shopify theme renders these as static
 * screenshot images of Facebook Marketplace reviews (shop files 1.png–12.png).
 * The text below is a verbatim transcription of those screenshots so they can
 * be re-presented in the premium design without shipping heavy images.
 * Reviews truncated by "See more" in the source screenshot are transcribed up
 * to the visible text only. Every source screenshot shows a 5-star rating.
 *
 * Do not add aggregate rating markup (JSON-LD) for these: there is no
 * verifiable structured source, per docs/04 and docs/06.
 */

export type CustomerReview = {
  id: string;
  author: string;
  /** Display date exactly as shown in the source screenshot. */
  date: string;
  quote: string;
  /** True when the source screenshot truncated the review with "See more". */
  truncated?: boolean;
};

export const REVIEWS_SOURCE_LABEL = 'Reviews from Facebook Marketplace customers';

export const customerReviews: CustomerReview[] = [
  {
    id: 'skip-2026-01-24',
    author: 'Skip',
    date: 'Jan 24, 2026',
    quote:
      'Very nice and helpful person. He took the time to show and explain all his items for sale. Quality is great and prices were great.',
    truncated: true,
  },
  {
    id: 'jessie-2026-01-17',
    author: 'Jessie',
    date: 'Jan 17, 2026',
    quote:
      'My purchase was exactly as described. Messages were answered promptly, and everything was made convenient on my end. Great seller to work with!!',
  },
  {
    id: 'preston-2026-01-10',
    author: 'Preston',
    date: 'Jan 10, 2026',
    quote:
      'Good and easy to work with and they have a good variety of discounted furniture!',
  },
  {
    id: 'abbey-2026-01-02',
    author: 'Abbey',
    date: 'Jan 2, 2026',
    quote:
      'Excellent seller. Prompt communication, reasonable price, and they delivered to our home.',
  },
  {
    id: 'kylee-2026-01-02',
    author: 'Kylee',
    date: 'Jan 2, 2026',
    quote:
      'Getting a couch from Alex was so easy! We love the sofa we purchased from him and we were so grateful that he has a delivery service because we do not have a vehicle that fits couches. He gave us a great price for our couch and overall we are very happy with our purchase. Highly recommend!',
  },
  {
    id: 'tom-2025-12-31',
    author: 'Tom',
    date: 'Dec 31, 2025',
    quote:
      'Great communication and the product was exactly as described. Very pleased with the purchase and the overall interaction.',
  },
  {
    id: 'maddie-2025-12-30',
    author: 'Maddie',
    date: 'Dec 30, 2025',
    quote: 'Great service and so kind!!',
  },
  {
    id: 'gargee-2025-12-30',
    author: 'Gargee',
    date: 'Dec 30, 2025',
    quote:
      'Sells great products, is very helpful and communicates well. Highly recommend!',
  },
  {
    id: 'angeline-2025-12-27',
    author: 'Angeline',
    date: 'Dec 27, 2025',
    quote:
      'Such a nice guy, very accommodating and drove up to Logan to drop off the couch! I would purchase from him again in the future.',
  },
  {
    id: 'fabiola-2025-12-26',
    author: 'Fabiola',
    date: 'Dec 26, 2025',
    quote:
      'We love our new couches and how above and beyond he went to deliver them today.',
  },
  {
    id: 'timothy-2025-12-21',
    author: 'Timothy',
    date: 'Dec 21, 2025',
    quote:
      "Alex went above and beyond to help us get what we needed the same day! Also helped us move around all our furniture. Great people, great deals, can't go wrong!",
  },
  {
    id: 'rhoda-2025-12-21',
    author: 'Rhoda',
    date: 'Dec 21, 2025',
    quote:
      'Yuka provided a truly 5-star couch-buying experience from start to finish. They were incredibly patient as we took time to decide, never rushed us, and made the entire process easy and enjoyable. The delivery was smooth and professional, and we felt we received a great price as well. Overall, it was a super experience—highly recommend!',
  },
];
