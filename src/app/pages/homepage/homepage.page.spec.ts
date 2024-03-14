/**
 * @jest-environment jsdom
 */

import { HomePage } from './homepage.page';

jest.useFakeTimers();

jest.mock('../../services/movie.service', () => {
  const mockObj = {};
  (<any>mockObj).getInstance = () => ({
      getGenreMap: jest.fn().mockResolvedValue(new Map()),
      getChunkOfNowPlayingMovies: jest.fn(),
      getChunkOfQueriedMovies: jest.fn(),
      movies: [],
      genreMap: new Map()
  })
  return { MovieService: mockObj };
});


describe('HomePage::Page', () => {
  let element;
  let mockMovieService;

  beforeEach(() => {
    if (!customElements.get('home-page')) {
      customElements.define('home-page', HomePage);
    }

    jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    document.body.innerHTML = '<home-page></home-page>';
    element = document.body.querySelector('home-page');

    mockMovieService = element._movieService;
  });

  afterEach(() => {
    jest.spyOn(window, 'scrollTo').mockRestore();
  })

  it('initializes', async () => {
    const header = element.shadowRoot.querySelector('.header h1');
    expect(header.textContent).toBe('MovieRama');
  });

  describe('browsing now playing', () => {
    it('gets some movies when starting', () => {
      mockMovieService.movies = [{ id: '1', title: 'The Conjuring', genreIds: [1] }, { id: '2', title: 'Goonies', genreIds: [3] }];

      element.render();
      const items = element.shadowRoot.querySelectorAll('movie-list-item');

      expect(mockMovieService.getChunkOfNowPlayingMovies).toHaveBeenCalledTimes(1);
      expect(items.length).toEqual(2);
    });

    it('loads more items on scroll when no searching', async () => {
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1000, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
      Object.defineProperty(window, 'scrollY', { value: 700, configurable: true });

      window.dispatchEvent(new Event('scroll'));
      jest.advanceTimersToNextTimer();

      // one on init, one on scroll
      expect(mockMovieService.getChunkOfNowPlayingMovies).toHaveBeenCalledTimes(2);
    });
  });

  describe('search', () => {
    it('searches for movies when user has typed on search', async () => {
      const searchbar = element.shadowRoot.querySelector('movie-searchbar');
      const searchEvent = new CustomEvent('search', {
        detail: { query: "Goonies" },
        bubbles: false,
        composed: true
      });
      searchbar.dispatchEvent(searchEvent);
      expect(mockMovieService.getChunkOfQueriedMovies).toHaveBeenCalledWith("Goonies");
    });

    it('loads more items on scroll when searching', async () => {
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1000, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
      Object.defineProperty(window, 'scrollY', { value: 700, configurable: true });
      element.searchQuery = 'Power Rangers';

      window.dispatchEvent(new Event('scroll'));
      jest.advanceTimersToNextTimer();

      expect(mockMovieService.getChunkOfQueriedMovies).toHaveBeenCalledTimes(1);
    });
  })
});