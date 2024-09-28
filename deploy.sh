#!/bin/bash
docker build --platform linux/amd64 -t us-central1-docker.pkg.dev/infra-filament-436412-n2/barpingpong/bpp-auth .
docker push us-central1-docker.pkg.dev/infra-filament-436412-n2/barpingpong/bpp-auth