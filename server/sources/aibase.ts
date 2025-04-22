import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

const rootUrl = "https://top.aibase.com"
const apiRootUrl = "https://app.chinaz.com"

async function getToken($: CheerioAPI): Promise<string> {
  const scriptUrl = new URL($("script[src]").last()?.prop("src") ?? defaultSrc, rootUrl).href

  const script = await myFetch(scriptUrl, {
    responseType: "text",
  })

  return script.match(/"\/(\w+)\/ai\/.*?\.aspx"/)?.[1] ?? defaultToken
}

async function buildApiUrl($: CheerioAPI) {
  const token = await getToken($)

  const apiRecommListUrl = new URL(`${token}/ai/GetAIProcRecommList.aspx`, apiRootUrl).href
  const apiRecommProcUrl = new URL(`${token}/ai/GetAIProcListByRecomm.aspx`, apiRootUrl).href
  const apiTagProcUrl = new URL(`${token}/ai/GetAiProductOfTag.aspx`, apiRootUrl).href
  // AI 资讯列表
  const apiInfoListUrl = new URL(`${token}/ai/GetAiInfoList.aspx`, apiRootUrl).href

  return {
    apiRecommListUrl,
    apiRecommProcUrl,
    apiTagProcUrl,
    apiInfoListUrl,
  }
}

export default defineSource(async () => {
  const currentUrl = new URL("discover", rootUrl).href
  const currentHtml = await myFetch(currentUrl)
  const $ = cheerio.load(currentHtml)

  const { apiInfoListUrl } = await buildApiUrl($)

  const data: NewsItem[] = await myFetch(apiInfoListUrl, {
    headers: {
      accept: "application/json;charset=utf-8",
    },
    query: {
      pagesize: 30,
      page: 1,
      type: 1,
      isen: 0,
    },
  })

  const items = data.map(item => ({
    title: item.title,
    url: `https://www.aibase.com/zh/news/${item.Id}`,
    id: item.Id,
    pubDate: parseDate(item.addtime),
  }))

  return { items }
})
