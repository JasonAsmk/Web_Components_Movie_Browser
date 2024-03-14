/**
 * @jest-environment jsdom
 */

import { Searchbar } from './searchbar.component.js';

jest.useFakeTimers();

describe('Searchbar::Component', () => {
  let element;

  beforeEach(() => {
    if (!customElements.get('movie-searchbar')) {
      customElements.define('movie-searchbar', Searchbar);
    }

    document.body.innerHTML = '<movie-searchbar></movie-searchbar>';
    element = document.body.querySelector('movie-searchbar');
  });

  it('initializes', async () => {
    const input = element.shadowRoot.querySelector('input');
    expect(input).toBeDefined();
  });

  it('emits a search event on input', (done) => {
    const input: HTMLInputElement = element.shadowRoot.querySelector('input');
    input.value = 'hello';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    element.addEventListener('search', (event) => {
      expect(event.detail.query).toEqual('hello');
      done();
    })
    jest.advanceTimersByTime(1000); // account for the debounce!
  });
});