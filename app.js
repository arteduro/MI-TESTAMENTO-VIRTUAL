/* =============================================
   MI TESTAMENTO VIRTUAL — app.js
   Flujo guiado con compuertas por nivel
   ============================================= */

// ============================================================
// ORDEN DE PASOS Y ESTADO GLOBAL
// ============================================================
var PASOS = ['inicio', 'cliente', 'bienes', 'beneficiario', 'testamento'];
var currentTab = 'datos-personales';
var pestanas = ['datos-personales', 'datos-contacto', 'datos-familiares'];
var pendingModalCallback = null;

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
  actualizarNavLocks();
  actualizarStepperGlobal();
  mostrarPagina('inicio');
  // Calcular edad al cambiar fecha
  var fechaInput = document.getElementById('fecha-nacimiento');
  if (fechaInput) fechaInput.addEventListener('change', calcularEdad);
});

// ============================================================
// HELPERS — qué pasos están completados
// ============================================================
function pasoCompletado(paso) {
  switch (paso) {
    case 'inicio':    return true;
    case 'cliente':   return !!localStorage.getItem('clienteTestamento');
    case 'bienes':    return (JSON.parse(localStorage.getItem('bienesTestamento')) || []).length > 0;
    case 'beneficiario': return (JSON.parse(localStorage.getItem('beneficiariosTestamento')) || []).length > 0;
    case 'testamento': return !!localStorage.getItem('albaceaTestamento');
    default: return false;
  }
}

function pasoAnteriorCompletado(paso) {
  var idx = PASOS.indexOf(paso);
  if (idx <= 1) return true; // inicio y cliente siempre accesibles
  return pasoCompletado(PASOS[idx - 1]);
}

// ============================================================
// NAV — bloquear / desbloquear botones
// ============================================================
function actualizarNavLocks() {
  document.querySelectorAll('nav button[data-pagina]').forEach(function (btn) {
    var destino = btn.getAttribute('data-pagina');
    if (destino === 'inicio' || destino === 'beneficios' || destino === 'digital') {
      btn.classList.remove('nav-locked');
      return;
    }
    if (pasoAnteriorCompletado(destino)) {
      btn.classList.remove('nav-locked');
    } else {
      btn.classList.add('nav-locked');
    }
  });
}

// ============================================================
// STEPPER GLOBAL (indicador en header)
// ============================================================
function actualizarStepperGlobal() {
  var mapa = { cliente: 'check-cliente', bienes: 'check-bienes', beneficiario: 'check-beneficiarios', testamento: 'check-albacea', digital: 'check-digital' };
  Object.keys(mapa).forEach(function (paso) {
    var el = document.getElementById(mapa[paso]);
    if (!el) return;
    var completado = paso === 'digital'
      ? !!localStorage.getItem('albaceaDigitalTestamento')
      : pasoCompletado(paso);
    if (completado) {
      el.classList.add('done');
      el.querySelector('i').className = 'fas fa-check-circle';
    } else {
      el.classList.remove('done');
      el.querySelector('i').className = 'fas fa-circle';
    }
  });
}

// ============================================================
// NAVEGACIÓN DE PÁGINAS
// ============================================================
// Resalta el botón de nav principal correspondiente a la página activa.
// Las 4 páginas del flujo clásico (cliente/bienes/beneficiario/testamento)
// comparten un único botón de nav: "Testamento Clásico" (data-pagina="cliente").
function resaltarNavPrincipal(paginaId) {
  var CLASICO = ['cliente', 'bienes', 'beneficiario', 'testamento'];
  var destinoResaltado = CLASICO.indexOf(paginaId) !== -1 ? 'cliente' : paginaId;
  document.querySelectorAll('nav button').forEach(function (btn) {
    btn.classList.remove('nav-active');
    if (btn.getAttribute('data-pagina') === destinoResaltado) btn.classList.add('nav-active');
  });
}

function mostrarPagina(paginaId) {
  // Compuerta: si el paso anterior no está completo, bloquear
  if (paginaId !== 'inicio' && paginaId !== 'beneficios' && paginaId !== 'digital') {
    if (!pasoAnteriorCompletado(paginaId)) {
      var idx = PASOS.indexOf(paginaId);
      var pasoRequerido = PASOS[idx - 1];
      var nombres = { cliente: 'Testador', bienes: 'Bienes', beneficiario: 'Beneficiarios', testamento: 'Testamento' };
      mostrarBloqueada(paginaId, nombres[pasoRequerido] || pasoRequerido, pasoRequerido);
      return;
    }
  }

  document.querySelectorAll('.pagina').forEach(function (p) { p.classList.remove('active'); });
  var target = document.getElementById(paginaId);
  if (target) target.classList.add('active');

  resaltarNavPrincipal(paginaId);

  document.querySelectorAll('.alert').forEach(function (a) { a.style.display = 'none'; });

  // Acciones por página
  if (paginaId === 'cliente')     { resetTabs(); }
  if (paginaId === 'bienes')      { cargarBienes(); }
  if (paginaId === 'beneficiario') { cargarBeneficiarios(); actualizarBadgePorcentaje(); }
  if (paginaId === 'testamento')  { cargarVistaPreviaTestamento(); }

  actualizarNavLocks();
  actualizarStepperGlobal();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Muestra un banner de sección bloqueada dentro del contenedor
function mostrarBloqueada(paginaId, nombrePasoRequerido, idPasoRequerido) {
  document.querySelectorAll('.pagina').forEach(function (p) { p.classList.remove('active'); });
  var target = document.getElementById(paginaId);
  if (!target) return;

  // Guardar contenido real y mostrar pantalla bloqueada
  var bloqueada = document.createElement('div');
  bloqueada.className = 'seccion-bloqueada pagina active';
  bloqueada.id = 'bloqueada-temp';
  bloqueada.innerHTML =
    '<div class="bloqueada-icono"><i class="fas fa-lock"></i></div>' +
    '<h3>Sección bloqueada</h3>' +
    '<p>Debes completar primero el paso <strong>' + nombrePasoRequerido + '</strong> para acceder a esta sección.</p>' +
    '<button class="btn-ir-paso" onclick="irAPaso(\'' + idPasoRequerido + '\')">' +
    '<i class="fas fa-arrow-right"></i> Ir a ' + nombrePasoRequerido + '</button>';

  // Remover posible bloqueada anterior
  var anterior = document.getElementById('bloqueada-temp');
  if (anterior) anterior.remove();

  target.parentNode.insertBefore(bloqueada, target);
  bloqueada.classList.add('active');

  resaltarNavPrincipal(paginaId);
}

function irAPaso(pasoId) {
  var anterior = document.getElementById('bloqueada-temp');
  if (anterior) anterior.remove();
  mostrarPagina(pasoId);
}

// ============================================================
// PANTALLA DE TRANSICIÓN (celebración al completar un paso)
// ============================================================
function mostrarTransicion(config) {
  // config: { titulo, subtitulo, icono, claseIcono, resumen:[], siguientePaso, idPasoActual }
  var paginaActual = document.getElementById(config.idPasoActual);
  if (!paginaActual) { mostrarPagina(config.siguientePaso); return; }

  // Construir resumen
  var resumenHtml = '';
  if (config.resumen && config.resumen.length) {
    resumenHtml = '<div class="transicion-resumen"><h4>Resumen guardado</h4>';
    config.resumen.forEach(function (item) {
      resumenHtml += '<div class="resumen-item"><i class="fas fa-check-circle"></i><span>' + escapeHtml(item) + '</span></div>';
    });
    resumenHtml += '</div>';
  }

  var div = document.createElement('div');
  div.className = 'pantalla-transicion activa';
  div.id = 'transicion-' + config.idPasoActual;
  div.innerHTML =
    '<div class="transicion-icono ' + (config.claseIcono || 'exito') + '"><i class="fas ' + (config.icono || 'fa-check') + '"></i></div>' +
    '<div class="transicion-titulo">' + config.titulo + '</div>' +
    '<div class="transicion-subtitulo">' + config.subtitulo + '</div>' +
    resumenHtml +
    '<div class="transicion-acciones">' +
    '<button class="btn-continuar" onclick="continuarDesdTransicion(\'' + config.siguientePaso + '\', \'' + config.idPasoActual + '\')">' +
    '<i class="fas fa-arrow-right"></i> Continuar al siguiente paso' +
    '</button>' +
    '<button class="btn-editar-paso" onclick="editarPaso(\'' + config.idPasoActual + '\')">' +
    '<i class="fas fa-pencil-alt"></i> Revisar / Editar' +
    '</button>' +
    '</div>';

  // Ocultar contenido del paso y mostrar transición
  paginaActual.style.display = 'none';
  paginaActual.parentNode.insertBefore(div, paginaActual.nextSibling);
  div.style.display = 'flex';

  actualizarNavLocks();
  actualizarStepperGlobal();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function continuarDesdTransicion(siguientePaso, pasoActualId) {
  var trans = document.getElementById('transicion-' + pasoActualId);
  if (trans) trans.remove();
  var paginaActual = document.getElementById(pasoActualId);
  if (paginaActual) paginaActual.style.display = '';
  mostrarPagina(siguientePaso);
}

function editarPaso(pasoId) {
  var trans = document.getElementById('transicion-' + pasoId);
  if (trans) trans.remove();
  var pagina = document.getElementById(pasoId);
  if (pagina) { pagina.style.display = ''; pagina.classList.add('active'); }
  resaltarNavPrincipal(pasoId);
}

// ============================================================
// TABS + PROGRESS BAR (dentro de página Cliente)
// ============================================================
function resetTabs() {
  currentTab = 'datos-personales';
  updateTabNavigation();
}

function updateTabNavigation() {
  document.querySelectorAll('.tab-content').forEach(function (t) { t.classList.add('hidden'); });
  var activa = document.getElementById(currentTab);
  if (activa) activa.classList.remove('hidden');

  var tabIndex = pestanas.indexOf(currentTab);
  document.querySelectorAll('.tab-btn').forEach(function (btn, i) {
    btn.classList.remove('active', 'disabled');
    if (i === tabIndex)  btn.classList.add('active');
    else if (i > tabIndex) btn.classList.add('disabled');
  });

  updateProgressBar(tabIndex + 1);
  var err = document.getElementById('mensaje-error-cliente');
  if (err) err.style.display = 'none';
}

function updateProgressBar(step) {
  var progress = ((step - 1) / 2) * 100;
  var bar = document.getElementById('progress-bar');
  if (bar) bar.style.width = progress + '%';
  for (var i = 1; i <= 3; i++) {
    var el = document.getElementById('step' + i);
    if (!el) continue;
    el.classList.remove('active', 'completed');
    if (i < step) el.classList.add('completed');
    else if (i === step) el.classList.add('active');
  }
}

function mostrarTab(tabId) {
  var ci = pestanas.indexOf(currentTab);
  var ti = pestanas.indexOf(tabId);
  if (ti <= ci) { currentTab = tabId; updateTabNavigation(); }
}

function avanzarPestana() {
  var ci = pestanas.indexOf(currentTab);
  if (ci < pestanas.length - 1 && validarCamposPestana(currentTab)) {
    currentTab = pestanas[ci + 1];
    updateTabNavigation();
  }
}

function retrocederPestana() {
  var ci = pestanas.indexOf(currentTab);
  if (ci > 0) { currentTab = pestanas[ci - 1]; updateTabNavigation(); }
}

// ============================================================
// MENSAJES
// ============================================================
function mostrarExito(elementId, mensaje) {
  var el = document.getElementById(elementId);
  if (!el) return;
  var div = el.querySelector('div');
  if (div) div.textContent = mensaje;
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.gap = '0.5rem';
  setTimeout(function () { el.style.display = 'none'; }, 5000);
}

function mostrarError(elementId, mensaje) {
  var el = document.getElementById(elementId);
  if (!el) return;
  if (elementId === 'mensaje-error-cliente') {
    var t = document.getElementById('mensaje-error-texto');
    if (t) t.textContent = mensaje;
  } else {
    var div = el.querySelector('div');
    if (div) div.textContent = mensaje;
  }
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.gap = '0.5rem';
}

// ============================================================
// MODAL DE CONFIRMACIÓN
// ============================================================
function abrirModal(titulo, mensaje, callback) {
  document.getElementById('modal-titulo').textContent = titulo;
  document.getElementById('modal-mensaje').textContent = mensaje;
  pendingModalCallback = callback;
  document.getElementById('btn-modal-ok').onclick = function () {
    cerrarModal();
    if (pendingModalCallback) pendingModalCallback();
  };
  document.getElementById('modal-confirmar').classList.remove('hidden');
}

function cerrarModal() {
  document.getElementById('modal-confirmar').classList.add('hidden');
  pendingModalCallback = null;
}

// ============================================================
// UTILIDADES
// ============================================================
function setSpan(id, texto) {
  var el = document.getElementById(id);
  if (el) el.textContent = texto;
}

function formatearFecha(iso) {
  if (!iso) return '—';
  var p = iso.split('-');
  return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso;
}

function formatearFechaActual() {
  return new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatearMoneda(valor) {
  if (!valor) return '—';
  return '$ ' + parseInt(valor).toLocaleString('es-CO');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function togglePassword(id, btn) {
  var input = document.getElementById(id);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.querySelector('i').className = 'fas fa-eye-slash';
  } else {
    input.type = 'password';
    btn.querySelector('i').className = 'fas fa-eye';
  }
}

function calcularEdad() {
  var fechaVal = document.getElementById('fecha-nacimiento').value;
  var display   = document.getElementById('edad-display');
  if (!fechaVal || !display) return;
  var hoy  = new Date();
  var nac  = new Date(fechaVal);
  var edad = hoy.getFullYear() - nac.getFullYear();
  var m    = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  if (edad < 18) {
    display.textContent = edad + ' años — No cumple la edad mínima (Art. 1061 CC)';
    display.className = 'edad-display edad-error';
  } else {
    display.textContent = edad + ' años — Cumple el requisito legal';
    display.className = 'edad-display edad-ok';
  }
}

// ============================================================
// VALIDACIONES
// ============================================================
function validarCorreos() {
  var c1 = document.getElementById('correo').value;
  var c2 = document.getElementById('confirmar-correo').value;
  if (c1 && c2 && c1 !== c2) {
    document.getElementById('correo').classList.add('invalid');
    document.getElementById('confirmar-correo').classList.add('invalid');
    mostrarError('mensaje-error-cliente', 'Los correos electrónicos no coinciden');
    return false;
  }
  document.getElementById('correo').classList.remove('invalid');
  document.getElementById('confirmar-correo').classList.remove('invalid');
  return true;
}

function validarCamposPestana(pestana) {
  var requeridos = {
    'datos-personales': ['tipo-documento','numero-documento','password','nombre','apellido','sexo','fecha-nacimiento','pais-nacimiento','nivel-estudio'],
    'datos-contacto':   ['pais-residencia','departamento-residencia','municipio-residencia','celular','correo','confirmar-correo']
  };
  var campos = requeridos[pestana];
  if (!campos) return true;
  var ok = true;

  // Validar mayoría de edad
  if (pestana === 'datos-personales') {
    var fechaVal = document.getElementById('fecha-nacimiento') ? document.getElementById('fecha-nacimiento').value : '';
    if (fechaVal) {
      var nac = new Date(fechaVal);
      var hoy = new Date();
      var edad = hoy.getFullYear() - nac.getFullYear();
      var m = hoy.getMonth() - nac.getMonth();
      if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
      if (edad < 18) {
        document.getElementById('fecha-nacimiento').classList.add('invalid');
        mostrarError('mensaje-error-cliente', 'Debe ser mayor de 18 años para otorgar testamento (Art. 1061 CC)');
        return false;
      }
    }
  }

  campos.forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    if (!el.value.trim()) {
      el.classList.add('invalid');
      if (ok) {
        var lbl = el.previousElementSibling;
        var txt = lbl ? lbl.textContent.replace(' *','').trim() : id;
        mostrarError('mensaje-error-cliente', 'Por favor complete: ' + txt);
        el.focus();
        ok = false;
      }
    } else {
      el.classList.remove('invalid');
    }
  });

  if (!ok) return false;
  if (pestana === 'datos-contacto') return validarCorreos();
  return true;
}

// ============================================================
// CLIENTE — guardar y mostrar transición
// ============================================================
function guardarCliente() {
  if (!validarCamposPestana('datos-personales') || !validarCamposPestana('datos-contacto')) return;

  var dp = document.getElementById;
  var clienteData = {
    datosPersonales: {
      tipoDocumento:         document.getElementById('tipo-documento').value,
      numeroDocumento:       document.getElementById('numero-documento').value.trim(),
      nombre:                document.getElementById('nombre').value.trim(),
      apellido:              document.getElementById('apellido').value.trim(),
      sexo:                  document.getElementById('sexo').value,
      fechaNacimiento:       document.getElementById('fecha-nacimiento').value,
      paisNacimiento:        document.getElementById('pais-nacimiento').value,
      departamentoNacimiento:document.getElementById('departamento-nacimiento').value,
      municipioNacimiento:   document.getElementById('municipio-nacimiento').value.trim(),
      nivelEstudio:          document.getElementById('nivel-estudio').value
    },
    datosContacto: {
      paisResidencia:         document.getElementById('pais-residencia').value,
      departamentoResidencia: document.getElementById('departamento-residencia').value,
      municipioResidencia:    document.getElementById('municipio-residencia').value.trim(),
      celular:                document.getElementById('celular').value.trim(),
      correo:                 document.getElementById('correo').value.trim(),
      direccion:              document.getElementById('direccion').value.trim()
    },
    datosFamiliares: {
      estadoCivil:        document.getElementById('estado-civil').value,
      nombreConyuge:      document.getElementById('nombre-conyuge').value.trim(),
      hijos:              document.getElementById('hijos').value,
      profesion:          document.getElementById('profesion') ? document.getElementById('profesion').value.trim() : '',
      contactoEmergencia: document.getElementById('contacto-emergencia').value.trim(),
      telefonoEmergencia: document.getElementById('telefono-emergencia').value.trim()
    },
    fechaRegistro: new Date().toISOString()
  };

  try {
    localStorage.setItem('clienteTestamento', JSON.stringify(clienteData));
    var nombre = clienteData.datosPersonales.nombre + ' ' + clienteData.datosPersonales.apellido;
    mostrarTransicion({
      idPasoActual: 'cliente',
      siguientePaso: 'bienes',
      icono: 'fa-user-check',
      claseIcono: 'exito',
      titulo: '¡Testador registrado!',
      subtitulo: 'Tus datos personales han sido guardados correctamente. Ahora declara los bienes que conforman tu patrimonio.',
      resumen: [
        'Nombre: ' + nombre,
        'Documento: ' + clienteData.datosPersonales.tipoDocumento + ' ' + clienteData.datosPersonales.numeroDocumento,
        'Residencia: ' + clienteData.datosContacto.municipioResidencia + ', ' + clienteData.datosContacto.paisResidencia,
        'Estado civil: ' + (clienteData.datosFamiliares.estadoCivil || 'No indicado')
      ]
    });
  } catch (e) {
    mostrarError('mensaje-error-cliente', 'Error al guardar: ' + e.message);
  }
}

// ============================================================
// BIENES — guardar, cargar, eliminar, transición
// ============================================================
function guardarBien() {
  var tipo = document.getElementById('bien-tipo');
  var desc = document.getElementById('bien-descripcion');
  if (!tipo.value) { tipo.classList.add('invalid'); mostrarError('mensaje-error-bien', 'Seleccione el tipo de bien'); return; }
  tipo.classList.remove('invalid');
  if (!desc.value.trim()) { desc.classList.add('invalid'); mostrarError('mensaje-error-bien', 'Ingrese la descripción del bien'); return; }
  desc.classList.remove('invalid');

  var bien = {
    tipo:        tipo.value,
    descripcion: desc.value.trim(),
    matricula:   document.getElementById('bien-matricula').value.trim(),
    valor:       document.getElementById('bien-valor').value,
    notas:       document.getElementById('bien-notas').value.trim(),
    fecha:       new Date().toISOString()
  };

  try {
    var bienes = JSON.parse(localStorage.getItem('bienesTestamento')) || [];
    bienes.push(bien);
    localStorage.setItem('bienesTestamento', JSON.stringify(bienes));
    mostrarExito('mensaje-exito-bien', 'Bien registrado. Puede agregar más bienes.');
    ['bien-tipo','bien-descripcion','bien-matricula','bien-valor','bien-notas'].forEach(function(id) {
      var el = document.getElementById(id); if (el) { el.value = ''; el.classList.remove('invalid'); }
    });
    cargarBienes();
  } catch (e) {
    mostrarError('mensaje-error-bien', 'Error: ' + e.message);
  }
}

function cargarBienes() {
  var container = document.getElementById('bienes-container');
  var countEl   = document.getElementById('bienes-count');
  if (!container) return;
  var bienes = JSON.parse(localStorage.getItem('bienesTestamento')) || [];
  if (countEl) countEl.textContent = bienes.length + (bienes.length === 1 ? ' bien' : ' bienes');
  if (bienes.length === 0) {
    container.innerHTML = '<p style="color:var(--gray);text-align:center;padding:1rem;">No hay bienes registrados aún.</p>';
    return;
  }
  var html = '';
  bienes.forEach(function (b, i) {
    html += '<div class="bien-item">' +
      '<div class="bien-info">' +
      '<h4>' + escapeHtml(b.tipo) + '</h4>' +
      '<p>' + escapeHtml(b.descripcion) + '</p>' +
      (b.valor ? '<p><strong>Valor estimado:</strong> ' + formatearMoneda(b.valor) + '</p>' : '') +
      '</div>' +
      '<div class="bien-actions"><button onclick="confirmarEliminarBien(' + i + ')"><i class="fas fa-trash"></i> Eliminar</button></div>' +
      '</div>';
  });
  container.innerHTML = html;

  // Mostrar botón de continuar si hay bienes
  mostrarBotonContinuarBienes(bienes.length);
}

function mostrarBotonContinuarBienes(cantidad) {
  var existente = document.getElementById('btn-continuar-bienes');
  if (cantidad > 0 && !existente) {
    var btn = document.createElement('button');
    btn.id = 'btn-continuar-bienes';
    btn.className = 'btn-continuar';
    btn.style.marginTop = '1.5rem';
    btn.style.width = '100%';
    btn.style.justifyContent = 'center';
    btn.innerHTML = '<i class="fas fa-arrow-right"></i> Continuar con Beneficiarios';
    btn.onclick = function () { terminarBienes(); };
    var lista = document.querySelector('#bienes .beneficiarios-list');
    if (lista) lista.appendChild(btn);
  }
}

function terminarBienes() {
  var bienes = JSON.parse(localStorage.getItem('bienesTestamento')) || [];
  if (bienes.length === 0) { mostrarError('mensaje-error-bien', 'Registre al menos un bien para continuar'); return; }
  var resumen = bienes.slice(0,4).map(function(b) { return b.tipo + ': ' + b.descripcion.substring(0,50); });
  if (bienes.length > 4) resumen.push('... y ' + (bienes.length - 4) + ' bien(es) más');
  mostrarTransicion({
    idPasoActual: 'bienes',
    siguientePaso: 'beneficiario',
    icono: 'fa-building',
    claseIcono: 'exito',
    titulo: '¡Patrimonio declarado!',
    subtitulo: 'Has registrado ' + bienes.length + ' bien(es). Ahora designa a los beneficiarios de tu herencia.',
    resumen: resumen
  });
}

function confirmarEliminarBien(index) {
  abrirModal('Eliminar bien', '¿Está seguro de eliminar este bien? Esta acción no se puede deshacer.', function () {
    var bienes = JSON.parse(localStorage.getItem('bienesTestamento')) || [];
    bienes.splice(index, 1);
    localStorage.setItem('bienesTestamento', JSON.stringify(bienes));
    cargarBienes();
  });
}

// ============================================================
// BENEFICIARIOS — guardar, cargar, eliminar, transición
// ============================================================
function guardarBeneficiario() {
  var campos = ['beneficiario-nombre','beneficiario-parentesco','beneficiario-porcentaje'];
  var ok = true;
  campos.forEach(function (id) {
    var el = document.getElementById(id);
    if (!el || !el.value.trim()) {
      if (el) el.classList.add('invalid');
      if (ok) {
        var lbl = el ? el.previousElementSibling : null;
        mostrarError('mensaje-error-beneficiario', 'Complete: ' + (lbl ? lbl.textContent.replace(' *','').trim() : id));
        if (el) el.focus();
        ok = false;
      }
    } else {
      if (el) el.classList.remove('invalid');
    }
  });
  if (!ok) return;

  var pct = parseInt(document.getElementById('beneficiario-porcentaje').value, 10);
  if (isNaN(pct) || pct < 1 || pct > 100) {
    document.getElementById('beneficiario-porcentaje').classList.add('invalid');
    mostrarError('mensaje-error-beneficiario', 'El porcentaje debe estar entre 1 y 100');
    return;
  }
  var total = calcularPorcentajeTotal();
  if (total + pct > 100) {
    document.getElementById('beneficiario-porcentaje').classList.add('invalid');
    mostrarError('mensaje-error-beneficiario', 'Supera el 100%. Disponible: ' + (100 - total) + '%');
    return;
  }

  var b = {
    nombre:          document.getElementById('beneficiario-nombre').value.trim(),
    parentesco:      document.getElementById('beneficiario-parentesco').value,
    tipoAsignacion:  document.getElementById('beneficiario-tipo-asignacion') ? document.getElementById('beneficiario-tipo-asignacion').value : 'Cuota herencial',
    porcentaje:      pct,
    documento:       document.getElementById('beneficiario-documento').value.trim(),
    bienLegado:      document.getElementById('beneficiario-bien-legado') ? document.getElementById('beneficiario-bien-legado').value.trim() : '',
    contacto:        document.getElementById('beneficiario-contacto').value.trim(),
    notas:           document.getElementById('beneficiario-notas').value.trim(),
    fecha:           new Date().toISOString()
  };

  try {
    var lista = JSON.parse(localStorage.getItem('beneficiariosTestamento')) || [];
    lista.push(b);
    localStorage.setItem('beneficiariosTestamento', JSON.stringify(lista));
    mostrarExito('mensaje-exito-beneficiario', 'Beneficiario registrado. Puede agregar más.');
    ['beneficiario-nombre','beneficiario-parentesco','beneficiario-porcentaje',
     'beneficiario-documento','beneficiario-bien-legado','beneficiario-contacto','beneficiario-notas'].forEach(function(id){
      var el = document.getElementById(id); if(el){el.value='';el.classList.remove('invalid');}
    });
    cargarBeneficiarios();
    actualizarBadgePorcentaje();
  } catch (e) { mostrarError('mensaje-error-beneficiario', 'Error: ' + e.message); }
}

function cargarBeneficiarios() {
  var container = document.getElementById('beneficiarios-container');
  var countEl   = document.getElementById('beneficiarios-count');
  if (!container) return;
  var lista = JSON.parse(localStorage.getItem('beneficiariosTestamento')) || [];
  if (countEl) countEl.textContent = lista.length;
  if (lista.length === 0) {
    container.innerHTML = '<p style="color:var(--gray);text-align:center;padding:1rem;">No hay beneficiarios registrados aún.</p>';
    return;
  }
  var html = '';
  lista.forEach(function (b, i) {
    html += '<div class="beneficiario-item">' +
      '<div class="beneficiario-info">' +
      '<h4>' + escapeHtml(b.nombre) + '</h4>' +
      '<p><strong>Parentesco:</strong> ' + escapeHtml(b.parentesco) + '</p>' +
      '<p><strong>' + escapeHtml(b.tipoAsignacion) + ':</strong> ' + b.porcentaje + '%' +
      (b.bienLegado ? ' — ' + escapeHtml(b.bienLegado) : '') + '</p>' +
      '</div>' +
      '<div class="beneficiario-actions">' +
      '<button onclick="confirmarEliminarBeneficiario(' + i + ')"><i class="fas fa-trash"></i> Eliminar</button>' +
      '</div></div>';
  });
  container.innerHTML = html;
  mostrarBotonContinuarBeneficiarios(lista.length, calcularPorcentajeTotal());
}

function mostrarBotonContinuarBeneficiarios(cantidad, total) {
  var existente = document.getElementById('btn-continuar-benef');
  if (existente) existente.remove();
  if (cantidad > 0) {
    var div = document.createElement('div');
    div.style.marginTop = '1.5rem';
    var advertencia = total < 100
      ? '<p style="color:var(--warning);font-size:0.85rem;margin-bottom:0.75rem;"><i class="fas fa-exclamation-triangle"></i> Has asignado ' + total + '%. El ' + (100-total) + '% restante quedará sin asignar.</p>'
      : '';
    div.innerHTML = advertencia +
      '<button id="btn-continuar-benef" class="btn-continuar" style="width:100%;justify-content:center;" onclick="terminarBeneficiarios()">' +
      '<i class="fas fa-arrow-right"></i> Continuar con el Testamento</button>';
    var lista = document.querySelector('#beneficiario .beneficiarios-list');
    if (lista) lista.appendChild(div);
  }
}

function terminarBeneficiarios() {
  var lista = JSON.parse(localStorage.getItem('beneficiariosTestamento')) || [];
  if (lista.length === 0) { mostrarError('mensaje-error-beneficiario', 'Registre al menos un beneficiario'); return; }
  var total = calcularPorcentajeTotal();
  var resumen = lista.map(function(b){ return b.nombre + ' (' + b.parentesco + ') — ' + b.porcentaje + '%'; });
  resumen.push('Total asignado: ' + total + '%');
  mostrarTransicion({
    idPasoActual: 'beneficiario',
    siguientePaso: 'testamento',
    icono: 'fa-users',
    claseIcono: 'exito',
    titulo: '¡Beneficiarios registrados!',
    subtitulo: 'Has designado ' + lista.length + ' beneficiario(s) con un total del ' + total + '% de la herencia. Ahora designa el albacea y genera tu testamento.',
    resumen: resumen
  });
}

function confirmarEliminarBeneficiario(index) {
  abrirModal('Eliminar beneficiario', '¿Está seguro de eliminar este beneficiario?', function () {
    var lista = JSON.parse(localStorage.getItem('beneficiariosTestamento')) || [];
    lista.splice(index, 1);
    localStorage.setItem('beneficiariosTestamento', JSON.stringify(lista));
    cargarBeneficiarios();
    actualizarBadgePorcentaje();
  });
}

function calcularPorcentajeTotal() {
  var lista = JSON.parse(localStorage.getItem('beneficiariosTestamento')) || [];
  return lista.reduce(function (s, b) { return s + (parseInt(b.porcentaje, 10) || 0); }, 0);
}

function actualizarBadgePorcentaje() {
  var badge = document.getElementById('badge-porcentaje');
  if (!badge) return;
  var total = calcularPorcentajeTotal();
  badge.className = 'porcentaje-total';
  if (total === 100) {
    badge.classList.add('ok');
    badge.innerHTML = '<i class="fas fa-check-circle"></i> Total asignado: ' + total + '% — Completo';
  } else if (total > 100) {
    badge.classList.add('over');
    badge.innerHTML = '<i class="fas fa-exclamation-circle"></i> Total: ' + total + '% — Excede el 100%';
  } else {
    badge.classList.add('warn');
    badge.innerHTML = '<i class="fas fa-info-circle"></i> Total: ' + total + '% — Faltan ' + (100 - total) + '%';
  }
}

// ============================================================
// ALBACEA y TESTIGOS
// ============================================================
function guardarAlbacea() {
  var nombre    = document.getElementById('albacea-nombre')    ? document.getElementById('albacea-nombre').value.trim()    : '';
  var documento = document.getElementById('albacea-documento') ? document.getElementById('albacea-documento').value.trim() : '';
  var sustituto = document.getElementById('sustituto-nombre')  ? document.getElementById('sustituto-nombre').value.trim()  : '';
  var facultades= document.getElementById('albacea-facultades')? document.getElementById('albacea-facultades').value : 'generales';

  if (!nombre) { mostrarError('mensaje-error-albacea', 'Ingrese el nombre del albacea'); return; }
  var data = { nombre, documento, sustituto, facultades };
  localStorage.setItem('albaceaTestamento', JSON.stringify(data));
  mostrarExito('mensaje-exito-albacea', 'Albacea guardado.');
  actualizarNavLocks(); actualizarStepperGlobal();
  cargarVistaPreviaTestamento();
}

function guardarTestigos() {
  var testigos = [];
  for (var i = 1; i <= 3; i++) {
    var n = document.getElementById('testigo'+i+'-nombre')    ? document.getElementById('testigo'+i+'-nombre').value.trim()    : '';
    var d = document.getElementById('testigo'+i+'-documento') ? document.getElementById('testigo'+i+'-documento').value.trim() : '';
    testigos.push({ nombre: n, documento: d });
  }
  localStorage.setItem('testigosTestamento', JSON.stringify(testigos));
  mostrarExito('mensaje-exito-testigos', 'Testigos guardados.');
  cargarVistaPreviaTestamento();
}

// ============================================================
// TESTAMENTO — vista previa
// ============================================================
function cargarVistaPreviaTestamento() {
  var cliente     = JSON.parse(localStorage.getItem('clienteTestamento'));
  var beneficiarios = JSON.parse(localStorage.getItem('beneficiariosTestamento')) || [];
  var bienes      = JSON.parse(localStorage.getItem('bienesTestamento')) || [];
  var albacea     = JSON.parse(localStorage.getItem('albaceaTestamento')) || {};
  var testigos    = JSON.parse(localStorage.getItem('testigosTestamento')) || [];

  // Pre-rellenar campos de albacea
  if (albacea.nombre)    { var n = document.getElementById('albacea-nombre');    if(n) n.value = albacea.nombre; }
  if (albacea.documento) { var d = document.getElementById('albacea-documento'); if(d) d.value = albacea.documento; }
  if (albacea.sustituto) { var s = document.getElementById('sustituto-nombre');  if(s) s.value = albacea.sustituto; }
  if (albacea.facultades){ var f = document.getElementById('albacea-facultades');if(f) f.value = albacea.facultades; }

  // Pre-rellenar testigos
  for (var i = 1; i <= 3; i++) {
    if (testigos[i-1]) {
      var tn = document.getElementById('testigo'+i+'-nombre');
      var td = document.getElementById('testigo'+i+'-documento');
      if (tn && testigos[i-1].nombre)    tn.value = testigos[i-1].nombre;
      if (td && testigos[i-1].documento) td.value = testigos[i-1].documento;
    }
  }

  if (!cliente) {
    var prev = document.getElementById('vista-previa-testamento');
    if (prev && !prev.querySelector('.aviso-sin-datos')) {
      var aviso = document.createElement('div');
      aviso.className = 'aviso-sin-datos alert alert-error';
      aviso.style.cssText = 'display:flex;align-items:center;gap:0.5rem;';
      aviso.innerHTML = '<i class="fas fa-exclamation-circle"></i><div>Complete primero el registro del Testador.</div>';
      prev.insertBefore(aviso, prev.firstChild);
    }
    return;
  }

  var avisoAnt = document.querySelector('.aviso-sin-datos');
  if (avisoAnt) avisoAnt.remove();

  var dp = cliente.datosPersonales || {};
  var dc = cliente.datosContacto || {};
  var df = cliente.datosFamiliares || {};
  var nombre = (dp.nombre + ' ' + dp.apellido).trim();
  var domicilio = [dc.municipioResidencia, dc.departamentoResidencia, dc.paisResidencia].filter(Boolean).join(', ');

  setSpan('testador-nombre',          nombre);
  setSpan('testador-nombre-completo', nombre);
  setSpan('testador-documento',       (dp.tipoDocumento || '') + ' No. ' + (dp.numeroDocumento || ''));
  setSpan('testador-nacimiento',      formatearFecha(dp.fechaNacimiento));
  setSpan('testador-estado-civil',    df.estadoCivil || '—');
  setSpan('testador-domicilio',       domicilio || '—');
  setSpan('firma-testador-nombre',    nombre);

  // Bienes
  var bienesEl = document.getElementById('bienes-testamento');
  if (bienesEl) {
    if (!bienes.length) {
      bienesEl.innerHTML = '<p style="color:var(--gray);">No se declararon bienes.</p>';
    } else {
      bienesEl.innerHTML = bienes.map(function(b) {
        return '<p>• <strong>' + escapeHtml(b.tipo) + '</strong>: ' + escapeHtml(b.descripcion) +
          (b.matricula ? ' (Matr./Placa: ' + escapeHtml(b.matricula) + ')' : '') +
          (b.valor ? ' — Valor estimado: ' + formatearMoneda(b.valor) : '') + '</p>';
      }).join('');
    }
  }

  // Beneficiarios
  var benfEl = document.getElementById('beneficiarios-testamento');
  if (benfEl) {
    if (!beneficiarios.length) {
      benfEl.innerHTML = '<p style="color:var(--gray);">No se registraron beneficiarios.</p>';
    } else {
      benfEl.innerHTML = beneficiarios.map(function(b) {
        var texto = 'Instituyo como heredero(a) a <strong>' + escapeHtml(b.nombre) + '</strong>, ' +
          escapeHtml(b.parentesco) + ', con ' + b.tipoAsignacion + ' del <strong>' + b.porcentaje + '%</strong>';
        if (b.bienLegado) texto += ', correspondiente al bien: ' + escapeHtml(b.bienLegado);
        if (b.notas) texto += '. Condición: ' + escapeHtml(b.notas);
        return '<p>' + texto + '.</p>';
      }).join('');
    }
  }

  // Albacea preview
  var facultadesTexto = { generales:'facultades generales de administración', cobro:'cobro de deudas activas', pago:'pago de deudas hereditarias', plenas:'plenas facultades testamentarias' };
  setSpan('albacea-nombre-preview',    albacea.nombre    || '___________________');
  setSpan('albacea-documento-preview', albacea.documento || '___________________');
  setSpan('sustituto-nombre-preview',  albacea.sustituto || '___________________');
  setSpan('albacea-facultades-preview',facultadesTexto[albacea.facultades] || 'facultades generales de administración');

  // Testigos preview
  var testigosEl = document.getElementById('testigos-preview');
  if (testigosEl) {
    var tHtml = testigos.filter(function(t){ return t.nombre; }).map(function(t,i) {
      return '<p>Testigo ' + (i+1) + ': <strong>' + escapeHtml(t.nombre) + '</strong>' +
        (t.documento ? ', documento ' + escapeHtml(t.documento) : '') + '</p>';
    }).join('') || '<p style="color:var(--gray);">Testigos no registrados.</p>';
    testigosEl.innerHTML = tHtml;
    // Firmas
    for (var j = 1; j <= 3; j++) {
      setSpan('firma-testigo' + j, testigos[j-1] ? testigos[j-1].nombre : '');
    }
  }

  // Fecha y lugar
  setSpan('fecha-testamento', formatearFechaActual());
  setSpan('lugar-testamento', domicilio || '—');
}

function imprimirTestamento() { window.print(); }

function exportarTexto() {
  var prev = document.getElementById('vista-previa-testamento');
  if (!prev) return;
  var texto = prev.innerText || prev.textContent;
  var blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href = url; a.download = 'testamento_virtual.txt'; a.click();
  URL.revokeObjectURL(url);
}

// ============================================================
// ACTIVOS DIGITALES — tabs de la sección
// ============================================================
var currentTabDigital = 'dTab-albacea-content';
var tabsDigitalMap = {
  'dTab-albacea-content':   'dtab-albacea',
  'dTab-activos-content':   'dtab-activos',
  'dTab-clausulas-content': 'dtab-clausulas',
  'dTab-bigtech-content':   'dtab-bigtech',
  'dTab-preview-content':   'dtab-preview'
};

function mostrarTabDigital(tabId) {
  // Ocultar todos los contenidos
  Object.keys(tabsDigitalMap).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  // Quitar active de todos los botones
  Object.values(tabsDigitalMap).forEach(function(btnId) {
    var btn = document.getElementById(btnId);
    if (btn) btn.classList.remove('active');
  });
  // Activar tab seleccionado
  var target = document.getElementById(tabId);
  if (target) target.classList.remove('hidden');
  var btnActivo = document.getElementById(tabsDigitalMap[tabId]);
  if (btnActivo) btnActivo.classList.add('active');
  currentTabDigital = tabId;

  // Si es cláusulas, regenerar con datos del albacea digital y restaurar la selección A/B/C/D
  if (tabId === 'dTab-clausulas-content') {
    generarClausulaAlbacea();
    cargarSeleccionClausulas();
  }
  // Si es la vista previa del testamento digital, recompilar el documento completo
  if (tabId === 'dTab-preview-content') {
    cargarTestadorDigital();
    cargarTestigosDigital();
    cargarVistaPreviaTestamentoDigital();
  }
}

// ============================================================
// ALBACEA DIGITAL — guardar / cargar
// ============================================================
function guardarAlbaceaDigital() {
  var nombre    = document.getElementById('albacea-digital-nombre') ? document.getElementById('albacea-digital-nombre').value.trim() : '';
  var documento = document.getElementById('albacea-digital-documento') ? document.getElementById('albacea-digital-documento').value.trim() : '';

  if (!nombre || !documento) {
    mostrarError('msg-error-albacea-digital', 'Complete el nombre y documento del albacea digital.');
    return;
  }

  var data = {
    nombre:       nombre,
    documento:    documento,
    correo:       document.getElementById('albacea-digital-correo') ? document.getElementById('albacea-digital-correo').value.trim() : '',
    telefono:     document.getElementById('albacea-digital-telefono') ? document.getElementById('albacea-digital-telefono').value.trim() : '',
    instrucciones: document.getElementById('albacea-digital-instrucciones') ? document.getElementById('albacea-digital-instrucciones').value.trim() : '',
    facultades: {
      administrar:   document.getElementById('fac-administrar')   ? document.getElementById('fac-administrar').checked   : false,
      cerrar:        document.getElementById('fac-cerrar')        ? document.getElementById('fac-cerrar').checked        : false,
      transferir:    document.getElementById('fac-transferir')    ? document.getElementById('fac-transferir').checked    : false,
      conmemorativa: document.getElementById('fac-conmemorativa') ? document.getElementById('fac-conmemorativa').checked : false,
      eliminar:      document.getElementById('fac-eliminar')      ? document.getElementById('fac-eliminar').checked      : false,
      cripto:        document.getElementById('fac-cripto')        ? document.getElementById('fac-cripto').checked        : false
    }
  };

  try {
    localStorage.setItem('albaceaDigitalTestamento', JSON.stringify(data));
    mostrarExito('msg-exito-albacea-digital', 'Albacea digital guardado correctamente.');
    actualizarStepperGlobal();
    cargarVistaPreviaTestamentoDigital();
  } catch(e) {
    mostrarError('msg-error-albacea-digital', 'Error al guardar: ' + e.message);
  }
}

function cargarAlbaceaDigital() {
  var data = JSON.parse(localStorage.getItem('albaceaDigitalTestamento') || 'null');
  if (!data) return;
  var set = function(id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; };
  set('albacea-digital-nombre',        data.nombre);
  set('albacea-digital-documento',     data.documento);
  set('albacea-digital-correo',        data.correo);
  set('albacea-digital-telefono',      data.telefono);
  set('albacea-digital-instrucciones', data.instrucciones);
  if (data.facultades) {
    var setChk = function(id, val) { var el = document.getElementById(id); if (el) el.checked = !!val; };
    setChk('fac-administrar',   data.facultades.administrar);
    setChk('fac-cerrar',        data.facultades.cerrar);
    setChk('fac-transferir',    data.facultades.transferir);
    setChk('fac-conmemorativa', data.facultades.conmemorativa);
    setChk('fac-eliminar',      data.facultades.eliminar);
    setChk('fac-cripto',        data.facultades.cripto);
  }
}

// ============================================================
// ACTIVOS DIGITALES — guardar / cargar / eliminar
// ============================================================
var CATEGORIAS_BADGE = {
  'Criptomonedas / NFTs': 'badge-economico',
  'Banca digital': 'badge-economico',
  'Billetera digital': 'badge-economico',
  'Inversiones online': 'badge-economico',
  'Red social': 'badge-perfil',
  'Correo electrónico': 'badge-perfil',
  'Blog / sitio web': 'badge-perfil',
  'Cuenta gaming': 'badge-perfil',
  'Almacenamiento nube': 'badge-nube',
  'Fotos y videos': 'badge-nube',
  'Documentos confidenciales': 'badge-nube',
  'Streaming': 'badge-suscripcion',
  'Software / licencias': 'badge-suscripcion',
  'Suscripcion otro': 'badge-suscripcion',
  'Dominio web': 'badge-otro',
  'Activo digital otro': 'badge-otro'
};

var ICONOS_CATEGORIA = {
  'Criptomonedas / NFTs': 'fa-bitcoin',
  'Banca digital': 'fa-university',
  'Billetera digital': 'fa-wallet',
  'Inversiones online': 'fa-chart-line',
  'Red social': 'fa-share-alt',
  'Correo electrónico': 'fa-envelope',
  'Blog / sitio web': 'fa-globe',
  'Cuenta gaming': 'fa-gamepad',
  'Almacenamiento nube': 'fa-cloud',
  'Fotos y videos': 'fa-images',
  'Documentos confidenciales': 'fa-file-lock',
  'Streaming': 'fa-play-circle',
  'Software / licencias': 'fa-box',
  'Suscripcion otro': 'fa-credit-card',
  'Dominio web': 'fa-server',
  'Activo digital otro': 'fa-laptop-code'
};

// Sugerencias de plataforma según la categoría elegida (referenciada por el <select> en el HTML)
var SUGERENCIAS_PLATAFORMA = {
  'Criptomonedas / NFTs':      'Ej: Binance, Coinbase, Metamask',
  'Banca digital':             'Ej: Nu, Lulo Bank, Nubank',
  'Billetera digital':         'Ej: Nequi, Daviplata, PayPal',
  'Inversiones online':        'Ej: YouTube, Twitch, Trii',
  'Red social':                'Ej: Facebook, Instagram, TikTok, X',
  'Correo electrónico':        'Ej: Gmail, Outlook, Yahoo',
  'Blog / sitio web':          'Ej: WordPress, Wix',
  'Cuenta gaming':             'Ej: Steam, PlayStation Network, Xbox Live',
  'Almacenamiento nube':       'Ej: Google Drive, iCloud, Dropbox',
  'Fotos y videos':            'Ej: Google Fotos, iCloud Fotos',
  'Documentos confidenciales': 'Ej: Notion, Evernote',
  'Streaming':                 'Ej: Netflix, Spotify, Disney+',
  'Software / licencias':      'Ej: Microsoft 365, Adobe',
  'Suscripcion otro':          'Ej: nombre del servicio',
  'Dominio web':                'Ej: GoDaddy, Namecheap',
  'Activo digital otro':       'Ej: nombre del servicio o plataforma'
};

function actualizarSubtipo() {
  var tipo = document.getElementById('activo-digital-tipo');
  var plat = document.getElementById('activo-digital-plataforma');
  if (!tipo || !plat) return;
  plat.placeholder = SUGERENCIAS_PLATAFORMA[tipo.value] || 'Nombre de la plataforma o servicio';
}

function guardarActivoDigital() {
  var tipo  = document.getElementById('activo-digital-tipo');
  var plat  = document.getElementById('activo-digital-plataforma');
  if (!tipo.value) { tipo.classList.add('invalid'); mostrarError('msg-error-activo-digital', 'Seleccione la categoría del activo.'); return; }
  tipo.classList.remove('invalid');
  if (!plat.value.trim()) { plat.classList.add('invalid'); mostrarError('msg-error-activo-digital', 'Ingrese el nombre de la plataforma.'); return; }
  plat.classList.remove('invalid');

  var activo = {
    tipo:          tipo.value,
    plataforma:    plat.value.trim(),
    identificador: document.getElementById('activo-digital-identificador').value.trim(),
    valor:         document.getElementById('activo-digital-valor').value,
    instruccion:   document.getElementById('activo-digital-instruccion').value,
    notas:         document.getElementById('activo-digital-notas').value.trim(),
    fecha:         new Date().toISOString()
  };

  try {
    var lista = JSON.parse(localStorage.getItem('activosDigitalesTestamento')) || [];
    lista.push(activo);
    localStorage.setItem('activosDigitalesTestamento', JSON.stringify(lista));
    mostrarExito('msg-exito-activo-digital', 'Activo digital registrado.');
    ['activo-digital-tipo','activo-digital-plataforma','activo-digital-identificador','activo-digital-valor','activo-digital-notas'].forEach(function(id) {
      var el = document.getElementById(id); if (el) { el.value = ''; el.classList.remove('invalid'); }
    });
    actualizarSubtipo();
    cargarActivosDigitales();
    actualizarStepperGlobal();
    cargarVistaPreviaTestamentoDigital();
  } catch(e) {
    mostrarError('msg-error-activo-digital', 'Error: ' + e.message);
  }
}

function cargarActivosDigitales() {
  var container = document.getElementById('activos-digitales-container');
  var countEl   = document.getElementById('activos-digitales-count');
  if (!container) return;
  var lista = JSON.parse(localStorage.getItem('activosDigitalesTestamento')) || [];
  if (countEl) countEl.textContent = lista.length;
  if (lista.length === 0) {
    container.innerHTML = '<p style="color:var(--gray);text-align:center;padding:1rem;">No hay activos digitales registrados aún.</p>';
    return;
  }
  var html = '';
  lista.forEach(function(a, i) {
    var badgeClass = CATEGORIAS_BADGE[a.tipo] || 'badge-otro';
    var icono      = ICONOS_CATEGORIA[a.tipo]  || 'fa-laptop-code';
    html += '<div class="activo-digital-item">' +
      '<div class="activo-digital-info">' +
      '<h4><i class="fas ' + icono + '"></i> ' + escapeHtml(a.plataforma) + '</h4>' +
      '<span class="activo-digital-badge ' + badgeClass + '">' + escapeHtml(a.tipo) + '</span>' +
      (a.identificador ? '<p><strong>Identificador:</strong> ' + escapeHtml(a.identificador) + '</p>' : '') +
      '<p><strong>Instrucción:</strong> ' + escapeHtml(a.instruccion) + '</p>' +
      (a.valor ? '<p><strong>Valor estimado:</strong> ' + formatearMoneda(a.valor) + '</p>' : '') +
      (a.notas ? '<p><strong>Notas:</strong> ' + escapeHtml(a.notas) + '</p>' : '') +
      '</div>' +
      '<div class="activo-digital-actions"><button onclick="confirmarEliminarActivoDigital(' + i + ')"><i class="fas fa-trash"></i> Eliminar</button></div>' +
      '</div>';
  });
  container.innerHTML = html;
}

function confirmarEliminarActivoDigital(index) {
  abrirModal('Eliminar activo digital', '¿Está seguro de eliminar este activo digital?', function() {
    var lista = JSON.parse(localStorage.getItem('activosDigitalesTestamento')) || [];
    lista.splice(index, 1);
    localStorage.setItem('activosDigitalesTestamento', JSON.stringify(lista));
    cargarActivosDigitales();
    cargarVistaPreviaTestamentoDigital();
  });
}

// ============================================================
// CLÁUSULAS NOTARIALES — generar texto dinámico
// ============================================================
// Genera el texto de designación del Albacea Digital a partir de los datos guardados.
// Se usa tanto en la Cláusula A (pestaña Cláusulas Notariales) como en la vista previa
// del Testamento de Activos Digitales, para no duplicar la lógica.
function generarTextoAlbaceaDigital(data) {
  if (!data || !data.nombre) return '';
  var facultadesTextos = [];
  if (data.facultades) {
    if (data.facultades.administrar)   facultadesTextos.push('la administración y gestión de cuentas y perfiles digitales');
    if (data.facultades.cerrar)        facultadesTextos.push('la cancelación de suscripciones y servicios de pago');
    if (data.facultades.transferir)    facultadesTextos.push('la transferencia de activos financieros digitales a los herederos');
    if (data.facultades.conmemorativa) facultadesTextos.push('la conversión de perfiles sociales en cuentas conmemorativas');
    if (data.facultades.eliminar)      facultadesTextos.push('la eliminación definitiva de archivos y perfiles privados');
    if (data.facultades.cripto)        facultadesTextos.push('la gestión y recuperación de criptomonedas ante exchanges e intermediarios');
  }
  var facultadesStr = facultadesTextos.length
    ? facultadesTextos.join('; ')
    : 'la administración, gestión, migración, cierre o transformación en cuentas conmemorativas de la totalidad del patrimonio digital';

  return 'Nombro como Albacea Digital a ' + data.nombre + ', identificado con C.C. ' + data.documento +
    (data.correo ? ', correo electrónico ' + data.correo : '') +
    ', para que, con exclusión de cualquier otra persona, asuma las siguientes funciones respecto a mi patrimonio digital: ' + facultadesStr +
    '. Lo anterior incluye cuentas de correo electrónico, perfiles en redes sociales, archivos en la nube, suscripciones digitales y activos criptográficos de mi propiedad.' +
    (data.instrucciones ? ' Instrucciones adicionales: ' + data.instrucciones : '');
}

function generarClausulaAlbacea() {
  var data = JSON.parse(localStorage.getItem('albaceaDigitalTestamento') || 'null');
  var el   = document.getElementById('clausula-albacea-digital-texto');
  if (!el) return;

  var texto = generarTextoAlbaceaDigital(data);
  if (!texto) {
    el.innerHTML = '<em style="color:var(--warning);">⚠ Primero guarda los datos del Albacea Digital en la pestaña "Albacea Digital" para generar esta cláusula automáticamente.</em>';
    return;
  }
  el.textContent = '"' + texto + '"';
}

// ============================================================
// SELECCIÓN DE CLÁUSULAS (A/B/C/D) — cuáles se incorporan al documento final
// ============================================================
var CLAUSULAS_DIGITAL_DEFAULT = { A: true, B: true, C: false, D: true };

function guardarSeleccionClausulas() {
  var seleccion = {};
  ['A', 'B', 'C', 'D'].forEach(function(letra) {
    var chk = document.getElementById('check-clausula-' + letra);
    seleccion[letra] = chk ? chk.checked : true;
    var card = chk ? chk.closest('.clausula-card') : null;
    if (card) card.classList.toggle('clausula-inactiva', !seleccion[letra]);
  });
  localStorage.setItem('clausulasDigitalSeleccion', JSON.stringify(seleccion));
  cargarVistaPreviaTestamentoDigital();
}

function cargarSeleccionClausulas() {
  var seleccion = JSON.parse(localStorage.getItem('clausulasDigitalSeleccion') || 'null') || CLAUSULAS_DIGITAL_DEFAULT;
  ['A', 'B', 'C', 'D'].forEach(function(letra) {
    var chk = document.getElementById('check-clausula-' + letra);
    if (!chk) return;
    chk.checked = !!seleccion[letra];
    var card = chk.closest('.clausula-card');
    if (card) card.classList.toggle('clausula-inactiva', !chk.checked);
  });
}

// ============================================================
// TESTIGOS DEL TESTAMENTO DE ACTIVOS DIGITALES (formalismo Art. 1068/1070 CC)
// ============================================================
function guardarTestigosDigital() {
  var testigos = [1, 2, 3].map(function(n) {
    var nombreEl    = document.getElementById('testigo' + n + '-digital-nombre');
    var documentoEl = document.getElementById('testigo' + n + '-digital-documento');
    return {
      nombre: nombreEl ? nombreEl.value.trim() : '',
      documento: documentoEl ? documentoEl.value.trim() : ''
    };
  });
  localStorage.setItem('testigosDigitalTestamento', JSON.stringify(testigos));
  mostrarExito('msg-exito-testigos-digital', 'Testigos guardados correctamente.');
  cargarVistaPreviaTestamentoDigital();
}

function cargarTestigosDigital() {
  var testigos = JSON.parse(localStorage.getItem('testigosDigitalTestamento') || 'null') || [];
  testigos.forEach(function(t, i) {
    var n = i + 1;
    var nombreEl    = document.getElementById('testigo' + n + '-digital-nombre');
    var documentoEl = document.getElementById('testigo' + n + '-digital-documento');
    if (nombreEl)    nombreEl.value    = t.nombre    || '';
    if (documentoEl) documentoEl.value = t.documento || '';
  });
}

// ============================================================
// TESTAMENTO DE ACTIVOS DIGITALES — identificación, vista previa, imprimir/exportar
// (Documento independiente del testamento general; no requiere Testador/Bienes/Beneficiarios)
// ============================================================
function guardarTestadorDigital() {
  var nombre    = document.getElementById('testador-digital-nombre')    ? document.getElementById('testador-digital-nombre').value.trim()    : '';
  var documento = document.getElementById('testador-digital-documento') ? document.getElementById('testador-digital-documento').value.trim() : '';
  var domicilio = document.getElementById('testador-digital-domicilio') ? document.getElementById('testador-digital-domicilio').value.trim() : '';

  if (!nombre || !documento) {
    mostrarError('msg-error-testador-digital', 'Ingrese nombre y documento del testador.');
    return;
  }

  var data = { nombre: nombre, documento: documento, domicilio: domicilio };
  try {
    localStorage.setItem('testadorDigitalTestamento', JSON.stringify(data));
    mostrarExito('msg-exito-testador-digital', 'Identificación guardada correctamente.');
    cargarVistaPreviaTestamentoDigital();
  } catch(e) {
    mostrarError('msg-error-testador-digital', 'Error al guardar: ' + e.message);
  }
}

function cargarTestadorDigital() {
  var data = JSON.parse(localStorage.getItem('testadorDigitalTestamento') || 'null');
  if (!data) return;
  var set = function(id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; };
  set('testador-digital-nombre',    data.nombre);
  set('testador-digital-documento', data.documento);
  set('testador-digital-domicilio', data.domicilio);
}

function cargarVistaPreviaTestamentoDigital() {
  var prev = document.getElementById('vista-previa-testamento-digital');
  if (!prev) return; // la pestaña aún no existe en el DOM en este momento

  var testador          = JSON.parse(localStorage.getItem('testadorDigitalTestamento') || 'null');
  var albaceaDigital     = JSON.parse(localStorage.getItem('albaceaDigitalTestamento') || 'null');
  var activosDigitales   = JSON.parse(localStorage.getItem('activosDigitalesTestamento')) || [];
  var testigos           = JSON.parse(localStorage.getItem('testigosDigitalTestamento') || 'null') || [];
  var seleccion           = JSON.parse(localStorage.getItem('clausulasDigitalSeleccion') || 'null') || CLAUSULAS_DIGITAL_DEFAULT;

  // I. Identificación
  setSpan('testador-digital-nombre-preview',    testador ? testador.nombre    : '___________________');
  setSpan('testador-digital-documento-preview', testador ? testador.documento : '___________________');
  setSpan('testador-digital-domicilio-preview', (testador && testador.domicilio) ? testador.domicilio : '___________________');

  // III. Cláusulas notariales incorporadas — solo las marcadas como seleccionadas (A/B/C/D)
  var TODAS_LAS_CLAUSULAS = [
    { letra: 'A', titulo: 'Designación de Albacea Digital', texto: function () { return generarTextoAlbaceaDigital(albaceaDigital); } },
    { letra: 'B', titulo: 'Acceso a Activos Financieros Digitales', textoId: 'clausula-financiera-texto' },
    { letra: 'C', titulo: 'Mandato de Destrucción de Datos Privados', textoId: 'clausula-destruccion-texto' },
    { letra: 'D', titulo: 'Autorización de Datos Personales Post-Mortem (Ley 1581/2012)', textoId: 'clausula-datos-texto' }
  ];
  var clEl = document.getElementById('clausulas-testamento-preview');
  if (clEl) {
    var incluidas = TODAS_LAS_CLAUSULAS.filter(function (c) { return seleccion[c.letra]; });
    if (!incluidas.length) {
      clEl.innerHTML = '<p style="color:var(--gray);">No se ha seleccionado ninguna cláusula. Márcalas en la pestaña "Cláusulas Notariales".</p>';
    } else {
      clEl.innerHTML = incluidas.map(function (c) {
        var texto = c.texto ? c.texto() : '';
        if (!texto && c.textoId) {
          var origen = document.getElementById(c.textoId);
          texto = origen ? (origen.textContent || origen.innerText).trim().replace(/^"|"$/g, '') : '';
        }
        if (!texto) return '';
        return '<p><strong>Cláusula ' + c.letra + ' — ' + escapeHtml(c.titulo) + ':</strong> ' + escapeHtml(texto) + '</p>';
      }).join('');
    }
  }

  // IV. Activos digitales
  var actEl = document.getElementById('activos-digitales-testamento-preview');
  if (actEl) {
    if (!activosDigitales.length) {
      actEl.innerHTML = '<p style="color:var(--gray);">Aún no se han registrado activos digitales. Agrégalos en la pestaña "Mis Activos".</p>';
    } else {
      actEl.innerHTML = activosDigitales.map(function(a) {
        return '<p>• <strong>' + escapeHtml(a.tipo) + '</strong> — ' + escapeHtml(a.plataforma) +
          (a.identificador ? ' (cuenta: ' + escapeHtml(a.identificador) + ')' : '') +
          ' → Instrucción: ' + escapeHtml(a.instruccion) +
          (a.valor ? ' — Valor estimado: ' + formatearMoneda(a.valor) : '') +
          (a.notas ? '. ' + escapeHtml(a.notas) : '') + '</p>';
      }).join('');
    }
  }

  // V. Cierre y firma
  setSpan('fecha-testamento-digital', formatearFechaActual());
  setSpan('lugar-testamento-digital', (testador && testador.domicilio) ? testador.domicilio : '—');
  setSpan('firma-testador-digital-nombre', testador ? testador.nombre : '');
  setSpan('firma-albacea-digital-nombre',  (seleccion.A && albaceaDigital) ? albaceaDigital.nombre : '');
  setSpan('firma-testigo1-digital', testigos[0] ? testigos[0].nombre : '');
  setSpan('firma-testigo2-digital', testigos[1] ? testigos[1].nombre : '');
  setSpan('firma-testigo3-digital', testigos[2] ? testigos[2].nombre : '');

  // La firma del Albacea Digital solo se muestra si la Cláusula A fue incluida
  var boxAlbacea = document.getElementById('firma-box-albacea-digital');
  if (boxAlbacea) boxAlbacea.style.display = seleccion.A ? '' : 'none';
}

function imprimirTestamentoDigital() {
  mostrarTabDigital('dTab-preview-content');
  window.print();
}

function exportarTextoDigital() {
  var prev = document.getElementById('vista-previa-testamento-digital');
  if (!prev) return;
  var texto = prev.innerText || prev.textContent;
  var blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href = url; a.download = 'testamento_activos_digitales.txt'; a.click();
  URL.revokeObjectURL(url);
}

function copiarClausula(elementId) {
  var el = document.getElementById(elementId);
  if (!el) return;
  var texto = el.textContent || el.innerText;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texto).then(function() {
      mostrarExito('msg-copiar', 'Cláusula copiada al portapapeles.');
    });
  } else {
    // Fallback para navegadores que no soportan clipboard API
    var ta = document.createElement('textarea');
    ta.value = texto;
    ta.style.position = 'fixed'; ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    mostrarExito('msg-copiar', 'Cláusula copiada al portapapeles.');
  }
}

// Inicializar la sección digital al mostrarla
var _mostrarPaginaOriginal = mostrarPagina;
mostrarPagina = function(paginaId) {
  _mostrarPaginaOriginal(paginaId);
  if (paginaId === 'digital') {
    cargarAlbaceaDigital();
    cargarActivosDigitales();
    cargarTestadorDigital();
    mostrarTabDigital('dTab-albacea-content');
  }
};
