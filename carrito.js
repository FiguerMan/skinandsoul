// Array global que almacenará los productos en el carrito
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Ejecutar cuando la página termine de cargar
document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorCesta();
});

// Función para cambiar la cantidad en los botones + y -
function cambiarCantidad(boton, cambio) {
    const contenedor = boton.parentElement;
    const input = contenedor.querySelector('.input-cantidad');
    let valorActual = parseInt(input.value);
    
    valorActual += cambio;
    if (valorActual < 1) valorActual = 1; // No dejar bajar de 1
    
    input.value = valorActual;
}

// Función para añadir productos al carrito
function agregarAlCarrito(boton) {
    // Buscamos la tarjeta del producto más cercana
    const tarjeta = boton.closest('.producto-card');
    
    const id = tarjeta.getAttribute('data-id');
    const nombre = tarjeta.getAttribute('data-nombre');
    const precio = parseFloat(tarjeta.getAttribute('data-precio'));
    const cantidad = parseInt(tarjeta.querySelector('.input-cantidad').value);

    // Verificar si el producto ya existe en el carrito
    const productoExistente = carrito.find(item => item.id === id);

    if (productoExistente) {
        // Si ya existe, le sumamos la nueva cantidad
        productoExistente.cantidad += cantidad;
    } else {
        // Si es nuevo, lo agregamos al array
        carrito.push({ id, nombre, precio, cantidad });
    }

    // Guardar en la memoria del navegador
    guardarCarrito();
    
    // Reiniciar el selector a 1 después de añadir
    tarjeta.querySelector('.input-cantidad').value = 1;
    
    alert(`¡${nombre} añadido al carrito! 💕`);
}

// Guarda el estado actual en LocalStorage y actualiza la interfaz
function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCesta();
}

// Cambia el numerito o alerta visual de la cesta en la barra superior
function actualizarContadorCesta() {
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    // Buscamos el enlace o icono de la cesta. 
    // Puedes ponerle un id="icono-cesta" en tu HTML para que cambie el número
    const iconoCesta = document.getElementById('icono-cesta');
    if (iconoCesta) {
        iconoCesta.innerText = `🛒 (${totalItems})`;
    }
}

// Función para actualizar visualmente el contador en la barra superior
function actualizarContadorCesta() {
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const contador = document.getElementById('contador-numero');
    if (contador) {
        contador.innerText = `(${totalItems})`;
    }
}

// Función para abrir la ventana flotante de la factura
function abrirCarrito(event) {
    if(event) event.preventDefault();
    
    // Comprobar si ya existe la ventana en pantalla para no duplicarla
    let modal = document.getElementById('modal-carrito');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-carrito';
        // Estilos rápidos para que se vea hermoso, centrado y flotante
        modal.style = "position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); width:90%; max-width:450px; background:#fff; border-radius:15px; box-shadow:0 5px 15px rgba(0,0,0,0.3); z-index:1000; padding:20px; font-family:sans-serif; max-height:80vh; overflow-y:auto;";
        document.body.appendChild(modal);
        
        // Crear también un fondo oscuro detrás
        let fondo = document.createElement('div');
        fondo.id = 'fondo-modal';
        fondo.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:999;";
        fondo.onclick = cerrarCarrito;
        document.body.appendChild(fondo);
    }
    
    renderizarFactura();
}

// Función para cerrar la ventana del carrito
function cerrarCarrito() {
    const modal = document.getElementById('modal-carrito');
    const fondo = document.getElementById('fondo-modal');
    if (modal) modal.remove();
    if (fondo) fondo.remove();
}

// Función que dibuja el diseño estilo factura dentro de la ventana emergente
function renderizarFactura() {
    const modal = document.getElementById('modal-carrito');
    if (!modal) return;
    
    if (carrito.length === 0) {
        modal.innerHTML = `
            <div style="text-align:center; padding:20px;">
                <h3 style="color:#e91e63;">Tu cesta está vacía 💕</h3>
                <p>¡Explora nuestro catálogo y añade tus productos kawaii favoritos!</p>
                <button onclick="cerrarCarrito()" style="background:#e91e63; color:#fff; border:none; padding:10px 20px; border-radius:20px; cursor:pointer; margin-top:10px;">Cerrar</button>
            </div>
        `;
        return;
    }
    
    let tablaProductos = '';
    let granTotal = 0;
    
    carrito.forEach((item, index) => {
        let subtotal = item.precio * item.cantidad;
        granTotal += subtotal;
        tablaProductos += `
            <tr style="border-bottom: 1px dashed #eee;">
                <td style="padding:8px 0;">${item.nombre} x${item.cantidad}</td>
                <td style="text-align:right; padding:8px 0;">$${subtotal.toFixed(2)}</td>
                <td style="text-align:right; padding:8px 0;"><button onclick="eliminarDelCarrito(${index})" style="background:none; border:none; color:red; cursor:pointer; font-weight:bold;">✕</button></td>
            </tr>
        `;
    });
    
    modal.innerHTML = `
        <h2 style="text-align:center; color:#e91e63; margin-top:0; border-bottom:2px dotted #e91e63; padding-bottom:10px;">🧾 Mi Factura - SKIN AND SOUL</h2>
        <table style="width:100%; border-collapse:collapse; margin-top:15px;">
            <thead>
                <tr style="border-bottom:1px solid #ddd; color:#555;">
                    <th style="text-align:left; padding-bottom:5px;">Producto</th>
                    <th style="text-align:right; padding-bottom:5px;">Subtotal</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${tablaProductos}
            </tbody>
        </table>
        
        <div style="margin-top:20px; border-top:2px dotted #e91e63; padding-top:15px; text-align:right; font-size:1.2em; font-weight:bold;">
            TOTAL ESTIMADO: <span style="color:#e91e63;">$${granTotal.toFixed(2)}</span>
        </div>
        
        <div style="margin-top:20px; display:flex; gap:10px; flex-direction:column;">
            <button onclick="enviarPedidoWhatsApp()" style="background:#25D366; color:#fff; border:none; padding:12px; border-radius:25px; font-weight:bold; font-size:1em; cursor:pointer; display:flex; justify-content:center; align-items:center; gap:8px;">
                <i class="fab fa-whatsapp"></i> Pedir Pedido Completo por WhatsApp 🛍️
            </button>
            <button onclick="cerrarCarrito()" style="background:#ccc; color:#333; border:none; padding:8px; border-radius:25px; cursor:pointer; font-weight:bold;">
                Seguir Comprando
            </button>
        </div>
    `;
}

// Función para eliminar un producto de la lista si el cliente se arrepiente
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    guardarCarrito();
    renderizarFactura();
}

// ¡El paso mágico! Convierte todo en texto y abre tu WhatsApp Business
function enviarPedidoWhatsApp() {
    const telefono = "584243433829"; // Tu número telefónico que vi en el código
    let texto = "¡Hola SKIN AND SOUL! 💕 Me gustaría realizar el siguiente pedido desde el catálogo web:\n\n";
    let granTotal = 0;
    
    carrito.forEach(item => {
        let subtotal = item.precio * item.cantidad;
        granTotal += subtotal;
        texto += `• ${item.cantidad}x ${item.nombre} ($${item.precio.toFixed(2)} c/u) = *$${subtotal.toFixed(2)}*\n`;
    });
    
    texto += `\n-----------------------------\n`;
    texto += `💰 *TOTAL DE LA COMPRA:* *$${granTotal.toFixed(2)}*\n-----------------------------\n\n`;
    texto += `Por favor, confírmame disponibilidad para coordinar el pago. ¡Muchas gracias! ✨`;
    
    // Codificar el texto para que sea compatible con un enlace web URL
    const urlWhatsApp = `https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`;
    
    // Abrir WhatsApp en una nueva pestaña
    window.open(urlWhatsApp, '_blank');
    
    // Opcional: Limpiar el carrito después de enviar el pedido
    carrito = [];
    guardarCarrito();
    cerrarCarrito();
}