// Generated by `wit-bindgen-wrpc-go` 0.9.1. DO NOT EDIT!
package types

import (
	binary "encoding/binary"
	fmt "fmt"
	io "io"
	slog "log/slog"
	math "math"
	sync "sync"
	atomic "sync/atomic"
	wrpc "wrpc.io/go"
)

type OperationError struct {
	Message string
}

func (v *OperationError) String() string { return "OperationError" }

func (v *OperationError) WriteToIndex(w wrpc.ByteWriter) (func(wrpc.IndexWriter) error, error) {
	writes := make(map[uint32]func(wrpc.IndexWriter) error, 1)
	slog.Debug("writing field", "name", "message")
	write0, err := (func(wrpc.IndexWriter) error)(nil), func(v string, w io.Writer) (err error) {
		n := len(v)
		if n > math.MaxUint32 {
			return fmt.Errorf("string byte length of %d overflows a 32-bit integer", n)
		}
		if err = func(v int, w io.Writer) error {
			b := make([]byte, binary.MaxVarintLen32)
			i := binary.PutUvarint(b, uint64(v))
			slog.Debug("writing string byte length", "len", n)
			_, err = w.Write(b[:i])
			return err
		}(n, w); err != nil {
			return fmt.Errorf("failed to write string byte length of %d: %w", n, err)
		}
		slog.Debug("writing string bytes")
		_, err = w.Write([]byte(v))
		if err != nil {
			return fmt.Errorf("failed to write string bytes: %w", err)
		}
		return nil
	}(v.Message, w)
	if err != nil {
		return nil, fmt.Errorf("failed to write `message` field: %w", err)
	}
	if write0 != nil {
		writes[0] = write0
	}

	if len(writes) > 0 {
		return func(w wrpc.IndexWriter) error {
			var wg sync.WaitGroup
			var wgErr atomic.Value
			for index, write := range writes {
				wg.Add(1)
				w, err := w.Index(index)
				if err != nil {
					return fmt.Errorf("failed to index nested record writer: %w", err)
				}
				write := write
				go func() {
					defer wg.Done()
					if err := write(w); err != nil {
						wgErr.Store(err)
					}
				}()
			}
			wg.Wait()
			err := wgErr.Load()
			if err == nil {
				return nil
			}
			return err.(error)
		}, nil
	}
	return nil, nil
}
func (v *OperationError) Error() string { return v.String() }

type Operation struct {
	Id             string
	OriginalAsset  string
	ClientLocation string
	CreatedAt      string
	ResizedAsset   *string
	ResizeError    *string
	ResizedAt      *string
	AnalyzeResult  *bool
	AnalyzeError   *string
	AnalyzedAt     *string
}

func (v *Operation) String() string { return "Operation" }

func (v *Operation) WriteToIndex(w wrpc.ByteWriter) (func(wrpc.IndexWriter) error, error) {
	writes := make(map[uint32]func(wrpc.IndexWriter) error, 10)
	slog.Debug("writing field", "name", "id")
	write0, err := (func(wrpc.IndexWriter) error)(nil), func(v string, w io.Writer) (err error) {
		n := len(v)
		if n > math.MaxUint32 {
			return fmt.Errorf("string byte length of %d overflows a 32-bit integer", n)
		}
		if err = func(v int, w io.Writer) error {
			b := make([]byte, binary.MaxVarintLen32)
			i := binary.PutUvarint(b, uint64(v))
			slog.Debug("writing string byte length", "len", n)
			_, err = w.Write(b[:i])
			return err
		}(n, w); err != nil {
			return fmt.Errorf("failed to write string byte length of %d: %w", n, err)
		}
		slog.Debug("writing string bytes")
		_, err = w.Write([]byte(v))
		if err != nil {
			return fmt.Errorf("failed to write string bytes: %w", err)
		}
		return nil
	}(v.Id, w)
	if err != nil {
		return nil, fmt.Errorf("failed to write `id` field: %w", err)
	}
	if write0 != nil {
		writes[0] = write0
	}
	slog.Debug("writing field", "name", "original-asset")
	write1, err := (func(wrpc.IndexWriter) error)(nil), func(v string, w io.Writer) (err error) {
		n := len(v)
		if n > math.MaxUint32 {
			return fmt.Errorf("string byte length of %d overflows a 32-bit integer", n)
		}
		if err = func(v int, w io.Writer) error {
			b := make([]byte, binary.MaxVarintLen32)
			i := binary.PutUvarint(b, uint64(v))
			slog.Debug("writing string byte length", "len", n)
			_, err = w.Write(b[:i])
			return err
		}(n, w); err != nil {
			return fmt.Errorf("failed to write string byte length of %d: %w", n, err)
		}
		slog.Debug("writing string bytes")
		_, err = w.Write([]byte(v))
		if err != nil {
			return fmt.Errorf("failed to write string bytes: %w", err)
		}
		return nil
	}(v.OriginalAsset, w)
	if err != nil {
		return nil, fmt.Errorf("failed to write `original-asset` field: %w", err)
	}
	if write1 != nil {
		writes[1] = write1
	}
	slog.Debug("writing field", "name", "client-location")
	write2, err := (func(wrpc.IndexWriter) error)(nil), func(v string, w io.Writer) (err error) {
		n := len(v)
		if n > math.MaxUint32 {
			return fmt.Errorf("string byte length of %d overflows a 32-bit integer", n)
		}
		if err = func(v int, w io.Writer) error {
			b := make([]byte, binary.MaxVarintLen32)
			i := binary.PutUvarint(b, uint64(v))
			slog.Debug("writing string byte length", "len", n)
			_, err = w.Write(b[:i])
			return err
		}(n, w); err != nil {
			return fmt.Errorf("failed to write string byte length of %d: %w", n, err)
		}
		slog.Debug("writing string bytes")
		_, err = w.Write([]byte(v))
		if err != nil {
			return fmt.Errorf("failed to write string bytes: %w", err)
		}
		return nil
	}(v.ClientLocation, w)
	if err != nil {
		return nil, fmt.Errorf("failed to write `client-location` field: %w", err)
	}
	if write2 != nil {
		writes[2] = write2
	}
	slog.Debug("writing field", "name", "created-at")
	write3, err := (func(wrpc.IndexWriter) error)(nil), func(v string, w io.Writer) (err error) {
		n := len(v)
		if n > math.MaxUint32 {
			return fmt.Errorf("string byte length of %d overflows a 32-bit integer", n)
		}
		if err = func(v int, w io.Writer) error {
			b := make([]byte, binary.MaxVarintLen32)
			i := binary.PutUvarint(b, uint64(v))
			slog.Debug("writing string byte length", "len", n)
			_, err = w.Write(b[:i])
			return err
		}(n, w); err != nil {
			return fmt.Errorf("failed to write string byte length of %d: %w", n, err)
		}
		slog.Debug("writing string bytes")
		_, err = w.Write([]byte(v))
		if err != nil {
			return fmt.Errorf("failed to write string bytes: %w", err)
		}
		return nil
	}(v.CreatedAt, w)
	if err != nil {
		return nil, fmt.Errorf("failed to write `created-at` field: %w", err)
	}
	if write3 != nil {
		writes[3] = write3
	}
	slog.Debug("writing field", "name", "resized-asset")
	write4, err := func(v *string, w interface {
		io.ByteWriter
		io.Writer
	}) (func(wrpc.IndexWriter) error, error) {
		if v == nil {
			slog.Debug("writing `option::none` status byte")
			if err := w.WriteByte(0); err != nil {
				return nil, fmt.Errorf("failed to write `option::none` byte: %w", err)
			}
			return nil, nil
		}
		slog.Debug("writing `option::some` status byte")
		if err := w.WriteByte(1); err != nil {
			return nil, fmt.Errorf("failed to write `option::some` status byte: %w", err)
		}
		slog.Debug("writing `option::some` payload")
		write, err := (func(wrpc.IndexWriter) error)(nil), func(v string, w io.Writer) (err error) {
			n := len(v)
			if n > math.MaxUint32 {
				return fmt.Errorf("string byte length of %d overflows a 32-bit integer", n)
			}
			if err = func(v int, w io.Writer) error {
				b := make([]byte, binary.MaxVarintLen32)
				i := binary.PutUvarint(b, uint64(v))
				slog.Debug("writing string byte length", "len", n)
				_, err = w.Write(b[:i])
				return err
			}(n, w); err != nil {
				return fmt.Errorf("failed to write string byte length of %d: %w", n, err)
			}
			slog.Debug("writing string bytes")
			_, err = w.Write([]byte(v))
			if err != nil {
				return fmt.Errorf("failed to write string bytes: %w", err)
			}
			return nil
		}(*v, w)
		if err != nil {
			return nil, fmt.Errorf("failed to write `option::some` payload: %w", err)
		}
		return write, nil
	}(v.ResizedAsset, w)
	if err != nil {
		return nil, fmt.Errorf("failed to write `resized-asset` field: %w", err)
	}
	if write4 != nil {
		writes[4] = write4
	}
	slog.Debug("writing field", "name", "resize-error")
	write5, err := func(v *string, w interface {
		io.ByteWriter
		io.Writer
	}) (func(wrpc.IndexWriter) error, error) {
		if v == nil {
			slog.Debug("writing `option::none` status byte")
			if err := w.WriteByte(0); err != nil {
				return nil, fmt.Errorf("failed to write `option::none` byte: %w", err)
			}
			return nil, nil
		}
		slog.Debug("writing `option::some` status byte")
		if err := w.WriteByte(1); err != nil {
			return nil, fmt.Errorf("failed to write `option::some` status byte: %w", err)
		}
		slog.Debug("writing `option::some` payload")
		write, err := (func(wrpc.IndexWriter) error)(nil), func(v string, w io.Writer) (err error) {
			n := len(v)
			if n > math.MaxUint32 {
				return fmt.Errorf("string byte length of %d overflows a 32-bit integer", n)
			}
			if err = func(v int, w io.Writer) error {
				b := make([]byte, binary.MaxVarintLen32)
				i := binary.PutUvarint(b, uint64(v))
				slog.Debug("writing string byte length", "len", n)
				_, err = w.Write(b[:i])
				return err
			}(n, w); err != nil {
				return fmt.Errorf("failed to write string byte length of %d: %w", n, err)
			}
			slog.Debug("writing string bytes")
			_, err = w.Write([]byte(v))
			if err != nil {
				return fmt.Errorf("failed to write string bytes: %w", err)
			}
			return nil
		}(*v, w)
		if err != nil {
			return nil, fmt.Errorf("failed to write `option::some` payload: %w", err)
		}
		return write, nil
	}(v.ResizeError, w)
	if err != nil {
		return nil, fmt.Errorf("failed to write `resize-error` field: %w", err)
	}
	if write5 != nil {
		writes[5] = write5
	}
	slog.Debug("writing field", "name", "resized-at")
	write6, err := func(v *string, w interface {
		io.ByteWriter
		io.Writer
	}) (func(wrpc.IndexWriter) error, error) {
		if v == nil {
			slog.Debug("writing `option::none` status byte")
			if err := w.WriteByte(0); err != nil {
				return nil, fmt.Errorf("failed to write `option::none` byte: %w", err)
			}
			return nil, nil
		}
		slog.Debug("writing `option::some` status byte")
		if err := w.WriteByte(1); err != nil {
			return nil, fmt.Errorf("failed to write `option::some` status byte: %w", err)
		}
		slog.Debug("writing `option::some` payload")
		write, err := (func(wrpc.IndexWriter) error)(nil), func(v string, w io.Writer) (err error) {
			n := len(v)
			if n > math.MaxUint32 {
				return fmt.Errorf("string byte length of %d overflows a 32-bit integer", n)
			}
			if err = func(v int, w io.Writer) error {
				b := make([]byte, binary.MaxVarintLen32)
				i := binary.PutUvarint(b, uint64(v))
				slog.Debug("writing string byte length", "len", n)
				_, err = w.Write(b[:i])
				return err
			}(n, w); err != nil {
				return fmt.Errorf("failed to write string byte length of %d: %w", n, err)
			}
			slog.Debug("writing string bytes")
			_, err = w.Write([]byte(v))
			if err != nil {
				return fmt.Errorf("failed to write string bytes: %w", err)
			}
			return nil
		}(*v, w)
		if err != nil {
			return nil, fmt.Errorf("failed to write `option::some` payload: %w", err)
		}
		return write, nil
	}(v.ResizedAt, w)
	if err != nil {
		return nil, fmt.Errorf("failed to write `resized-at` field: %w", err)
	}
	if write6 != nil {
		writes[6] = write6
	}
	slog.Debug("writing field", "name", "analyze-result")
	write7, err := func(v *bool, w interface {
		io.ByteWriter
		io.Writer
	}) (func(wrpc.IndexWriter) error, error) {
		if v == nil {
			slog.Debug("writing `option::none` status byte")
			if err := w.WriteByte(0); err != nil {
				return nil, fmt.Errorf("failed to write `option::none` byte: %w", err)
			}
			return nil, nil
		}
		slog.Debug("writing `option::some` status byte")
		if err := w.WriteByte(1); err != nil {
			return nil, fmt.Errorf("failed to write `option::some` status byte: %w", err)
		}
		slog.Debug("writing `option::some` payload")
		write, err := (func(wrpc.IndexWriter) error)(nil), func(v bool, w io.ByteWriter) error {
			if !v {
				slog.Debug("writing `false` byte")
				return w.WriteByte(0)
			}
			slog.Debug("writing `true` byte")
			return w.WriteByte(1)
		}(*v, w)
		if err != nil {
			return nil, fmt.Errorf("failed to write `option::some` payload: %w", err)
		}
		return write, nil
	}(v.AnalyzeResult, w)
	if err != nil {
		return nil, fmt.Errorf("failed to write `analyze-result` field: %w", err)
	}
	if write7 != nil {
		writes[7] = write7
	}
	slog.Debug("writing field", "name", "analyze-error")
	write8, err := func(v *string, w interface {
		io.ByteWriter
		io.Writer
	}) (func(wrpc.IndexWriter) error, error) {
		if v == nil {
			slog.Debug("writing `option::none` status byte")
			if err := w.WriteByte(0); err != nil {
				return nil, fmt.Errorf("failed to write `option::none` byte: %w", err)
			}
			return nil, nil
		}
		slog.Debug("writing `option::some` status byte")
		if err := w.WriteByte(1); err != nil {
			return nil, fmt.Errorf("failed to write `option::some` status byte: %w", err)
		}
		slog.Debug("writing `option::some` payload")
		write, err := (func(wrpc.IndexWriter) error)(nil), func(v string, w io.Writer) (err error) {
			n := len(v)
			if n > math.MaxUint32 {
				return fmt.Errorf("string byte length of %d overflows a 32-bit integer", n)
			}
			if err = func(v int, w io.Writer) error {
				b := make([]byte, binary.MaxVarintLen32)
				i := binary.PutUvarint(b, uint64(v))
				slog.Debug("writing string byte length", "len", n)
				_, err = w.Write(b[:i])
				return err
			}(n, w); err != nil {
				return fmt.Errorf("failed to write string byte length of %d: %w", n, err)
			}
			slog.Debug("writing string bytes")
			_, err = w.Write([]byte(v))
			if err != nil {
				return fmt.Errorf("failed to write string bytes: %w", err)
			}
			return nil
		}(*v, w)
		if err != nil {
			return nil, fmt.Errorf("failed to write `option::some` payload: %w", err)
		}
		return write, nil
	}(v.AnalyzeError, w)
	if err != nil {
		return nil, fmt.Errorf("failed to write `analyze-error` field: %w", err)
	}
	if write8 != nil {
		writes[8] = write8
	}
	slog.Debug("writing field", "name", "analyzed-at")
	write9, err := func(v *string, w interface {
		io.ByteWriter
		io.Writer
	}) (func(wrpc.IndexWriter) error, error) {
		if v == nil {
			slog.Debug("writing `option::none` status byte")
			if err := w.WriteByte(0); err != nil {
				return nil, fmt.Errorf("failed to write `option::none` byte: %w", err)
			}
			return nil, nil
		}
		slog.Debug("writing `option::some` status byte")
		if err := w.WriteByte(1); err != nil {
			return nil, fmt.Errorf("failed to write `option::some` status byte: %w", err)
		}
		slog.Debug("writing `option::some` payload")
		write, err := (func(wrpc.IndexWriter) error)(nil), func(v string, w io.Writer) (err error) {
			n := len(v)
			if n > math.MaxUint32 {
				return fmt.Errorf("string byte length of %d overflows a 32-bit integer", n)
			}
			if err = func(v int, w io.Writer) error {
				b := make([]byte, binary.MaxVarintLen32)
				i := binary.PutUvarint(b, uint64(v))
				slog.Debug("writing string byte length", "len", n)
				_, err = w.Write(b[:i])
				return err
			}(n, w); err != nil {
				return fmt.Errorf("failed to write string byte length of %d: %w", n, err)
			}
			slog.Debug("writing string bytes")
			_, err = w.Write([]byte(v))
			if err != nil {
				return fmt.Errorf("failed to write string bytes: %w", err)
			}
			return nil
		}(*v, w)
		if err != nil {
			return nil, fmt.Errorf("failed to write `option::some` payload: %w", err)
		}
		return write, nil
	}(v.AnalyzedAt, w)
	if err != nil {
		return nil, fmt.Errorf("failed to write `analyzed-at` field: %w", err)
	}
	if write9 != nil {
		writes[9] = write9
	}

	if len(writes) > 0 {
		return func(w wrpc.IndexWriter) error {
			var wg sync.WaitGroup
			var wgErr atomic.Value
			for index, write := range writes {
				wg.Add(1)
				w, err := w.Index(index)
				if err != nil {
					return fmt.Errorf("failed to index nested record writer: %w", err)
				}
				write := write
				go func() {
					defer wg.Done()
					if err := write(w); err != nil {
						wgErr.Store(err)
					}
				}()
			}
			wg.Wait()
			err := wgErr.Load()
			if err == nil {
				return nil
			}
			return err.(error)
		}, nil
	}
	return nil, nil
}