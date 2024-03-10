import { MovieApiService } from '../../services/movie-api.service.js';
import { MovieService } from '../../services/movie.service.js';

export class HomePage extends HTMLElement {
  private _movieService: MovieService;
  private _movieApiService: MovieApiService;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    this._movieService = MovieService.getInstance();
    this._movieApiService = MovieApiService.getInstance();

    await this._movieService.getGenreMap();
    await this._movieService.getChunkOfNowPlayingMovies();

    this.render();
  }

  public render() {
    // const items = [
    //   {
    //     id: '123',
    //     title: 'Kung fu panda: The pandamonium',
    //     overview:
    //       'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vitae est neque. Quisque sit amet massa nec arcu sodales convallis. Praesent tempor nunc a justo finibus hendrerit. Etiam fringilla sapien id quam ultrices dignissim. Sed commodo cursus laoreet. Aliquam erat volutpat. Pellentesque mattis posuere eros et faucibus. Phasellus aliquet nunc eu mi tempor ultricies. Sed rutrum nunc in pretium eleifend.',
    //     voteAverage: '4.9',
    //     posterUrl: '/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg',
    //     releaseDate: '2020-03-04',
    //     genreIds: [1, 2, 3]
    //   }
    // ];

    const items = this._movieService.movies.map(movie => ({
      ...movie,
      genreIds: movie.genreIds.map(genreId => this._movieService.genreMap.get(genreId))
    }));
    const itemListFragment = document.createDocumentFragment();

    const movieItems = items.map(item => {
      const movieItem = document.createElement('movie-list-item');
      movieItem.movieData = item;
      itemListFragment.appendChild(movieItem);
    });

    this.shadowRoot.innerHTML = `
      <style>
        ul {
          list-style-type: none;
          padding-left: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 18px;
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
        }
      </style>
      <div id="homepage">
        <h1>MovieRama</h1>
        <ul id="moviesList"></ul>
      </div>
    `;

    const moviesList = this.shadowRoot.getElementById('moviesList');
    moviesList.appendChild(itemListFragment);
  }
}

customElements.define('home-page', HomePage);
