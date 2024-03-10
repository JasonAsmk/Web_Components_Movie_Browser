import { AbstractSingleton } from '../shared/abstract-singleton.js';
import { MovieApiService } from './movie-api.service.js';

export class MovieService extends AbstractSingleton<MovieService> {
  public movies = [];
  public genreMap: Map<number, string>; // this doesn't change much so it should be save to just save it on memory
  public currentPage = 1;

  private _movieApiService: MovieApiService;

  constructor() {
    super();
    this._movieApiService = MovieApiService.getInstance();
  }

  public async getChunkOfNowPlayingMovies() {
    const newMovies = await this._movieApiService.getNowPlayingMovies(this.currentPage);
    if (newMovies && newMovies.length) {
      this.movies = newMovies.concat(this.movies);
      this.currentPage = this.currentPage + 1;
    }
  }

  public async getGenreMap() {
    this.genreMap = await this._movieApiService.getMovieGenres();
  }
}
