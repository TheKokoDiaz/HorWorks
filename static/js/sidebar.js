document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('main-sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            // Esto pone o quita la clase "collapsed" cada que das clic
            sidebar.classList.toggle('collapsed');
        });
    }
});