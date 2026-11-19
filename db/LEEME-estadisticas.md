# Estadísticas de escucha — puesta en marcha (una sola vez)

1. **Base de datos (D1):** Cloudflare → Storage & Databases → D1 → *Create database* → nombre `frigidaire-listens`.
   En su pestaña **Console** pega y ejecuta primero `db/schema.sql` y luego `db/seed-tracks.sql` (lista de temas por disco).
2. **Conectarla al sitio:** Workers & Pages → proyecto del sitio → Settings → Bindings → *Add* → D1 database → nombre de variable `LISTEN_DB` → elige `frigidaire-listens`.
3. **Variables del proyecto** (Settings → Variables and secrets): `ADMIN_KEY` (ya existe), `RESEND_API_KEY` (ya existe) y nueva `REPORT_EMAIL` = tu correo. Opcional `FROM_EMAIL` si el remitente de Resend es otro.
4. **Subir el sitio** de nuevo (Direct Upload) con la carpeta completa — incluye `functions/`.
5. **Worker de reportes:** Workers & Pages → Create → Worker `frigidaire-reportes` → pega `report-cron/worker.js` → Settings → Variables: `SITE_URL` = `https://frigidairetango.com`, `ADMIN_KEY` (secret, el mismo) → Settings → Triggers → *Cron* → `0 7 1,16 * *` (días 1 y 16 a las 07:00 UTC).
   - Día 16: reporte quincenal (1–15). Día 1: quincenal (16–fin de mes) + mensual.

Ver el reporte cuando quieras (navegador): `https://frigidairetango.com/api/listen-report?key=TU_ADMIN_KEY&type=biweekly`
(otros: `type=monthly`, `type=custom&from=2026-11-01&to=2026-11-20`, `&format=json`, `&send=1` para que lo mande por email ahora).

Si ya creaste la tabla `plays` antes de esta versión, añade el país con (consola D1): `ALTER TABLE plays ADD COLUMN country TEXT;`
