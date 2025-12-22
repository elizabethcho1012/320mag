import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CategoryClassification {
  category: string
  subcategory: string | null
  confidence: number
  reasoning: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { articleId, title, content, excerpt } = await req.json()

    if (!articleId || !title || !content) {
      throw new Error('Missing required fields: articleId, title, content')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get categories from database
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, slug, subcategories(id, name, slug)')
      .order('name')

    if (categoriesError) throw categoriesError
    if (!categories || categories.length === 0) {
      throw new Error('No categories found')
    }

    // Transform categories for Claude
    const categoryList = categories.map(cat => ({
      name: cat.name,
      slug: cat.slug,
      subcategories: cat.subcategories?.map((sub: any) => ({
        name: sub.name,
        slug: sub.slug,
      })) || [],
    }))

    // Call Anthropic API
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY not set')
    }

    const prompt = `다음 기사를 분석하고 가장 적합한 카테고리와 서브카테고리를 선택해주세요.

# 기사 정보
제목: ${title}
${excerpt ? `요약: ${excerpt}\n` : ''}
본문: ${content.substring(0, 2000)}${content.length > 2000 ? '...' : ''}

# 사용 가능한 카테고리
${JSON.stringify(categoryList, null, 2)}

# 지침
1. 기사의 주제와 내용을 신중히 분석하세요
2. 가장 적합한 카테고리와 서브카테고리를 선택하세요
3. 서브카테고리가 없다면 null로 반환하세요
4. 신뢰도(confidence)는 0-100 사이의 숫자로 표현하세요
5. 선택한 이유를 간단히 설명하세요

다음 JSON 형식으로만 응답해주세요:
{
  "category": "카테고리명",
  "categorySlug": "category-slug",
  "subcategory": "서브카테고리명 또는 null",
  "subcategorySlug": "subcategory-slug 또는 null",
  "confidence": 95,
  "reasoning": "선택 이유"
}`

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text()
      throw new Error(`Anthropic API error: ${errorText}`)
    }

    const anthropicData = await anthropicResponse.json()
    const responseText = anthropicData.content[0].text

    // Parse Claude's response
    const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || responseText.match(/\{[\s\S]*\}/)
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText
    const classification = JSON.parse(jsonText)

    // Find category ID
    const category = categories.find(c => c.slug === classification.categorySlug)
    if (!category) {
      throw new Error(`Category not found: ${classification.categorySlug}`)
    }

    let subcategoryId = null
    if (classification.subcategorySlug && category.subcategories) {
      const subcategory = category.subcategories.find(
        (s: any) => s.slug === classification.subcategorySlug
      )
      if (subcategory) {
        subcategoryId = subcategory.id
      }
    }

    // Update article
    const { error: updateError } = await supabase
      .from('articles')
      .update({
        category_id: category.id,
        subcategory_id: subcategoryId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', articleId)

    if (updateError) throw updateError

    console.log(`[AI 분류] 기사 "${title}" → ${classification.category}/${classification.subcategory || '없음'} (신뢰도: ${classification.confidence}%)`)

    const result: CategoryClassification = {
      category: classification.category,
      subcategory: classification.subcategory,
      confidence: classification.confidence,
      reasoning: classification.reasoning,
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in classify-article function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
