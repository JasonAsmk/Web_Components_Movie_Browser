import { debounce } from "../../shared/helpers.js";

// cloning templates is faster than everytime parsing html in render
const template = document.createElement('template');
template.innerHTML =`
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
    `;


export class Searchbar extends HTMLElement {
  private _inputEl: HTMLInputElement;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this._inputEl = this.shadowRoot.querySelector('input');
    this._inputEl.addEventListener('input', this.onKeyUp(), false);
  }

  disconnectedCallback() {
    this.removeEventListener('input', this.onKeyUp(), false)
  }

  onKeyUp() {
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
}

customElements.define('movie-searchbar', Searchbar);