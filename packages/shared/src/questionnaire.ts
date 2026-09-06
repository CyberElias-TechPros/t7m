/**
 * Brand & Logo Design — Client Intake Questionnaire definition.
 *
 * Single source of truth for the form: the Vercel (Next.js) frontend renders
 * from this definition and the Cloudflare Worker validates submissions against
 * the Zod schema derived from it (see ./schema.ts).
 */

export type FieldType =
  | 'text'
  | 'email'
  | 'textarea'
  | 'choice'
  | 'multichoice'
  | 'chips'
  | 'stringlist'
  | 'pairlist';

export interface FieldOption {
  value: string;
  label: string;
  hint?: string;
}

export interface FieldDef {
  id: string;
  type: FieldType;
  label: string;
  helpText?: string;
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[];
  /** Minimum number of entries (chips / stringlist / multichoice). */
  minItems?: number;
  /** Maximum number of entries (chips / stringlist / multichoice). */
  maxItems?: number;
  rows?: number;
  /** Placeholders for pairlist [name, why]. */
  pairPlaceholders?: [string, string];
}

export interface SectionDef {
  id: string;
  title: string;
  subtitle?: string;
  fields: FieldDef[];
}

export interface PairEntry {
  name: string;
  why: string;
}

export type AnswerValue = string | string[] | PairEntry[];
export type QuestionnaireAnswers = Record<string, AnswerValue>;

export const STAGES: FieldOption[] = [
  { value: 'pre-launch', label: 'Pre-launch', hint: 'No brand identity yet' },
  { value: 'early', label: 'Early stage', hint: 'Trading for under ~2 years' },
  { value: 'established', label: 'Established', hint: 'Mature business, first proper branding' },
  { value: 'rebrand', label: 'Rebrand', hint: 'Replacing or evolving an existing identity' },
];

export const GEO_SCOPE: FieldOption[] = [
  { value: 'local', label: 'Local' },
  { value: 'regional', label: 'Regional / multi-city' },
  { value: 'national', label: 'National' },
  { value: 'global', label: 'Global / international' },
];

export const ENCOUNTER_POINTS: FieldOption[] = [
  { value: 'website', label: 'Website' },
  { value: 'social', label: 'Social media' },
  { value: 'app', label: 'Mobile app' },
  { value: 'in-store', label: 'In-store / physical location' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'pitch-decks', label: 'B2B pitch decks' },
  { value: 'events', label: 'Events / trade shows' },
  { value: 'marketplaces', label: 'Marketplaces / third-party retail' },
];

export const TONE_OPTIONS: FieldOption[] = [
  { value: 'formal', label: 'Formal' },
  { value: 'professional', label: 'Professional' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'warm', label: 'Warm' },
  { value: 'playful', label: 'Playful' },
  { value: 'edgy', label: 'Edgy' },
  { value: 'quirky', label: 'Quirky' },
  { value: 'minimal', label: 'Minimal / understated' },
  { value: 'bold', label: 'Bold / confident' },
];

export const STYLE_OPTIONS: FieldOption[] = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'bold', label: 'Bold' },
  { value: 'modern', label: 'Modern' },
  { value: 'classic', label: 'Classic' },
  { value: 'vintage', label: 'Vintage / retro' },
  { value: 'luxury', label: 'Luxury / premium' },
  { value: 'hand-drawn', label: 'Hand-drawn / illustrative' },
  { value: 'geometric', label: 'Geometric' },
  { value: 'organic', label: 'Organic / natural' },
  { value: 'abstract', label: 'Abstract' },
];

export const TYPOGRAPHY_OPTIONS: FieldOption[] = [
  { value: 'modern-sans', label: 'Modern sans-serif' },
  { value: 'classic-serif', label: 'Classic serif' },
  { value: 'display', label: 'Display / expressive' },
  { value: 'monospace', label: 'Technical / monospace' },
  { value: 'handwritten', label: 'Handwritten / script' },
  { value: 'unsure', label: 'Not sure — open to suggestions' },
];

export const IMAGERY_OPTIONS: FieldOption[] = [
  { value: 'literal', label: 'Literal symbol', hint: 'A recognizable icon of what you do' },
  { value: 'abstract', label: 'Abstract mark', hint: 'A distinctive shape, not pictorial' },
  { value: 'lettermark', label: 'Lettermark', hint: 'Initials or a single letter' },
  { value: 'wordmark', label: 'Wordmark-focused', hint: 'The name itself, styled' },
  { value: 'emblem', label: 'Emblem / badge' },
  { value: 'mascot', label: 'Mascot / character' },
  { value: 'unsure', label: 'Not sure — open to options' },
];

export const LOGO_TYPE_OPTIONS: FieldOption[] = [
  { value: 'wordmark', label: 'Wordmark' },
  { value: 'icon-wordmark', label: 'Icon + wordmark (lockup)' },
  { value: 'icon', label: 'Icon alone' },
  { value: 'lettermark', label: 'Lettermark' },
  { value: 'emblem', label: 'Emblem / badge' },
];

export const YES_NO_MAYBE: FieldOption[] = [
  { value: 'yes', label: 'Yes — required' },
  { value: 'maybe', label: 'Nice to have' },
  { value: 'no', label: 'No' },
];

export const APPLICATIONS: FieldOption[] = [
  { value: 'website', label: 'Website' },
  { value: 'app-icon', label: 'App icon' },
  { value: 'social', label: 'Social media profiles' },
  { value: 'packaging', label: 'Packaging / labels' },
  { value: 'signage', label: 'Signage / storefront' },
  { value: 'merch', label: 'Merch / swag' },
  { value: 'print', label: 'Print collateral (cards, brochures)' },
  { value: 'vehicle', label: 'Vehicle wrap' },
  { value: 'decks', label: 'Pitch decks / presentations' },
  { value: 'email', label: 'Email / signatures' },
];

export const DARK_LIGHT: FieldOption[] = [
  { value: 'light', label: 'Mostly light backgrounds' },
  { value: 'dark', label: 'Mostly dark backgrounds' },
  { value: 'both', label: 'Both equally — need full flexibility' },
];

export const FILE_FORMATS: FieldOption[] = [
  { value: 'svg', label: 'SVG' },
  { value: 'png', label: 'PNG' },
  { value: 'eps', label: 'EPS' },
  { value: 'pdf', label: 'PDF' },
  { value: 'source', label: 'Editable source (AI/PSD/Figma)' },
  { value: 'unsure', label: 'Not sure — recommend what I need' },
];

export const CONCEPT_OPTIONS: FieldOption[] = [
  { value: '1-2', label: '1–2 concepts' },
  { value: '3', label: '3 concepts', hint: 'Most popular' },
  { value: '4-5', label: '4–5 concepts' },
  { value: 'flexible', label: 'Flexible — you decide' },
];

export const REVISION_OPTIONS: FieldOption[] = [
  { value: '1', label: '1 round' },
  { value: '2', label: '2 rounds', hint: 'Typical' },
  { value: '3', label: '3 rounds' },
  { value: 'unlimited', label: 'As many as needed' },
];

export const TIMELINE_OPTIONS: FieldOption[] = [
  { value: 'asap', label: 'ASAP — under 2 weeks' },
  { value: '2-4w', label: '2–4 weeks' },
  { value: '1-2m', label: '1–2 months' },
  { value: 'flexible', label: 'Flexible / no hard deadline' },
];

export const BUDGET_OPTIONS: FieldOption[] = [
  { value: 'under-1k', label: 'Under $1,000' },
  { value: '1k-3k', label: '$1,000 – $3,000' },
  { value: '3k-7k', label: '$3,000 – $7,000' },
  { value: '7k-15k', label: '$7,000 – $15,000' },
  { value: '15k-plus', label: '$15,000+' },
  { value: 'undisclosed', label: 'Prefer not to say' },
];

export const SECTIONS: SectionDef[] = [
  {
    id: 'business',
    title: 'Business fundamentals',
    subtitle: 'Tell us who you are and what you do.',
    fields: [
      {
        id: 'contactName',
        type: 'text',
        label: 'Your name',
        helpText: 'Who should we talk to about this project?',
        placeholder: 'Jane Doe',
        required: true,
      },
      {
        id: 'contactEmail',
        type: 'email',
        label: 'Email address',
        helpText: 'We will use this to follow up on your brief.',
        placeholder: 'jane@company.com',
        required: true,
      },
      {
        id: 'brandName',
        type: 'text',
        label: 'Company / brand name',
        helpText: 'Final name, or shortlist of candidates.',
        placeholder: 'Acme Studio',
        required: true,
      },
      {
        id: 'tagline',
        type: 'text',
        label: 'Tagline or slogan',
        placeholder: 'e.g. “Design that works”',
      },
      {
        id: 'description',
        type: 'textarea',
        label: 'One-sentence description of what you do',
        placeholder: 'We help [audience] do [thing] by [approach]…',
        rows: 2,
        required: true,
      },
      {
        id: 'problem',
        type: 'textarea',
        label: 'What problem do you solve, or what need do you meet?',
        rows: 3,
        required: true,
      },
      {
        id: 'stage',
        type: 'choice',
        label: 'What stage is the business at?',
        options: STAGES,
        required: true,
      },
      {
        id: 'legalName',
        type: 'text',
        label: 'Legal / trade name differences',
        helpText: 'Fill this in if the registered business name differs from the brand name.',
        placeholder: 'Registered as: Acme Holdings LLC',
      },
    ],
  },
  {
    id: 'market',
    title: 'Market & audience',
    subtitle: 'Who you serve and where they will meet the brand.',
    fields: [
      {
        id: 'primaryAudience',
        type: 'textarea',
        label: 'Primary target audience',
        helpText: 'Age, profession, lifestyle, habits — the more specific the better.',
        rows: 3,
        placeholder: 'e.g. Women 25–40, urban professionals, value sustainability…',
        required: true,
      },
      {
        id: 'secondaryAudience',
        type: 'textarea',
        label: 'Secondary audience',
        helpText: 'Any other important group you want to resonate with.',
        rows: 2,
      },
      {
        id: 'excludedAudience',
        type: 'textarea',
        label: 'Who are you explicitly NOT trying to reach?',
        rows: 2,
      },
      {
        id: 'geoScope',
        type: 'choice',
        label: 'Geographic scope',
        options: GEO_SCOPE,
        required: true,
      },
      {
        id: 'encounterPoints',
        type: 'multichoice',
        label: 'Where will your audience primarily encounter the brand?',
        helpText: 'Select all that apply.',
        options: ENCOUNTER_POINTS,
        minItems: 1,
        required: true,
      },
    ],
  },
  {
    id: 'competition',
    title: 'Competitive landscape',
    subtitle: 'Who else is in the space, and how do you stand out?',
    fields: [
      {
        id: 'competitors',
        type: 'stringlist',
        label: 'Top 3–5 direct competitors',
        helpText: 'One per line — names or URLs.',
        placeholder: 'competitor.com',
        minItems: 1,
        required: true,
      },
      {
        id: 'competitorLikes',
        type: 'textarea',
        label: 'What do competitors do visually that you like?',
        rows: 3,
      },
      {
        id: 'competitorAvoid',
        type: 'textarea',
        label: 'What do competitors do that you want to avoid or differentiate from?',
        rows: 3,
      },
      {
        id: 'usp',
        type: 'textarea',
        label: 'Your unique selling point vs. the competition',
        helpText: 'What makes you the obvious choice?',
        rows: 3,
        required: true,
      },
    ],
  },
  {
    id: 'personality',
    title: 'Brand personality & voice',
    subtitle: 'How the brand should feel and sound.',
    fields: [
      {
        id: 'adjectives',
        type: 'chips',
        label: '3–5 adjectives describing the brand’s personality',
        helpText: 'Type an adjective and press Enter.',
        placeholder: 'e.g. Trustworthy',
        minItems: 3,
        maxItems: 5,
        required: true,
      },
      {
        id: 'brandAsPerson',
        type: 'textarea',
        label: 'If the brand were a person, describe them',
        helpText: 'Age, style, attitude — who would they be?',
        rows: 3,
        placeholder: 'e.g. A 30-something creative director in well-wear…',
      },
      {
        id: 'toneOfVoice',
        type: 'multichoice',
        label: 'Tone of voice',
        helpText: 'Select all that apply.',
        options: TONE_OPTIONS,
        minItems: 1,
        required: true,
      },
      {
        id: 'admiredBrands',
        type: 'pairlist',
        label: 'Brands outside your industry that you admire',
        helpText: 'Any category — and tell us why.',
        pairPlaceholders: ['Brand name', 'What you admire about it'],
      },
      {
        id: 'associateWords',
        type: 'chips',
        label: 'Words or feelings people should associate with the brand',
        placeholder: 'e.g. Reliable',
      },
      {
        id: 'avoidWords',
        type: 'chips',
        label: 'Words or feelings you want to AVOID being associated with',
        placeholder: 'e.g. Cheap',
      },
    ],
  },
  {
    id: 'visual',
    title: 'Visual direction',
    subtitle: 'The look you are drawn to (and the ones you aren’t).',
    fields: [
      {
        id: 'stylePreference',
        type: 'multichoice',
        label: 'Style preference',
        helpText: 'Select all that appeal — we will find the blend.',
        options: STYLE_OPTIONS,
        minItems: 1,
        required: true,
      },
      {
        id: 'colorPreferences',
        type: 'textarea',
        label: 'Color preferences',
        helpText: 'Colors you love, and colors to avoid (cultural meaning, competitor overlap, personal dislike).',
        rows: 3,
        placeholder: 'e.g. Love deep teal and warm neutrals; avoid red (used by our main competitor).',
      },
      {
        id: 'existingAssets',
        type: 'textarea',
        label: 'Existing brand assets',
        helpText: 'Old logos, colors, fonts to build from or retire. You can upload files in the final step.',
        rows: 3,
      },
      {
        id: 'typographyFeel',
        type: 'multichoice',
        label: 'Typography feel',
        options: TYPOGRAPHY_OPTIONS,
      },
      {
        id: 'imageryDirection',
        type: 'choice',
        label: 'Imagery / iconography direction',
        helpText: 'Where should the mark land?',
        options: IMAGERY_OPTIONS,
      },
    ],
  },
  {
    id: 'logo',
    title: 'Logo specifics',
    subtitle: 'The deliverable at the center of the project.',
    fields: [
      {
        id: 'logoType',
        type: 'multichoice',
        label: 'Logo type needed',
        helpText: 'Select one or more.',
        options: LOGO_TYPE_OPTIONS,
        minItems: 1,
        required: true,
      },
      {
        id: 'symbolIdea',
        type: 'textarea',
        label: 'Any specific symbol, motif, or idea already in mind?',
        rows: 3,
      },
      {
        id: 'mustAvoidSymbols',
        type: 'textarea',
        label: 'Must-avoid symbols',
        helpText: 'Religious, cultural, competitor-adjacent, or overused clichés (swooshes, generic globes…).',
        rows: 3,
      },
      {
        id: 'submarkNeeded',
        type: 'choice',
        label: 'Do you need a submark / icon-only version?',
        helpText: 'For app icons, favicons, social avatars.',
        options: YES_NO_MAYBE,
      },
    ],
  },
  {
    id: 'usage',
    title: 'Practical usage & constraints',
    subtitle: 'Where the identity has to perform.',
    fields: [
      {
        id: 'applications',
        type: 'multichoice',
        label: 'Primary applications',
        helpText: 'Where will the logo live?',
        options: APPLICATIONS,
        minItems: 1,
        required: true,
      },
      {
        id: 'minimumSize',
        type: 'text',
        label: 'Minimum size it needs to work at',
        placeholder: 'e.g. 16px favicon, embroidery on a cap',
      },
      {
        id: 'singleColor',
        type: 'choice',
        label: 'Does it need to work in a single color / black & white?',
        helpText: 'Stamps, engraving, fax, embroidery.',
        options: YES_NO_MAYBE,
        required: true,
      },
      {
        id: 'darkLight',
        type: 'choice',
        label: 'Light and dark background use',
        options: DARK_LIGHT,
        required: true,
      },
      {
        id: 'regulations',
        type: 'textarea',
        label: 'Industry regulations or restrictions',
        helpText: 'e.g. healthcare, finance, alcohol — anything that constrains the design.',
        rows: 2,
      },
    ],
  },
  {
    id: 'deliverables',
    title: 'Deliverables & process',
    subtitle: 'How you like to work — helps us scope and quote.',
    fields: [
      {
        id: 'fileFormats',
        type: 'multichoice',
        label: 'File formats needed',
        options: FILE_FORMATS,
        minItems: 1,
        required: true,
      },
      {
        id: 'conceptCount',
        type: 'choice',
        label: 'Number of concepts before narrowing down',
        options: CONCEPT_OPTIONS,
        required: true,
      },
      {
        id: 'revisionRounds',
        type: 'choice',
        label: 'Number of revision rounds',
        options: REVISION_OPTIONS,
        required: true,
      },
      {
        id: 'timeline',
        type: 'choice',
        label: 'Timeline / deadline',
        options: TIMELINE_OPTIONS,
        required: true,
      },
      {
        id: 'budget',
        type: 'choice',
        label: 'Budget range',
        helpText: 'Helps us tailor a proposal. “Prefer not to say” is fine.',
        options: BUDGET_OPTIONS,
        required: true,
      },
    ],
  },
  {
    id: 'wrapup',
    title: 'Wrap-up',
    subtitle: 'Almost done — inspiration, files, and sign-off.',
    fields: [
      {
        id: 'inspirationLinks',
        type: 'textarea',
        label: 'Anything else: inspiration links, mood boards, Pinterest, sketches',
        helpText: 'One link per line. You can also attach files below.',
        rows: 4,
        placeholder: 'https://pinterest.com/…',
      },
      {
        id: 'signOff',
        type: 'text',
        label: 'Who has final sign-off on the logo?',
        helpText: 'Name and role (e.g. “Jane Doe, Founder”).',
        placeholder: 'Jane Doe, Founder',
        required: true,
      },
    ],
  },
];

export const ALL_FIELDS: FieldDef[] = SECTIONS.flatMap((s) => s.fields);

export function getField(id: string): FieldDef | undefined {
  return ALL_FIELDS.find((f) => f.id === id);
}

/** Empty answers object, used to initialise form state. */
export function emptyAnswers(): QuestionnaireAnswers {
  const answers: QuestionnaireAnswers = {};
  for (const field of ALL_FIELDS) {
    if (field.type === 'multichoice' || field.type === 'chips' || field.type === 'stringlist') {
      answers[field.id] = [];
    } else if (field.type === 'pairlist') {
      answers[field.id] = [];
    } else {
      answers[field.id] = '';
    }
  }
  return answers;
}
