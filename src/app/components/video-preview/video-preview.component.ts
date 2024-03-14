import { VideoProvider } from "../../models/video.model.js";

export interface IVideoProviderData {
  provider: VideoProvider;
  resourceId: string;
}

export class VideoPreview extends HTMLElement {
  private _provider: VideoProvider;
  private _providerResourceId: string;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set providerData(data: IVideoProviderData) {
    if(!data || !data.provider || !data.resourceId) return;
    if(this._provider !== data.provider || this._providerResourceId !== data.resourceId) {
      this._provider = data.provider;
      this._providerResourceId = data.resourceId;
      // this is potentially dangerous, if misused :/
      this.render();
    }
  }

  get providerData(): IVideoProviderData {
    return { provider: this._provider, resourceId: this._providerResourceId};
  }


  renderYoutube() {
    // eh ratios and stuff https://codegena.com/generator/Youtube-Embed-Code-Generator/
    const width = '400';
    const height= '235';
    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', `https://www.youtube.com/embed/${this._providerResourceId}`);
    iframe.setAttribute('width', width);
    iframe.setAttribute('height', height);
    iframe.style.border = 'none';
    this.shadowRoot.appendChild(iframe);
  }

  render() {
    if(!this._provider || !this._providerResourceId) return;

    if(this._provider === VideoProvider.Youtube) {
      this.renderYoutube();
    } else
      this.innerHTML = '';
  }
}

customElements.define('video-preview', VideoPreview);