import { MovieApiService } from '../../services/movie-api.service.js';
import { MovieService } from '../../services/movie.service.js';
import { throttle } from '../../shared/helpers.js';

export class HomePage extends HTMLElement {
  public shouldLoadMore = false;
  private _movieService: MovieService;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    this._movieService = MovieService.getInstance();

    await this._movieService.getGenreMap();
    await this._movieService.getChunkOfNowPlayingMovies();

    window.addEventListener('scroll', this.loadOnScrollEnd());

    this.render();
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.loadOnScrollEnd(), false);
  }

  loadOnScrollEnd() {
    return throttle(() => {
      const distanceFromBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      if (distanceFromBottom < 200) {
        console.log('load more!');
        this.loadMoreItems();
      }
    }, 300);
  }

  async loadMoreItems() {
    await this._movieService.getChunkOfNowPlayingMovies();
    this.updateRenderedMovieList();
  }

  updateRenderedMovieList() {
    const moviesList = this.shadowRoot.getElementById('moviesList');
    const currentItems: string[] = Array.from(moviesList.children).map(child => child.getAttribute('data-id'));

    this._movieService.movies.forEach(movie => {
      if (!currentItems.includes(movie.id)) {
        // Append only new movies
        const movieItem = document.createElement('movie-list-item');
        movieItem.setAttribute('data-id', movie.id);
        movieItem.movieData = {
          ...movie,
          genreIds: movie.genreIds.map(genreId => this._movieService.genreMap.get(genreId))
        };
        moviesList.appendChild(movieItem);
      }
    });
  }

  render() {
    const items = this._movieService.movies.map(movie => ({
      ...movie,
      genreIds: movie.genreIds.map(genreId => this._movieService.genreMap.get(genreId))
    }));
    const itemListFragment = document.createDocumentFragment();

    const movieItems = items.map(item => {
      const movieItem = document.createElement('movie-list-item');
      movieItem.setAttribute('data-id', item.id);
      (<any>movieItem).movieData = item;
      itemListFragment.appendChild(movieItem);
    });

    this.shadowRoot.innerHTML = `
      <style>
        ul {
          list-style-type: none;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 18px;

          padding-left: 0;
          padding-top: 80px;
        }
        movie-list-item {
          display: flex;
          max-width: 600px;
        }
        h1 {
          background: repeating-linear-gradient(
            45deg,
            #DAF7A6,
            #DAF7A6 10px,
            #FFC300 10px,
            #FFC300 20px,
            #FF5733 20px,
            #FF5733 30px,
            #C70039 30px,
            #C70039 40px,
            #900C3F 40px,
            #900C3F 50px
          );
          padding: 10px 20px;
          width: 100%;
          margin: 0;
        }
        .header {
          position: fixed;
          width: 100%;
          box-shadow: 0px 16px 55px 10px rgba(255,255,255,1);
        }
        #moviesList {
          margin-top: 0;
          margin-bottom: 0;
          padding-bottom: 20px;
        }
        #homepage {
          background: #FCF5E5;
        }
      </style>

      <div id="homepage">
        <div class="header">
          <h1>MovieRama</h1>
        </div>
        <ul id="moviesList"></ul>
      </div>
    `;

    const moviesList = this.shadowRoot.getElementById('moviesList');
    moviesList.appendChild(itemListFragment);
  }
}

customElements.define('home-page', HomePage);
