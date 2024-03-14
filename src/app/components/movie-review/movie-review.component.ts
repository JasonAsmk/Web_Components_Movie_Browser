import { appConfig } from "../../app.config.js";
import { IMovieReview } from "../../models/review.model.js";
import { MovieService } from "../../services/movie.service.js";

export class MovieReview extends HTMLElement {
  private _reviews: IMovieReview[];
  private _movieService: MovieService;
  private _imageCDNUrl: string;

  static get observedAttributes() {
    return ['movie-id'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._movieService = MovieService.getInstance();
    this._imageCDNUrl = appConfig.movieDBAvatarImageCDNUrl;
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
        this._reviews = await this._movieService.getReviewsForMovie(newValue);
        this.render();
      }
    }
  }

  render() {
    const reviewList = this._reviews.map(review => {
      const userImage = review?.avatarPath  ? `<img src=${this._imageCDNUrl + review.avatarPath} class="avatar" />` : '';
      return `
        <div class="review">
          <div class="middle">
            <div class="top-container">
              <div class="name-and-avatar">
                <div class="name">${review.username ?? review.name }</div>
                ${userImage}
              </div>
              <div class="rating">Rated: ${ review.rating ?? '-' }/10</div>
            </div>
            <div class="bottom-container">
              ${review.content}
            </div>
          </div>
        </div>
      `
    }).join('');

    this.shadowRoot.innerHTML =
      `
        <style>
         :host {
          min-width: 0;
          overflow-x: scroll;
         }
         .flex-container {
          display: flex;
          flex-direction: column;
          overflow-y: scroll;
          max-height: 91px;
          gap: 10px;
         }
         .review {
          display: flex;
          justify-content: center;
          align-items: center;
         }
         .middle {
          font-size: 10px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
         }
         .top-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
         }
         .bottom-container {
          margin-top: 5px;
          max-height: 50px;
          overflow-y: scroll;
          padding: 0 20px;
         }
         .name-and-avatar {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-left: 10px;
         }
         .name {
          font-size: 12px;
          font-style: bold;
         }
         .avatar {
          width: 20px;
          height: 20px;
         }
         .rating {
          margin-right: 50px;
          font-size: 8px;
         }
        </style>
        <div class='flex-container'>
          ${reviewList}
        </div>
      `
  }
}

customElements.define('movie-review', MovieReview);