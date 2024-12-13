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
wash build
```

## Running

Run the UI in one terminal with:

```shell
cd wasmcloud.banking/client/apps/banking
npm i
npm run dev
```

Run the backend in another terminal with:

```shell
wash dev
```

## Interacting with the demo

Navigate to [http://127.0.0.1:5173](http://127.0.0.1:5173) and sign in to view your account.

After signing in, run the script to add transactions. The `BANK_USER` is your GitHub username:

```shell
BANK_USER=brooksmtownsend ./new-transaction.sh
```

## Adding Capabilities

To learn how to extend this example with additional capabilities, see the [Adding Capabilities](https://wasmcloud.com/docs/tour/adding-capabilities?lang=tinygo) section of the wasmCloud documentation.
