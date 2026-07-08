import type { ChatTool } from '~~/shared/ai/chat'
import { createHttpToolProvider } from './http-provider'

const searchPostsTool: ChatTool = {
  name: 'search_posts',
  description: '搜索 imba97.com 博客文章(元数据列表,不含正文)。按关键词在标题/标签/分类上做不区分大小写的子串匹配,多个标签/分类之间是「任一匹配」语义,过滤条件之间是 AND。结果按发布日期倒序。',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: '标题/标签/分类的子串匹配,忽略大小写。省略则不过滤关键词。'
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: '按标签过滤,任一命中即匹配(OR)。例如 ["AI", "前端"]。'
      },
      categories: {
        type: 'array',
        items: { type: 'string' },
        description: '按分类过滤,任一命中即匹配(OR)。'
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 30,
        description: '最多返回条数,默认 10,最大 30。'
      }
    }
  }
}

const getPostContentTool: ChatTool = {
  name: 'get_post_content',
  description: '获取某篇博客文章的完整正文。仅在用户明确想看/引用某篇具体内容时调用(正文很大)。需要提供 id,通常是先调用 search_posts 从返回结果的 id 字段取。',
  parameters: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: '文章 id(从 search_posts 的返回结果里取)'
      }
    },
    required: ['id']
  }
}

export function createBlogToolProvider() {
  return createHttpToolProvider({
    name: 'blog',
    tools: [
      { localName: 'search_posts', tool: searchPostsTool },
      { localName: 'get_post_content', tool: getPostContentTool }
    ]
  })
}
