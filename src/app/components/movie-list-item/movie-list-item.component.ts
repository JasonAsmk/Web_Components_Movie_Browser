import { appConfig } from '../../app.config.js';
import { IMovie } from '../../models/movie.model.js';

export class MovieListItem extends HTMLElement {
  private _movieData: IMovie & { genres: string[] };
  private _imageCDNUrl: string;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._imageCDNUrl = appConfig.movieDBImageCDNUrl;
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
  }

  public render() {
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
      const imageUrl = this._imageCDNUrl + this._movieData.posterUrl;
      const yearOfRelease = new Date(this._movieData.releaseDate).getFullYear();
      const genres = this._movieData.genres.map(genre => `<div class="genre">${genre}</div>`).join('');
      const roundedAverage = Math.round(this._movieData.voteAverage * 10) / 10;
      listContent = `
        <li class="flex-container">
          <div class="left-side-container">
            <img src="${imageUrl}" class="poster"/>
          </div>
          <div class="right-side-container">
            <div>
              <h2>${this._movieData.title} <span class="year-of-release">(${yearOfRelease})</span></h2>
              <p>${this._movieData.overview}</p>
            </div>
            <div class="extra-info-container">
              <div class="genre-list">${genres}</div>
              <div class="vote-average">${roundedAverage}<img src="dist/assets/icons/star.svg" class="icon-star"/></div>
            </div>
          </div>
        </li>
        `;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          box-shadow: 0px 0px 8px -2px rgba(0,0,0,0.2);
          border-radius: 8px;
        }
        .flex-container {
          display: flex;
          padding: 10px;
          border: solid 1px black;
          border-radius: 8px;
          gap: 10px;
          background: white;
        }
        .poster {
          width: 90px;
          height: 135px;
          border-radius: 10px;
          box-shadow: 0px 10px 15px 7px rgba(0,0,0,0.1);
        }
        .year-of-release {
          font-size: 13px;
        }
        p {
          font-size: 12px;
          margin: 0;
          margin-top: 5px;
        }
        h2 {
          margin: 0;
        }
        .genre-list,
        .vote-average,
        .extra-info-container,
        .left-side-container {
          display: flex;
          align-items: center;
        }
        .extra-info-container{
          justify-content: space-between;
        }
        .right-side-container {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .genre-list {
          gap: 10px;
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
      </style>
      <li>
        ${listContent}
      </li>
    `;
  }
}

customElements.define('movie-list-item', MovieListItem);
