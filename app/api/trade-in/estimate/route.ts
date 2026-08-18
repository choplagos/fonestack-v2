import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'edge'

// Condition grade -> % of current catalog price a fair trade-in offer represents
const CONDITION_MULTIPLIER: Record<string, number> = {
  excellent: 0.65,
  good: 0.55,
  fair: 0.4,
  poor: 0.25,
}

function round1000(n: number) {
  return Math.round(n / 1000) * 1000
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      customer_name,
      customer_phone,
      brand,
      model,
      storage_gb,
      condition_grade,
      condition_description,
      has_box,
      has_charger,
    } = body

    if (!customer_name || !customer_phone || !brand || !model || !condition_grade) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      )
    }

    const grade = String(condition_grade).toLowerCase()
    const multiplier = CONDITION_MULTIPLIER[grade] ?? 0.45

    // 1. Try to find a close catalog match (brand + model)
    const { data: exactMatches } = await supabase
      .from('products')
      .select('name, brand, price')
      .ilike('brand', `%${brand}%`)
      .ilike('name', `%${model}%`)
      .limit(5)

    let anchorPrice: number | null = null
    let confidence: 'high' | 'medium' | 'low' = 'low'
    let matchLabel = ''

    if (exactMatches && exactMatches.length > 0) {
      anchorPrice =
        exactMatches.reduce((sum, p) => sum + Number(p.price), 0) /
        exactMatches.length
      confidence = 'high'
      matchLabel = exactMatches[0].name
    } else {
      // 2. Fall back to average price for the brand
      const { data: brandMatches } = await supabase
        .from('products')
        .select('name, brand, price')
        .ilike('brand', `%${brand}%`)
        .limit(20)

      if (brandMatches && brandMatches.length > 0) {
        anchorPrice =
          brandMatches.reduce((sum, p) => sum + Number(p.price), 0) /
          brandMatches.length
        confidence = 'medium'
        matchLabel = `average ${brand} pricing`
      } else {
        // 3. Fall back to overall catalog average
        const { data: allProducts } = await supabase
          .from('products')
          .select('price')
          .limit(200)

        const prices = (allProducts || []).map((p) => Number(p.price))
        anchorPrice = prices.length
          ? prices.reduce((a, b) => a + b, 0) / prices.length
          : 200000
        confidence = 'low'
        matchLabel = 'general market estimate'
      }
    }

    // Accessory completeness bump
    let accessoryBump = 0
    if (has_box) accessoryBump += 0.03
    if (has_charger) accessoryBump += 0.02

    const baseValue = anchorPrice * (multiplier + accessoryBump)
    const estimate_low = round1000(baseValue * 0.9)
    const estimate_high = round1000(baseValue * 1.1)

    const gradeLabel = grade.charAt(0).toUpperCase() + grade.slice(1)
    const accessoryText =
      has_box && has_charger
        ? 'with original box and charger'
        : has_box
        ? 'with original box'
        : has_charger
        ? 'with charger included'
        : 'with no accessories included'

    const estimate_reasoning = `Based on ${matchLabel} (₦${Math.round(
      anchorPrice
    ).toLocaleString()} reference price), ${gradeLabel} condition ${accessoryText}. Final offer confirmed after in-person inspection at Computer Village, Ikeja.`

    // Save the request to Supabase for admin review
    const { data: inserted, error: insertError } = await supabase
      .from('trade_in_requests')
      .insert({
        customer_name,
        customer_phone,
        brand,
        model,
        storage_gb: storage_gb || null,
        condition_description: condition_description || null,
        condition_grade: gradeLabel,
        has_box: !!has_box,
        has_charger: !!has_charger,
        estimate_low,
        estimate_high,
        estimate_reasoning,
        estimate_confidence: confidence,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Supabase insert error:', insertError)
    }

    return NextResponse.json({
      estimate_low,
      estimate_high,
      estimate_reasoning,
      estimate_confidence: confidence,
      request_id: inserted?.id || null,
    })
  } catch (err: any) {
    console.error('Trade-in estimate error:', err)
    return NextResponse.json(
      { error: 'Could not generate estimate. Please try again.' },
      { status: 500 }
    )
  }
}