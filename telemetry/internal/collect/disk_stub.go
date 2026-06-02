//go:build !linux

package collect

import "fmt"

func readDisk(path string) (DiskBlock, error) {
	return DiskBlock{}, fmt.Errorf("disk stats only supported on linux")
}
