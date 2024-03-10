export class HomePage extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = '<p>Hello from homepage</p>';
  }
}

customElements.define('home-page', HomePage);
