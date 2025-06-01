document.addEventListener('DOMContentLoaded', () => {
    new rive.Rive({
      src: 'gpi.riv',
      canvas: document.getElementById('rive-logo'),
      autoplay: true
    });
  });