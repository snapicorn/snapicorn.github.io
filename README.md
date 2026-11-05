# Snapicorn

Snapicorn is a browser photobooth. Take four photos, turn them into a vertical strip, and decorate it with a frame and pixel stickers. You can download the finished PNG, share it through your device, or save it to your local Gallery.

## Take a photo strip

1. Choose **Start Photobooth**, then **Enable camera** and grant camera access.
2. Select **Take 4 photos**. The booth counts down before each shot.
3. Review the photos in capture order. To replace one, choose **Retake photo**, take a new shot, and select **Use replacement**.
4. Choose **Make it yours** to pick a frame and add stickers. Select a sticker to move, resize, rotate, or remove it. **Undo** and **Redo** apply to sticker edits.

   The **None** frame uses white paper and the homepage sample's Snapicorn icon and wordmark.
5. Choose **Finish strip**, then **Download PNG**, **Save to Gallery**, or **Share strip**. Sharing depends on your browser and device.

Open **Gallery** to preview, download, share, or delete a saved strip. **Make another strip** asks for confirmation before clearing the current session.

## Camera and storage

Snapicorn requests video when you enable the camera. Audio stays off. Photos and edits are processed in the browser and held in memory until you reload, close the page, or start a new strip.

**Save to Gallery** stores the finished PNG in the current browser profile and site origin. Clearing site data or browser storage eviction can remove saved strips. Gallery data stays local to that browser. Download a PNG if you want a separate copy.

## Run locally

Use Node.js 20.19+ on the 20.x line, 22.13+ on the 22.x line, or 24+. The example server uses Python 3. Snapicorn runs as a static site with HTML, CSS, and vanilla JavaScript.

From the repository root, build and serve the local package.

```sh
npm run package:local
python -m http.server 8000 --bind 127.0.0.1 --directory dist/local-package
```

Open `http://localhost:8000` and enable the camera in the booth. Hosted copies need HTTPS for camera access. If the camera is unavailable, check the site's camera permissions and try **Enable camera** again.

The packager copies the [runtime allowlist](tools/static-package.js) into `dist/local-package/` with the original relative paths. If packaging reports an unexpected entry, inspect the generated directory before rerunning.

## Project structure

- [index.html](index.html) defines the screens, dialogs, and script load order.
- [styles/](styles/) contains shared visual styles and screen layouts.
- [scripts/](scripts/) handles camera capture, session state, strip composition, sticker editing, and export. The composition code draws the strip to a canvas, and Export uses that result for the finished PNG.
- [Gallery storage](scripts/gallery-store.js) validates and persists finished PNGs in IndexedDB, separately from the active editing session.
- [assets/](assets/) contains frames, stickers, fonts, and interface artwork. See the [asset and license notes](assets/ASSETS.md).
- [test/](test/) contains automated checks for application behavior and static packaging.

## Development checks

```sh
npm ci
npm test
npm run lint
```

The tests use browser mocks for camera, editing, export, and Gallery behavior. Packaging checks exercise the generated files through a loopback server. To run just those checks, use `node --test test/static-package.test.js`.
