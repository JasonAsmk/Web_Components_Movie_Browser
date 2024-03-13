import { IMovie } from 'src/app/models/movie.model.js';
import { MovieService } from '../../services/movie.service.js';
import { throttle } from '../../shared/helpers.js';

// cloning templates is faster than everytime parsing html in render
const template = document.createElement('template');
template.innerHTML = `
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
        }
        h1 {
          padding: 10px 20px;
          width: 187px;
          margin: 0;
        }
        .header {
          z-index: 1;
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
          position: fixed;
          width: 100%;
          box-shadow: 0px 16px 55px 10px rgba(255,255,255,1);
        }
        #moviesList {
          margin-top: 0;
          margin-bottom: 0;
          padding-bottom: 20px;
          padding-left: 10px;
          padding-right: 10px;
        }
        #homepage {
          background: #FCF5E5;
        }
        .flex-container {
          display: flex;
          flex-wrap: wrap;
        }
      </style>

      <div id="homepage">
        <div class="header">
          <div class=flex-container>
            <h1>MovieRama</h1>
            <movie-searchbar></movie-searchbar>
          </div>
        </div>
        <ul id="moviesList"></ul>
      </div>
    `;

export class HomePage extends HTMLElement {
  public canFetchMore = true;  // signifies if api calls can return more movies, if false stops spamming api calls

  private _searchQuery: string;

  public set searchQuery(value: string) {
    if(this._searchQuery !== value) {
      this.canFetchMore = true;
    }
    this._searchQuery = value;
  };

  public get searchQuery() {
    return this._searchQuery;
  };

  private _movieService: MovieService;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    this._movieService = MovieService.getInstance();

    await this._movieService.getGenreMap();
    await this._movieService.getChunkOfNowPlayingMovies();

    window.addEventListener('scroll', this.onScroll());

    this.render();

    this.attachHostEventListeners();
  }

  attachHostEventListeners() {
    // attaching some events to host element, so that we don't have to
    // redo this allover after a full render
    this.addEventListener('search', async (event: CustomEvent) => {
      let query = event?.detail?.query?.trim();
      if(query === this.searchQuery) return;
      if(query)
        this.searchForMovies(event.detail.query);
      else {
        this.searchQuery = '';
        await this.resetToNowPlaying();
        this.render();
      }
    });
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.onScroll(), false);
  }

  onScroll() {
    // events go crazy if not throttled
    return throttle(() => {
      const distanceFromBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      if (distanceFromBottom < 200) {
        this.loadMoreItems();
      }
    }, 300);
  }

  async loadMoreItems() {
    if(!this.canFetchMore) return;

    let itemsReceived: number;
    if(this.searchQuery) {
      itemsReceived = await this._movieService.getChunkOfQueriedMovies(this.searchQuery);
    } else {
      itemsReceived = await this._movieService.getChunkOfNowPlayingMovies();
    }

    this.canFetchMore = itemsReceived > 0;
    this.updateRenderedMovieList();
  }

  async searchForMovies(query: string) {
    if(!query || query.trim() === '') {
      this.searchQuery = '';
    }
    this.searchQuery = query;
    await this._movieService.getChunkOfQueriedMovies(query);
    this.clearViewAndScrollUp();
    this.updateRenderedMovieList();
  }

  clearViewAndScrollUp() {
    window.scrollTo(0,0);
    const moviesList = this.shadowRoot.getElementById('moviesList');
    moviesList.innerHTML = '';
  }

  async resetToNowPlaying() {
    this.clearViewAndScrollUp();
    await this._movieService.getChunkOfNowPlayingMovies();
  }

  updateRenderedMovieList() {
    const moviesList = this.shadowRoot.getElementById('moviesList');
    const currentItems: string[] = Array.from(moviesList.children).map(child => child.getAttribute('data-id'));

    this._movieService.movies.forEach(movie => {
      if (!currentItems.includes(movie.id)) {
        // Append only new movies
        const movieItem = this.createAndSetupNewMovieListItem(movie);
        moviesList.appendChild(movieItem);
      }
    });
  }

  // creates a new movie-list-item and setups its data and event listeners
  createAndSetupNewMovieListItem(movie: IMovie) {
    let movieItem = document.createElement('movie-list-item');
    const itemData = {
      ...movie,
      genres: movie.genreIds.map(genreId => this._movieService.genreMap.get(genreId))
    }
    movieItem.setAttribute('data-id', itemData.id);
    movieItem.addEventListener('click', () => this.handleClickOnMovieItem(movieItem));
    (<any>movieItem).movieData = itemData;
    return movieItem;
  }

  handleClickOnMovieItem(movieItem) {
    // it might be the case that there's another one expanded or not so we have to account for that
    const currentExpandedItem = this.shadowRoot.querySelector('movie-list-item[expand]');
    const isCurrentItemExpanded = movieItem.hasAttribute('expand');

    if (currentExpandedItem && currentExpandedItem !== movieItem) {
      currentExpandedItem.removeAttribute('expand');
    }

    movieItem.toggleAttribute('expand');

    setTimeout(() => {
      this.scrollToItem(movieItem, isCurrentItemExpanded);
    }, 210); // gotta account for delays from movie items' transitions
  }

  scrollToItem(movieItem, isCurrentlyExpanded) {
    if(!isCurrentlyExpanded){
      const top = window.scrollY + movieItem.getBoundingClientRect().top - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  render() {
    const movies = this._movieService.movies;
    const itemListFragment = document.createDocumentFragment();

    movies.map(movie => {
      const movieItem = this.createAndSetupNewMovieListItem(movie);
      itemListFragment.appendChild(movieItem);
    });

    // reset and clone preparsed template
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    const moviesList = this.shadowRoot.getElementById('moviesList');
    moviesList.appendChild(itemListFragment);
  }
}

customElements.define('home-page', HomePage);
