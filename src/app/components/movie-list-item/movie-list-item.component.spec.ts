/**
 * @jest-environment jsdom
 */

import { MovieListItem } from './movie-list-item.component';

describe('MovieListItem', () => {
  beforeEach(() => {
    if (!customElements.get('movie-list-item')) {
      customElements.define('movie-list-item', MovieListItem);
    }

    document.body.innerHTML = '<movie-list-item></movie-list-item>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  })

  it('is defined', () => {
    const element = document.querySelector('movie-list-item');
    expect(element).toBeDefined();
  });

  it('renders movie details when movieData is set', async () => {
    const element = document.querySelector('movie-list-item');
    (<any>element).movieData = {
      id: '1',
      posterUrl: 'poster.jpg',
      title: 'Kung fu Panda',
      releaseDate: '2022-01-01',
      genres: ['horror', 'thriller'],
      voteAverage: 8.5,
      overview: 'Panda goes pandaing again'
    };

    expect((<any>element).movieData.title).toEqual('Kung fu Panda');
    expect((<any>element).shadowRoot.querySelector('p').textContent).toEqual('Panda goes pandaing again');
    expect((<any>element).shadowRoot.querySelector('h2').textContent).toEqual('Kung fu Panda (2022)');
    expect((<any>element).shadowRoot.querySelector('.vote-average').textContent).toEqual('8.5');
    expect((<any>element).shadowRoot.querySelector('img').src).toEqual('https://image.tmdb.org/t/p/w185poster.jpg');
  });
});
