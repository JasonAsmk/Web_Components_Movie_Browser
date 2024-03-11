import { IMovie } from '../models/movie.model.js';
import { AbstractSingleton } from '../shared/abstract-singleton.js';
import { MovieApiService } from './movie-api.service.js';

export class MovieService extends AbstractSingleton<MovieService> {
  public movies: IMovie[] = [];
  public genreMap: Map<number, string>; // this doesn't change much so it should ok to just save it on memory
  public _nowPlayingPage = 1;
  public _queriesPage = 1;

  private _lastQuery: string;

  private _movieApiService: MovieApiService;

  constructor() {
    super();
    this._movieApiService = MovieApiService.getInstance();
  }

  public async getChunkOfNowPlayingMovies(): Promise<number>{
    const newMovies = await this._movieApiService.getNowPlayingMovies(this._nowPlayingPage);
    if (newMovies && newMovies.length) {
      if(this._lastQuery) {
        this._lastQuery = null;
        this.movies = newMovies;
      } else {
        this.movies = this.movies.concat(...newMovies);
      }
      this._nowPlayingPage = this._nowPlayingPage + 1;
      return newMovies.length;
    }
    return 0;
  }

  public async getChunkOfQueriedMovies(query: string): Promise<number> {
    // different query, paging starts over
    if(this._lastQuery !== query)
      this.clearPaging();
    const queriedMovies = await this._movieApiService.searchForMovieName(query, this._queriesPage);
    if(queriedMovies && queriedMovies.length) {
      this._lastQuery = query;
      this.movies = queriedMovies;
      this._queriesPage = this._queriesPage + 1;
      return queriedMovies.length;
    }
    return 0;
  }

  public async getGenreMap() {
    this.genreMap = await this._movieApiService.getMovieGenres();
  }

  private clearPaging() {
    this._nowPlayingPage = 1;
    this._queriesPage = 1;
  }
}
