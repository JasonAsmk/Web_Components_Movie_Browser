/**
 * @jest-environment jsdom
 */

import { appConfig } from "../../app.config";
import { SimilarMovies } from './similar-movies.component';

jest.mock("../../services/movie.service.js", () => {
  const mockObj = {};
  (<any>mockObj).getInstance = () => ({
    getSimilarMoviesForMovie: jest.fn().mockResolvedValue([
      { id: '1', posterUrl: '/image1.jpg', title: 'Noise of the lambs' },
      { id: '2', posterUrl: '/image2.jpg', title: 'Death becomes me' },
      { id: '3', posterUrl: '/image3.jpg', title: 'Pride and Prejudice and Zombies' },
      { id: '4', posterUrl: '/image4.jpg', title: 'Shellraiser' },
    ])
  })
  return { MovieService: mockObj }
});

global.requestAnimationFrame = jest.fn(fn => fn()) as jest.Mock; // higher order functions ftw

appConfig; // need to import this for jest.mock but it's no used causing linter hicups :(
jest.mock("../../app.config.js", () => ({
  appConfig: {
    movieDBPreviewImageCDNUrl: 'https://image.tmdb.org/t/p/w92/'
  }
}));

describe('SimilarMovies::Component', () => {
  let element;
  beforeEach(() => {
    if (!customElements.get('similar-movies')) {
      customElements.define('similar-movies', SimilarMovies);
    }

    document.body.innerHTML = '<similar-movies></similar-movies>';
    element = document.body.querySelector('similar-movies');
  });

  it('renders similar movies after setting movie-id', async () => {
    element.setAttribute('movie-id', '123');

    await Promise.resolve(); // yikes

    const posters = element.shadowRoot.querySelectorAll('.poster')
    expect(posters.length).toBe(4);
    expect(posters[0].src).toContain('image1.jpg');
    expect(posters[1].src).toContain('image2.jpg');
  });
});