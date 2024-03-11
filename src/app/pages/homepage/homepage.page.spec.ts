/**
 * @jest-environment jsdom
 */

import { HomePage } from './homepage.page';

jest.useFakeTimers();
jest.mock('../../services/movie.service', () => {
  const mockObj = {};
  (<any>mockObj).getInstance = () => ({
      getGenreMap: jest.fn().mockResolvedValue(new Map()),
      getChunkOfNowPlayingMovies: jest.fn().mockResolvedValue([]),
      movies: [],
      genreMap: new Map()
  })
  return { MovieService: mockObj };
});


describe('HomePage', () => {
  let element;
  let mockMovieService;

  beforeEach(() => {
    if (!customElements.get('home-page')) {
      customElements.define('home-page', HomePage);
    }

    document.body.innerHTML = '<home-page></home-page>';
    element = document.body.querySelector('home-page');

    mockMovieService = element._movieService;
  });

  it('initializes', async () => {
    const header = element.shadowRoot.querySelector('.header h1');
    expect(header.textContent).toBe('MovieRama');

    expect(mockMovieService.getChunkOfNowPlayingMovies).toHaveBeenCalledTimes(1);
  });

  it('loads more items on scroll', async () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1000, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: 700, configurable: true });

    window.dispatchEvent(new Event('scroll'));
    jest.advanceTimersToNextTimer();

    // one on init, one on scroll
    expect(mockMovieService.getChunkOfNowPlayingMovies).toHaveBeenCalledTimes(2);
  });
});