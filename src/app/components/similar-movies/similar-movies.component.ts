import { appConfig } from "../../app.config.js";
import { IMoviePreview } from "../../models/movie.model.js";
import { MovieService } from "../../services/movie.service.js";

export class SimilarMovies extends HTMLElement {
  private _similarMovies: IMoviePreview[];
  private _movieService: MovieService;
  private _imageCDNUrl: string;

  static get observedAttributes() {
    return ['movie-id'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._imageCDNUrl = appConfig.movieDBPreviewImageCDNUrl;
    this._movieService = MovieService.getInstance();
  }

  connectedCallback() {
    this.upgradeProperty('movie-id');
  }

  // if a user sets a property before the element is loaded
  // we need to run through properties set them again after
  // see https://web.dev/articles/custom-elements-best-practices#make_properties_lazy
  upgradeProperty(prop) {
    if (this.hasOwnProperty(prop)) {
      let value = this[prop];
      delete this[prop];
      this[prop] = value;
    }
  }

  // don't forget to declare a new attribute in the observedAttributes getter above or it won't work
  async attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'movie-id') {
      if(newValue && newValue.length) {
        this._similarMovies = await this._movieService.getSimilarMoviesForMovie(newValue);
        this.render();
      }
    }
  }

  render() {
    const getPreviewPoster = (moviePreview: IMoviePreview) => {
      let poster;
      if(moviePreview.posterUrl) {
        const imageUrl = this._imageCDNUrl + moviePreview.posterUrl;
        poster = `<img src="${imageUrl}" style="opacity:0" class="poster"/>`
      } else {
        poster = `<div class="no-image poster">No image</div>`
      }
      return poster;
    };

    const previewMovieList = this._similarMovies.map(movie => `<div class="movie-preview">${getPreviewPoster(movie)}<div class="preview-title">${movie.title ?? ''}</div></div>`).join('')
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          min-width: 0;
          overflow-x: scroll;
          height: 134px;
          min-width: 54px;
          transition: opacity 0.1s ease-in;
        }
        img {
          height: 81px;
          border-radius: 10px;
        }
        .no-image {
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 10px;
          background-color: #FCF5E5;
          height: 81px;
          width: 54px;
          border-radius: 10px;
        }
        .flex-container {
          display: flex;
          gap: 5px;
          height: 124px;
        }
        .movie-preview {
          width: 54px;
          max-width: 70px;
          gap: 3px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
        }
        .preview-title {
          text-align: center;
          font-size: 10px;

          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow-y: hidden
        }
      </style>
      <div class="flex-container">
        ${previewMovieList}
      </div>
    `;

    requestAnimationFrame(() => {
      const posters = this.shadowRoot.querySelectorAll('.poster');
      posters.forEach((poster: any, index) => {
        const delay = index * 50;
        poster.style.transition = `opacity 0.5s ease-in ${delay}ms`;
        poster.style.opacity = '1';
      });
    });

  }

}

customElements.define('similar-movies', SimilarMovies);