// POST /api/check — 外语地道性检测 (v2 - 修复规则引擎)
const LANG_NAMES = { en:'English', ru:'Русский', ja:'日本語', ko:'한국어', fr:'Français', de:'Deutsch', es:'Español', zh:'中文' }

function conjugateVerb(verb) {
  var m = {go:'goes',do:'does',have:'has',say:'says',make:'makes',take:'takes',get:'gets',use:'uses',write:'writes',read:'reads',run:'runs',come:'comes',see:'sees',know:'knows',think:'thinks',give:'gives',find:'finds',tell:'tells',ask:'asks',work:'works',try:'tries',leave:'leaves',call:'calls',keep:'keeps',let:'lets',begin:'begins',show:'shows',hear:'hears',play:'plays',move:'moves',live:'lives',believe:'believes',bring:'brings'}
  if (m[verb]) return m[verb]
  if (/[ochsxz]e?$/.test(verb) || verb.endsWith('ss') || verb.endsWith('sh')) return verb + 'es'
  if (/[^aeiou]y$/.test(verb)) return verb.slice(0,-1)+'ies'
  return verb + 's'
}

function heuristicCheck(text, lang) {
  var issues = [], score = 7, corrected = text
  if (lang === 'en') {
    // 主谓一致: He go -> He goes
    var sv = text.match(/\b(he|she|it)\s+(go|have|do|say|make|take|get|use|write|read|run|come|see|know|think)\b/i)
    if (sv) {
      var c = conjugateVerb(sv[2].toLowerCase())
      var wrong = sv[1]+' '+sv[2], right = sv[1]+' '+c
      corrected = corrected.replace(wrong, right)
      issues.push({type:'grammar',desc:'主语与谓语不一致: '+wrong+' 应为 '+right, suggestion:right})
      score = Math.max(1, score-2)
    }
    // 过去时: goes yesterday -> went
    if (/\bgoes\b/i.test(text) && /\b(yesterday|last|ago|did)\b/i.test(text)) {
      corrected = corrected.replace(/\bgoes\b/gi, 'went')
      issues.push({type:'grammar',desc:'时态不一致，过去时应用 went', suggestion:'改为 went'})
      score = Math.max(1, score-2)
    }
  }
  var rating = score>=9?'优秀':score>=7?'良好':score>=5?'一般，有改进空间':'需要大幅改进'
  return {score:score, rating:rating, issues:issues.slice(0,5), corrected:corrected}
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'})
  var {text, targetLang} = req.body||{}
  if (!text||typeof text!=='string'||!text.trim()) return res.status(400).json({error:'请输入内容'})
  if (text.length>2000) return res.status(400).json({error:'内容过长'})
  var lang = targetLang||'en'

  // Try Ollama first (fast timeout)
  try {
    var ac = new AbortController()
    setTimeout(function(){ac.abort()}, 6000)
    var r = await fetch('http://127.0.0.1:11434/api/generate', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'qwen2.5:1.5b', prompt:
        '你是一个外语水平评估专家。给以下'+LANG_NAMES[lang]+'文本评分(满分10)、指出语法问题、给出修正建议。只输出JSON: {"score":N,"rating":"...","issues":[{"type":"...","desc":"...","suggestion":"..."}],"corrected":"..."}\n\n文本: '+text,
        stream:false, options:{temperature:0.1,num_predict:300}}),
      signal:ac.signal
    })
    clearTimeout()
    if (r.ok) {
      var d = await r.json(), raw = d.response||''
      var jm = raw.match(/\{[\s\S]*\}/)
      if (jm) {
        var j = JSON.parse(jm[0])
        return res.status(200).json({score:Math.max(1,Math.min(10,j.score||5)), rating:j.rating||'一般', issues:(j.issues||[]).slice(0,5), corrected:j.corrected||text})
      }
    }
  } catch(e) {}

  // Fallback: rule engine
  return res.status(200).json(heuristicCheck(text, lang))
}
