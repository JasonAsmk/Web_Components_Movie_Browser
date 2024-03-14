export interface IMovie {
  id: string;
  posterUrl: string;
  title: string;
  releaseDate: string;
  genreIds: number[];
  voteAverage: number;
  overview: string;
}

export type IMoviePreview = Pick<IMovie, 'id' | 'posterUrl' | 'title'>;