/**
 * TOEFL Typing Studio —— 全球排行榜后端 (Cloudflare Worker + D1)
 *
 * 提供两个接口（同一个地址）：
 *   GET  /?mode=word&limit=20   → 返回该模式 WPM 前 N 名
 *   POST /  body:{name,mode,wpm,acc} → 提交一条成绩
 *
 * 部署步骤见 README.md 的「开启全球排行榜」一节。
 * 绑定一个 D1 数据库，变量名为 DB（在 wrangler.toml / 控制台里绑定）。
 *
 * 注意：这是一个轻量的休闲排行榜，分数由前端上报，无法防止伪造。
 *      仅供娱乐，请勿当作严肃竞赛成绩。
 */

const MODES = ["word", "passage"];

export default {
  async fetch(request, env) {
    const origin = env.ALLOW_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), {
        status,
        headers: { ...cors, "Content-Type": "application/json" },
      });

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (!env.DB) return json({ error: "D1 database (DB) not bound" }, 500);

    const url = new URL(request.url);

    // —— 读取排行榜 ——
    if (request.method === "GET") {
      const mode = MODES.includes(url.searchParams.get("mode"))
        ? url.searchParams.get("mode")
        : "word";
      let limit = parseInt(url.searchParams.get("limit") || "20", 10);
      if (!Number.isFinite(limit) || limit < 1) limit = 20;
      if (limit > 100) limit = 100;
      const { results } = await env.DB.prepare(
        "SELECT name, mode, wpm, acc, ts FROM scores WHERE mode = ? ORDER BY wpm DESC, ts ASC LIMIT ?"
      )
        .bind(mode, limit)
        .all();
      return json({ scores: results || [] });
    }

    // —— 提交成绩 ——
    if (request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch (e) {
        return json({ error: "Bad JSON" }, 400);
      }
      let name = String(body.name || "").trim().slice(0, 16);
      const mode = MODES.includes(body.mode) ? body.mode : null;
      let wpm = Math.round(Number(body.wpm));
      let acc = Math.round(Number(body.acc));
      if (!name) name = "匿名";
      if (!mode) return json({ error: "invalid mode" }, 400);
      if (!Number.isFinite(wpm) || wpm < 0 || wpm > 400) return json({ error: "invalid wpm" }, 400);
      if (!Number.isFinite(acc) || acc < 0 || acc > 100) return json({ error: "invalid acc" }, 400);

      await env.DB.prepare(
        "INSERT INTO scores (name, mode, wpm, acc, ts) VALUES (?, ?, ?, ?, ?)"
      )
        .bind(name, mode, wpm, acc, Date.now())
        .run();
      return json({ ok: true });
    }

    return json({ error: "method not allowed" }, 405);
  },
};
