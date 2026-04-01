# Control de Carriles

Aplicacion web tablet-first para control horario de carriles en dos piscinas, con panel operativo para staff y panel analitico para admin.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Neon Postgres
- Recharts para reportes
- Modo demo local con almacenamiento en `data/demo-db.json`

## Funcionalidades principales

- Login por roles `staff` y `admin`
- Panel staff con carga por bloque horario, piscina y carril
- Panel admin con supervision operativa y refresco automatico
- Reportes por hora, categoria, piscina y organizacion
- Configuracion de usuarios, organizaciones y parametros de piscina
- Compatibilidad demo sin Neon para probar la UI y el flujo completo

## Credenciales demo

- Staff: `staff@fdnda.org` / `staff123`
- Admin: `admin@fdnda.org` / `admin123`

## Variables de entorno

Copia `.env.example` y completa:

- `DATABASE_URL`

Si no defines `DATABASE_URL`, la app funciona en modo demo local usando `data/demo-db.json`.

Ejemplo rapido:

```bash
copy .env.example .env.local
```

## Puesta en marcha

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Neon

1. Crea un proyecto en Neon.
2. Ejecuta el SQL de `neon-schema.sql` en el SQL editor.
3. Define `DATABASE_URL` en `.env.local`.
4. O, desde terminal, ejecuta `npm run db:setup` para aplicar `neon-schema.sql` automaticamente.
5. Ejecuta `npm run db:bootstrap` para crear catalogos, usuarios demo y hashes de password en `public.profiles`.
6. Si quieres partir con la data demo, ejecuta `npm run db:bootstrap -- --include-assignments`.
7. Reinicia la app.

Notas:

- Esta app usa Neon solo como Postgres. El refresco live del panel corre por polling corto, no por Realtime estilo Supabase.
- El bootstrap genera hashes con `scrypt` antes de guardar usuarios en `profiles`.

## Despliegue

La ruta mas directa es Vercel:

1. Sube el proyecto a un repositorio Git.
2. Importa el repo en Vercel.
3. Configura `DATABASE_URL` en Production, Preview y Development.
4. Ejecuta `neon-schema.sql` en la base de datos del entorno productivo.
5. Si quieres dejar usuarios demo tambien en produccion, corre localmente `npm run db:bootstrap` apuntando a esa base.
6. Lanza el deploy.

Antes de desplegar, valida localmente:

```bash
npm run lint
npm run test
npm run build
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run test`
- `npm run lint`
- `npm run db:setup`
- `npm run db:bootstrap`

## Notas de implementacion

- El guardado staff trabaja por bloque horario completo para evitar estados parciales.
- `libre` no requiere organizacion; las demas categorias si.
- Cuando se usa Neon, el panel admin se refresca por polling corto.
