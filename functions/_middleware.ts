/**
 * OG 注入中间件 —— 分享卡片按会议间换品牌
 *
 * 爬虫不执行 JS，主题切换救不了分享卡片：Faith 用户把链接转进微信群，
 * 卡片上不该出现「草诀歌」。换肤是每台设备自己的事，分享卡片是发链接
 * 那个人的门面，只能在服务端按 ?room= 注入。
 *
 * 规则：
 *   - 主会议间（含改名前的旧别名）→ 草诀歌 AI Labs 品牌卡片
 *   - Faith 主会议间 → Faith 白标卡片
 *   - 其余任何房间 → 中性卡片：只有房间名，不带任何品牌——
 *     谁另开一间，谁的链接就是谁自己的门面
 *
 * 只对爬虫 UA 用 HTMLRewriter 改写静态页的四个标签（title /
 * description / og:title / og:description），普通浏览器零开销。
 */

const FAITH_MAIN_ROOM = "Faith 会议室";
const DEFAULT_ROOM = "草诀歌 AI Labs";
const LEGACY_ROOM_NAMES = ["共创会", "草诀歌AI Labs"];

interface OgCard {
  title: string;
  description: string;
}

const CLASSIC_CARD: OgCard = {
  title: "草诀歌 AI Labs 会议白板",
  description: "以产品为笔，和世界对话。开一个链接，所有人一起写。",
};

const FAITH_CARD: OgCard = {
  title: "Faith 会议室 · 会议白板",
  description: "开一个链接，所有人一起写。提问、投票与回应，落在同一张纸面上。",
};

function cardForRoom(room: string | null): OgCard {
  if (!room) return CLASSIC_CARD;
  if (room === FAITH_MAIN_ROOM) return FAITH_CARD;
  if (room === DEFAULT_ROOM || LEGACY_ROOM_NAMES.includes(room)) {
    return CLASSIC_CARD;
  }
  return {
    title: `${room} · 会议白板`,
    description:
      "实时协同提问、投票与回应的会议收集场。开一个链接，所有人一起写。",
  };
}

/** 微信 / QQ / 推特 / FB / Slack / 飞书 / 钉钉 / Telegram / WhatsApp 等取卡爬虫 */
const CRAWLER_UA =
  /MicroMessenger|MQQBrowser|QQ\/|WeChat|facebookexternalhit|Twitterbot|Slackbot|TelegramBot|WhatsApp|DingTalk|Lark|Feishu|LinkedInBot|Discordbot|Pinterest|vkShare|Line\//i;

interface PagesContext {
  request: Request;
  next: () => Promise<Response>;
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, next } = context;

  if (request.method !== "GET" && request.method !== "HEAD") {
    return next();
  }

  const ua = request.headers.get("user-agent") || "";
  if (!CRAWLER_UA.test(ua)) {
    return next(); // 普通浏览器：静态页原样发出，OG 与它无关
  }

  const response = await next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  const room = new URL(request.url).searchParams.get("room");
  const card = cardForRoom(room);

  return new HTMLRewriter()
    .on("title", {
      element(el) {
        el.setInnerContent(card.title);
      },
    })
    .on('meta[name="description"]', {
      element(el) {
        el.setAttribute("content", card.description);
      },
    })
    .on('meta[property="og:title"]', {
      element(el) {
        el.setAttribute("content", card.title);
      },
    })
    .on('meta[property="og:description"]', {
      element(el) {
        el.setAttribute("content", card.description);
      },
    })
    .transform(response);
}
