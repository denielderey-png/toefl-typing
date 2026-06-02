/**
 * TOEFL Typing Studio —— 每日新闻后端 (Cloudflare Worker)
 *
 * 抓取 BBC 官方 RSS 订阅源，清洗成适合打字练习的英文段落返回前端。
 *   GET /?feed=news   → 返回该分类的当日新闻（标题 + 摘要）
 * 支持的 feed: news（头条）, world, technology, science, business
 *
 * 部署步骤见 README.md 的「开启每日新闻」一节。
 *
 * 版权说明：仅使用 BBC 公开 RSS 提供的「标题 + 简介摘要」（本就供转载/聚合用），
 *          不抓取文章全文。请遵守来源方的使用条款，仅作个人学习用途。
 */

const FEEDS = {
  news:       "https://feeds.bbci.co.uk/news/rss.xml",
  world:      "https://feeds.bbci.co.uk/news/world/rss.xml",
  technology: "https://feeds.bbci.co.uk/news/technology/rss.xml",
  science:    "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
  business:   "https://feeds.bbci.co.uk/news/business/rss.xml",
};

function clean(s) {
  return String(s || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function field(block, tag) {
  const m = new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)<\\/" + tag + ">").exec(block);
  return m ? m[1] : "";
}

export default {
  async fetch(request, env) {
    const origin = env.ALLOW_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), {
        status,
        headers: { ...cors, "Content-Type": "application/json" },
      });

    const url = new URL(request.url);
    const feedUrl = FEEDS[url.searchParams.get("feed")] || FEEDS.news;

    let xml;
    try {
      const r = await fetch(feedUrl, {
        headers: { "User-Agent": "toefl-typing-news/1.0" },
        cf: { cacheTtl: 900, cacheEverything: true }, // 缓存 15 分钟，减轻来源压力
      });
      if (!r.ok) throw new Error("upstream " + r.status);
      xml = await r.text();
    } catch (e) {
      return json({ error: String((e && e.message) || e) }, 502);
    }

    const items = [];
    const re = /<item>([\s\S]*?)<\/item>/g;
    let m;
    while ((m = re.exec(xml)) !== null && items.length < 20) {
      const block = m[1];
      const title = clean(field(block, "title"));
      const desc = clean(field(block, "description"));
      const link = clean(field(block, "link"));
      if (!title) continue;
      // 组合成一段适合打字的英文：标题在前，摘要在后
      let text = title;
      if (desc && desc.toLowerCase() !== title.toLowerCase()) {
        text = title.replace(/[.!?]?$/, ".") + " " + desc;
      }
      items.push({ title, text, link });
    }

    return json({ source: "BBC", feed: url.searchParams.get("feed") || "news", items });
  },
};
