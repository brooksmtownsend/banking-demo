# Banking Demo

TinyGo component that implements a CRUDdy bank application and OAuth2 integration with GitHub, and UI.

## Prerequisites

- `go`
- `tinygo`
- [`wash`](https://wasmcloud.com/docs/installation)
- `npm`

## Building

Make sure to replace the `client_secret` in [oauth.go](./oauth.go) with the GitHub client secret. Instructions for secrets to follow.

```bash
pushd wasmcloud.banking
npm i
npm run build --workspaces --if-present
popd
wash build
```

## Running

```shell
wash dev
```

## Interacting with the demo

Navigate to [http://127.0.0.1:8000](http://127.0.0.1:8000) and sign in to view your account.

After signing in, run the script to add transactions. The `BANK_USER` is your GitHub username:

```shell
BANK_USER=brooksmtownsend ./new-transaction.sh
```

## Adding Capabilities

To learn how to extend this example with additional capabilities, see the [Adding Capabilities](https://wasmcloud.com/docs/tour/adding-capabilities?lang=tinygo) section of the wasmCloud documentation.
