// Edit this list to add your work. Put images in public/work/ and reference them as 'work/name.jpg'.
// slug: opens the detail page (src/detail/details.js) · image: optional (soft placeholder without one) · link: external URL fallback
const img = (name) => `${import.meta.env.BASE_URL}work/${name}`

export const projects = [
  {
    title: '차세대 통합포털시스템',
    description: '더 스마트한 업무 환경을 위한 통합 포털 서비스. 근태·일정·결재·공지와 AI 요약을 하나의 대시보드로 통합했습니다.',
    category: 'Public Service',
    tags: ['UI/UX Design', 'Ai', '제안시안'],
    slug: 'portal',
    image: img('project-portal.jpg'),
    link: '',
  },
  {
    title: 'LMO 정보시스템',
    description: '안전한 바이오, 더 나은 미래를 위한 LMO 통합 플랫폼. 흩어진 안전관리 서비스를 하나의 포털로 모았습니다.',
    category: 'Government',
    tags: ['UI/UX Design', 'Ai', '제안시안'],
    slug: 'lmo',
    image: img('project-lmo.jpg'),
    link: '',
  },
  {
    title: '탄소관리 · 거래 플랫폼',
    description: '지속 가능한 탄소중립을 위한 통합 관리 시스템. 에너지·배출량·발전량 데이터를 하나의 대시보드에서 관리합니다.',
    category: 'Energy Platform',
    tags: ['UI/UX Design', 'Data Viz', '오픈 준비 중'],
    slug: 'carbon',
    image: img('project-carbon.png'),
    link: '',
  },
  {
    title: 'ENERUSE 에너지 관리 플랫폼',
    description: '기업의 RE100 이행을 위한 에너지 관리 서비스. 전력 사용량과 재생에너지 이행 수단, REC 보유 현황을 한 대시보드에서 관리합니다.',
    category: 'Energy Platform',
    tags: ['UI/UX Design', 'Data Viz', 'RE100'],
    slug: 'eneruse',
    image: img('project-eneruse.png'),
    link: '',
  },
  {
    title: 'RE100 통합운영플랫폼',
    description: '산단의 재생에너지 전환을 위한 통합 운영 플랫폼. 전력·신재생·온실가스 현황과 산단별 RE 수준을 지도 기반 대시보드로 보여줍니다.',
    category: 'Energy Platform',
    tags: ['UI/UX Design', 'Data Viz', '오픈 준비 중'],
    slug: 're100',
    image: img('project-re100-light.png'),
    link: '',
  },
  {
    title: '제주 태양광 통합 모니터링 플랫폼',
    description: '지속 가능한 에너지를 위한 스마트 모니터링. 제주 전역의 태양광 설비와 발전량을 지도 기반으로 확인합니다.',
    category: 'Smart City',
    tags: ['UI/UX Design', 'Data Viz', '오픈 준비 중'],
    slug: 'solar',
    image: img('project-solar.png'),
    link: '',
  },
]
