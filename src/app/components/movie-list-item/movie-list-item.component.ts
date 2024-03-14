import { appConfig } from '../../app.config.js';
import { IMovie } from '../../models/movie.model.js';
import { MovieService } from '../../services/movie.service.js';

export class MovieListItem extends HTMLElement {
  static get observedAttributes() {
    return ['expand'];
  }

  private _movieData: IMovie & { genres: string[] };
  private _movieService: MovieService;
  private _imageCDNUrl: string;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._imageCDNUrl = appConfig.movieDBImageCDNUrl;
    this._movieService = MovieService.getInstance();
  }

  set movieData(data) {
    this._movieData = data;
    this.render();
  }

  get movieData() {
    return this._movieData;
  }

  async connectedCallback() {
    this.render();

    this.upgradeProperty('expand');
  }

  // if a user sets a property before the element is loaded
  // we need to run through properties set them again after
  // see https://web.dev/articles/custom-elements-best-practices#make_properties_lazy
  upgradeProperty(prop) {
    if(this.hasOwnProperty(prop)) {
      let value = this[prop];
      delete this[prop];
      this[prop] = value;
    }
  }

  // don't forget to declare a new attribute in the observedAttributes getter above or it won't work
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'expand') {
      this.toggleExpansion();
    }
  }

  toggleExpansion() {
    let expansionContainer = this.shadowRoot.querySelector('.expansion-container');
    if (this.hasAttribute('expand')) {
      const handleTransitionEnd = () => {
        if(this.hasAttribute('expand')) { // need to check again as it could be the wrong transition if(expansionContainer.hasChildNodes) expansionContainer.innerHTML = ''; // clear just in case
          this.hydrateExpansionContainer(expansionContainer);
        }
        this.removeEventListener('transitionend', handleTransitionEnd);
      }
      this.addEventListener('transitionend', handleTransitionEnd, { passive: true })
    } else {
      expansionContainer.innerHTML = '';
    }
  }

  // fill it up with a video, some reviews and suggestions yo!
  async hydrateExpansionContainer(expansionContainer: Element) {
    const youbuteVideo = await this._movieService.getBestMatchVideoDataForMovie(this._movieData.id);

    const videoPreview = document.createElement('video-preview');
    (<any>videoPreview).providerData = { provider: youbuteVideo.videoProvider, resourceId: youbuteVideo.key };
    expansionContainer.appendChild(videoPreview);

    const divEl = document.createElement('div');
    divEl.classList.add('similar-and-reviews');

    const similarMovies = document.createElement('similar-movies');
    (<any>similarMovies).setAttribute('movie-id', this._movieData.id);
    divEl.appendChild(similarMovies);

    const reviews = document.createElement('movie-review');
    (<any>reviews).setAttribute('movie-id', this._movieData.id);
    divEl.appendChild(reviews);

    expansionContainer.appendChild(divEl);
  }

  render() {
    let listContent;
    if (!this._movieData) {
      listContent = `
      <li class="skeleton flex-container">
          <div class="left-side-container">
            <div class="skeleton-poster"></div>
          </div>
          <div class="right-side-container">
            <div>
              <div class="skeleton-title"></div>
              <div class="skeleton-body">
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
              </p>
            </div>
          </div>
      </div>`;
    } else {
      const parsedYear = new Date(this._movieData.releaseDate).getFullYear();
      const yearOfRelease = isNaN(parsedYear) ? '' : (parsedYear + '');
      const genres = this._movieData.genres.map(genre => `<div class="genre">${genre}</div>`).join('');
      const roundedAverage = Math.round(this._movieData.voteAverage * 10) / 10;

      let poster;
      if(this._movieData.posterUrl) {
        const imageUrl = this._imageCDNUrl + this._movieData.posterUrl;
        poster = `<img src="${imageUrl}" class="poster"/>`
      } else {
        poster = `<div class="no-image poster">No image</div>`
      }

      listContent = `
        <li class="flex-container">
          <div class="main-info-container">
            <div class="left-side-container">
              ${poster}
            </div>
            <div class="right-side-container">
              <div>
                <h2>${this._movieData.title} <span class="year-of-release">${yearOfRelease ? '(' + yearOfRelease + ')' : '' }</span></h2>
                <p>${this._movieData.overview}</p>
              </div>
              <div class="extra-info-container">
                <div class="genre-list">${genres}</div>
                <div class="vote-average">${roundedAverage == 0 ? '-' : roundedAverage}<img src="dist/assets/icons/star.svg" class="icon-star"/></div>
              </div>
            </div>
          </div>
          <div class="expansion-container"></div>
        </li>
      `;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          box-shadow: 0px 0px 8px -2px rgba(0,0,0,0.2);
          border-radius: 8px;
          width: 100%;

          transition: max-width 0.2s ease-in, height 0.2s ease-in;
          height: 157px;
          max-width: 600px;
        }
        li {
          transition: transform 0.1s ease-in;
        }
        :host(:not([expand])) li {
          cursor: pointer;
        }
        :host(:not([expand])) li:hover {
          transform: scale3d(1.1, 1.1, 1);
        }
        :host([expand]) {
          min-height: 75vh;
          height: 100%;
          width: 100%;
          max-width: 100%;
        }
        .flex-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          border: solid 1px black;
          border-radius: 8px;
          background: white;
        }
        .main-info-container {
          display: flex;
          height: 137px;
          padding: 10px;
          gap: 10px;
        }
        .poster {
          width: 90px;
          height: 135px;
          border-radius: 10px;
          box-shadow: 0px 10px 15px 7px rgba(0,0,0,0.1);
        }
        .no-image {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .year-of-release {
          font-size: 13px;
        }
        p {
          font-size: 12px;
          margin: 0;
          margin-top: 5px;

          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow-y: hidden
        }
        h2 {
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden
        }
        .genre-list,
        .vote-average,
        .extra-info-container{
          display: flex;
          align-items: center;
        }
        .extra-info-container{
          justify-content: space-between;
        }
        .right-side-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .genre-list {
          gap: 10px;
          row-gap: 3px;
          flex-wrap: wrap;
          .genre {
            display: flex;
            justify-content: center;
            padding: 5px;
            background-color: #FCF5E5;
            font-size: 10px;
            min-width: 20px;
            border-radius: 20px;
            white-space: no-wrap;
          }
        }
        .icon-star {
          height: 20px;
          margin-bottom: 2px;
        }
        .vote-average {
          gap: 3px;
        }
        .skeleton {
          min-width: 600px;
          height: 157px;
        }
        .skeleton-poster {
          width: 90px;
          height: 135px;
          border-radius: 10px;
          background-color: #E5E4E2	;
        }

        .skeleton-title,
        .skeleton-body {
          width: 478px;
        }
        .skeleton-title {
          height: 20px;
          margin-top: 12px;
          background-color: #E5E4E2	;
        }
        .skeleton-body {
          height: 100px;
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin-top: 10px;
        }
        .skeleton-line {
          height: 12px;
          background-color: #E5E4E2	;
        }
        .skeleton-line:last-of-type {
          width: 350px;
        }
        .expansion-container {
          display: flex;
          padding: 0 10px;
          gap: 10px;
        }
        .similar-and-reviews {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 0;
        }
        video-preview {
          flex-shrink: 0;
          width: 400px;
          height: 235px;
        }
        @media only screen and (max-width: 600px) {
          .expansion-container {
            flex-wrap: wrap;
          }
          video-preview {
            margin: auto;
            flex-shrink: 0;
            width: 280px;
            height: 165px;
          }
        }
      </style>
      <li>
        ${listContent}
      </li>
    `;
  }
}

customElements.define('movie-list-item', MovieListItem);
