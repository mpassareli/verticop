// Edital Verticalizado — Agente de Polícia Judiciária e Papiloscopista Policial — PCPR 2026
// Estrutura: grupos > temas > itens
// Cada item vira uma linha de estudo com 4 marcações (estudei, rev1, rev2, rev3) + contador de questões

function buildSyllabus() {
  const groups = [
    {
      id: "gerais",
      label: "Conhecimentos Gerais",
      topics: [
        {
          id: "lp",
          name: "Língua Portuguesa",
          items: [
            "Interpretação e compreensão de texto.",
            "Organização estrutural dos textos.",
            "Marcas de textualidade: coesão, coerência e intertextualidade.",
            "Modos de organização discursiva: descrição, narração, exposição, argumentação e injunção; características específicas de cada modo.",
            "Tipos textuais: informativo, publicitário, propagandístico, normativo, didático e divinatório; características específicas de cada tipo.",
            "Textos literários e não literários.",
            "Tipologia da frase portuguesa.",
            "Estrutura da frase portuguesa: operações de deslocamento, substituição, modificação e correção.",
            "Problemas estruturais das frases.",
            "Norma culta.",
            "Pontuação e sinais gráficos.",
            "Organização sintática das frases: termos e orações.",
            "Ordem direta e inversa.",
            "Tipos de discurso.",
            "Registros de linguagem.",
            "Funções da linguagem.",
            "Elementos dos atos de comunicação.",
            "Estrutura e formação de palavras.",
            "Formas de abreviação.",
            "Classes de palavras; aspectos morfológicos, sintáticos, semânticos e textuais de substantivos, adjetivos, artigos, numerais, pronomes, verbos, advérbios, conjunções e interjeições; modalizadores.",
            "Semântica: sentido próprio e figurado; antônimos, sinônimos, parônimos e hiperônimos.",
            "Polissemia e ambiguidade.",
            "Os dicionários: tipos e organização de verbetes.",
            "Vocabulário: neologismos, arcaísmos, estrangeirismos e latinismos.",
            "Ortografia e acentuação gráfica.",
            "A crase."
          ]
        },
        {
          id: "rlm",
          name: "Raciocínio Lógico-Matemático",
          items: [
            "Lógica: proposições, conectivos, equivalências lógicas, quantificadores e predicados.",
            "Conjuntos e suas operações; diagramas.",
            "Números inteiros, racionais e reais; operações; porcentagem; juros.",
            "Proporcionalidade direta e inversa.",
            "Medidas de comprimento, área, volume, massa e tempo.",
            "Estrutura lógica de relações arbitrárias entre pessoas, lugares, objetos ou eventos fictícios; dedução de informações e avaliação de condições.",
            "Compreensão e análise lógica de situações: raciocínio verbal, matemático e sequencial; orientação espacial e temporal; formação de conceitos; discriminação de elementos.",
            "Interpretação de dados apresentados em gráficos e tabelas.",
            "Raciocínio lógico envolvendo problemas aritméticos, geométricos e matriciais.",
            "Problemas de contagem e noções de probabilidade.",
            "Geometria básica: ângulos, triângulos, polígonos, distâncias, proporcionalidade, perímetro e área.",
            "Plano cartesiano: sistema de coordenadas e distância.",
            "Problemas de lógica e raciocínio."
          ]
        },
        {
          id: "pr",
          name: "Realidade do Estado do Paraná",
          items: [
            "Aspectos históricos do Estado do Paraná: formação territorial; processos coloniais; movimentos sociais e desenvolvimento histórico.",
            "Geografia física e humana: relevo; clima; hidrografia; vegetação; população; densidade demográfica; atividades econômicas.",
            "Divisão político-administrativa: organização territorial; municípios; regiões de desenvolvimento.",
            "Cultura paranaense: manifestações culturais; patrimônio material e imaterial; festas populares; artes; literatura; música; tradições.",
            "Indicadores sociais e econômicos: IDH; segurança pública; saúde; educação; mobilidade; desenvolvimento regional.",
            "Estrutura do governo estadual; políticas públicas; programas sociais; desafios contemporâneos.",
            "Temas atuais do Estado do Paraná: segurança pública; economia; meio ambiente; inclusão social; sustentabilidade."
          ]
        }
      ]
    },
    {
      id: "especificos",
      label: "Conhecimentos Específicos",
      topics: [
        {
          id: "tec",
          name: "Tecnologia, Segurança Cibernética e Crimes Digitais",
          items: [
            "Fundamentos de informática: hardware, software, periféricos, dispositivos móveis, armazenamento de dados, backup, BIOS, UEFI, drivers e firmware.",
            "Sistemas operacionais e aplicativos: Windows 11(BR); Android; iOS; Microsoft 365 (BR); LibreOffice/BrOffice; Google Workspace; instalação, atualização, configuração e segurança.",
            "Internet, redes e tecnologias digitais: navegadores; e-mail; nuvem; compartilhamento de arquivos; redes; IP; DNS; VPN; firewall; cookies; cache; metadados; noções de HTML, CSS, JavaScript, bancos de dados e APIs.",
            "Segurança da informação e cibernética: confidencialidade, integridade, disponibilidade, autenticidade, rastreabilidade; controle de acesso; criptografia; malware; ransomware; phishing; engenharia social; proteção de dados.",
            "Crimes cibernéticos, investigação digital e evidências eletrônicas: fraudes eletrônicas; invasão de dispositivos; cadeia de custódia digital; inteligência cibernética; OSINT.",
            "Legislação e ética digital: Marco Civil da Internet (Lei 12.965/2014); LGPD (Lei 13.709/2018); Lei dos Crimes Informáticos (Lei 12.737/2012); Lei 14.155/2021; sigilo funcional."
          ]
        },
        {
          id: "forense",
          name: "Ciências Forenses",
          items: [
            "Medicina Legal: perícia médico-legal; antropologia forense; identificação humana; papiloscopia; odontologia legal; DNA; reconhecimento facial; IA aplicada à perícia; sexologia, traumatologia, asfixiologia, balística, tanatologia, toxicologia e psicopatologia forenses.",
            "Criminalística e Documentoscopia: vestígios, indícios e evidências; local de crime; cadeia de custódia; grafoscopia; análise documental e de assinaturas; falsificações.",
            "Criminologia e Vitimologia: escolas criminológicas; criminologia crítica; vitimologia; controle social; prevenção do delito; perfil criminal.",
            "Criminologia Digital e Investigação Tecnológica: perfil do criminoso cibernético; deep web; dark web; vitimização digital; evidências eletrônicas; OSINT."
          ]
        },
        {
          id: "contab",
          name: "Contabilidade Geral",
          items: [
            "Teoria e princípios básicos da contabilidade.",
            "Patrimônio, contas e escrituração contábil.",
            "Operações comerciais e bancárias; estoques; tributos sobre compras e vendas; folha de pagamento; provisões.",
            "Demonstrações contábeis e análise das demonstrações contábeis.",
            "Custos: conceitos e classificações.",
            "Sistemas de informações contábeis (SIC).",
            "Normas do CPC, do CFC e legislação societária aplicável.",
            "Noções de análise financeira, controle patrimonial e identificação de irregularidades, fraudes e ocultação patrimonial."
          ]
        },
        {
          id: "estat",
          name: "Estatística",
          items: [
            "Conceitos básicos de estatística e estatística descritiva.",
            "Organização, interpretação e apresentação de dados; tabelas e gráficos.",
            "Variáveis qualitativas e quantitativas; média, mediana, moda e medidas de dispersão.",
            "Porcentagem, probabilidade básica e noções de amostragem.",
            "Leitura e interpretação de indicadores estatísticos.",
            "Identificação de padrões, inconsistências e anomalias em dados estatísticos.",
            "Métodos de detecção de outliers.",
            "Aplicação da estatística na análise de informações e indicadores de criminalidade."
          ]
        },
        {
          id: "legest",
          name: "Legislação Estadual e Institucional",
          items: [
            "Constituição do Estado do Paraná: Administração Pública, servidores, segurança pública e Polícia Civil.",
            "Estruturação das carreiras da Polícia Civil do PR: Lei Complementar Estadual n.º 259/2023 e alterações.",
            "Lei Orgânica Nacional das Polícias Civis: Lei Federal n.º 14.735/2023.",
            "Lei Orgânica da Polícia Civil do Estado do Paraná: Lei Estadual n.º 23.213/2026.",
            "Código Disciplinar da Polícia Civil do Paraná: Lei Estadual n.º 21.894/2024.",
            "Regime jurídico dos servidores públicos do PR: Lei Estadual n.º 6.174/1970; direitos, deveres, PAD, responsabilidades, sigilo funcional.",
            "Legislação aplicada à atividade institucional: Abuso de Autoridade (13.869/2019); Identificação Criminal (12.037/2009); LGPD (13.709/2018); Acesso à Informação (12.527/2011)."
          ]
        },
        {
          id: "penal",
          name: "Direito Penal e Legislação Penal Extravagante",
          items: [
            "Direito Penal: princípios; lei penal no tempo e espaço; teoria do crime; dolo e culpa; ilicitude; culpabilidade; concurso de crimes/pessoas; penas; extinção da punibilidade; crimes em espécie.",
            "Direito Processual Penal aplicado: inquérito policial, indiciamento, provas, cadeia de custódia, prisões e medidas cautelares.",
            "Legislação Penal Extravagante: LEP; Crimes Hediondos; Crimes contra Ordem Tributária; Interceptação Telefônica; CTB; Estatuto do Desarmamento; Maria da Penha; Lei de Drogas; Organizações Criminosas; Abuso de Autoridade; Pacote Anticrime; Estatuto da OAB (aspectos penais)."
          ]
        },
        {
          id: "procpenal",
          name: "Direito Processual Penal e Legislação Processual Extravagante",
          items: [
            "Direito Processual Penal: princípios; persecução penal; inquérito; ação penal; provas; cadeia de custódia; prisões; medidas cautelares; juiz das garantias; ANPP.",
            "Legislação Processual Extravagante: Interceptação Telefônica; Lavagem de Dinheiro; Estatuto do Desarmamento; Maria da Penha; Lei de Drogas; Organizações Criminosas; Abuso de Autoridade; Pacote Anticrime; Crimes Hediondos; Marco Legal do Combate ao Crime Organizado (Lei 15.358/2026); Estatuto da OAB (aspectos processuais)."
          ]
        },
        {
          id: "constit",
          name: "Direito Constitucional",
          items: [
            "Princípios fundamentais da CF/1988.",
            "Direitos e garantias fundamentais: individuais, coletivos, sociais; nacionalidade; direitos políticos; devido processo legal; inviolabilidade de domicílio.",
            "Remédios constitucionais: habeas corpus; habeas data; mandado de segurança; mandado de injunção; ação popular.",
            "Organização do Estado: União, Estados, Municípios, DF; competências.",
            "Poderes da União: Executivo, Legislativo e Judiciário.",
            "Segurança pública na CF: art. 144; organização e atribuições das polícias; polícia judiciária.",
            "Controle de constitucionalidade: ADI e ADC.",
            "Constituição do Estado do Paraná: Administração Pública, servidores, segurança pública e Polícia Civil."
          ]
        },
        {
          id: "admin",
          name: "Direito Administrativo",
          items: [
            "Conceito, fontes e princípios do Direito Administrativo; LINDB aplicável.",
            "Administração Pública: direta e indireta; autarquias, fundações, empresas públicas e sociedades de economia mista.",
            "Atos administrativos: requisitos, atributos, classificação, revogação, invalidação e convalidação.",
            "Poderes administrativos: hierárquico, disciplinar, regulamentar e de polícia; abuso de poder.",
            "Serviços públicos: conceito, características e formas de prestação.",
            "Licitações e contratos administrativos: Lei n.º 14.133/2021.",
            "Agentes públicos: cargos, empregos, investidura, direitos, deveres e PAD.",
            "Responsabilidade civil do Estado: teoria do risco administrativo; causas excludentes.",
            "Improbidade administrativa: Lei n.º 8.429/1992 e alterações.",
            "Controle da Administração Pública: administrativo, judicial e legislativo; autotutela."
          ]
        },
        {
          id: "dh",
          name: "Direitos Humanos",
          items: [
            "Teoria Geral dos Direitos Humanos: conceito, características, princípios e evolução histórica.",
            "Sistemas de proteção: sistema global e interamericano; tratados internacionais; CF/1988 e Direitos Humanos.",
            "Democracia, cidadania e Direitos Humanos.",
            "Direitos Humanos e grupos vulneráveis: mulheres, idosos, crianças e adolescentes, povos indígenas, PCD, LGBTQIA+ e refugiados.",
            "Segurança pública e Direitos Humanos: dignidade da pessoa humana; uso proporcional da força; prevenção da tortura; atuação policial.",
            "Política Nacional de Direitos Humanos e educação em Direitos Humanos.",
            "Agenda 2030 e Objetivos de Desenvolvimento Sustentável (ODS)."
          ]
        }
      ]
    }
  ];

  // Gera códigos e ids únicos automaticamente (ex: "gerais-lp-1", "gerais-lp-2"...)
  groups.forEach(group => {
    group.topics.forEach(topic => {
      topic.items = topic.items.map((text, idx) => ({
        id: `${topic.id}-${idx + 1}`,
        code: `${idx + 1}`,
        text
      }));
    });
  });

  return groups;
}

const SYLLABUS = buildSyllabus();
const EXAM_DATE = "2026-12-20T08:00:00-03:00";
