import { ManagedSurvey, SurveyField, SurveyQuestion, SurveySubject } from '../types';
import { cloneQuestions } from './surveyQuestions';

function field(id: string, type: SurveyField['type'], label: string, extra: Partial<SurveyField> = {}): SurveyField {
  const base: SurveyField = {
    id,
    type,
    label,
    help: extra.help || '',
    required: extra.required !== false,
  };
  if (type === 'scale') {
    base.scaleMin = extra.scaleMin ?? 1;
    base.scaleMax = extra.scaleMax ?? 11;
  }
  if (type === 'single_choice' || type === 'multi_choice') {
    base.options = extra.options || ['Tak', 'Częściowo', 'Nie'];
  }
  return { ...base, ...extra, id, type, label };
}

export interface SurveyTemplate {
  id: string;
  title: string;
  blurb: string;
  subject: SurveySubject;
  subjectLabel: string;
  engine: 'generic' | '360';
  description: string;
  fields: SurveyField[];
  questions?: SurveyQuestion[];
}

export const SURVEY_TEMPLATES: SurveyTemplate[] = [
  {
    id: 'tpl_ewaluacja_360',
    title: 'Ewaluacja pracownika',
    blurb: 'Pełna ocena konkretnej osoby: komunikacja, terminowość, jakość i wkład własny.',
    subject: 'person',
    subjectLabel: 'Jedna osoba',
    engine: '360',
    description: 'Anonimowa ewaluacja pracownika — cztery obszary współpracy w zespole.',
    fields: [],
    questions: cloneQuestions(),
  },
  {
    id: 'tpl_zadowolenie_pracy',
    title: 'Zadowolenie z pracy',
    blurb: 'Pracownik ocenia firmę i warunki pracy — nie jedną osobę.',
    subject: 'workplace',
    subjectLabel: 'Miejsce pracy / firma jako pracodawca',
    engine: 'generic',
    description: 'Anonimowa ankieta satysfakcji: atmosfera, obciążenie, rozwój i to, czy polecisz tę pracę.',
    fields: [
      field('zp_atmosfera', 'scale', 'Jak oceniasz atmosferę i relacje w codziennej pracy?', { help: '1 = bardzo źle, 11 = wybitnie.' }),
      field('zp_obciazenie', 'scale', 'Jak oceniasz obciążenie obowiązkami (tempo, nadgodziny, realność celów)?'),
      field('zp_rozwoj', 'scale', 'Czy masz przestrzeń do rozwoju i jasność, dokąd zmierzasz w firmie?'),
      field('zp_wyplata', 'single_choice', 'Czy wynagrodzenie i benefity są adekwatne do wkładu?', {
        options: ['Zdecydowanie tak', 'Raczej tak', 'Trudno powiedzieć', 'Raczej nie', 'Zdecydowanie nie'],
      }),
      field('zp_plusy', 'long_text', 'Co w tej pracy działa naprawdę dobrze?', { required: false }),
      field('zp_minusy', 'long_text', 'Co najbardziej obniża Twoje zadowolenie?', { required: false }),
      field('zp_polece', 'yes_no', 'Czy polecił(a)byś tę pracę znajomemu?'),
    ],
  },
  {
    id: 'tpl_ocena_pracownika',
    title: 'Ocena pracownika',
    blurb: 'Kierownik / współpracownik ocenia jedną osobę na stanowisku.',
    subject: 'person',
    subjectLabel: 'Jedna osoba (pracownik)',
    engine: 'generic',
    description: 'Ocena konkretnego pracownika: rzetelność, samodzielność, relacje i obszary do rozwoju.',
    fields: [
      field('op_rola', 'short_text', 'Jaką rolę / stanowisko ma ta osoba? (bez nazwiska, jeśli ankieta ma zostać anonimowa)', { required: false }),
      field('op_rzetelnosc', 'scale', 'Jak oceniasz rzetelność i dotrzymywanie ustaleń?'),
      field('op_jakosc', 'scale', 'Jak oceniasz jakość efektów pracy?'),
      field('op_relacje', 'scale', 'Jak ta osoba współpracuje z resztą zespołu?'),
      field('op_samodzielnosc', 'single_choice', 'Na ile pracuje samodzielnie?', {
        options: ['W pełni samodzielnie', 'Z lekkim wsparciem', 'Wymaga regularnego prowadzenia', 'Wymaga stałego nadzoru'],
      }),
      field('op_mocne', 'long_text', 'Mocne strony, które warto zachować', { required: false }),
      field('op_rozwoj', 'long_text', 'Co konkretnie warto doszlifować?', { required: false }),
    ],
  },
  {
    id: 'tpl_ocena_drukarni',
    title: 'Ocena drukarni',
    blurb: 'Ocena zakładu / usługi druku: jakość, terminy, kontakt, reklamacje.',
    subject: 'printshop',
    subjectLabel: 'Zakład / usługa (drukarnia)',
    engine: 'generic',
    description: 'Ocena współpracy z drukarnią jako dostawcą: jakość odbitek, terminy, komunikacja i obsługa reklamacji.',
    fields: [
      field('dr_jakosc', 'scale', 'Jak oceniasz jakość wydruków (kolor, pasowanie, materiał)?'),
      field('dr_termin', 'scale', 'Jak oceniasz dotrzymywanie terminów i informowanie o opóźnieniach?'),
      field('dr_kontakt', 'scale', 'Jak oceniasz kontakt z opiekunem / biurem (szybkość, konkret)?'),
      field('dr_reklamacje', 'single_choice', 'Jak drukarnia ogarnia poprawki i reklamacje?', {
        options: ['Wzorowo — szybko i bez spiny', 'W porządku', 'Bywa opór / przeciąganie', 'Słabo — trzeba się upominać', 'Nie miałem(am) reklamacji'],
      }),
      field('dr_oferta', 'multi_choice', 'Co było w zamówieniu? (zaznacz wszystkie)', {
        required: false,
        options: ['Druk offset', 'Druk cyfrowy', 'Oprawa / uszlachetnienie', 'Wielki format', 'Pakowanie / logistyka'],
      }),
      field('dr_plus', 'long_text', 'Co warto powtórzyć przy kolejnym zleceniu?', { required: false }),
      field('dr_minus', 'long_text', 'Co poszło nie tak i jak to naprawić?', { required: false }),
      field('dr_polece', 'yes_no', 'Czy zlecisz tej drukarni kolejne prace?'),
    ],
  },
  {
    id: 'tpl_wspolpraca_firma',
    title: 'Ocena współpracy z firmą',
    blurb: 'Ocena całego kontrahenta / partnera B2B — nie jednego pracownika.',
    subject: 'company',
    subjectLabel: 'Cała firma / kontrahent',
    engine: 'generic',
    description: 'Ocena współpracy z inną firmą jako całością (jakość obsługi, terminy, rozliczenia), a nie z jedną osobą z zespołu.',
    fields: [
      field('wf_firma', 'short_text', 'Jaką firmę oceniasz? (nazwa kontrahenta)', { help: 'To ocena organizacji, nie pojedynczego pracownika.' }),
      field('wf_jakosc', 'scale', 'Jak oceniasz jakość tego, co firma dostarcza (usługa / towar / efekt)?'),
      field('wf_termin', 'scale', 'Jak oceniasz punktualność i dotrzymywanie umów?'),
      field('wf_kontakt', 'scale', 'Jak oceniasz komunikację firmy jako całości (nie jednej osoby)?'),
      field('wf_rozliczenia', 'single_choice', 'Jak wyglądają rozliczenia, oferty i papiery?', {
        options: ['Przejrzyście i terminowo', 'W porządku, drobne potknięcia', 'Często trzeba dopominać się dokumentów', 'Chaotycznie / nieufnie'],
      }),
      field('wf_plus', 'long_text', 'Co w tej współpracy firmowej warto zostawić?', { required: false }),
      field('wf_minus', 'long_text', 'Co firma jako całość powinna zmienić?', { required: false }),
      field('wf_dalej', 'yes_no', 'Czy kontynuował(a)byś współpracę z tą firmą?'),
    ],
  },
];

export function templateToDraft(template: SurveyTemplate, title: string, description?: string): Partial<ManagedSurvey> {
  return {
    title: title.trim(),
    description: (description && description.trim()) || template.description,
    engine: template.engine,
    status: 'draft',
    fields: template.fields.map((f) => ({ ...f, options: f.options ? [...f.options] : undefined })),
    questions: template.questions ? cloneQuestions(template.questions) : [],
    sourceTemplateId: template.id,
    subject: template.subject,
    archived: false,
  };
}
