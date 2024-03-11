import { appConfig } from '../app.config.js';
import { IMovie } from '../models/movie.model';
import { AbstractSingleton } from '../shared/abstract-singleton.js';

export class MovieApiService extends AbstractSingleton<MovieApiService> {
  private _baseUrl = 'https://api.themoviedb.org/3/';
  private _apiKey;

  constructor() {
    super();
    console.log('Movie api created');

    // in a real scenario this has to be safer
    this._apiKey = appConfig.movieDBAPIKey;
  }

  public async getNowPlayingMovies(page?: number): Promise<IMovie[]> {
    const endpoint = this._baseUrl + `movie/now_playing?api_key=${this._apiKey}&page=${page ?? 1}`;
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      data.results;
      return data.results.map((serverMovie: any) => ({
        id: serverMovie.id + '',
        posterUrl: serverMovie.poster_path,
        title: serverMovie.title,
        releaseDate: serverMovie.release_date,
        genreIds: [...serverMovie.genre_ids],
        voteAverage: serverMovie.vote_average,
        overview: serverMovie.overview
      }));
    } catch (error) {
      console.error('Could not fetch movies ', error);
      return [];
    }
  }

  public async getMovieGenres(): Promise<Map<number, string>> {
    const endpoint = this._baseUrl + `genre/movie/list?api_key=${this._apiKey}`;
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      const genreMap = data.genres.reduce((map: any, genre: any) => {
        map.set(genre.id, genre.name);
        return map;
      }, new Map<number, string>());
      return genreMap;
    } catch (error) {
      console.error('Could not fetch movies ', error);
      return new Map();
    }
  }
}
