document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('rive-logo');
    
    if (!canvas) {
        console.error('Rive logo canvas not found');
        return;
    }

    try {
        const riveInstance = new rive.Rive({
            src: 'gpi.riv',
            canvas: canvas,
            autoplay: true,
            stateMachines: 'State Machine 1',
            onLoad: () => {
                console.log('Rive animation loaded successfully');
                // Ensure the animation starts in Idle state after loading
                riveInstance.play('Idle');
            },
            onLoadError: (error) => {
                console.error('Failed to load Rive animation:', error);
                // Hide the canvas if animation fails to load
                canvas.style.display = 'none';
            }
        });

        // Add hover event listeners with error handling
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

        // Add error handling for runtime errors
        riveInstance.on('error', (error) => {
            console.error('Rive runtime error:', error);
        });

    } catch (error) {
        console.error('Failed to initialize Rive:', error);
        // Hide the canvas if Rive fails to initialize
        canvas.style.display = 'none';
    }
});