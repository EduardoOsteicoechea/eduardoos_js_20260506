package collect

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/eduardoos/telemetry/internal/config"
)

type MemoryBlock struct {
	TotalBytes     uint64  `json:"total_bytes"`
	AvailableBytes uint64  `json:"available_bytes"`
	UsedBytes      uint64  `json:"used_bytes"`
	UsedPercent    float64 `json:"used_percent"`
}

type DiskBlock struct {
	Path        string  `json:"path"`
	TotalBytes  uint64  `json:"total_bytes"`
	UsedBytes   uint64  `json:"used_bytes"`
	FreeBytes   uint64  `json:"free_bytes"`
	UsedPercent float64 `json:"used_percent"`
}

type SystemBlock struct {
	Memory MemoryBlock `json:"memory"`
	Disk   DiskBlock   `json:"disk"`
	Error  *string     `json:"error,omitempty"`
}

func SystemStats(cfg config.Config) SystemBlock {
	block := SystemBlock{}

	mem, memErr := readMemory(cfg.HostProcRoot)
	disk, diskErr := readDisk(cfg.DiskPath)

	if memErr != nil || diskErr != nil {
		var parts []string
		if memErr != nil {
			parts = append(parts, "memory: "+memErr.Error())
		}
		if diskErr != nil {
			parts = append(parts, "disk: "+diskErr.Error())
		}
		msg := strings.Join(parts, "; ")
		block.Error = &msg
	}

	if memErr == nil {
		block.Memory = mem
	}
	if diskErr == nil {
		block.Disk = disk
	}

	return block
}

func readMemory(procRoot string) (MemoryBlock, error) {
	path := filepath.Join(procRoot, "meminfo")
	file, err := os.Open(path)
	if err != nil {
		return MemoryBlock{}, err
	}
	defer file.Close()

	values := map[string]uint64{}
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		parts := strings.SplitN(line, ":", 2)
		if len(parts) != 2 {
			continue
		}
		key := strings.TrimSpace(parts[0])
		fields := strings.Fields(strings.TrimSpace(parts[1]))
		if len(fields) == 0 {
			continue
		}
		kb, err := strconv.ParseUint(fields[0], 10, 64)
		if err != nil {
			continue
		}
		values[key] = kb * 1024
	}

	total := values["MemTotal"]
	available := values["MemAvailable"]
	if available == 0 {
		available = values["MemFree"] + values["Buffers"] + values["Cached"]
	}

	if total == 0 {
		return MemoryBlock{}, fmt.Errorf("MemTotal not found in %s", path)
	}

	used := total - available
	percent := 0.0
	if total > 0 {
		percent = float64(used) / float64(total) * 100
	}

	return MemoryBlock{
		TotalBytes:     total,
		AvailableBytes: available,
		UsedBytes:      used,
		UsedPercent:    round2(percent),
	}, nil
}

func round2(value float64) float64 {
	return float64(int(value*100+0.5)) / 100
}
