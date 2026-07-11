// TAREA PRIORITARIA
document.addEventListener("DOMContentLoaded", () => {
    // Simulación del contador de alta prioridad
    const timerElement = document.getElementById("countdown-timer");
    
    // Configura tiempo inicial: 45 min y 37 seg (2737 segundos)
    let timeInSeconds = (45 * 60) + 37; 

    function updateTimer() {
        if (timeInSeconds <= 0) return;

        timeInSeconds--;
        
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;

        // Formateo a HH:MM:SS
        const displayTime = 
            String(hours).padStart(2, '0') + ':' +
            String(minutes).padStart(2, '0') + ':' +
            String(seconds).padStart(2, '0');

        timerElement.textContent = displayTime;
    }

    // Actualizar cada segundo
    setInterval(updateTimer, 1000);
});

// AÑADIR TAREA
function addTask(){
    window.location.href = "/crear_tarea";
}