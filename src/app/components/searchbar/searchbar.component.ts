import { debounce } from "../../shared/helpers.js";

export class Searchbar extends HTMLElement {
  private _inputEl: HTMLInputElement;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {

    this.render();

    this._inputEl = this.shadowRoot.querySelector('input');
    this._inputEl.addEventListener('input', this.onKeyDown(), false);
  }

  disconnectedCallback() {
    this.removeEventListener('', this.onKeyDown(), false)
  }

  onKeyDown() {
    return debounce((event: Event) => {
      event.stopPropagation();

      const searchEvent = new CustomEvent('search', {
        detail: { query: this._inputEl.value },
        bubbles: false,
        composed: true
      });
      this.dispatchEvent(searchEvent);
    }, 1000);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          width: 100px;
          display: flex;
        }
        .search-bar {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        input {
          margin: 5px;
          height: 30px;
          border-radius: 6px;
          border: none;
          padding-left: 10px;
          outline: none;
        }
      </style>
      <div class="search-bar">
        <input type="search" id="" placeholder="I'm looking for..."/>
      </div>
    `
  }
}

customElements.define('movie-searchbar', Searchbar);