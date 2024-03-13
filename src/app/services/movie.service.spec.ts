import { VideoProvider, VideoType } from '../models/video.model';
import { MovieService } from './movie.service';

jest.mock('./movie-api.service', () => {
  const mockObj = {};
  (<any>mockObj).getInstance = () => ({
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
    searchForMovieName: jest.fn().mockImplementation((query, currentPage) => {
      if (currentPage === 1)
        return [
          { id: '5', title: 'Animorphs endgame', genreIds: [1, 2] },
          { id: '6', title: 'Animorphial-X', genreIds: [2, 3] }
        ];
      else if (currentPage === 2)
        return [
          { id: '7', title: 'Animorphs 2', genreIds: [3] },
          { id: '8', title: 'Man morpheus', genreIds: [2, 3] }
        ];
      else return [];
    }),
    getMovieGenres: jest.fn().mockResolvedValue(
      new Map([
        [1, 'Horror'],
        [2, 'Spoopy'],
        [3, 'Thriller']
      ])
    ),
    getVideoDataForMovie: jest.fn().mockResolvedValue([])
  })

  return { MovieApiService: mockObj };
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

  describe('getChunkOfNowPlayingMovies', () => {
    it('should fetch and store first page of now playing movies', async () => {
      await sut.getChunkOfNowPlayingMovies();
      expect(sut.movies.length).toBe(2);
      expect(sut.movies[0].title).toEqual('Krav Maga Panda');
      expect((<any>sut)._nowPlayingPage).toBe(2);
    });

    it('should fetch and store second page of now playing movies', async () => {
      await sut.getChunkOfNowPlayingMovies();
      await sut.getChunkOfNowPlayingMovies();
      expect(sut.movies.length).toBe(4);
      expect(sut.movies[0].title).toEqual('Krav Maga Panda');
      expect(sut.movies[2].title).toEqual('Carebears 5: The new order');
      expect((<any>sut)._nowPlayingPage).toBe(3);
    });

    it('clear paging and should refetch all over if we did a search right before', async () => {
      (<any>sut)._nowPlayingPage = 4;
      (<any>sut)._queriesPage = 66;
      (<any>sut)._lastQuery = 'Alien vs Predator';
      sut.movies = [<any>{ id: '55', title: 'Alien vs Predator', genreIds: [2, 3] }]

      await sut.getChunkOfNowPlayingMovies();

      expect((<any>sut)._nowPlayingPage).toEqual(2);
      expect((<any>sut)._queriesPage).toEqual(1);
      expect(sut.movies.length).toBe(2);
      expect(sut.movies[0].title).toEqual('Krav Maga Panda');
      expect((<any>sut)._nowPlayingPage).toBe(2);
    });
  });

  describe('getChunkOfQueriedMovies', () => {
    it('should fetch and store first page of a query results', async () => {
      await sut.getChunkOfQueriedMovies('Animorph');
      expect(sut.movies.length).toBe(2);
      expect(sut.movies[0].title).toEqual('Animorphs endgame');
      expect((<any>sut)._queriesPage).toBe(2);
    });

    it('should fetch and store second page of a query results', async () => {
      await sut.getChunkOfQueriedMovies('Animorph');
      await sut.getChunkOfQueriedMovies('Animorph');
      expect(sut.movies.length).toBe(4);
      expect(sut.movies[2].title).toEqual('Animorphs 2');
      expect((<any>sut)._queriesPage).toBe(3);
    });

    it('clears paging when query string changes', async () => {
      await sut.getChunkOfQueriedMovies('Animorph');
      await sut.getChunkOfQueriedMovies('Jeeper\'s creepers');
      expect((<any>sut)._queriesPage).toBe(2);
      expect(sut.movies.length).toBe(2);
    });
  })

  describe('getGenreMap', () => {
    it('should fetch and store genre mappings', async () => {
      await sut.getGenreMap();
      expect(sut.genreMap.size).toBe(3);
      expect(sut.genreMap.get(1)).toEqual('Horror');
    });
  });

  describe('getBestMatchVideoDataForMovie', () => {
    it('returns null if no videos returned from api', async () => {
      const mockMovieApiService = (<any>sut)._movieApiService;
      jest.spyOn(mockMovieApiService, 'getVideoDataForMovie').mockResolvedValue(Promise.resolve([]))
      const res = await sut.getBestMatchVideoDataForMovie('123');
      expect(res).toEqual(null);
    })

    it('returns null if provided movie id is empty', async () => {
      const res = await sut.getBestMatchVideoDataForMovie('');
      expect(res).toEqual(null);
    });

    it('returns no video if no youtube video available', async () => {
      const mockMovieApiService = (<any>sut)._movieApiService;
      jest.spyOn(mockMovieApiService, 'getVideoDataForMovie').mockResolvedValue(Promise.resolve([
        { id: '1', videoType: VideoType.BehindTheScenes, videoProvider: VideoProvider.Other, key: '111', name: 'best video' },
        { id: '2', videoType: VideoType.Trailer, videoProvider: VideoProvider.Other, key: '222', name: 'Official trailer' },
      ]))
      const res = await sut.getBestMatchVideoDataForMovie('123');
      expect(res).toEqual(null);
    })

    it('returns a trailer if there\'s one', async () => {
      const mockMovieApiService = (<any>sut)._movieApiService;
      jest.spyOn(mockMovieApiService, 'getVideoDataForMovie').mockResolvedValue(Promise.resolve([
        { id: '1', videoType: VideoType.BehindTheScenes, videoProvider: VideoProvider.Youtube, key: '111', name: 'best video' },
        { id: '2', videoType: VideoType.Trailer, videoProvider: VideoProvider.Youtube, key: '222', name: 'Official trailer' },
      ]))
      const res = await sut.getBestMatchVideoDataForMovie('123');
      expect(res.name).toEqual('Official trailer');
    })

    it('returns anything if there\'s no trailer', async () => {
      const mockMovieApiService = (<any>sut)._movieApiService;
      jest.spyOn(mockMovieApiService, 'getVideoDataForMovie').mockResolvedValue(Promise.resolve([
        { id: '1', videoType: VideoType.BehindTheScenes, videoProvider: VideoProvider.Youtube, key: '111', name: 'best video' },
        { id: '2', videoType: VideoType.Clip, videoProvider: VideoProvider.Youtube, key: '222', name: 'Editors cut' },
      ]))
      const res = await sut.getBestMatchVideoDataForMovie('123');
      expect(res.name).toEqual('best video');
    })
  })

});
