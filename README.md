# Snapicorn

Snapicorn is a browser photobooth. Take four photos, turn them into a vertical strip, and decorate it with a frame and pixel stickers. You can download the finished PNG, share it through your device, or save it to your local Gallery.

## Camera and storage

Snapicorn requests video when you enable the camera. Audio stays off. Photos and edits are processed in the browser and held in memory until you reload, close the page, or start a new strip.

**Save to Gallery** stores the finished PNG in this browser profile, on this website. Browser cleanup can remove saved strips; they do not sync to other browsers or devices. Download a PNG if you want a separate copy.

## Run locally

Use Node.js 20.19+ on the 20.x line, 22.13+ on the 22.x line, or 24+, and Python 3 for the example server. From the repository root:

```sh
npm run package:local
python -m http.server 8000 --bind 127.0.0.1 --directory dist/local-package
```

Open `http://localhost:8000`. Hosted copies need HTTPS for camera access.

See [packaging and release guidance](docs/packaging.md) for package contents and safeguards, and [asset notes](assets/ASSETS.md) for artwork sources and licenses.

## Development checks

```sh
npm ci
npm test
npm run lint
```
