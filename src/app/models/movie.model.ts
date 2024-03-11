export interface IMovie {
  id: string;
  posterUrl: string;
  title: string;
  releaseDate: string;
  genreIds: number[];
  voteAverage: number;
  overview: string;
}
