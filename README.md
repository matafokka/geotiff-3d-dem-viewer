# GeoTIFF 3D DEM Viewer

This app lets you view GeoTIFF DEM files in 3D.

[Use it online.](https://matafokka.github.io/geotiff-3d-dem-viewer)

It's different from other apps because it uses [geotiff-geokeys-to-proj4](https://github.com/matafokka/geotiff-geokeys-to-proj4) which allows to support almost any projection which other apps doesn't do (for now). In fact, this app is demo for that library.

# Building from sources
`cd` to the source root and run `npm run build`.

# Serving

Serve the `build` directory using your favorite HTTP server.

# Motivation

There're a couple of reasons why I did it:

1. To pass a subject.
1. To try React.
1. To provide an example and a demo for [geotiff-geokeys-to-proj4](https://github.com/matafokka/geotiff-geokeys-to-proj4).