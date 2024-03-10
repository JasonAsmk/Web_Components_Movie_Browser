export class AppComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
    <style>
      * {
        font-family: "Quicksand", sans-serif;
        font-optical-sizing: auto;
        font-weight: 400;
        font-style: normal;
      }
    </style>
    <home-page></home-page>
    `;
  }
}

customElements.define('my-app', AppComponent);
