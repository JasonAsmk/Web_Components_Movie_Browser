/**
 * @jest-environment jsdom
 */

import { MovieReview } from './movie-review.component';

jest.mock("../../services/movie.service.js", () => {
  const mockObj = {};
  (<any>mockObj).getInstance = () => ({
    getReviewsForMovie: jest.fn().mockResolvedValue([
      {
        id: '1',
        author_details: {
          name: 'Iasonas',
          username: 'jasonasmk',
          rating: 9.9,
          avatar_path: 'prettyguy.jpg'
        },
        content: 'Would watch again for sho!'
      }
    ])
  })
  return { MovieService: mockObj }
});

describe('MovieReview::Component', () => {
  let element;

  beforeEach(() => {
    if (!customElements.get('movie-review')) {
      customElements.define('movie-review', MovieReview);
    }

    document.body.innerHTML = '<movie-review></movie-review>';
    element = document.querySelector('movie-review');
  });

  it('fetches and renders reviews on movie-id attribute change', async () => {
    element.setAttribute('movie-id', '123');

    await Promise.resolve();

    const reviewsContainer = element.shadowRoot.querySelector('.flex-container');
    expect(reviewsContainer).not.toBeNull();

    const reviews = reviewsContainer.querySelectorAll('.review');
    expect(reviews.length).toBeGreaterThan(0);

    const firstReviewContent = reviews[0].querySelector('.bottom-container').textContent.trim();
    expect(firstReviewContent).toBe('Would watch again for sho!');
  });
});