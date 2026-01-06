# Análisis UX - Heurísticas y Leyes de UX
## FLOWYA V1.0

**Fecha**: 2025-01-XX  
**Consultor UX**: Análisis Heurístico Completo  
**Metodología**: Heurísticas de Nielsen + Leyes de UX + Análisis de Flujos Críticos

---

## 📋 Marco de Evaluación

### Heurísticas de Nielsen (10)
1. **Visibilidad del estado del sistema** - El sistema debe informar al usuario sobre su estado actual
2. **Correspondencia entre sistema y mundo real** - El sistema debe usar lenguaje y conceptos familiares
3. **Control y libertad del usuario** - El usuario debe poder deshacer o salir fácilmente
4. **Consistencia y estándares** - Seguir convenciones de plataforma y mantener consistencia interna
5. **Prevención de errores** - Prevenir errores antes de que ocurran
6. **Reconocimiento antes que recuerdo** - Hacer acciones y opciones visibles
7. **Flexibilidad y eficiencia de uso** - Aceleradores para usuarios expertos
8. **Diseño estético y minimalista** - No incluir información irrelevante
9. **Ayuda a reconocer, diagnosticar y recuperarse de errores** - Mensajes de error claros
10. **Ayuda y documentación** - Documentación accesible cuando se necesite

### Leyes de UX Relevantes
- **Ley de Fitts**: Tiempo para alcanzar un objetivo depende de distancia y tamaño
- **Ley de Hick**: Tiempo de decisión aumenta con número de opciones
- **Ley de Miller (7±2)**: Límite cognitivo de 7±2 elementos
- **Ley de Proximidad**: Elementos cercanos se perciben como relacionados
- **Ley de Similaridad**: Elementos similares se perciben como relacionados
- **Ley de Continuidad**: Elementos alineados se perciben como continuos
- **Ley de Punto Focal**: Un elemento destacado atrae la atención

---

## 🔍 FLUJO 1: EXPLORACIÓN (Home → Spot Detail)

### Pantalla: Home (Explore Tab)

#### ✅ Fortalezas
- **Heurística #1 (Visibilidad)**: Header muestra "FLOWYA - Home" claramente
- **Heurística #4 (Consistencia)**: Tab bar visible y consistente
- **Ley de Proximidad**: Sliders agrupan spots relacionados (cercanos, recomendados)
- **Ley de Similaridad**: Cards similares indican mismo tipo de contenido
- **Ley de Fitts**: Botones de perfil tienen área táctil ≥48px

#### ⚠️ Áreas de Oportunidad

**1. Visibilidad del Estado del Sistema (Heurística #1)**
- **Problema**: No hay indicador claro de carga mientras se obtienen spots
- **Impacto**: Usuario no sabe si la app está cargando o no hay datos
- **Sugerencia**: 
  - Agregar skeleton loaders mientras carga
  - Mostrar "Cargando lugares cercanos..." con ActivityIndicator

**2. Reconocimiento vs Recuerdo (Heurística #6)**
- **Problema**: Los sliders horizontales no muestran indicadores de scroll (puntos, flechas)
- **Impacto**: Usuario no sabe que puede hacer scroll horizontal
- **Sugerencia**:
  - Agregar indicadores visuales sutiles (gradiente en bordes, sombra parcial)
  - Mostrar parcialmente el siguiente card para indicar scroll

**3. Ley de Miller (7±2)**
- **Problema**: Puede haber muchos sliders en pantalla (Cercanos, Recomendados, Vistos recientemente, etc.)
- **Impacto**: Sobrecarga cognitiva
- **Sugerencia**:
  - Limitar a 3-4 secciones principales visibles inicialmente
  - Colapsar/expandir secciones secundarias

**4. Prevención de Errores (Heurística #5)**
- **Problema**: No hay validación de que haya spots antes de mostrar sliders vacíos
- **Impacto**: Sliders vacíos confunden al usuario
- **Sugerencia**: Mostrar estado vacío con mensaje claro: "No hay spots cercanos. Explora el mapa para encontrar lugares."

**5. Control y Libertad (Heurística #3)**
- **Problema**: No hay forma fácil de refrescar la lista de spots
- **Impacto**: Usuario debe salir y volver para actualizar
- **Sugerencia**: Agregar pull-to-refresh en ScrollView

### Pantalla: Spot Detail

#### ✅ Fortalezas
- **Heurística #1 (Visibilidad)**: Header sticky muestra acciones claramente
- **Heurística #3 (Control)**: Botón de back siempre visible
- **Ley de Fitts**: Botones de acción tienen área táctil adecuada (≥48px)
- **Ley de Punto Focal**: Imagen hero (40% pantalla) atrae atención
- **Heurística #6 (Reconocimiento)**: Iconos semánticos claros (like, share, menu)

#### ⚠️ Áreas de Oportunidad

**1. Visibilidad del Estado (Heurística #1)**
- **Problema**: No hay feedback visual inmediato al guardar/like un spot
- **Impacto**: Usuario no sabe si la acción funcionó
- **Sugerencia**:
  - Cambiar color del icono inmediatamente (tint cuando está guardado)
  - Agregar animación sutil (scale) al tocar
  - Mostrar toast breve: "Spot guardado" (opcional, discreto)

**2. Prevención de Errores (Heurística #5)**
- **Problema**: Botón "Start from here" no valida si hay ubicación del usuario
- **Impacto**: Puede fallar silenciosamente si no hay ubicación
- **Sugerencia**:
  - Deshabilitar botón si no hay ubicación
  - Mostrar mensaje: "Activa ubicación para iniciar desde aquí"

**3. Ayuda y Documentación (Heurística #10)**
- **Problema**: Botón "Generate with AI" no explica qué hace exactamente
- **Impacto**: Usuario puede no entender qué generará
- **Sugerencia**:
  - Agregar tooltip o texto explicativo: "Genera descripción y contexto cultural con IA"
  - O mostrar preview de qué campos se llenarán

**4. Consistencia (Heurística #4)**
- **Problema**: El menú "..." (tres puntos) no sigue convención estándar
- **Impacto**: Puede no ser reconocible como menú
- **Sugerencia**: Usar icono "more-vert" más estándar o agregar label "Más opciones"

**5. Ley de Hick (Decisiones)**
- **Problema**: Menú "..." tiene 3 opciones pero no están claramente separadas
- **Impacto**: Puede ser difícil elegir rápidamente
- **Sugerencia**: Separar visualmente opciones destructivas (Report, Delete) de opciones normales

---

## 🔍 FLUJO 2: BÚSQUEDA (Search → Resultados → Spot Detail)

### Pantalla: Search

#### ✅ Fortalezas
- **Heurística #1 (Visibilidad)**: Campo de búsqueda siempre visible
- **Heurística #6 (Reconocimiento)**: Sugerencias mientras escribe
- **Ley de Proximidad**: Resultados agrupados por tipo (Spots, Paths)
- **Heurística #3 (Control)**: Botón "+" para crear si no encuentra

#### ⚠️ Áreas de Oportunidad

**1. Visibilidad del Estado (Heurística #1)**
- **Problema**: No hay indicador de que está buscando
- **Impacto**: Usuario no sabe si la búsqueda está procesando
- **Sugerencia**: Mostrar ActivityIndicator o skeleton mientras busca

**2. Prevención de Errores (Heurística #5)**
- **Problema**: No hay validación de búsqueda vacía o muy corta
- **Impacto**: Puede mostrar resultados irrelevantes
- **Sugerencia**: 
  - Requerir mínimo 2 caracteres antes de buscar
  - Mostrar mensaje: "Escribe al menos 2 caracteres"

**3. Reconocimiento vs Recuerdo (Heurística #6)**
- **Problema**: Las categorías (chips) solo aparecen después de buscar
- **Impacto**: Usuario no sabe que puede filtrar por categoría
- **Sugerencia**: 
  - Mostrar categorías principales siempre visibles
  - O agregar botón "Filtrar por categoría" visible

**4. Ley de Miller (7±2)**
- **Problema**: Puede haber muchas categorías en chips
- **Impacto**: Sobrecarga de opciones
- **Sugerencia**: Mostrar solo categorías más relevantes, resto en "Ver más"

**5. Ayuda a Recuperarse de Errores (Heurística #9)**
- **Problema**: "No results found" no sugiere acciones
- **Impacto**: Usuario se queda sin opciones
- **Sugerencia**: 
  - Agregar: "Intenta con otros términos" o "Crea un nuevo spot"
  - Mostrar sugerencias de búsquedas populares

---

## 🔍 FLUJO 3: CREACIÓN DE SPOT (Map → Create Spot)

### Pantalla: Create Spot

#### ✅ Fortalezas
- **Heurística #3 (Control)**: Botón de cancelar siempre visible
- **Heurística #5 (Prevención)**: Valida que haya foto antes de enviar
- **Ley de Proximidad**: Campos relacionados están agrupados
- **Heurística #1 (Visibilidad)**: Mapa muestra ubicación seleccionada

#### ⚠️ Áreas de Oportunidad

**1. Visibilidad del Estado (Heurística #1)**
- **Problema**: No hay indicador de progreso del formulario (cuántos campos faltan)
- **Impacto**: Usuario no sabe qué tan completo está el spot
- **Sugerencia**: 
  - Agregar indicador: "3 de 5 campos completados"
  - O marcar campos requeridos vs opcionales claramente

**2. Prevención de Errores (Heurística #5)**
- **Problema**: Validación solo al final (botón Send)
- **Impacto**: Usuario completa todo y luego descubre que falta algo
- **Sugerencia**: 
  - Validar en tiempo real
  - Deshabilitar "Send" hasta que campos requeridos estén completos
  - Mostrar mensajes de error inline

**3. Reconocimiento vs Recuerdo (Heurística #6)**
- **Problema**: Selector de tipo de spot (chips) no muestra todos los tipos claramente
- **Impacto**: Usuario puede no encontrar el tipo correcto
- **Sugerencia**: 
  - Mostrar todos los tipos en grid o lista
  - Agregar búsqueda de tipo si hay muchos

**4. Ayuda y Documentación (Heurística #10)**
- **Problema**: Campo "Generate with AI" no explica qué campos llenará
- **Impacto**: Usuario no sabe qué esperar
- **Sugerencia**: 
  - Tooltip: "Generará nombre, descripción, contexto cultural y tips de visita"
  - O mostrar preview antes de generar

**5. Control y Libertad (Heurística #3)**
- **Problema**: No hay forma de guardar borrador
- **Impacto**: Usuario pierde trabajo si sale accidentalmente
- **Sugerencia**: 
  - Auto-guardar borrador
  - O agregar botón "Guardar borrador"

**6. Ley de Fitts**
- **Problema**: Botón "Send" está al final del scroll, puede ser difícil alcanzar
- **Impacto**: Fricción para completar acción
- **Sugerencia**: 
  - Hacer botón sticky al final
  - O duplicar botón en header

**7. Correspondencia con Mundo Real (Heurística #2)**
- **Problema**: Campo "Cultural Context" puede no ser claro para todos
- **Impacto**: Usuario no sabe qué escribir
- **Sugerencia**: 
  - Agregar placeholder: "¿Qué hace especial este lugar?"
  - O ejemplo: "Ej: Templo histórico del siglo XVI..."

---

## 🔍 FLUJO 4: FLOW (Flow Detail → Start Flow → Flow Screen)

### Pantalla: Flow Detail

#### ✅ Fortalezas
- **Heurística #1 (Visibilidad)**: Imagen de portada con rotación muestra contenido
- **Ley de Punto Focal**: Botón "Start Flow" destacado
- **Heurística #6 (Reconocimiento)**: Lista de spots muestra orden claramente
- **Ley de Proximidad**: Métricas agrupadas (duración, distancia, spots)

#### ⚠️ Áreas de Oportunidad

**1. Prevención de Errores (Heurística #5)**
- **Problema**: "Start Flow" no valida si hay ubicación del usuario
- **Impacto**: Flow puede no funcionar correctamente sin ubicación
- **Sugerencia**: 
  - Validar ubicación antes de iniciar
  - Mostrar mensaje: "Activa ubicación para mejor experiencia"

**2. Visibilidad del Estado (Heurística #1)**
- **Problema**: No hay indicador de que el flow está guardado (botón save)
- **Impacto**: Usuario no sabe si ya guardó el flow
- **Sugerencia**: 
  - Cambiar color del icono cuando está guardado
  - O mostrar badge "Guardado"

**3. Ayuda y Documentación (Heurística #10)**
- **Problema**: "Start Flow" no explica qué pasará
- **Impacto**: Usuario puede no entender qué es un Flow
- **Sugerencia**: 
  - Agregar texto: "Inicia navegación guiada con narraciones"
  - O tooltip explicativo

**4. Control y Libertad (Heurística #3)**
- **Problema**: No hay forma de reordenar spots antes de iniciar
- **Impacto**: Usuario debe aceptar orden sugerido
- **Sugerencia**: 
  - Agregar modo "Editar orden" antes de iniciar
  - O permitir reordenar en Flow Screen (drag and drop - ya planificado)

### Pantalla: Flow Screen (Activo)

#### ✅ Fortalezas
- **Heurística #1 (Visibilidad)**: Header "NOW MOVING" indica estado claramente
- **Heurística #3 (Control)**: Botones minimizar y cerrar siempre visibles
- **Ley de Fitts**: Controles grandes y accesibles
- **Heurística #6 (Reconocimiento)**: Segmented control List/Map claro

#### ⚠️ Áreas de Oportunidad

**1. Visibilidad del Estado (Heurística #1)**
- **Problema**: Progreso (porcentaje) puede no ser claro para todos
- **Impacto**: Usuario no entiende qué significa "45%"
- **Sugerencia**: 
  - Agregar: "Spot 3 de 7" además del porcentaje
  - O mostrar timeline visual más clara

**2. Prevención de Errores (Heurística #5)**
- **Problema**: Diálogo de guardar al cerrar aparece siempre, incluso si ya está guardado
- **Impacto**: Fricción innecesaria
- **Sugerencia**: 
  - Solo mostrar diálogo si no está guardado
  - O preguntar: "¿Guardar cambios?" solo si hubo cambios

**3. Ayuda a Recuperarse (Heurística #9)**
- **Problema**: Si narration falla, no hay mensaje claro
- **Impacto**: Usuario no sabe por qué no hay audio
- **Sugerencia**: 
  - Mostrar icono de mute si narration está deshabilitada
  - O mensaje: "Narration pausada" si hay error

**4. Ley de Miller (7±2)**
- **Problema**: Lista "UP NEXT" puede tener muchos spots
- **Impacto**: Sobrecarga visual
- **Sugerencia**: 
  - Limitar a 3-5 próximos spots visibles
  - O colapsar lista con "Ver todos"

**5. Flexibilidad y Eficiencia (Heurística #7)**
- **Problema**: No hay atajos para saltar a un spot específico
- **Impacto**: Usuario debe navegar secuencialmente
- **Sugerencia**: 
  - Permitir tocar spots en lista "UP NEXT" para saltar
  - O agregar "Ir a spot X" en menú

---

## 🔍 FLUJO 5: AUTENTICACIÓN (Login/Signup)

### Pantalla: Login

#### ✅ Fortalezas
- **Heurística #4 (Consistencia)**: Formulario estándar (email, password)
- **Heurística #3 (Control)**: Link a Signup visible
- **Ley de Fitts**: Botones tienen tamaño adecuado
- **Heurística #5 (Prevención)**: Valida campos vacíos

#### ⚠️ Áreas de Oportunidad

**1. Visibilidad del Estado (Heurística #1)**
- **Problema**: No hay indicador claro de que está procesando login
- **Impacto**: Usuario puede tocar múltiples veces
- **Sugerencia**: 
  - Deshabilitar botón durante login
  - Mostrar ActivityIndicator en botón
  - Cambiar texto: "Iniciando sesión..."

**2. Ayuda a Recuperarse (Heurística #9)**
- **Problema**: Mensajes de error genéricos ("Failed to sign in")
- **Impacto**: Usuario no sabe cómo corregir
- **Sugerencia**: 
  - Mensajes específicos: "Email o contraseña incorrectos"
  - O "No hay cuenta con este email. ¿Crear cuenta?"

**3. Reconocimiento vs Recuerdo (Heurística #6)**
- **Problema**: No hay opción "Olvidé mi contraseña"
- **Impacto**: Usuario bloqueado si olvida contraseña
- **Sugerencia**: 
  - Agregar link "¿Olvidaste tu contraseña?"
  - Integrar con resetPassword del AuthContext

**4. Prevención de Errores (Heurística #5)**
- **Problema**: No valida formato de email antes de enviar
- **Impacto**: Error solo después de intentar login
- **Sugerencia**: 
  - Validar formato de email en tiempo real
  - Mostrar mensaje: "Formato de email inválido"

**5. Correspondencia con Mundo Real (Heurística #2)**
- **Problema**: Placeholder "Email" puede no ser claro en todos los idiomas
- **Impacto**: Confusión para usuarios no angloparlantes
- **Sugerencia**: 
  - Placeholder más descriptivo: "tu@email.com"
  - O agregar icono de email

### Pantalla: Signup

#### ⚠️ Áreas de Oportunidad (Similares a Login)

**1. Prevención de Errores (Heurística #5)**
- **Problema**: No valida fortaleza de contraseña
- **Impacto**: Usuario puede crear contraseña débil
- **Sugerencia**: 
  - Validar: mínimo 8 caracteres
  - Mostrar indicador de fortaleza
  - Mensaje: "La contraseña debe tener al menos 8 caracteres"

**2. Visibilidad del Estado (Heurística #1)**
- **Problema**: No hay confirmación de que cuenta se creó
- **Impacto**: Usuario no sabe si el registro fue exitoso
- **Sugerencia**: 
  - Mostrar mensaje: "¡Cuenta creada! Redirigiendo..."
  - O pantalla de bienvenida breve

**3. Ayuda y Documentación (Heurística #10)**
- **Problema**: No explica qué pasa después de registrarse
- **Impacto**: Usuario no sabe qué esperar
- **Sugerencia**: 
  - Agregar texto: "Crea tu cuenta para guardar spots y flows"
  - O mostrar beneficios brevemente

---

## 🔍 FLUJO 6: GUARDADO (Spot Detail → Save/Like)

### Pantalla: Spot Detail (Acciones)

#### ✅ Fortalezas
- **Heurística #6 (Reconocimiento)**: Iconos claros (bookmark, like)
- **Ley de Fitts**: Botones accesibles en header
- **Heurística #3 (Control)**: Acciones siempre visibles

#### ⚠️ Áreas de Oportunidad

**1. Visibilidad del Estado (Heurística #1) - CRÍTICO**
- **Problema**: No hay feedback visual inmediato al guardar/like
- **Impacto**: Usuario no sabe si la acción funcionó
- **Sugerencia**: 
  - Cambiar color del icono inmediatamente (tint cuando está guardado/liked)
  - Agregar animación sutil (scale 0.9 → 1.0)
  - Mostrar toast discreto: "Guardado" (opcional, puede ser muy discreto)

**2. Consistencia (Heurística #4)**
- **Problema**: Diferencia entre "Save" (bookmark) y "Like" no está clara
- **Impacto**: Usuario puede no entender la diferencia
- **Sugerencia**: 
  - Agregar tooltips: "Guardar" vs "Me gusta"
  - O unificar en una sola acción con estados

**3. Reconocimiento vs Recuerdo (Heurística #6)**
- **Problema**: No hay forma de ver qué spots están guardados desde Spot Detail
- **Impacto**: Usuario debe ir a Saved para verificar
- **Sugerencia**: 
  - El icono ya cambia de color (implementar sugerencia #1)
  - O agregar badge "Guardado" en la card

---

## 📊 RESUMEN DE HALLAZGOS

### Problemas Críticos (Alta Prioridad)

1. **Feedback Visual en Acciones** (Spot Detail, Flow Detail)
   - **Impacto**: Usuario no sabe si acciones funcionaron
   - **Frecuencia**: Alta (cada vez que guarda/like)
   - **Solución**: Cambiar color de iconos + animación sutil

2. **Validación de Ubicación** (Spot Detail, Flow Detail)
   - **Impacto**: Funcionalidad puede fallar silenciosamente
   - **Frecuencia**: Media (cuando no hay permisos)
   - **Solución**: Validar y deshabilitar botones o mostrar mensaje claro

3. **Estados de Carga** (Home, Search)
   - **Impacto**: Usuario no sabe si está cargando o no hay datos
   - **Frecuencia**: Alta (cada carga de pantalla)
   - **Solución**: Skeleton loaders o ActivityIndicator con mensaje

### Problemas Importantes (Media Prioridad)

4. **Mensajes de Error** (Login, Create Spot)
   - **Impacto**: Usuario no sabe cómo corregir errores
   - **Solución**: Mensajes específicos y accionables

5. **Validación en Tiempo Real** (Create Spot)
   - **Impacto**: Usuario completa todo y luego descubre errores
   - **Solución**: Validar mientras escribe, deshabilitar botón hasta válido

6. **Indicadores de Scroll** (Home)
   - **Impacto**: Usuario no sabe que puede hacer scroll horizontal
   - **Solución**: Gradientes sutiles o mostrar parcialmente siguiente card

### Mejoras Sugeridas (Baja Prioridad)

7. **Pull-to-Refresh** (Home)
8. **Guardar Borradores** (Create Spot)
9. **Reordenar Spots** (Flow Detail, Flow Screen)
10. **Olvidé Contraseña** (Login)

---

## 🎯 PLAN DE ACCIÓN SUGERIDO

### Fase 1: Críticos (Implementar Antes de Pruebas)
1. ✅ Feedback visual en acciones (Save/Like)
2. ✅ Validación de ubicación con mensajes claros
3. ✅ Estados de carga con skeleton loaders

### Fase 2: Importantes (Implementar Durante QA)
4. ✅ Mensajes de error específicos
5. ✅ Validación en tiempo real (Create Spot)
6. ✅ Indicadores de scroll (Home)

### Fase 3: Mejoras (Post Pruebas Internas)
7. ⚠️ Pull-to-refresh
8. ⚠️ Guardar borradores
9. ⚠️ Reordenar spots
10. ⚠️ Olvidé contraseña

---

## 📝 NOTAS ADICIONALES

### Principios FLOWYA Aplicados
- ✅ "La interfaz nunca debe competir con el lugar" - Se cumple bien
- ✅ Diseño minimalista - Se cumple bien
- ✅ Controles grandes y accesibles - Se cumple (≥48px)
- ⚠️ Feedback visual - Necesita mejora (ver críticos)

### Compatibilidad Web
- ✅ Todas las interacciones funcionan con tap (no dependen de hover)
- ✅ Áreas táctiles adecuadas para móvil
- ⚠️ Algunos estados de carga pueden mejorar para web

---

**Próximo Paso**: Revisar y aprobar sugerencias, luego implementar Fase 1 (Críticos)

