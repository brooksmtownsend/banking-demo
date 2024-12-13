# Welcome to wasmcloud.space!

Classify images from the spacey-edge using [LLaVA](https://ollama.com/library/llava) (Large Language and Vision Assistant) with an [Ollama](https://ollama.com/) provider.

## Overview

This application view is from the perspective of a satellite orbiting the Earth.

## Challenges Addressed

1. **Distributed and Disconnected Edge**:

   - The app may need to connect to different near-region "base stations" and requires resiliency across multiple regions and edges.

2. **Network constrained**:
   - Satellites benefit from reducing network bandwidth and offload style service pattern architectures. This app simulates image classification by the satellite which is orbiting the Earth and taking photos of vessels. If a boat is detected, it will send an image resized to reduce over-the-wire bytes. Matches are stored in blob storage for later evaluation.

## Components

- http-router: Capability Provider bringing external requests into the system
- task-manager: Keeps track of background tasks, storing state in postgres
- image-processor: Resizes images, stashing them in blobstore
- image-analyzer: Runs LLM on images from blobstore

### Highlights

- The size of a typical Wasm component is typically KBs and not MBs or even GBs like containers.
  - The `image_analyzer` component in this demo is only 292KB uncompressed.
- The logic of each component is focused on business logic allowing each component to **do one thing well** and is free of boilerplate and middleware.
  ```rust
  impl Guest for Ollama {
      fn detect(image: Vec<u8>) -> Result<bool, String> {
          let res = Ollama::do_detect(image);
          match res {
              Ok(result) => Ok(result),
              Err(e) => {
                  log(Level::Error, "detect", &e);
                  Err(e)
              }
          }
      }
  }
  ```
- **Local-first**. The architecture of this application lends itself to prefer local components but is also able to fallback over the network across regions, clouds, and edges.
- **Extensible at runtime**. Need to add or remove a GPU resource? Expand the lattice to new hosts from the cloud to the edge, even your own.
- **Local dev friendly**. Working with remote services can be a pain. Wasm components are portable from dev to prod and are decoupled from the provider implementation. Develop by running Ollama on your own dev box to take advantage of your own "free" GPU. Use your local filesystem to serve as the blobstore provider.

## Running

### Prerequisites

Running the application locally requires the following CLI tools and toolchains:

- [Rust](https://www.rust-lang.org/tools/install)
- [Go](https://go.dev/doc/install)
- [Node and NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Docker](https://docs.docker.com/engine/install/)
- [ollama](https://ollama.com/)
- [wash](https://wasmcloud.com/docs/installation)
- [wit-bindgen-wrpc](https://github.com/bytecodealliance/wrpc)
- psql

### Quickstart

Run `make quickstart` to run wasmCloud (`wash up -d`), setup Postgres + ollama, and deploy the application from pre-compiled images.

### Development

Run `make all` to build all application components, run wasmCloud, setup Postgres + ollama, and deploy the application. Alternatively, you can run each step independently:

```shell
make sync
make build
make up
make deploy
```
