// Cloudflare Worker (cron): day 16 -> biweekly report (1-15); day 1 -> biweekly (16-end) + monthly. Calls the site's report endpoint, which e-mails it.
export default {
  async scheduled(event, env, ctx) {
    const day = new Date(event.scheduledTime).getUTCDate();
    const types = day === 1 ? ['biweekly', 'monthly'] : ['biweekly'];
    for (const t of types) {
      const r = await fetch(env.SITE_URL + '/api/listen-report?send=1&type=' + t, { headers: { 'x-admin-key': env.ADMIN_KEY } });
      console.log(t, r.status, await r.text());
    }
  },
  async fetch() { return new Response('ok'); }
};
