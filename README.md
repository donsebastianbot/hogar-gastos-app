# Hogar Gastos App

Aplicación web fullstack para gestión de finanzas domésticas, inspirada en control mensual por Excel.

## Stack

- **Frontend**: Next.js (App Router) + React + TypeScript + Tailwind
- **Backend**: API Routes de Next.js (Node runtime)
- **Base de datos**: SQLite
- **ORM**: Prisma
- **Gráficas**: Recharts

---

## Funcionalidades incluidas

### Dashboard principal
- Resumen del mes seleccionado con tarjetas:
  - Ingresos totales
  - Gastos totales
  - Otros gastos
  - Balance final
  - Total pendiente del mes
- Indicadores visuales de balance positivo/negativo
- Gráfica de reparto de gastos por categoría (fijos/variables/cuotas deuda)
- Gráfica de evolución mensual (balance + pendiente)

### Gestión mensual
- Selector de mes (enero a diciembre)
- Navegación mes anterior/siguiente
- Crear nuevo mes
- **Duplicar mes** (copia estructura al mes siguiente y resetea estados a pendiente)
- Persistencia en SQLite

### Deudas / préstamos
Cada deuda incluye:
- Nombre
- Importe inicial
- Importe pendiente
- Cuota mensual
- Estado del mes (Pendiente/Liquidado)
- Marcar cuota pagada

Regla de negocio implementada:
- Al marcar pagada (`false -> true`) descuenta automáticamente una cuota del pendiente
- Si se desmarca (`true -> false`) revierte una cuota (sin superar total inicial)

### Gastos fijos
- Nombre
- Importe mensual
- Estado (Liquidado/Pendiente)
- Toggle rápido de estado

### Otros gastos variables
- Nombre
- Importe
- Estado
- Categoría opcional
- Fecha opcional
- Filtros por estado/categoría y buscador

### Ingresos
- Varios ingresos por mes
- Fuente + importe
- Total mensual automático

### Cálculos automáticos
- Total ingresos
- Total gastos fijos
- Total otros gastos
- Total gastado
- Balance final
- Pendiente del mes
- Pendiente acumulado de deudas

### Control visual y UX
- Estado de pagos por color:
  - Verde = Liquidado
  - Amarillo = Pendiente
- Confirmación antes de borrar
- Responsive (móvil/escritorio)
- Modo oscuro/claro

### Exportaciones
- **CSV mensual** (API `GET /api/months/:id/export/csv`)
- **PDF** vía impresión del navegador

---

## Estructura del proyecto

```bash
hogar-gastos-app/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.mjs
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── lib/
│   └── types/
├── .env.example
└── README.md
```

---

## Modelo de datos

### Month
- `id`
- `year`
- `month`
- relaciones a ingresos/gastos/deudas

### Income
- `id`, `monthId`, `source`, `amount`

### FixedExpense
- `id`, `monthId`, `name`, `amount`, `status`

### VariableExpense
- `id`, `monthId`, `name`, `amount`, `status`, `category`, `date`

### Debt
- `id`, `monthId`, `name`, `initialTotal`, `remainingTotal`, `monthlyFee`, `status`, `isPaid`

---

## Instalación y ejecución

### 1) Instalar dependencias

```bash
npm install
```

### 2) Configurar entorno

```bash
cp .env.example .env
```

### 3) Migrar base de datos

```bash
npm run db:migrate
```

### 4) Cargar datos demo

```bash
npm run db:seed
```

### 5) Ejecutar en desarrollo

```bash
npm run dev
```

Abrir: `http://localhost:3000`

---

## Scripts útiles

```bash
npm run dev        # desarrollo
npm run build      # build producción
npm run start      # ejecutar build
npm run lint       # lint
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:reset
```

---

## Datos demo incluidos

Se crean varios meses con ejemplos reales de categorías solicitadas:

- Deudas: Préstamo 1, Préstamo 2, Coche, Abogados
- Gastos fijos: Alquiler, Luz/agua/gas, Comida, Vodafone
- Variables: Seguro coche, Parking, Bip Drive, Gasolina, Lavadora
- Ingresos múltiples por mes

Esto permite visualizar evolución de balance y reducción de deudas.

---

## Notas de mantenibilidad

- Reglas de negocio sensibles están comentadas en API de deudas (`PATCH /api/debts/[id]`).
- Cálculos centralizados en `src/lib/calc.ts`.
- Validación de payloads con Zod en `src/lib/validators.ts`.
- API desacoplada por recursos para facilitar futuras ampliaciones (usuarios, categorías configurables, backups, etc.).
