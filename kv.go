package main

import (
	"github.com/brooksmtownsend/multitiersecurity/gen/wasi/keyvalue/store"
)

func KV() (*store.Bucket, *store.Error) {
	bucket := store.Open("default")
	if err := bucket.Err(); err != nil {
		return nil, err
	}
	return bucket.OK(), nil
}
