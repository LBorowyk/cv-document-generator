import Fastify from 'fastify';
import nunjucks from 'nunjucks';
import { z } from 'zod';

const cvSchema = z.object({
  name: z.string().min(1),
  title: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
  skills: z.array(z.string()).default([]),
  experience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    period: z.string().optional(),
    description: z.string().optional(),
    achievements: z.array(z.string()).default([]),
  })).default([]),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    period: z.string().optional(),
  })).default([]),
});

type Cv = z.infer<typeof cvSchema>;

const latexTemplate = String.raw`\documentclass[11pt,a4paper]{article}
\usepackage[margin=1.8cm]{geometry}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage{enumitem}
\usepackage{hyperref}
\pagenumbering{gobble}
\setlength{\parindent}{0pt}

\begin{document}
{\LARGE\textbf{ {{ name | latex }} }}\\
{% if title %}{{ title | latex }}\\{% endif %}
{% if email %}\href{mailto:{{ email | latex }} }{ {{ email | latex }} }{% endif %}
{% if phone %} \textbar\ {{ phone | latex }}{% endif %}
{% if location %} \textbar\ {{ location | latex }}{% endif %}

{% if summary %}\section*{Summary}
{{ summary | latex }}
{% endif %}

{% if skills.length %}\section*{Skills}
{{ skills | join(', ') | latex }}
{% endif %}

{% if experience.length %}\section*{Experience}
{% for item in experience %}
\textbf{ {{ item.role | latex }} } --- {{ item.company | latex }}{% if item.period %} \hfill {{ item.period | latex }}{% endif %}\\
{% if item.description %}{{ item.description | latex }}\\{% endif %}
{% if item.achievements.length %}\begin{itemize}[leftmargin=*]
{% for achievement in item.achievements %}\item {{ achievement | latex }}
{% endfor %}\end{itemize}{% endif %}
{% endfor %}
{% endif %}

{% if education.length %}\section*{Education}
{% for item in education %}
\textbf{ {{ item.degree | latex }} } --- {{ item.institution | latex }}{% if item.period %} \hfill {{ item.period | latex }}{% endif %}\\
{% endfor %}
{% endif %}
\end{document}
`;

const escapeLatex = (value: string): string => value
  .replace(/\\/g, '\\textbackslash{}')
  .replace(/([#$%&_{}])/g, '\\$1')
  .replace(/\^/g, '\\textasciicircum{}')
  .replace(/~/g, '\\textasciitilde{}');

// LaTeX is not HTML: Nunjucks' HTML autoescaping would produce entities such
// as `&amp;`. Values are escaped for LaTeX by the custom filter instead.
const nunjucksEnvironment = new nunjucks.Environment(undefined, { autoescape: false });
nunjucksEnvironment.addFilter('latex', (value: string | undefined) => escapeLatex(value ?? ''));

const app = Fastify({
  logger: true,
});

app.get('/health', async () => {
  return {
    status: 'ok'
  };
});

app.post<{ Body: unknown }>('/generate-latex', async (request, reply) => {
  const result = cvSchema.safeParse(request.body);

  if (!result.success) {
    return reply.code(400).send({
      error: 'Invalid CV payload',
      details: result.error.flatten(),
    });
  }

  const document = nunjucksEnvironment.renderString(latexTemplate, result.data as Cv);

  return reply
    .type('application/x-tex; charset=utf-8')
    .header('Content-Disposition', 'attachment; filename="cv.tex"')
    .send(document);
});

const port = Number(process.env.PORT ?? 3000);

const start = async (): Promise<void> => {
  try {
    await app.listen({
      port,
      host: '0.0.0.0',
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void start();
