/**
 * @jest-environment jsdom
 */

import { VideoProvider } from "../../models/video.model";
import { VideoPreview } from './video-preview.component';

describe('VideoPreview', () => {
  let element;

  beforeEach(() => {
    if (!customElements.get('video-preview')) {
      customElements.define('video-preview', VideoPreview);
    }
    element = document.createElement('video-preview');
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('sets and gets providerData correctly', () => {
    const testData = { provider: VideoProvider.Youtube, resourceId: 'abc123' };
    element.providerData = testData;

    expect(element.providerData.provider).toBe(VideoProvider.Youtube);
    expect(element.providerData.resourceId).toBe('abc123');
  });

  it('renders nothing when providerData is null', () => {
    element.providerData = null;
    expect(element.children.length).toBe(0);
  });

  it('renders nothing if not youbute', () => {
    element.providerData = { provider: VideoProvider.Other, resourceId: 'cba321' };
    expect(element.children.length).toBe(0);
  });

  it('renders nothing if not valid resource', () => {
    element.providerData = { provider: VideoProvider.Youtube, resourceId: null };
    expect(element.children.length).toBe(0);
  });

  describe('YouTube rendering', () => {
    it('renders a YouTube iframe with correct attributes', () => {
      element.providerData = { provider: VideoProvider.Youtube, resourceId: 'abc123' };
      const iframe = element.shadowRoot.querySelector('iframe');

      expect(iframe).not.toBeNull();
      expect(iframe.src).toContain('youtube.com/embed/abc123');
      expect(iframe.width).toBe('400');
      expect(iframe.height).toBe('235');
    });
  });
});