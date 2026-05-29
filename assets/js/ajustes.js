// -------------------------------------------------------------
// 1. MANEJO DEL FORMATO DE HORA (12h vs 24h)
// -------------------------------------------------------------
const btn12 = document.getElementById('btnFormato12');
const btn24 = document.getElementById('btnFormato24');

btn12.addEventListener('click', () => {
    btn12.classList.add('activo');
    btn24.classList.remove('activo');
    console.log("Formato seleccionado: 12 horas");
    // Aquí puedes hacer un fetch() o llamar a Flask para guardar la preferencia
});

btn24.addEventListener('click', () => {
    btn24.classList.add('activo');
    btn12.classList.remove('remove');
    btn12.classList.remove('activo');
    console.log("Formato seleccionado: 24 horas");
});

// -------------------------------------------------------------
// 2. MANEJO DE CAMBIO DE TEMAS VISUALES
// -------------------------------------------------------------
function cambiarTema(color) {
    // Quitar la clase 'activo' de todos los botones de color
    const botones = document.querySelectorAll('.btn-color');
    botones.forEach(btn => btn.classList.remove('activo'));

    // Añadir activo al botón presionado
    if(color === 'azul') document.getElementById('btnTemaAzul').classList.add('activo');
    if(color === 'verde') document.getElementById('btnTemaVerde').classList.add('activo');
    if(color === 'morado') document.getElementById('btnTemaMorado').classList.add('activo');
    if(color === 'naranja') document.getElementById('btnTemaNaranja').classList.add('activo');

    // Cambiar dinámicamente el color del encabezado de las tarjetas como demostración
    const encabezados = document.querySelectorAll('.encabezado-tarjeta');
    let codigoColor = '#1c558e'; // Azul por defecto

    if(color === 'verde') codigoColor = '#5cb85c';
    if(color === 'morado') codigoColor = '#8e44ad';
    if(color === 'naranja') codigoColor = '#f39c12';

    encabezados.forEach(encabezado => {
        encabezado.style.backgroundColor = codigoColor;
    });

    console.log("Tema cambiado a: " + color);
}

// -------------------------------------------------------------
// 3. ACCIÓN DEL BOTÓN USAR TICKET
// -------------------------------------------------------------
document.getElementById('btnUsarTicket').addEventListener('click', () => {
    const desafioSeleccionado = document.getElementById('selectorDesafio').value;
    const infoTickets = document.getElementById('cantidadTickets');
    let ticketsActuales = parseInt(infoTickets.textContent);

    if (ticketsActuales > 0) {
        ticketsActuales--;
        infoTickets.textContent = ticketsActuales; // Resta visualmente el ticket
        alert(`¡Desafío [${desafioSeleccionado}] iniciado! Te quedan ${ticketsActuales} tickets.`);
    } else {
        alert("No tienes más tickets disponibles.");
    }
});