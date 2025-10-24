let palabrasData = [];
let categoriaActiva = null;

// Cargar palabras desde el archivo JSON
fetch('palabras.json')
  .then(res => res.json())
  .then(data => {
    palabrasData = data;
    console.log("Palabras cargadas:", palabrasData);

    // Activar buscador por texto
    document.getElementById('buscador').addEventListener('input', function () {
      mostrarResultado(this.value);
    });
  })
  .catch(error => {
    console.error("Error al cargar palabras.json:", error);
  });

// Mostrar resultado por búsqueda directa
function mostrarResultado(query) {
  const resultado = document.getElementById('resultado');
  const texto = query.trim().toLowerCase();

  const palabra = palabrasData.find(p =>
    p.palabra.toLowerCase() === texto || p.traduccion.toLowerCase() === texto
  );

  if (palabra) {
    resultado.innerHTML = `
      <div class="resultado-palabra visible">
        <h2>${palabra.palabra} → ${palabra.traduccion}</h2>
        <p><strong>Categoría:</strong> ${palabra.categoria}</p>
        <p><strong>Definición:</strong> ${palabra.definicion}</p>
        <p><strong>Ejemplo:</strong> ${palabra.ejemplo}</p>
      </div>
    `;
    resultado.classList.add('activo');
    document.getElementById('bienvenida').style.display = 'none';
  } else {
    resultado.innerHTML = `
      <div class="resultado-palabra visible">
        <p class="frase-poetica">Esta palabra aún duerme bajo las hojas del monte.</p>
        <p>No se encontró la palabra ni su traducción.</p>
      </div>
    `;
    resultado.classList.add('activo');
  }
}

// Sugerencias dinámicas
document.getElementById('buscador').addEventListener('input', function () {
  const texto = this.value.trim().toLowerCase();
  const sugerencias = document.getElementById('sugerencias');

  if (texto === '') {
    sugerencias.innerHTML = '';
    return;
  }

  const coincidencias = palabrasData.filter(p =>
    p.palabra.toLowerCase().includes(texto) ||
    p.traduccion.toLowerCase().includes(texto)
  );

  if (coincidencias.length > 0) {
    sugerencias.innerHTML = coincidencias.slice(0, 5).map(p => `
      <li onclick="seleccionarSugerencia('${p.palabra}')">
        ${p.palabra} → <span class="traduccion">${p.traduccion}</span>
      </li>
    `).join('');
  } else {
    sugerencias.innerHTML = `<li class="sin-resultados">No hay coincidencias.</li>`;
  }
});

function seleccionarSugerencia(palabra) {
  document.getElementById('buscador').value = palabra;
  document.getElementById('sugerencias').innerHTML = '';
  mostrarResultado(palabra);
}

// Filtrar por categoría
function filtrarCategoria(categoria) {
  const resultado = document.getElementById('resultado');
  const botones = document.querySelectorAll('.boton-categoria');

  if (categoriaActiva === categoria) {
    categoriaActiva = null;
    resultado.innerHTML = '';
    document.getElementById('bienvenida').style.display = 'block';
    document.body.className = '';
    botones.forEach(btn => btn.classList.remove('activo'));
    return;
  }

  categoriaActiva = categoria;
  document.getElementById('bienvenida').style.display = 'none';
  document.body.className = categoria;

  botones.forEach(btn => {
    const texto = btn.textContent.toLowerCase();
    btn.classList.toggle('activo', texto.includes(categoria));
  });

  // Filtrar y ordenar alfabéticamente
  const filtradas = palabrasData
    .filter(p => p.categoria.toLowerCase() === categoria)
    .sort((a, b) => a.palabra.localeCompare(b.palabra));

  if (filtradas.length > 0) {
    resultado.innerHTML = `<ul class="lista-palabras">` + filtradas.map(p => `
      <li onclick="alternarDetalle('${p.palabra}')">
        <strong>${p.palabra}</strong>
        <div id="detalle-${p.palabra}" class="detalle-palabra" style="display:none;"></div>
      </li>
    `).join('') + `</ul>`;
  } else {
    resultado.innerHTML = `<p>No hay palabras en la categoría "${categoria}".</p>`;
  }
}
// Alternar despliegue de palabra
function alternarDetalle(nombre) {
  const palabra = palabrasData.find(p => p.palabra.toLowerCase() === nombre.toLowerCase());
  const contenedor = document.getElementById(`detalle-${nombre}`);

  if (!palabra || !contenedor) return;

  const estaVisible = contenedor.classList.contains('visible');

  if (estaVisible) {
    // Si ya está visible, lo ocultamos
    contenedor.innerHTML = '';
    contenedor.classList.remove('visible');
    contenedor.style.display = 'none';
  } else {
    // Ocultamos todos los demás
    document.querySelectorAll('.detalle-palabra').forEach(div => {
      div.innerHTML = '';
      div.classList.remove('visible');
      div.style.display = 'none';
    });

    // Mostramos el nuevo
    contenedor.innerHTML = `
      <p><strong>Traducción:</strong> ${palabra.traduccion}</p>
      <p><strong>Definición:</strong> ${palabra.definicion}</p>
      <p><strong>Ejemplo:</strong> ${palabra.ejemplo}</p>
    `;
    contenedor.classList.add('visible');
    contenedor.style.display = 'block';
  }
}