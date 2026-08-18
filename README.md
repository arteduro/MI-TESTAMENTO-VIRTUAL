# 📜 Mi Testamento Virtual — Colombia

![Version](https://img.shields.io/badge/version-2.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-stable-brightgreen)
![HTML](https://img.shields.io/badge/HTML-5-orange)
![CSS](https://img.shields.io/badge/CSS-3-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)

> **Herramienta web gratuita para redactar testamentos conforme al Código Civil Colombiano**

---

## 📋 Descripción

**Mi Testamento Virtual** es una aplicación web 100% gratuita y sin servidores que permite a cualquier ciudadano colombiano redactar su testamento conforme al Código Civil Colombiano (Art. 1055–1094).

La plataforma ofrece **dos modalidades de testamento** —Clásico y de Activos Digitales— que comparten un **único registro de identidad del testador**, evitando así la duplicidad de datos personales. El usuario puede optar por una modalidad, la otra, o ambas.

La herramienta guía al usuario paso a paso a través de un flujo intuitivo con compuertas de avance (no se puede continuar al siguiente módulo sin completar el actual), validando la información en tiempo real y generando un documento formal con los formalismos legales necesarios, listo para ser presentado ante notario.

---

## ✨ Características principales

### 🪪 Registro Único del Testador
- Paso obligatorio antes de acceder a cualquier modalidad de testamento
- Un solo registro (documento, nombre, fecha de nacimiento, contacto, domicilio) reutilizado tanto en el Testamento Clásico como en el Testamento de Activos Digitales
- Selector de departamento dinámico: al elegir Colombia como país, se despliegan los **32 departamentos** (aplica a datos de nacimiento y de contacto)
- Insignia de confirmación en el inicio ("Testador registrado: [nombre]") con acceso directo para editar
- Si se intenta entrar al Testamento Digital sin registro previo, la app redirige automáticamente al registro y retoma el flujo al terminar

### 📄 Testamento Clásico
- Datos de contacto y familiares del testador
- Declaración de bienes patrimoniales (inmuebles, vehículos, cuentas, etc.)
- Designación de beneficiarios con asignación de porcentajes
- Validación de asignaciones forzosas según Ley 1934/2018
- Designación de albacea y registro de testigos (mínimo 3)
- Vista previa con formato jurídico formal ("Testamento Abierto", Art. 1070 CC)
- Generación de PDF e impresión

### 💻 Testamento Digital
Documento **independiente** del Testamento Clásico, con avance secuencial por módulo (igual que el flujo clásico: no se avanza al siguiente módulo si el actual no está completo):

1. **Albacea Digital** — designación con facultades específicas y correo electrónico
2. **Mis Activos Digitales** — criptomonedas, redes sociales, correos, suscripciones, archivos en la nube, etc.
3. **Cláusulas Notariales** — 4 cláusulas modelo seleccionables (A: Albacea Digital · B: Activos Financieros · C: Destrucción de Datos · D: Datos Personales Post-Mortem, Ley 1581/2012); solo las marcadas se incorporan al documento final
4. **Guía Big Tech** — configuración post-mortem en Apple, Google, Meta y exchanges de criptomonedas
5. **Vista Previa y Firma** — documento final con identidad del testador, cláusulas incorporadas, activos, testigos y firma; generación de PDF y exportación de texto

**Notificación automática al Albacea Digital:** al registrar su correo, un botón envía automáticamente un aviso de designación por correo electrónico (vía EmailJS), con respaldo automático a `mailto:` si el envío falla o no hay conexión.

### 🔒 Seguridad y Privacidad
- **100% local**: todos los datos se guardan en el navegador (`localStorage`)
- **Sin servidores propios**: no se almacena información en servidores propios; el envío de notificaciones usa EmailJS como servicio de terceros, únicamente si el usuario lo activa
- **Sin cookies de rastreo**: no se recopilan datos personales con fines de seguimiento
- **Sin registros de cuenta**: no requiere crear cuenta ni proporcionar datos sensibles a terceros
- **Reinicio de datos**: botón "Reiniciar aplicación" en el encabezado, que borra todos los datos guardados (con confirmación) para empezar de cero o dejar el navegador limpio para otro usuario

---

## 🎯 Objetivo

Proporcionar una herramienta accesible, inclusiva y jurídicamente estructurada que permita a los colombianos:

- Formalizar su voluntad sucesoral sin barreras económicas
- Prevenir conflictos familiares mediante declaraciones claras
- Proteger su patrimonio digital ante el vacío legal existente
- Fomentar la cultura de previsión patrimonial

---

## 🛠️ Tecnologías

| Tecnología | Uso |
|------------|-----|
| **HTML5** | Estructura de la aplicación |
| **CSS3** | Estilos y diseño responsivo |
| **JavaScript (Vanilla)** | Lógica y funcionalidad |
| **EmailJS** | Envío de notificación por correo al Albacea Digital (sin backend propio) |
| **Font Awesome** | Íconos |
| **Google Fonts (Poppins)** | Tipografía |

---

## 📁 Estructura del Proyecto

```
MI-TESTAMENTO-VIRTUAL/
├── index.html    # Estructura de la aplicación + favicon embebido (data URI)
├── app.js        # Lógica: flujo guiado, compuertas, testamentos, EmailJS
├── styles.css    # Estilos y diseño responsivo
└── README.md
```

> `index.html` también existe en una variante autocontenida (CSS y JS incrustados en línea) para distribución como archivo único, útil cuando se comparte fuera de un repositorio.

---

## ⚖️ Marco Normativo Aplicado

| Norma | Descripción |
|-------|-------------|
| **Art. 1055–1064 CC** | Definición y clases de testamentos |
| **Art. 1061 CC** | Capacidad para testar (mayores de 18 años) |
| **Art. 1068 CC** | Inhabilidades de testigos |
| **Art. 1070 CC** | Testamento abierto ante notario y testigos |
| **Art. 1226 CC** | Asignaciones forzosas |
| **Ley 1934/2018** | Reforma al régimen de legítimas |
| **Art. 1327 CC** | Designación de albacea |
| **Ley 527/1999** | Comercio electrónico (base de adaptación para activos digitales) |
| **Ley 1581/2012** | Protección de datos personales |

---

## 📖 Guía de Uso

### 0. Registro Único del Testador (obligatorio)
- Se completa una sola vez, antes de acceder a cualquier modalidad
- Incluye datos personales, de contacto (con selector de los 32 departamentos de Colombia) y familiares
- Ambas modalidades de testamento reutilizan esta información

### 1. Testamento Clásico

#### Paso 1: Bienes
- Declara tus bienes patrimoniales
- Cada bien requiere: tipo, descripción, matrícula/placa y valor estimado
- Puedes agregar múltiples bienes

#### Paso 2: Beneficiarios
- Designa tus herederos
- Asigna porcentajes de herencia (total no puede superar 100%)
- Puedes especificar legados específicos
- El sistema valida las asignaciones forzosas

#### Paso 3: Testamento
- Designa albacea con facultades específicas
- Registra testigos (mínimo 3)
- Genera la vista previa del documento
- Exporta o imprime el testamento (PDF)

### 2. Testamento Digital

#### Módulo 1: Albacea Digital
- Designa la persona de confianza como albacea digital, con su correo electrónico
- Define las facultades otorgadas e instrucciones adicionales
- Opcional: notifícale la designación por correo con un clic

#### Módulo 2: Mis Activos Digitales
- Registra tus activos digitales: criptomonedas, redes sociales, correos, suscripciones, archivos en la nube, etc.
- Especifica instrucciones para cada activo

#### Módulo 3: Cláusulas Notariales
- Selecciona las cláusulas A/B/C/D a incluir en el documento final
- Copia las cláusulas para presentarlas al notario

#### Módulo 4: Guía Big Tech
- Consulta cómo configurar el legado digital en Apple, Google, Meta y exchanges de criptomonedas

#### Módulo 5: Vista Previa y Firma
- Genera el documento completo con identidad, cláusulas seleccionadas, activos y testigos
- Exporta o imprime el testamento (PDF)

---

## 🚀 Instalación

### Opción 1: Descarga directa
1. Descarga el archivo `index.html` (variante autocontenida)
2. Ábrelo en tu navegador preferido con doble clic

> **Nota sobre el favicon:** al abrir el archivo directamente (`file://`), Chrome no muestra el ícono en la pestaña por una restricción de seguridad del navegador para archivos locales. Esto se resuelve automáticamente al servir la app por `http://` o `https://` (ver opción 3).

### Opción 2: Clonar repositorio
```bash
git clone https://github.com/arteduro/MI-TESTAMENTO-VIRTUAL.git
cd MI-TESTAMENTO-VIRTUAL
```

### Opción 3: Ver en línea (GitHub Pages)
🔗 **[https://arteduro.github.io/MI-TESTAMENTO-VIRTUAL/](https://arteduro.github.io/MI-TESTAMENTO-VIRTUAL/)**

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo LICENSE para más detalles.

---

## ⚠️ Aviso Legal

**Importante:** este documento es un borrador orientativo. Para su plena validez jurídica:

- Debe ser firmado ante notario en presencia de testigos hábiles
- Conforme al Art. 1070 del Código Civil Colombiano
- Esta herramienta no reemplaza la asesoría jurídica profesional

La herramienta proporciona una guía estructurada pero no constituye asesoramiento legal. Se recomienda consultar con un abogado especializado en derecho sucesoral para validar el documento final.

En el caso del Testamento de Activos Digitales, Colombia no cuenta con una ley específica de herencia digital; las cláusulas incluidas se apoyan en una interpretación del Código Civil, la Ley 527/1999 y la Ley 1581/2012, y deben incorporarse formalmente al testamento ante notario para tener plena validez.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para sugerencias:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

### Áreas de mejora
- [ ] Integración con firma digital
- [ ] Autenticación biométrica
- [ ] Servicios notariales en línea
- [ ] Múltiples idiomas
- [ ] Exportación de PDF con motor propio (no dependiente del diálogo de impresión del navegador)

---

## 📞 Contacto

- **Email:** arteduro@gmail.com
- **GitHub:** [@arteduro](https://github.com/arteduro)
- **Website:** [https://arteduro.github.io/MI-TESTAMENTO-VIRTUAL/](https://arteduro.github.io/MI-TESTAMENTO-VIRTUAL/)

---

## 🙏 Agradecimientos

- Al Código Civil Colombiano por el marco jurídico
- A la comunidad de desarrollo open source por las herramientas
- A todos los usuarios que confían en esta herramienta

---

## 📊 Estado del Proyecto

| Módulo | Estado |
|--------|--------|
| ✅ Registro Único del Testador | Completamente funcional |
| ✅ Testamento Clásico | Completamente funcional |
| ✅ Testamento Digital | Completamente funcional |
| ✅ Avance secuencial por módulo (Digital) | Implementado |
| ✅ Cláusulas Notariales seleccionables (A/B/C/D) | Implementadas |
| ✅ Guía Big Tech | Implementada |
| ✅ Notificación por correo al Albacea Digital | Implementada (EmailJS + respaldo mailto) |
| ✅ Selector de 32 departamentos de Colombia | Implementado |
| ✅ Reiniciar aplicación | Implementado |
| ✅ Favicon | Implementado |
| ✅ Validaciones | Implementadas |
| ✅ Exportación / PDF | Implementada |
| ✅ Responsive | Implementado |
| ✅ Documentación | Completada |

---

## 📝 Changelog

### v2.1 (2026)
- ✨ Registro Único del Testador: paso obligatorio antes de elegir modalidad, evita duplicidad de datos entre ambos testamentos
- ✨ Testamento Digital: avance secuencial por módulo (igual que el Testamento Clásico)
- ✨ Testamento Digital: documento final independiente con identidad, cláusulas seleccionadas, activos, testigos y firma
- ✨ Selector dinámico de los 32 departamentos de Colombia (según país elegido)
- ✨ Notificación automática al Albacea Digital por correo electrónico (EmailJS) con respaldo a `mailto:`
- ✨ Botón "Reiniciar aplicación" para borrar todos los datos guardados
- ✨ Favicon de la aplicación
- 🐛 Corrección: el modal de confirmación no ejecutaba la acción al confirmar (afectaba reiniciar app y eliminar bien/beneficiario/activo digital)

### v2.0 (2024)
- ✨ Nueva sección de Testamento Digital
- ✨ Cláusulas notariales seleccionables (A/B/C/D)
- ✨ Guía Big Tech para configuración post-mortem
- ✨ Mejoras en la interfaz de usuario
- ✨ Optimizaciones de rendimiento
- ✨ Archivo único (HTML + CSS + JavaScript)

### v1.0 (2023)
- 🎉 Lanzamiento inicial
- ✨ Testamento Clásico completo
- ✨ Flujo guiado paso a paso
- ✨ Exportación e impresión
- ✨ Validaciones en tiempo real

---

## 🔗 Enlaces Útiles

- [Código Civil Colombiano](http://www.secretariasenado.gov.co/senado/basedoc/codigo_civil.html)
- [Ley 1934 de 2018](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=87020)
- [Ley 1581 de 2012](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981)
- [Font Awesome Íconos](https://fontawesome.com/)
- [Google Fonts](https://fonts.google.com/)
- [EmailJS](https://www.emailjs.com/)
