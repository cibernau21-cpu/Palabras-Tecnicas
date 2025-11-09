let palabrasFiltradas = [];
let categoriaActiva = null;

// 🌱 Cargar palabras desde el archivo JSON con frase poética de carga
fetch('palabras.json')
  .then(res => res.json())
  .then(data => {
    document.getElementById('resultado').innerHTML = '<p class="frase-poetica">🌱 El monte está despertando…</p>';
    palabrasFiltradas = limpiarDuplicados(data);
    actualizarContador(palabrasFiltradas.length);
    inicializarBuscador();
    activarBotonPresentacion();
  })
  .catch(error => {
    console.error("Error al cargar palabras.json:", error);
    document.getElementById('resultado').innerHTML = '<p>Error al cargar el glosario.</p>';
  });

// 🌄 Función ritual para volver al estado general
function volverAlInicio() {
  categoriaActiva = null;
  document.getElementById('resultado').innerHTML = '';
  document.getElementById('bienvenida').style.display = 'block';
  document.body.className = '';
  document.querySelectorAll('.boton-categoria').forEach(btn => btn.classList.remove('activo'));
  actualizarContador(palabrasFiltradas.length);
  mostrarBotonVolver(false);

  document.querySelector('.encabezado-institucional')?.classList.remove('ocultar');
  document.querySelector('.secciones-enlinea')?.classList.remove('ocultar');
  document.querySelector('.pie-institucional')?.classList.remove('ocultar');
  document.getElementById('contenido-presentacion')?.classList.add('oculto');

  activarBotonPresentacion();
}

// 🔍 Mostrar resultado por búsqueda directa
function mostrarResultado(query) {
  const texto = query.trim().toLowerCase();
  const palabra = palabrasFiltradas.find(p =>
    p.palabra.toLowerCase() === texto || p.traduccion.toLowerCase() === texto
  );

  if (palabra) {
    mostrarPalabras([palabra]);
    document.getElementById('bienvenida').style.display = 'none';
    mostrarBotonVolver(true);
  } else {
    document.getElementById('resultado').innerHTML = `
      <div class="resultado-palabra visible">
        <p class="frase-poetica">Esta palabra aún duerme bajo las hojas del monte.</p>
        <p>No se encontró la palabra ni su traducción.</p>
      </div>
    `;
    mostrarBotonVolver(true);
  }

  activarBotonPresentacion();
}

// 💡 Sugerencias dinámicas con debounce
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function inicializarBuscador() {
  const buscador = document.getElementById('buscador');
  const sugerencias = document.getElementById('sugerencias');

  buscador.addEventListener('input', debounce(function () {
    const texto = this.value.trim().toLowerCase();
    sugerencias.innerHTML = '';
      buscador.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      const termino = buscador.value.trim().toLowerCase();
      if (termino) {
        const resultado = palabrasFiltradas.find(p =>
          p.palabra.toLowerCase() === termino || p.traduccion.toLowerCase() === termino
        );
        if (resultado) {
          mostrarPalabras([resultado]);
          sugerencias.innerHTML = '';
        } else {
          document.getElementById('resultado').innerHTML = `
            <p class="frase-poetica">🌿 El monte no conoce esa palabra aún.</p>
          `;
          sugerencias.innerHTML = '';
        }
      }
    }
  });

    if (texto === '') {
      document.getElementById('resultado').innerHTML = '';
      document.getElementById('contador-palabras').textContent = '';
      document.getElementById('bienvenida').style.display = 'block';
      mostrarBotonVolver(false);
      document.querySelector('.encabezado-institucional')?.classList.remove('ocultar');
      document.querySelector('.secciones-enlinea')?.classList.remove('ocultar');
      document.querySelector('.pie-institucional')?.classList.remove('ocultar');
      document.getElementById('contenido-presentacion')?.classList.add('oculto');
      return;
    }

    const coincidencias = palabrasFiltradas.filter(p =>
      p.palabra.toLowerCase().includes(texto) ||
      p.traduccion.toLowerCase().includes(texto) ||
      p.definicion.toLowerCase().includes(texto)
    );

    sugerencias.innerHTML = coincidencias.slice(0, 5).map(p => `
      <li onclick="seleccionarSugerencia('${p.palabra}')">
        ${p.palabra} → <span class="traduccion">${p.traduccion}</span>
      </li>
    `).join('');

    mostrarPalabras(coincidencias);
    activarBotonPresentacion();
  }, 300));
}

function seleccionarSugerencia(palabra) {
  document.getElementById('buscador').value = palabra;
  document.getElementById('sugerencias').innerHTML = '';
  mostrarResultado(palabra);
}

// 🧭 Filtrar por categoría
function filtrarCategoria(categoria) {
  const resultado = document.getElementById('resultado');
  const botones = document.querySelectorAll('.boton-categoria');

  if (categoriaActiva === categoria) {
    volverAlInicio();
    history.pushState({}, '', '#inicio');
    return;
  }

  categoriaActiva = categoria;
  document.getElementById('bienvenida').style.display = 'none';
  document.querySelector('.encabezado-institucional')?.classList.add('ocultar');
  document.querySelector('.secciones-enlinea')?.classList.add('ocultar');
  document.querySelector('.pie-institucional')?.classList.add('ocultar');
  document.getElementById('contenido-presentacion')?.classList.add('oculto');
  document.body.className = categoria;

  botones.forEach(btn => {
    btn.classList.toggle('activo', btn.classList.contains(categoria));
  });

  const filtradas = palabrasFiltradas
    .filter(p => p.categoria.toLowerCase() === categoria)
    .sort((a, b) => a.palabra.localeCompare(b.palabra));

  actualizarContador(filtradas.length);
  mostrarBotonVolver(true);

  if (filtradas.length > 0) {
    const frase = {
      arquitectura: "🌇 El saber estructural se despliega...",
      informatica: "🧑‍💻 El sistema se revela entre bits...",
      programacion: "🧠 Algoritmos despiertan bajo las hojas..."
    };

    resultado.innerHTML = `
      <p class="frase-poetica">${frase[categoria]}</p>
      <ul class="lista-palabras">
        ${filtradas.map((p, i) => `
          <li onclick="alternarDetalle('${p.palabra}')" style="--i:${i}">
            <strong>${p.palabra}</strong>
            <div id="detalle-${p.palabra}" class="detalle-palabra" style="display:none;"></div>
          </li>
        `).join('')}
      </ul>
    `;
  } else {
    resultado.innerHTML = `<p>No hay palabras en la categoría "${categoria}".</p>`;
  }

  history.pushState({ categoria: categoria }, '', `#${categoria}`);
  activarBotonPresentacion();
}

// 📘 Mostrar palabra con banderitas
function mostrarPalabras(lista) {
  const contenedor = document.getElementById('resultado');
  contenedor.innerHTML = '';

  lista.forEach(p => {
    const entrada = document.createElement('div');
    entrada.className = 'entrada-palabra';

    entrada.innerHTML = `
  <p>
    <span class="bandera">🇪🇸</span>
    <strong class="palabra-es">${p.palabra}</strong>
    <button class="boton-audio" onclick="pronunciarPalabra('${p.palabra}', 'es')">🔊</button>
  </p>
  <p>
    <span class="bandera">🇬🇧</span>
    <em class="palabra-en">${p.traduccion}</em>
    <button class="boton-audio" onclick="pronunciarPalabra('${p.traduccion}', 'en')">🔊</button>
  </p>
  <p class="definicion">${p.definicion}</p>
  <p class="ejemplo"><strong>Ejemplo:</strong> ${p.ejemplo}</p>
`;

    contenedor.appendChild(entrada);
  });

  actualizarContador(lista.length);
  mostrarBotonVolver(true);
  activarBotonPresentacion();
}

// 📖 Alternar despliegue de palabra optimizado
function alternarDetalle(nombre) {
  const palabra = palabrasFiltradas.find(p => p.palabra.toLowerCase() === nombre.toLowerCase());
  const contenedor = document.getElementById(`detalle-${nombre}`);

  if (!palabra || !contenedor) return;

  const estaVisible = contenedor.classList.contains('visible');

  if (estaVisible) {
    contenedor.innerHTML = '';
    contenedor.classList.remove('visible');
    contenedor.style.display = 'none';
  } else {
    document.querySelectorAll('.detalle-palabra.visible').forEach(div => {
      div.innerHTML = '';
      div.classList.remove('visible');
      div.style.display = 'none';
    });

    contenedor.innerHTML = `
      <p><span class="bandera">🇬🇧</span> <em class="palabra-en">${palabra.traduccion}</em></p>
      <p class="definicion">${palabra.definicion}</p>
      <p class="ejemplo"><strong>Ejemplo:</strong> ${palabra.ejemplo}</p>
    `;
    contenedor.classList.add('visible');
    contenedor.style.display = 'block';
  }
}

// 🧼 Limpieza silenciosa de duplicados
function limpiarDuplicados(palabras) {
  const únicas = [];
  palabras.forEach(item => {
    const yaExiste = únicas.some(otro =>
      item.palabra.toLowerCase() === otro.palabra.toLowerCase() &&
      item.traduccion === otro.traduccion &&
      item.definicion === otro.definicion &&
      item.ejemplo === otro.ejemplo
    );
    if (!yaExiste) únicas.push(item);
  });
  return únicas;
}

// 🌿 Contador visual
function actualizarContador(cantidad) {
  const contador = document.getElementById('contador-palabras');
  if (contador) {
    contador.textContent = cantidad > 0
      ? `🐊⌨️ ${cantidad} Palabras técnicas.`
      : '🐊💻  No se encontraron coincidencias.';
  }
}

// 🔙 Manejo del botón ATRÁS
window.addEventListener('popstate', function(event) {
  if (event.state && event.state.categoria) {
    filtrarCategoria(event.state.categoria);
  } else {
    volverAlInicio();
    activarBotonPresentacion();
  }
});

// 🪶 Estado inicial al cargar
window.addEventListener('load', () => {
  history.replaceState({}, '', '#inicio');
  volverAlInicio();
});

// ℹ️ Activar presentación lateral
function activarBotonPresentacion() {
  const boton = document.getElementById('boton-presentacion');
  const contenido = document.getElementById('contenido-presentacion');

  if (boton && contenido) {
    boton.onclick = () => {
      contenido.classList.toggle('oculto');
    };
  }
}

// 🧭 Botón flotante ritual
function mostrarBotonVolver(mostrar) {
  const boton = document.getElementById('boton-volver');
  if (boton) {
    boton.classList.toggle('oculto', !mostrar);
    boton.onclick = () => {
      volverAlInicio();
      history.pushState({}, '', '#inicio');
    };
  }
}
function pronunciarPalabra(palabra, idioma = 'es') {
  speechSynthesis.cancel(); // Detiene cualquier voz anterior

  const voz = new SpeechSynthesisUtterance(palabra);
  voz.lang = idioma === 'en' ? 'en-US' : 'es-AR';
  voz.rate = 0.9;
  voz.pitch = 1.1;

  // Detectar qué botón fue presionado
  const botones = document.querySelectorAll('.boton-audio');
  botones.forEach(b => b.classList.remove('activo')); // limpiar otros

  // Activar el botón actual
  const evento = event.currentTarget;
  evento.classList.add('activo');

  // Cuando termina la voz, desactivar el botón
  voz.onend = () => {
    evento.classList.remove('activo');
  };

  speechSynthesis.speak(voz);
}