import { appConfig } from '../app.config';
import { MovieApiService } from './movie-api.service';

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ results: [], genres: [] })
  })
) as jest.Mock;

appConfig; // :( linter dictatorship sorry
jest.mock('../app.config', () => ({
  appConfig: {
    movieDBAPIKey: 'test-api-key'
  }
}));

describe('MovieApiService', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    MovieApiService.resetInstance();
  });

  it('fetches now playing movies', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            {
              id: 1,
              poster_path: '/abcdef123456789.jpg',
              title: 'Mortal Kombat 23',
              release_date: '2024-02-25',
              genre_ids: [1, 2],
              vote_average: 9.982,
              overview: `After Liu Kang's 5th resurrection warriors are once again called to defend the earth realm from Shao Kahn. Will the God council intervene this time? Fight or lose your soul.`
            }
          ]
        })
    });

    const movieApiService = MovieApiService.getInstance();
    const movies = await movieApiService.getNowPlayingMovies();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(movies.length).toBe(1);
    expect(movies[0].title).toEqual('Mortal Kombat 23');
    expect(movies[0].id).toEqual('1');
  });

  it('fetches movie genres', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          genres: [
            { id: 1, name: 'Thriller' },
            { id: 2, name: 'Horror' }
          ]
        })
    });

    const movieApiService = MovieApiService.getInstance();
    const genreMap = await movieApiService.getMovieGenres();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(genreMap.size).toBe(2);
    expect(genreMap.get(1)).toEqual('Thriller');
  });
});
