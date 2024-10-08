import { appConfig } from '../app.config.js';
import { IMovie, IMoviePreview } from '../models/movie.model.js';
import { IMovieReview } from '../models/review.model.js';
import { IVideo, VideoProvider, VideoType } from '../models/video.model.js';
import { AbstractSingleton } from '../shared/abstract-singleton.js';


export class MovieApiService extends AbstractSingleton<MovieApiService> {
  private _baseUrl;
  private _apiKey;

  constructor() {
    super();

    // in a real scenario this has to be safer
    this._apiKey = appConfig.movieDBAPIKey;
    this._baseUrl = appConfig.movieDBAPIBaseUrl;
  }

  public async getNowPlayingMovies(page?: number): Promise<IMovie[]> {
    const endpoint = this._baseUrl + `movie/now_playing?api_key=${this._apiKey}&page=${page ?? 1}`;
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
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
      console.error('Could not fetch movies: ', error);
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
      console.error('Could not fetch movies: ', error);
      return new Map();
    }
  }

  public async searchForMovieName(query: string, page?: number) {
    const encodedQuery = encodeURIComponent(query);
    const endpoint = this._baseUrl + `search/movie?api_key=${this._apiKey}&page=${page ?? 1}&query=${encodedQuery}`;
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
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
      console.error('Could query for movie name: ', error);
      return [];
    }
  }

  public async getVideoDataForMovie(movieId: string): Promise<IVideo[]> {
    const endpoint = this._baseUrl + `movie/${movieId}/videos?api_key=${this._apiKey}`;
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      return data.results.map((serverMovie) => ({
        id: serverMovie.id + '',
        key: serverMovie.key + '',
        name: serverMovie.name,
        videoType: this.mapServerToLocalVideoType(serverMovie.type),
        videoProvider: serverMovie.site === 'YouTube' ? VideoProvider.Youtube : VideoProvider.Other
      }));
    } catch (error) {
      console.error(`Could not fetch video links for movie id ${movieId}: `, error);
      return [];
    }
  }

  public async getSimilarMoviesForMovie(movieId: string): Promise<IMoviePreview[]> {
    const endpoint = this._baseUrl + `movie/${movieId}/similar?api_key=${this._apiKey}`;
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      return data.results.map((serverMovie: any) => ({
        id: serverMovie.id + '',
        posterUrl: serverMovie.poster_path,
        title: serverMovie.title,
      }));
    } catch (error) {
      console.error('Could not fetch movies: ', error);
      return [];
    }
  }

  public async getReviewsForMovie(movieId: string): Promise<IMovieReview[]> {
    const endpoint = this._baseUrl + `movie/${movieId}/reviews?api_key=${this._apiKey}`;
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      return data.results.map((serverReview: any) => ({
        id: serverReview.id + '',
        name: this.sanitizeString(serverReview.author_details?.name),
        username: this.sanitizeString(serverReview.author_details?.username),
        content: this.cleanupReview(this.sanitizeString(serverReview.content)),
        rating: serverReview.author_details?.rating + '',
        avatarPath: serverReview.author_details?.avatar_path
      }));
    } catch (error) {
      console.error('Could not fetch reviews: ', error);
      return [];
    }
  }

  private sanitizeString(s: string) {
    return window.DOMPurify.sanitize(s);
  }

  private cleanupReview(s: string) {
    // too many underscores in review content for some reason
    return s.split('_').join("");
  }

  private mapServerToLocalVideoType(videoType: string): VideoType {
    switch(videoType) {
      case 'Clip': return VideoType.Clip
      case 'Featurette': return VideoType.Featurette
      case 'Teaser': return VideoType.Teaser
      case 'BehindTheScenes': return VideoType.BehindTheScenes
      case 'Trailer': return VideoType.Trailer
      default: return VideoType.Other
    }
  }
}
