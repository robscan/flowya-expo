# QA Checklist - FLOWYA V1.0

**Fecha de creación**: 2025-01-XX  
**Scope**: 13 - QA Exhaustivo  
**Foco**: Web (navegador móvil)

---

## 📱 QA Funcional - Pantallas Principales

### Home (Explore Tab)
- [ ] La pantalla carga correctamente
- [ ] Se muestran spots cercanos si hay ubicación
- [ ] Se muestran spots recomendados
- [ ] Se muestran flows recomendados
- [ ] Los sliders horizontales funcionan (scroll)
- [ ] Al tocar un spot, navega a Spot Detail
- [ ] Al tocar un flow, navega a Flow Detail
- [ ] El botón de perfil funciona
- [ ] El header muestra "FLOWYA - Home"
- [ ] Estados vacíos se muestran cuando no hay datos

### Map Tab
- [ ] El mapa se carga correctamente
- [ ] Los pines de los spots son visibles (⚠️ Bug #21 documentado)
- [ ] El botón de ubicación funciona (centra en ubicación del usuario)
- [ ] El botón "+" para crear spot funciona
- [ ] Al tocar un pin, navega a Spot Detail
- [ ] Long press en el mapa abre Create Spot
- [ ] El mapa es navegable (pan, zoom)

### Search
- [ ] El campo de búsqueda funciona
- [ ] Se muestran sugerencias mientras se escribe
- [ ] Los resultados se filtran correctamente
- [ ] Se pueden filtrar por categorías
- [ ] Al tocar un resultado, navega correctamente
- [ ] El botón "+" para crear spot funciona
- [ ] El mapa en Search muestra los spots correctos
- [ ] Estados vacíos se muestran cuando no hay resultados

### Saved
- [ ] Se muestran spots guardados
- [ ] Se muestran flows guardados
- [ ] El timeline de actividad funciona
- [ ] Los tabs (Saved/History) funcionan
- [ ] Al tocar un item, navega correctamente
- [ ] Estados vacíos se muestran cuando no hay items guardados

### Profile
- [ ] Se muestra información del usuario si está autenticado
- [ ] Se muestra versión de invitado si no está autenticado
- [ ] Los botones de Login/Signup funcionan (si no autenticado)
- [ ] El botón de Logout funciona (si autenticado)
- [ ] Los toggles de preferencias funcionan
- [ ] "Liked Spots" navega correctamente
- [ ] "Limpiar datos" funciona con confirmación

### Spot Detail
- [ ] La pantalla carga correctamente
- [ ] Se muestra toda la información del spot
- [ ] El botón "Start from here" funciona
- [ ] El botón de like funciona
- [ ] El botón de share funciona
- [ ] El menú "..." muestra opciones correctas
- [ ] El modo edición funciona
- [ ] El botón "Generate with AI" funciona (si configurado)
- [ ] El mapa muestra la ubicación correcta

### Flow Detail
- [ ] La pantalla carga correctamente
- [ ] Se muestra información del flow
- [ ] La imagen de portada rota correctamente
- [ ] El botón "Start Flow" funciona
- [ ] La lista de spots se muestra correctamente
- [ ] Al tocar un spot, navega a Spot Detail

### Flow Screen (Activo)
- [ ] Se muestra cuando se inicia un flow
- [ ] El header con "NOW MOVING" se muestra
- [ ] Los controles de minimizar y cerrar funcionan
- [ ] El segmented control (List/Map) funciona
- [ ] El spot actual se muestra correctamente
- [ ] Los controles de play/pause funcionan
- [ ] El botón "Next" funciona
- [ ] El diálogo de guardar aparece al cerrar
- [ ] El mapa muestra la ruta correctamente

### Flow Mini Player
- [ ] Se muestra cuando el flow está minimizado
- [ ] Los controles de play/pause funcionan
- [ ] Los controles de atrás/adelante funcionan
- [ ] Al tocar, expande el Flow Screen
- [ ] Se posiciona correctamente sobre el tab bar

### Create Spot
- [ ] La pantalla carga correctamente
- [ ] El campo de nombre funciona
- [ ] El selector de tipo funciona
- [ ] El selector de foto funciona
- [ ] El mapa permite seleccionar ubicación
- [ ] El botón "Generate with AI" funciona (si configurado)
- [ ] El botón "Send" crea el spot correctamente
- [ ] La validación funciona (requiere foto)

### Login/Signup
- [ ] El formulario de login funciona
- [ ] El formulario de signup funciona
- [ ] La navegación entre login/signup funciona
- [ ] El tab bar se muestra durante login/signup
- [ ] Los errores se muestran correctamente

---

## 🔗 QA de Integración - Contextos

### SpotContext
- [ ] Crear spot funciona y persiste
- [ ] Actualizar spot funciona y persiste
- [ ] Eliminar spot funciona
- [ ] Obtener spots funciona
- [ ] Los spots se cargan al iniciar la app

### PathContext (FlowContext)
- [ ] Crear flow funciona
- [ ] Obtener flows funciona
- [ ] Los flows se cargan al iniciar la app
- [ ] Las sugerencias de flows funcionan

### FlowContext
- [ ] Iniciar flow funciona
- [ ] Pausar flow funciona
- [ ] Reanudar flow funciona
- [ ] Terminar flow funciona
- [ ] Minimizar/expandir flow funciona
- [ ] Navegar entre spots funciona

### SavedContext
- [ ] Guardar spot funciona
- [ ] Like spot funciona
- [ ] "Not my vibe" funciona
- [ ] Guardar flow funciona
- [ ] El timeline se actualiza correctamente

### NarrationContext
- [ ] Reproducir narration funciona
- [ ] Pausar narration funciona
- [ ] Silenciar narration funciona
- [ ] Los triggers funcionan (approaching, arriving, leaving)

---

## 💾 QA de Persistencia

- [ ] Los spots se guardan en AsyncStorage
- [ ] Los flows se guardan en AsyncStorage
- [ ] Las preferencias se guardan
- [ ] Los likes/saves se guardan
- [ ] Al reiniciar la app, los datos se cargan correctamente
- [ ] No hay pérdida de datos al cerrar la app

---

## 🌐 QA de Plataformas - Web

### Navegador Desktop
- [ ] La app carga correctamente
- [ ] La navegación funciona
- [ ] Los mapas funcionan
- [ ] Las interacciones funcionan (click, scroll)

### Navegador Móvil (Foco Principal)
- [ ] La app carga correctamente
- [ ] La navegación funciona
- [ ] Los mapas funcionan
- [ ] Las interacciones táctiles funcionan (tap, swipe, scroll)
- [ ] El tab bar es accesible
- [ ] Los controles tienen tamaño adecuado (≥48px)

---

## ⚡ QA de Rendimiento

- [ ] El tiempo de carga inicial es aceptable (<3 segundos)
- [ ] Las pantallas cargan rápidamente
- [ ] El scroll es fluido en listas largas
- [ ] El mapa no se congela con muchos marcadores
- [ ] Las animaciones son suaves (60fps)
- [ ] No hay memory leaks evidentes

---

## 🔐 QA de Permisos

- [ ] La solicitud de ubicación funciona
- [ ] El manejo de denegación funciona
- [ ] La app funciona sin permisos de ubicación
- [ ] El modo manual funciona

---

## 🎯 QA de Edge Cases

- [ ] Spots sin nombre se muestran correctamente
- [ ] Spots sin descripción se muestran correctamente
- [ ] Flows con un solo spot funcionan
- [ ] Flows vacíos se manejan correctamente
- [ ] Listas vacías muestran estados vacíos
- [ ] Datos corruptos no rompen la app
- [ ] Cambios de conexión se manejan correctamente

---

## ♿ QA de Accesibilidad

- [ ] Los botones tienen área táctil ≥48px
- [ ] El contraste de texto es suficiente
- [ ] La navegación no depende solo de color
- [ ] Los iconos tienen labels o son descriptivos
- [ ] La interfaz es usable caminando

---

## 📝 Notas de QA

**Fecha de ejecución**: ___________  
**Ejecutado por**: ___________  
**Plataforma probada**: Web (navegador móvil)  
**Versión**: ___________  

### Bugs Encontrados Durante QA

1. 
2. 
3. 

### Observaciones

- 
- 
- 

---

**Estado General**: ⬜ Pendiente | ⬜ En Progreso | ⬜ Completado

