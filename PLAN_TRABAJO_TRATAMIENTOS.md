# Plan de Trabajo - Sistema de Tratamientos

Este documento describe el plan completo para implementar el sistema de tratamientos en STL Labs Backend.

## Estado Actual

✅ **Completado:**
- Módulo `treatment-categories` (Categorías de Tratamientos)
- Modelos de Prisma: `Treatment`, `TreatmentStep`, `TreatmentCatalog`, `PaymentPlan`, `PaymentInstallment`
- Método básico `getTreatments` en `PatientsService`

❌ **Pendiente:**
- Módulo completo de `Treatments` (Tratamientos)
- Módulo de `TreatmentCatalog` (Catálogo de Tratamientos)
- Módulo de `TreatmentSteps` (Pasos de Tratamiento)
- Módulo de `PaymentPlans` (Planes de Pago)
- Integración con módulos existentes

---

## Fase 1: Módulo TreatmentCatalog (Catálogo de Tratamientos)

### Objetivo
Implementar CRUD completo para el catálogo de tratamientos disponibles en el sistema.

### Archivos a crear:

1. **`src/features/treatment-catalog/treatment-catalog.module.ts`**
   - Módulo NestJS con controller y service

2. **`src/features/treatment-catalog/treatment-catalog.service.ts`**
   - `create()` - Crear tratamiento en catálogo
   - `findAll()` - Listar con paginación y filtros
   - `findOne()` - Obtener por ID
   - `update()` - Actualizar tratamiento
   - `remove()` - Eliminar (soft delete)
   - `getStatistics()` - Estadísticas del catálogo

3. **`src/features/treatment-catalog/treatment-catalog.controller.ts`**
   - Endpoints REST con Swagger
   - GET `/treatment-catalog` - Listar
   - GET `/treatment-catalog/statistics` - Estadísticas
   - GET `/treatment-catalog/:id` - Obtener uno
   - POST `/treatment-catalog` - Crear
   - PATCH `/treatment-catalog/:id` - Actualizar
   - DELETE `/treatment-catalog/:id` - Eliminar

4. **DTOs (`src/features/treatment-catalog/dto/`):**
   - `create-treatment-catalog.dto.ts`
   - `update-treatment-catalog.dto.ts`
   - `treatment-catalog-query.dto.ts`
   - `treatment-catalog-response.dto.ts`
   - `paginated-treatment-catalog-response.dto.ts`
   - `treatment-catalog-statistics-response.dto.ts`
   - `index.ts`

### Funcionalidades:
- ✅ CRUD completo
- ✅ Búsqueda por nombre, código, categoría
- ✅ Filtros: `isActive`, `categoryId`, `requiresAnesthesia`
- ✅ Paginación
- ✅ Estadísticas (total, activos, por categoría)
- ✅ Validación de código único

---

## Fase 2: Módulo Treatments (Tratamientos)

### Objetivo
Implementar gestión completa de tratamientos de pacientes.

### Archivos a crear:

1. **`src/features/treatments/treatments.module.ts`**
   - Importar `TreatmentCategoriesModule` y `TreatmentCatalogModule`
   - Módulo NestJS con controller y service

2. **`src/features/treatments/treatments.service.ts`**
   - `create()` - Crear tratamiento para paciente
   - `findAll()` - Listar con filtros avanzados
   - `findOne()` - Obtener tratamiento con relaciones
   - `update()` - Actualizar tratamiento
   - `remove()` - Eliminar (soft delete)
   - `changeStatus()` - Cambiar estado del tratamiento
   - `getStatistics()` - Estadísticas de tratamientos
   - `calculateTotalPrice()` - Calcular precio total
   - `updatePaymentStatus()` - Actualizar estado de pago
   - `addStep()` - Agregar paso al tratamiento
   - `removeStep()` - Eliminar paso del tratamiento
   - `linkAppointment()` - Vincular cita al tratamiento

3. **`src/features/treatments/treatments.controller.ts`**
   - GET `/treatments` - Listar con filtros
   - GET `/treatments/statistics` - Estadísticas
   - GET `/treatments/:id` - Obtener uno
   - GET `/treatments/:id/steps` - Obtener pasos
   - GET `/treatments/:id/appointments` - Obtener citas vinculadas
   - POST `/treatments` - Crear
   - PATCH `/treatments/:id` - Actualizar
   - PATCH `/treatments/:id/status` - Cambiar estado
   - PATCH `/treatments/:id/payment` - Actualizar pago
   - DELETE `/treatments/:id` - Eliminar

4. **DTOs (`src/features/treatments/dto/`):**
   - `create-treatment.dto.ts`
   - `update-treatment.dto.ts`
   - `treatment-query.dto.ts`
   - `treatment-response.dto.ts`
   - `paginated-treatment-response.dto.ts`
   - `change-treatment-status.dto.ts`
   - `update-treatment-payment.dto.ts`
   - `treatment-statistics-response.dto.ts`
   - `treatment-statistics-query.dto.ts`
   - `index.ts`

### Funcionalidades:
- ✅ CRUD completo
- ✅ Filtros: `patientId`, `doctorId`, `branchId`, `status`, `isPaid`, fechas
- ✅ Búsqueda por nombre, código, diagnóstico
- ✅ Cálculo automático de precio total basado en pasos
- ✅ Actualización automática de `totalSteps` y `completedSteps`
- ✅ Gestión de estados (PENDING, CONFIRMED, COMPLETED, CANCELED)
- ✅ Vinculación con citas
- ✅ Estadísticas avanzadas
- ✅ Validaciones: paciente existe, doctor existe, branch existe

---

## Fase 3: Módulo TreatmentSteps (Pasos de Tratamiento)

### Objetivo
Implementar gestión de pasos individuales dentro de un tratamiento.

### Archivos a crear:

1. **`src/features/treatment-steps/treatment-steps.module.ts`**
   - Importar `TreatmentsModule` y `TreatmentCatalogModule`
   - Módulo NestJS con controller y service

2. **`src/features/treatment-steps/treatment-steps.service.ts`**
   - `create()` - Crear paso de tratamiento
   - `findAll()` - Listar pasos (con filtro de tratamiento)
   - `findOne()` - Obtener paso por ID
   - `update()` - Actualizar paso
   - `remove()` - Eliminar paso
   - `changeStatus()` - Cambiar estado del paso
   - `reorder()` - Reordenar pasos
   - `complete()` - Marcar paso como completado
   - `updatePaymentStatus()` - Actualizar estado de pago

3. **`src/features/treatment-steps/treatment-steps.controller.ts`**
   - GET `/treatment-steps` - Listar (filtro por treatmentId)
   - GET `/treatment-steps/:id` - Obtener uno
   - POST `/treatment-steps` - Crear
   - PATCH `/treatment-steps/:id` - Actualizar
   - PATCH `/treatment-steps/:id/status` - Cambiar estado
   - PATCH `/treatment-steps/:id/complete` - Completar paso
   - PATCH `/treatment-steps/:id/reorder` - Reordenar
   - DELETE `/treatment-steps/:id` - Eliminar

4. **DTOs (`src/features/treatment-steps/dto/`):**
   - `create-treatment-step.dto.ts`
   - `update-treatment-step.dto.ts`
   - `treatment-step-query.dto.ts`
   - `treatment-step-response.dto.ts`
   - `paginated-treatment-step-response.dto.ts`
   - `change-treatment-step-status.dto.ts`
   - `reorder-treatment-steps.dto.ts`
   - `index.ts`

### Funcionalidades:
- ✅ CRUD completo
- ✅ Filtros: `treatmentId`, `status`, `doctorId`, `isPaid`
- ✅ Reordenamiento de pasos (campo `order`)
- ✅ Actualización automática de `completedSteps` en tratamiento padre
- ✅ Cálculo automático de precio total del tratamiento
- ✅ Validación de tratamiento padre existe
- ✅ Validación de catálogo de tratamiento (si aplica)

---

## Fase 4: Módulo PaymentPlans (Planes de Pago)

### Objetivo
Implementar gestión de planes de pago para tratamientos.

### Archivos a crear:

1. **`src/features/payment-plans/payment-plans.module.ts`**
   - Importar `TreatmentsModule`
   - Módulo NestJS con controller y service

2. **`src/features/payment-plans/payment-plans.service.ts`**
   - `create()` - Crear plan de pago
   - `findAll()` - Listar planes (filtro por treatmentId)
   - `findOne()` - Obtener plan con cuotas
   - `update()` - Actualizar plan
   - `remove()` - Eliminar plan
   - `generateInstallments()` - Generar cuotas automáticamente
   - `markInstallmentPaid()` - Marcar cuota como pagada
   - `getPaymentSummary()` - Resumen de pagos

3. **`src/features/payment-plans/payment-plans.controller.ts`**
   - GET `/payment-plans` - Listar (filtro por treatmentId)
   - GET `/payment-plans/:id` - Obtener uno con cuotas
   - GET `/payment-plans/:id/summary` - Resumen de pagos
   - POST `/payment-plans` - Crear plan
   - PATCH `/payment-plans/:id` - Actualizar plan
   - PATCH `/payment-plans/:id/installments/:installmentId/pay` - Pagar cuota
   - DELETE `/payment-plans/:id` - Eliminar plan

4. **DTOs (`src/features/payment-plans/dto/`):**
   - `create-payment-plan.dto.ts`
   - `update-payment-plan.dto.ts`
   - `payment-plan-query.dto.ts`
   - `payment-plan-response.dto.ts`
   - `payment-installment-response.dto.ts`
   - `payment-summary-response.dto.ts`
   - `pay-installment.dto.ts`
   - `index.ts`

### Funcionalidades:
- ✅ CRUD completo
- ✅ Generación automática de cuotas
- ✅ Cálculo de monto de cuota
- ✅ Seguimiento de pagos
- ✅ Validación de tratamiento existe
- ✅ Validación de fechas de vencimiento
- ✅ Resumen de pagos pendientes/completados

---

## Fase 5: Integración y Mejoras

### Tareas:

1. **Actualizar `app.module.ts`**
   - Importar todos los nuevos módulos
   - Verificar dependencias entre módulos

2. **Actualizar `TreatmentCategoriesModule`**
   - Asegurar que exporta el servicio si es necesario

3. **Actualizar `PatientsService`**
   - Mejorar método `getTreatments()` para usar el nuevo servicio
   - O eliminar si se usa el módulo de treatments directamente

4. **Actualizar `AppointmentsService`**
   - Integrar con tratamientos al crear/actualizar citas
   - Método para vincular cita a tratamiento

5. **Validaciones cruzadas:**
   - Validar que al crear tratamiento, el paciente existe
   - Validar que al crear paso, el tratamiento existe
   - Validar que al crear plan de pago, el tratamiento existe
   - Validar que al eliminar tratamiento, no tenga pasos activos
   - Validar que al eliminar tratamiento, no tenga planes de pago activos

6. **Hooks y eventos:**
   - Actualizar `totalSteps` y `completedSteps` automáticamente
   - Actualizar precio total del tratamiento al agregar/eliminar pasos
   - Actualizar estado de pago del tratamiento basado en pasos/planes

---

## Orden de Implementación Recomendado

1. **Fase 1: TreatmentCatalog** (Base para crear pasos)
2. **Fase 2: Treatments** (Módulo principal)
3. **Fase 3: TreatmentSteps** (Depende de Treatments)
4. **Fase 4: PaymentPlans** (Depende de Treatments)
5. **Fase 5: Integración** (Conectar todo)

---

## Consideraciones Técnicas

### Validaciones importantes:
- Código único en `TreatmentCatalog`
- Relaciones válidas (patient, doctor, branch existen)
- Estados válidos según enum
- Precios no negativos
- Fechas válidas (startDate < endDate)
- Orden de pasos secuencial

### Transacciones:
- Crear tratamiento con pasos iniciales (transacción)
- Actualizar precio total del tratamiento (transacción)
- Marcar cuota como pagada y actualizar plan (transacción)

### Performance:
- Usar `include` selectivo en Prisma
- Paginación en todos los listados
- Índices en campos de búsqueda frecuente

### Documentación:
- Swagger completo en todos los endpoints
- Comentarios JSDoc en servicios
- Ejemplos en DTOs

---

## Notas Finales

- Seguir el patrón establecido en `appointments` y `patients`
- Usar DTOs para todas las operaciones
- Implementar manejo de errores consistente
- Usar decoradores de Swagger para documentación
- Mantener consistencia en nombres de endpoints (español/inglés según el proyecto)
- Considerar permisos/roles si aplica (futuro)

