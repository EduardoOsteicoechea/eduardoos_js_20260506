//go:build linux

package collect

import "syscall"

func readDisk(path string) (DiskBlock, error) {
	var stat syscall.Statfs_t
	if err := syscall.Statfs(path, &stat); err != nil {
		return DiskBlock{}, err
	}

	total := stat.Blocks * uint64(stat.Bsize)
	free := stat.Bavail * uint64(stat.Bsize)
	used := total - free

	percent := 0.0
	if total > 0 {
		percent = float64(used) / float64(total) * 100
	}

	return DiskBlock{
		Path:        path,
		TotalBytes:  total,
		UsedBytes:   used,
		FreeBytes:   free,
		UsedPercent: round2(percent),
	}, nil
}
