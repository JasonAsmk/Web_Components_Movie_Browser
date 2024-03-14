//
import { AppComponent } from './app/app.component.js';
import { MovieListItem } from './app/components/movie-list-item/movie-list-item.component.js';
import { Searchbar } from './app/components/searchbar/searchbar.component.js';
import { SimilarMovies } from './app/components/similar-movies/similar-movies.component.js';
import { VideoPreview } from './app/components/video-preview/video-preview.component.js';
import { HomePage } from './app/pages/homepage/homepage.page.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Content load');
});

export { AppComponent, HomePage, MovieListItem, Searchbar, SimilarMovies, VideoPreview };

