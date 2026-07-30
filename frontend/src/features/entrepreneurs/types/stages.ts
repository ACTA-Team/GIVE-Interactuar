export interface Stage {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
  credentialHash?: string;
}

export interface DashboardEntrepreneur {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  businessName: string;
  businessType: string;
  currentStage: number;
  stages: {
    stageId: number;
    completedAt: string;
    certifiedBy: string;
    credentialHash: string;
  }[];
  badges: BadgeData[];
  hasFunding: boolean;
  fundingAmount?: number;
  fundingDate?: string;
  isDelinquent: boolean;
  delinquentDays?: number;
  createdAt: string;
  advisorId: string;
  program?: string;
  partner?: string;
  municipality?: string;
  level?: string;
  mbaEligible?: boolean;
}

export const STAGES: Stage[] = [
  {
    id: 0,
    name: 'Registro',
    description: 'Empresario registrado en el sistema',
    icon: 'UserPlus',
  },
  {
    id: 1,
    name: 'Formación Básica',
    description: 'Completó cursos de fundamentos empresariales',
    icon: 'BookOpen',
  },
  {
    id: 2,
    name: 'Plan de Negocio',
    description: 'Presentó y aprobó su plan de negocio',
    icon: 'FileText',
  },
  {
    id: 3,
    name: 'Capacitación Financiera',
    description: 'Completó módulos de educación financiera',
    icon: 'Calculator',
  },
  {
    id: 4,
    name: 'Apto para Financiamiento',
    description: 'Cumple requisitos para recibir microcrédito',
    icon: 'CheckCircle',
  },
  {
    id: 5,
    name: 'Financiado',
    description: 'Recibió financiamiento activo',
    icon: 'Banknote',
  },
];

export const AVAILABLE_BADGES: BadgeData[] = [
  {
    id: 'punctual',
    name: 'Pago Puntual',
    description: 'Nunca ha tenido retrasos en pagos',
    icon: 'Clock',
  },
  {
    id: 'growth',
    name: 'Negocio en Crecimiento',
    description: 'Demostró crecimiento sostenido',
    icon: 'TrendingUp',
  },
  {
    id: 'community',
    name: 'Líder Comunitario',
    description: 'Participa activamente en la comunidad',
    icon: 'Users',
  },
  {
    id: 'training',
    name: 'Formación Completa',
    description: 'Completó todos los cursos disponibles',
    icon: 'GraduationCap',
  },
  {
    id: 'innovation',
    name: 'Innovador',
    description: 'Implementó prácticas innovadoras',
    icon: 'Lightbulb',
  },
  {
    id: 'sustainable',
    name: 'Sostenible',
    description: 'Prácticas ambientalmente responsables',
    icon: 'Leaf',
  },
];

export const BUSINESS_TYPES = [
  'Alimentos',
  'Confecciones',
  'Comercio',
  'Servicios',
  'Transporte',
  'Belleza',
  'Tecnología',
  'Manufactura',
  'Servicios Automotrices',
  'Otro',
];
