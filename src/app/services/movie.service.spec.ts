import { MovieService } from './movie.service';

jest.mock('./movie-api.service', () => {
  const mockInstanceMethods = {
    getNowPlayingMovies: jest.fn().mockImplementation(currentPage => {
      if (currentPage === 1)
        return [
          { id: '1', title: 'Krav Maga Panda', genreIds: [1, 2] },
          { id: '2', title: 'Four mornings at Freddys', genreIds: [2, 3] }
        ];
      else if (currentPage === 2)
        return [
          { id: '3', title: 'Carebears 5: The new order', genreIds: [3] },
          { id: '4', title: "Chucky's father in law", genreIds: [2, 3] }
        ];
      else return [];
    }),
    getMovieGenres: jest.fn().mockResolvedValue(
      new Map([
        [1, 'Horror'],
        [2, 'Spoopy'],
        [3, 'Thriller']
      ])
    )
  };

  const mockClass = jest.fn().mockImplementation(() => mockInstanceMethods);

  // static :(
  (<any>mockClass).getInstance = jest.fn(() => mockInstanceMethods);

  return { MovieApiService: mockClass };
});

describe('Movie::Service', () => {
  let sut: MovieService;
  beforeEach(() => {
    MovieService.resetInstance(); // need to clear this thing yo
    sut = MovieService.getInstance();
  });

  it('initializes', () => {
    expect(sut).toBeDefined();
  });

  it('should fetch and store first page of now playing movies', async () => {
    await sut.getChunkOfNowPlayingMovies();
    expect(sut.movies.length).toBe(2);
    expect(sut.movies[0].title).toEqual('Krav Maga Panda');
    expect(sut.currentPage).toBe(2);
  });

  it('should fetch and store second page of now playing movies', async () => {
    await sut.getChunkOfNowPlayingMovies();
    await sut.getChunkOfNowPlayingMovies();
    expect(sut.movies.length).toBe(4);
    expect(sut.movies[0].title).toEqual('Krav Maga Panda');
    expect(sut.movies[2].title).toEqual('Carebears 5: The new order');
    expect(sut.currentPage).toBe(3);
  });

  it('should fetch and store genre mappings', async () => {
    await sut.getGenreMap();
    expect(sut.genreMap.size).toBe(3);
    expect(sut.genreMap.get(1)).toEqual('Horror');
  });
});
