/**
 * TOEFL Typing Studio —— AI 代理 (Cloudflare Worker)
 *
 * 作用：把网页发来的请求转发给 Anthropic API，并在服务器端附上你的 API key，
 *      这样公开部署的网页就能用 AI 功能，而 key 不会暴露在前端。
 *
 * 部署步骤见 README.md 的「让公开版也能用 AI」一节。
 *
 * 需要设置一个环境变量（Secret）：
 *   ANTHROPIC_API_KEY = 你的 Anthropic API key
 *
 * 可选环境变量：
 *   ALLOW_ORIGIN = 允许的网站来源，例如 https://yourname.github.io
 *                  （不设置则默认 * ，任何来源都可调用——建议设成你的站点）
 */

export default {
  async fetch(request, env) {
    const origin = env.ALLOW_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // 预检请求
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }
    if (request.method !== "POST") {
      return new Response("Use POST", { status: 405, headers: cors });
    }
    if (!env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Server missing ANTHROPIC_API_KEY" }),
        { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Bad JSON" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // 转发给 Anthropic，附上 key 与 version 头
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: body.model || "claude-sonnet-4-20250514",
        max_tokens: body.max_tokens || 1200,
        messages: body.messages || [],
      }),
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  },
};
