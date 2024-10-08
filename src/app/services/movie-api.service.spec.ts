import { appConfig } from '../app.config';
import { VideoProvider, VideoType } from '../models/video.model';
import { MovieApiService } from './movie-api.service';

global.fetch = jest.fn(() => undefined) as jest.Mock;

appConfig; // need to import this for jest.mock but it's no used causing linter hicups :(
jest.mock('../app.config', () => ({
  appConfig: {
    movieDBAPIKey: 'test-api-key',
    movieDBAPIBaseUrl: 'https://api.moobies.org/3/'
  }
}));


describe('MovieApi::Service', () => {
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

  it('queries and fetches movies', async () => {
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
    const movies = await movieApiService.searchForMovieName('Mortal Kombat');

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("https://api.moobies.org/3/search/movie?api_key=test-api-key&page=1&query=Mortal%20Kombat");
    expect(movies.length).toBe(1);
    expect(movies[0].title).toEqual('Mortal Kombat 23');
    expect(movies[0].id).toEqual('1');
  })

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

  it('fetches video data for a movie id', async() => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            {
              id: '123',
              key: '60h6lpnSgck',
              name: 'Infrastellar bloopers',
              type: 'Featurette',
              site: 'YouTube'
            }
          ]
        })
    });

    const movieApiService = MovieApiService.getInstance();
    const videos = await movieApiService.getVideoDataForMovie('321');

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(videos.length).toBe(1);
    expect(videos[0].name).toEqual('Infrastellar bloopers');
    expect(videos[0].id).toEqual('123');
    expect(videos[0].key).toEqual('60h6lpnSgck');
    expect(videos[0].videoType).toEqual(VideoType.Featurette);
    expect(videos[0].videoProvider).toEqual(VideoProvider.Youtube);
  });

  it('fetches similar movies', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            {
              id: 1,
              poster_path: '/abcdef123456789.jpg',
              title: 'Tremors: Texas Ranger edition',
            }
          ]
        })
    });

    const movieApiService = MovieApiService.getInstance();
    const movies = await movieApiService.getSimilarMoviesForMovie('1');

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(movies.length).toBe(1);
    expect(movies[0].title).toEqual('Tremors: Texas Ranger edition');
    expect(movies[0].id).toEqual('1');
  });

  it('fetches reviews', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
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
          ]
        })
    });

    const movieApiService = MovieApiService.getInstance();

    // kinda hacky
    jest.spyOn(<any>movieApiService, 'sanitizeString').mockImplementation(x => x);

    const reviews = await movieApiService.getReviewsForMovie('1');

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(reviews.length).toBe(1);
    expect(reviews[0].username).toEqual('jasonasmk');
    expect(reviews[0].content).toEqual('Would watch again for sho!');
    expect(reviews[0].rating).toEqual('9.9');
    expect(reviews[0].name).toEqual('Iasonas');
  });
});
