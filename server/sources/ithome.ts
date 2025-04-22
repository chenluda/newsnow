import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

const allNews = defineSource(async () => {
  const response: any = await myFetch("https://www.ithome.com/list/")
  const $ = cheerio.load(response)
  const $main = $("#list > div.fl > ul > li")
  const news: NewsItem[] = []
  $main.each((_, el) => {
    const $el = $(el)
    const $a = $el.find("a.t")
    const $a_c = $el.find("a.c")
    const classify = $a_c.text()
    const url = $a.attr("href")
    const title = $a.text()
    const date = $(el).find("i").text()
    if (url && title && date) {
      const isAd = url?.includes("lapin") || ["神券", "优惠", "补贴", "京东"].find(k => title.includes(k))
      if (!isAd) {
        news.push({
          url,
          title,
          id: url,
          pubDate: parseRelativeDate(date, "Asia/Shanghai").valueOf(),
          classify,
        })
      }
    }
  })
  return news.sort((m, n) => n.pubDate! > m.pubDate! ? 1 : -1)
})

const smartEraNews = defineSource(async () => {
  const all = await allNews()
  return all.filter(item => item.classify.includes("智能时代")).sort((m, n) => n.pubDate! > m.pubDate! ? 1 : -1)
})

const itNews = defineSource(async () => {
  const all = await allNews()
  return all.filter(item => item.classify.includes("IT资讯")).sort((m, n) => n.pubDate! > m.pubDate! ? 1 : -1)
})

export default defineSource({
  "ithome": allNews,
  "ithome-all": allNews,
  "ithome-ai": smartEraNews,
  "ithome-it": itNews,
})
