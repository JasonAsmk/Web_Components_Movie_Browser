export interface IVideo {
  id: string; // id in the movie database
  key: string; // actual thing we pass to the provider to get the video
  name: string;
  videoType: VideoType;
  videoProvider: VideoProvider;
}

export enum VideoType {
  Clip = 1,
  Featurette = 2,
  Teaser = 3,
  BehindTheScenes = 4,
  Trailer = 5,
  Other = 1000
}

export enum VideoProvider {
  Youtube = 1,
  Other = 1000
}