const SUPERSCRIPT_MAP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
  'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'y': 'ʸ',
};

const SUBSCRIPT_MAP: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
  'a': 'ₐ', 'e': 'ₑ', 'o': 'ₒ', 'x': 'ₓ',
  'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'n': 'ₙ', 'r': 'ᵣ',
};

const GREEK_MAP: Record<string, string> = {
  'alpha': 'α', 'beta': 'β', 'gamma': 'γ', 'delta': 'δ',
  'epsilon': 'ε', 'zeta': 'ζ', 'eta': 'η', 'theta': 'θ',
  'iota': 'ι', 'kappa': 'κ', 'lambda': 'λ', 'mu': 'μ',
  'nu': 'ν', 'xi': 'ξ', 'pi': 'π', 'rho': 'ρ',
  'sigma': 'σ', 'tau': 'τ', 'upsilon': 'υ', 'phi': 'φ',
  'chi': 'χ', 'psi': 'ψ', 'omega': 'ω',
  'Alpha': 'Α', 'Beta': 'Β', 'Gamma': 'Γ', 'Delta': 'Δ',
  'Epsilon': 'Ε', 'Zeta': 'Ζ', 'Eta': 'Η', 'Theta': 'Θ',
  'Iota': 'Ι', 'Kappa': 'Κ', 'Lambda': 'Λ', 'Mu': 'Μ',
  'Nu': 'Ν', 'Xi': 'Ξ', 'Pi': 'Π', 'Rho': 'Ρ',
  'Sigma': 'Σ', 'Tau': 'Τ', 'Upsilon': 'Υ', 'Phi': 'Φ',
  'Chi': 'Χ', 'Psi': 'Ψ', 'Omega': 'Ω',
};

const SYMBOL_MAP: Record<string, string> = {
  'infty': '∞', 'infinity': '∞',
  'pm': '±', 'mp': '∓',
  'times': '×', 'cdot': '·', 'div': '÷',
  'leq': '≤', 'geq': '≥', 'neq': '≠', 'approx': '≈',
  'equiv': '≡', 'sim': '∼',
  'leftarrow': '←', 'rightarrow': '→', 'leftrightarrow': '↔',
  'Leftarrow': '⇐', 'Rightarrow': '⇒', 'Leftrightarrow': '⇔',
  'to': '→', 'implies': '⇒',
  'forall': '∀', 'exists': '∃', 'partial': '∂',
  'nabla': '∇', 'in': '∈', 'notin': '∉',
  'subset': '⊂', 'supset': '⊃', 'subseteq': '⊆', 'supseteq': '⊇',
  'cup': '∪', 'cap': '∩',
  'emptyset': '∅', 'varnothing': '∅',
  'angle': '∠', 'degree': '°',
  'triangle': '△',
  'perp': '⊥', 'parallel': '∥',
  'sum': 'Σ', 'prod': 'Π', 'int': '∫',
  'sqrt': '√',
  'lim': 'lim',
  'sin': 'sin', 'cos': 'cos', 'tan': 'tan',
  'sec': 'sec', 'csc': 'csc', 'cot': 'cot',
  'arcsin': 'arcsin', 'arccos': 'arccos', 'arctan': 'arctan',
  'log': 'log', 'ln': 'ln',
};

function toSuperscript(str: string): string {
  return str.split('').map(c => SUPERSCRIPT_MAP[c] || c).join('');
}

function toSubscript(str: string): string {
  return str.split('').map(c => SUBSCRIPT_MAP[c] || c).join('');
}

function stripBraces(s: string): string {
  if (s.startsWith('{') && s.endsWith('}')) {
    return s.slice(1, -1);
  }
  return s;
}

function convertLatexExpression(tex: string): string {
  let result = tex;

  result = result.replace(/\\frac\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, (_, num, den) => {
    const cleanNum = convertLatexExpression(num.trim());
    const cleanDen = convertLatexExpression(den.trim());
    return `(${cleanNum})/(${cleanDen})`;
  });

  result = result.replace(/\\dfrac\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, (_, num, den) => {
    const cleanNum = convertLatexExpression(num.trim());
    const cleanDen = convertLatexExpression(den.trim());
    return `(${cleanNum})/(${cleanDen})`;
  });

  result = result.replace(/\\sqrt\[([^\]]+)\]\s*\{([^{}]*)\}/g, (_, n, content) => {
    const cleanContent = convertLatexExpression(content);
    return `${toSuperscript(n)}√(${cleanContent})`;
  });

  result = result.replace(/\\sqrt\s*\{([^{}]*)\}/g, (_, content) => {
    const cleanContent = convertLatexExpression(content);
    return `√(${cleanContent})`;
  });

  result = result.replace(/\\left\s*[(({|]/g, (m) => m.slice(-1));
  result = result.replace(/\\left\s*\[/g, '[');
  result = result.replace(/\\right\s*[))}|]/g, (m) => m.slice(-1));
  result = result.replace(/\\right\s*]/g, ']');
  result = result.replace(/\\left\s*\\\{/g, '{');
  result = result.replace(/\\right\s*\\\}/g, '}');
  result = result.replace(/\\left\./g, '');
  result = result.replace(/\\right\./g, '');

  for (const [cmd, symbol] of Object.entries(GREEK_MAP)) {
    const regex = new RegExp(`\\\\${cmd}(?![a-zA-Z])`, 'g');
    result = result.replace(regex, symbol);
  }

  for (const [cmd, symbol] of Object.entries(SYMBOL_MAP)) {
    const regex = new RegExp(`\\\\${cmd}(?![a-zA-Z])`, 'g');
    result = result.replace(regex, symbol);
  }

  result = result.replace(/\^(\{[^{}]+\}|[0-9a-zA-Z])/g, (_, exp) => {
    const clean = stripBraces(exp);
    return toSuperscript(clean);
  });

  result = result.replace(/_(\{[^{}]+\}|[0-9a-zA-Z])/g, (_, sub) => {
    const clean = stripBraces(sub);
    return toSubscript(clean);
  });

  result = result.replace(/\\text\s*\{([^{}]*)\}/g, '$1');
  result = result.replace(/\\textbf\s*\{([^{}]*)\}/g, '$1');
  result = result.replace(/\\textit\s*\{([^{}]*)\}/g, '$1');
  result = result.replace(/\\mathrm\s*\{([^{}]*)\}/g, '$1');
  result = result.replace(/\\mathbf\s*\{([^{}]*)\}/g, '$1');
  result = result.replace(/\\mathit\s*\{([^{}]*)\}/g, '$1');
  result = result.replace(/\\operatorname\s*\{([^{}]*)\}/g, '$1');

  result = result.replace(/\\,/g, ' ');
  result = result.replace(/\\;/g, ' ');
  result = result.replace(/\\:/g, ' ');
  result = result.replace(/\\!/g, '');
  result = result.replace(/\\quad/g, '  ');
  result = result.replace(/\\qquad/g, '    ');
  result = result.replace(/\\\\/g, '\n');
  result = result.replace(/\\&/g, '&');

  result = result.replace(/\\[a-zA-Z]+/g, (match) => {
    const cmd = match.slice(1);
    return SYMBOL_MAP[cmd] || GREEK_MAP[cmd] || cmd;
  });

  result = result.replace(/\{([^{}]*)\}/g, '$1');
  result = result.replace(/\{([^{}]*)\}/g, '$1');

  return result.trim();
}

export function cleanMath(text: string): string {
  let cleaned = text;

  cleaned = cleaned.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => {
    return convertLatexExpression(tex.trim());
  });

  cleaned = cleaned.replace(/\\\[([\s\S]*?)\\\]/g, (_, tex) => {
    return convertLatexExpression(tex.trim());
  });

  cleaned = cleaned.replace(/\\\(([\s\S]*?)\\\)/g, (_, tex) => {
    return convertLatexExpression(tex.trim());
  });

  cleaned = cleaned.replace(/\$([^$\n]+?)\$/g, (_, tex) => {
    return convertLatexExpression(tex.trim());
  });

  cleaned = cleaned.replace(/\\frac\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, (_, num, den) => {
    return `(${convertLatexExpression(num.trim())})/(${convertLatexExpression(den.trim())})`;
  });

  cleaned = cleaned.replace(/\\sqrt\s*\{([^{}]*)\}/g, (_, content) => {
    return `√(${convertLatexExpression(content)})`;
  });

  return cleaned;
}

export function cleanMarkdown(text: string): string {
  let cleaned = text;

  cleaned = cleanMath(cleaned);

  cleaned = cleaned.replace(/^#{1,6}\s*/gm, '');
  cleaned = cleaned.replace(/\*\*\*(.+?)\*\*\*/g, '$1');
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1');
  cleaned = cleaned.replace(/(?<!\w)\*(.+?)\*(?!\w)/g, '$1');
  cleaned = cleaned.replace(/__(.+?)__/g, '$1');
  cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, '• ');
  cleaned = cleaned.replace(/```[\s\S]*?```/g, (match) => {
    return match.replace(/```\w*\n?/g, '').replace(/```/g, '').trim();
  });
  cleaned = cleaned.replace(/`(.+?)`/g, '$1');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.replace(/^---+$/gm, '');
  cleaned = cleaned.replace(/^\s*>\s?/gm, '');
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  return cleaned.trim();
}
