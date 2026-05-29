// 1. Cargar el carrito desde la memoria del navegador al empezar
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// 2. Esperar a que la página cargue para mostrar el número actual en la cesta
document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorCesta();
});

// 3. FUNCIÓN PARA LOS BOTONES + Y -
function cambiarCantidad(boton, cambio) {
    const contenedor = boton.parentElement;
    const input = contenedor.querySelector('.input-cantidad');
    if (input) {
        let valorActual = parseInt(input.value) || 1;
        valorActual += cambio;
        if (valorActual < 1) valorActual = 1; // Evitar números negativos o cero
        input.value = valorActual;
    }
}

// 4. FUNCIÓN PARA AÑADIR LOS PRODUCTOS AL CARRITO
function agregarAlCarrito(boton) {
    // Buscar la tarjeta del producto hacia arriba
    const tarjeta = boton.closest('.product-card');
    
    if (!tarjeta) {
        console.error("No se encontró la tarjeta del producto (.product-card)");
        return;
    }

    // Extraer los atributos data-
    const id = tarjeta.getAttribute('data-id');
    const nombre = tarjeta.getAttribute('data-nombre');
    const precio = parseFloat(tarjeta.getAttribute('data-precio'));
    
    // Buscar la cantidad seleccionada
    const inputCantidad = tarjeta.querySelector('.input-cantidad');
    const cantidad = inputCantidad ? parseInt(inputCantidad.value) : 1;

    if (!id || !nombre || isNaN(precio)) {
        alert("Faltan datos en el producto. Revisa los atributos data-id, data-nombre y data-precio.");
        return;
    }

    // Verificar si el producto ya está en el carrito
    const productoExistente = carrito.find(item => item.id === id);

    if (productoExistente) {
        productoExistente.cantidad += cantidad;
    } else {
        carrito.push({ id, nombre, precio, cantidad });
    }

    // Guardar cambios y actualizar número rosa de arriba
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCesta();
    
    // Reiniciar el contador del producto a 1
    if (inputCantidad) inputCantidad.value = 1;
    
    alert(`¡${nombre} añadido al carrito! 💕🛍️`);
}

// 5. FUNCIÓN PARA ACTUALIZAR EL CONTADOR DE LA CESTA ROSA
function actualizarContadorCesta() {
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const contador = document.getElementById('contador-numero');
    if (contador) {
        contador.innerText = `(${totalItems})`;
    }
}

// 6. FUNCIÓN PARA ABRIR EL VENTANA DE LA FACTURA
function abrirCarrito(event) {
    if (event) event.preventDefault();
    
    let modal = document.getElementById('modal-carrito');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-carrito';
        modal.style = "position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); width:90%; max-width:450px; background:#fff; border-radius:15px; box-shadow:0 5px 15px rgba(0,0,0,0.3); z-index:10000; padding:20px; font-family:sans-serif; max-height:80vh; overflow-y:auto;";
        document.body.appendChild(modal);
        
        let fondo = document.createElement('div');
        fondo.id = 'fondo-modal';
        fondo.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999;";
        fondo.onclick = cerrarCarrito;
        document.body.appendChild(fondo);
    }
    renderizarFactura();
}

function cerrarCarrito() {
    const modal = document.getElementById('modal-carrito');
    const fondo = document.getElementById('fondo-modal');
    if (modal) modal.remove();
    if (fondo) fondo.remove();
}

// 7. DIBUJAR LA FACTURA
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
                <td style="padding:8px 0; font-size:14px;">${item.nombre} x${item.cantidad}</td>
                <td style="text-align:right; padding:8px 0; font-size:14px;">$${subtotal.toFixed(2)}</td>
                <td style="text-align:right; padding:8px 0;"><button onclick="eliminarDelCarrito(${index})" style="background:none; border:none; color:red; cursor:pointer; font-weight:bold; font-size:16px;">✕</button></td>
            </tr>
        `;
    });
    
    modal.innerHTML = `
        <h2 style="text-align:center; color:#e91e63; margin-top:0; border-bottom:2px dotted #e91e63; padding-bottom:10px; font-size:20px;">🧾 Mi Factura - SKIN AND SOUL</h2>
        <table style="width:100%; border-collapse:collapse; margin-top:15px;">
            <thead>
                <tr style="border-bottom:1px solid #ddd; color:#555; font-size:14px;">
                    <th style="text-align:left; padding-bottom:5px;">Producto</th>
                    <th style="text-align:right; padding-bottom:5px;">Subtotal</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${tablaProductos}
            </tbody>
        </table>
        
        <div style="margin-top:20px; border-top:2px dotted #e91e63; padding-top:15px; text-align:right; font-size:1.1em; font-weight:bold;">
            TOTAL ESTIMADO: <span style="color:#e91e63;">$${granTotal.toFixed(2)}</span>
        </div>
        
        <div style="margin-top:20px; display:flex; gap:10px; flex-direction:column;">
            <button onclick="enviarPedidoWhatsApp()" style="background:#25D366; color:#fff; border:none; padding:12px; border-radius:25px; font-weight:bold; font-size:14px; cursor:pointer; text-align:center;">
                Pedir Pedido Completo por WhatsApp 🛍️
            </button>
            <button onclick="cerrarCarrito()" style="background:#ccc; color:#333; border:none; padding:8px; border-radius:25px; cursor:pointer; font-weight:bold; font-size:13px;">
                Seguir Comprando
            </button>
        </div>
    `;
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCesta();
    renderizarFactura();
}

// 8. ENVÍO A WHATSAPP
function enviarPedidoWhatsApp() {
    const telefono = "584243433829"; 
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
    
    const urlWhatsApp = `https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`;
    window.open(urlWhatsApp, '_blank');
    
    carrito = [];
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCesta();
    cerrarCarrito();
}