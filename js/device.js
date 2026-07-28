/**
 * Battery and performance awareness.
 */
// Reduce animations and effects on low battery
export function checkBatteryOptimizations() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            if (battery.level < 0.2 || !battery.charging) {
                document.body.classList.add('low-battery-mode');
                // Disable non-essential animations
                document.documentElement.style.setProperty('--animation-duration', '0s');
            }
        });
    }
}

// Detect slow devices and adjust accordingly
export function detectDevicePerformance() {
    const start = performance.now();
    
    // Simple CPU benchmark
    for (let i = 0; i < 100000; i++) {
        Math.random();
    }
    
    const time = performance.now() - start;
    
    if (time > 50) { // Slow device detected
        document.body.classList.add('slow-device');
        return 'slow';
    } else if (time > 20) {
        return 'medium';
    }
    return 'fast';
}
