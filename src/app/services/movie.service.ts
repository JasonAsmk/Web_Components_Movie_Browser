import { IMovie } from '../models/movie.model.js';
import { IVideo, VideoProvider, VideoType } from '../models/video.model.js';
import { AbstractSingleton } from '../shared/abstract-singleton.js';
import { MovieApiService } from './movie-api.service.js';

export class MovieService extends AbstractSingleton<MovieService> {
  public movies: IMovie[] = [];
  public genreMap: Map<number, string>; // this doesn't change much so it should ok to just save it on memory

  private _nowPlayingPage = 1;
  private _queriesPage = 1;
  private _lastQuery: string;

  private _movieApiService: MovieApiService;

  constructor() {
    super();
    this._movieApiService = MovieApiService.getInstance();
  }

  public async getChunkOfNowPlayingMovies(): Promise<number>{
    if(this._lastQuery)
      this.clearPagingStates();
    const newMovies = await this._movieApiService.getNowPlayingMovies(this._nowPlayingPage);
    if (newMovies && newMovies.length) {
      // we did a search before to cleanup first and set stored movies again
      if(this._lastQuery) {
        this._lastQuery = null;
        this.movies = newMovies;
      }
      // not in search, we keep accumulating stored movies normally
      else {
        this.movies = this.movies.concat(...newMovies);
      }
      this._nowPlayingPage = this._nowPlayingPage + 1;
      return newMovies.length;
    }
    return 0;
  }

  public async getChunkOfQueriedMovies(query: string): Promise<number> {
    // different query, paging starts over
    if(!query) return 0;
    if(this._lastQuery !== query)
      this.clearPagingStates();

    const queriedMovies = await this._movieApiService.searchForMovieName(query, this._queriesPage);
    if(queriedMovies && queriedMovies.length) {
      // we distinguish two cases
      // a: sequential calls of this method, where we just accumulate stored movies
      // b: search query changed, so we have to wipe our stored movies and start all over
      if(this._lastQuery === query) {
        this.movies = this.movies.concat(...queriedMovies);
      } else {
        this._lastQuery = query;
        this.movies = queriedMovies;
      }
      this._queriesPage = this._queriesPage + 1;
      return queriedMovies.length;
    }
    return 0;
  }

  public async getGenreMap() {
    this.genreMap = await this._movieApiService.getMovieGenres();
  }

  public async getBestMatchVideoDataForMovie(movieId: string): Promise<IVideo> {
    if(!movieId) return null;
    const videos: IVideo[] = await this._movieApiService.getVideoDataForMovie(movieId);
    const youtubeVideos = videos.filter(v => v.videoProvider === VideoProvider.Youtube);
    if(youtubeVideos.length === 0) return null;

    // try to get a trailer if possible
    const maybeTrailer = youtubeVideos.find(yv => yv.videoType === VideoType.Trailer);
    if(maybeTrailer)
      return maybeTrailer;
    else return youtubeVideos[0]; // whatever anything will do I guess
  }

  private clearPagingStates() {
    this._nowPlayingPage = 1;
    this._queriesPage = 1;
  }
}
