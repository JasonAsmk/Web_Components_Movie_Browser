export class AppComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `<home-page></home-page>`;
  }
}

customElements.define("my-app", AppComponent);
