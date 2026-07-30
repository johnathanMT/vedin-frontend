import { useEffect, useRef, useState } from 'react'
import { Terminal, GraduationCap } from 'lucide-react'
import { useInView } from '../hooks/useInView'

/**
 * LiveCodeShowcase — a glassy editor window that auto-types REAL, professional
 * C# / .NET lessons on a loop, with full colourful syntax highlighting
 * (VS Code "Dark+" token colours), line numbers and a blinking cursor.
 */

interface Snippet { file: string; lesson: string; code: string }

const SNIPPETS: Snippet[] = [
  {
    file: 'OrdersController.cs', lesson: 'Async REST + Dependency Injection',
    code: `// LESSON: a clean async REST endpoint with constructor injection
[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _service;

    // DI: the service is injected — never "new"-ed by hand
    public OrdersController(IOrderService service) => _service = service;

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var order = await _service.FindAsync(id);
        return order is null ? NotFound() : Ok(order);
    }
}`,
  },
  {
    file: 'Pricing.cs', lesson: 'Records · LINQ · Pattern Matching',
    code: `// LESSON: immutable records + switch expressions + LINQ
public record Product(int Id, string Name, decimal Price);

public decimal Discount(Product p) => p switch
{
    { Price: > 100m } => p.Price * 0.90m,   // 10% off
    { Name: "Bundle" } => p.Price * 0.80m,  // 20% off
    _ => p.Price,
};

var cheapest = products
    .Where(p => p.Price < 50m)
    .OrderBy(p => p.Price)
    .Select(p => p.Name)
    .ToList();`,
  },
  {
    file: 'UserService.cs', lesson: 'EF Core · Nullable · Guard Clauses',
    code: `// LESSON: a safe EF Core query with guard clauses + nullable types
public async Task<Result<User>> GetUser(int id)
{
    if (id <= 0)
        return Result.Fail("Invalid id");

    User? user = await _db.Users
        .AsNoTracking()
        .FirstOrDefaultAsync(u => u.Id == id);

    return user is not null
        ? Result.Ok(user)
        : Result.Fail("User not found");
}`,
  },
]

/* ── Lightweight C# tokenizer → colourful spans (robust on partial lines) ── */
const CS_KW = new Set<string>([
  'abstract', 'as', 'async', 'await', 'base', 'bool', 'break', 'byte', 'case', 'catch', 'char',
  'class', 'const', 'continue', 'decimal', 'default', 'delegate', 'do', 'double', 'else', 'enum',
  'event', 'explicit', 'extern', 'false', 'finally', 'fixed', 'float', 'for', 'foreach', 'goto',
  'if', 'implicit', 'in', 'int', 'interface', 'internal', 'is', 'lock', 'long', 'namespace', 'new',
  'null', 'object', 'operator', 'out', 'override', 'params', 'private', 'protected', 'public',
  'readonly', 'record', 'ref', 'return', 'sealed', 'short', 'sizeof', 'static', 'string', 'struct',
  'switch', 'this', 'throw', 'true', 'try', 'typeof', 'uint', 'ulong', 'ushort', 'using', 'var',
  'virtual', 'void', 'volatile', 'while', 'when', 'with', 'get', 'set', 'init', 'not',
])

const COLOR: Record<string, string> = {
  comment: '#6A9955', // green
  string: '#CE9178',  // orange
  kw: '#569CD6',      // blue
  type: '#4EC9B0',    // teal
  method: '#DCDCAA',  // yellow
  num: '#B5CEA8',     // light green
  id: '#D4D4D4',      // default
  punct: '#D4D4D4',
}

type Token = [type: string, text: string]

function tokenizeCs(line: string): Token[] {
  const tokens: Token[] = []
  // comments, strings (allow unterminated for mid-typing), words, numbers, ws, punctuation
  const re = /(\/\/.*$)|([@$]?"(?:\\.|[^"\\])*"?)|([A-Za-z_]\w*)|(\d[\d_]*\.?\d*[fFdDmMlL]?)|(\s+)|([^\w\s])/g
  let m: RegExpExecArray | null
  while ((m = re.exec(line)) !== null) {
    if (m.index === re.lastIndex) re.lastIndex++ // safety against zero-width
    if (m[1]) tokens.push(['comment', m[1]])
    else if (m[2]) tokens.push(['string', m[2]])
    else if (m[3]) {
      const w = m[3]
      const rest = line.slice(re.lastIndex)
      if (CS_KW.has(w)) tokens.push(['kw', w])
      else if (/^\s*\(/.test(rest)) tokens.push(['method', w])
      else if (/^[A-Z]/.test(w)) tokens.push(['type', w])
      else tokens.push(['id', w])
    }
    else if (m[4]) tokens.push(['num', m[4]])
    else if (m[5]) tokens.push(['ws', m[5]])
    else tokens.push(['punct', m[6]])
  }
  return tokens
}

// Reserve a constant height for the editor body = the TALLEST snippet, so the box
// never grows while code types in → zero layout shift (the page never jumps).
const MAX_LINES = Math.max(...SNIPPETS.map((s) => s.code.split('\n').length))
const BODY_H = MAX_LINES * 24 + 32   // ~24px/line + py-4 padding

export default function LiveCodeShowcase() {
  const [idx, setIdx] = useState(0)
  const [shown, setShown] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [viewRef, inView] = useInView({ threshold: 0.15 })

  useEffect(() => {
    if (!inView) return   // don't type while the section is off-screen
    const { code } = SNIPPETS[idx]
    let i = 0
    setShown('')
    const tick = () => {
      i++
      setShown(code.slice(0, i))
      if (i < code.length) timer.current = setTimeout(tick, code[i - 1] === '\n' ? 65 : 11)
      else timer.current = setTimeout(() => setIdx((p) => (p + 1) % SNIPPETS.length), 2600)
    }
    timer.current = setTimeout(tick, 350)
    return () => clearTimeout(timer.current)
  }, [idx, inView])

  const snip = SNIPPETS[idx]
  const lines = shown.split('\n')

  return (
    <section id="livecode" ref={viewRef} className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-jade">// C# · .NET 8 — LIVE LESSONS</p>
        <h2 className="mt-4 flex items-center gap-3 text-3xl font-bold text-white sm:text-4xl">
          <Terminal className="text-accent-light" size={30} /> Live from <span className="text-accent-light">the editor</span>
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-gray-400">
          Real, idiomatic C# / .NET — typing itself out with full syntax highlighting. Each file is a bite-sized,
          professional lesson.
        </p>

        {/* editor window */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#1e1e1e] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
          {/* title bar */}
          <div className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-[#252526] px-4 py-2.5">
            <span className="flex gap-1.5">
              <i className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <i className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <i className="h-3 w-3 rounded-full bg-[#27c93f]" />
            </span>
            <span className="font-mono text-xs text-gray-300">{snip.file}</span>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-jade/30 bg-jade/10 px-2.5 py-0.5 font-mono text-[10px] text-jade-light">
              <GraduationCap size={12} /> {snip.lesson}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-jade-light">
              <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-jade" /> live
            </span>
          </div>

          {/* code body */}
          <div className="flex overflow-hidden font-mono text-[12.5px] leading-relaxed sm:text-sm" style={{ height: BODY_H }}>
            <div className="select-none border-r border-white/5 bg-[#1e1e1e] px-3 py-4 text-right text-[#5a5a5a]">
              {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <pre className="flex-1 overflow-x-auto px-4 py-4">
              {lines.map((ln, i) => {
                const toks = tokenizeCs(ln)
                const last = i === lines.length - 1
                return (
                  <div key={i}>
                    {toks.length === 0 && !last ? ' ' : toks.map(([t, txt], j) => (
                      t === 'ws' ? <span key={j}>{txt}</span> : <span key={j} style={{ color: COLOR[t] }}>{txt}</span>
                    ))}
                    {last && <span className="ml-0.5 inline-block h-[1.05em] w-[8px] -translate-y-[1px] animate-pulse align-middle bg-accent-light" />}
                  </div>
                )
              })}
            </pre>
          </div>
        </div>

        {/* file tabs */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {SNIPPETS.map((s, i) => (
            <button key={s.file} onClick={() => setIdx(i)}
              className={`rounded-full px-3 py-1 font-mono text-[11px] transition ${i === idx ? 'bg-accent/20 text-accent-light' : 'text-gray-500 hover:text-gray-300'}`}>
              {s.file}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
