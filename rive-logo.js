document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('rive-logo');

    if (!canvas) {
        console.error('Rive logo canvas not found');
        return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        canvas.classList.add('rive-logo-static');
        return;
    }

    if (typeof rive === 'undefined') {
        canvas.style.display = 'none';
        return;
    }

    try {
        // Local WASM — CSP blocks unpkg/jsdelivr fetches used by the default runtime URL
        if (rive.RuntimeLoader && typeof rive.RuntimeLoader.setWasmUrl === 'function') {
            rive.RuntimeLoader.setWasmUrl(new URL('vendor/rive.wasm', window.location.href).href);
        }

        const riveInstance = new rive.Rive({
            src: 'gpi.riv',
            canvas: canvas,
            autoplay: true,
            stateMachines: 'State Machine 1',
            onLoad: () => {
                riveInstance.play('Idle');
            },
            onLoadError: (error) => {
                console.error('Failed to load Rive animation:', error);
                canvas.style.display = 'none';
            }
        });

        canvas.addEventListener('mouseenter', () => {
            try {
                riveInstance.play('Hover');
            } catch (error) {
                console.error('Error playing hover animation:', error);
            }
        });

        canvas.addEventListener('mouseleave', () => {
            try {
                riveInstance.play('Idle');
            } catch (error) {
                console.error('Error playing idle animation:', error);
            }
        });

        riveInstance.on('error', (error) => {
            console.error('Rive runtime error:', error);
        });

    } catch (error) {
        console.error('Failed to initialize Rive:', error);
        canvas.style.display = 'none';
    }
});
