document.addEventListener('DOMContentLoaded', () => {
    const riveInstance = new rive.Rive({
        src: 'gpi.riv',
        canvas: document.getElementById('rive-logo'),
        autoplay: true,
        stateMachines: 'State Machine 1'
    });

    // Get the canvas element
    const canvas = document.getElementById('rive-logo');

    // Wait for the intro animation to complete before enabling hover
    riveInstance.on('play', (event) => {
        if (event.name === 'Intro') {
            // When intro finishes, switch to idle
            riveInstance.on('stop', () => {
                riveInstance.play('Idle');
            }, { once: true }); // Use once: true to only listen for the first stop event
        }
    });

    // Add hover event listeners
    canvas.addEventListener('mouseenter', () => {
        riveInstance.play('Hover');
    });

    canvas.addEventListener('mouseleave', () => {
        riveInstance.play('Idle');
    });
});