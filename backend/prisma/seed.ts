import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole, LeadStatus, DealStage, InteractionType } from '@prisma/client';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

// -- Users --------------------------------------------------------------------
const users = [
    { name: 'Alice Johnson',   email: 'alice@leadflow.com', password: 'password123', role: UserRole.ADMIN },
    { name: 'Bob Smith',       email: 'bob@leadflow.com',   password: 'password123', role: UserRole.AGENT },
    { name: 'Carol Martinez',  email: 'carol@leadflow.com', password: 'password123', role: UserRole.AGENT },
    { name: 'David Lee',       email: 'david@leadflow.com', password: 'password123', role: UserRole.AGENT },
    { name: 'Eva Chen',        email: 'eva@leadflow.com',   password: 'password123', role: UserRole.AGENT },
];

// -- Customers ----------------------------------------------------------------
const customersData = [
    { name: 'Grupo Nexus Tecnologia',  email: 'contato@nexustech.com.br',         phone: '(11) 3210-4500', company: 'Nexus Tecnologia Ltda',  notes: 'Grande cliente enterprise. Interesse em modulo de BI.' },
    { name: 'Marina Oliveira',         email: 'marina@construtoraaplha.com.br',    phone: '(21) 9 8765-4321', company: 'Construtora Aplha',    notes: 'Responsavel pelas compras de software da construtora.' },
    { name: 'TechBridge Solucoes',     email: 'vendas@techbridge.io',              phone: '(11) 4002-8922', company: 'TechBridge Solucoes',    notes: 'Parceiro de revenda. Contrato anual.' },
    { name: 'Rafael Carvalho',         email: 'rafael.carvalho@logisticaxp.com',   phone: '(31) 3344-5566', company: 'LogisticaXP',            notes: 'Procurando solucao de rastreamento integrada ao CRM.' },
    { name: 'Smartfix Manutencao',     email: 'comercial@smartfix.com.br',         phone: '(41) 3021-7890', company: 'Smartfix',               notes: 'Empresa de manutencao industrial. 120 funcionarios.' },
    { name: 'Juliana Ferreira',        email: 'juliana@agenciacriativa.com',       phone: '(85) 9 9988-7766', company: 'Agencia Criativa',     notes: 'Agencia de marketing digital. Necessita de modulo de leads.' },
    { name: 'DataForce Analytics',     email: 'hello@dataforce.com.br',            phone: '(11) 5555-9900', company: 'DataForce',              notes: 'Startup de analytics. Plano de crescimento agressivo.' },
    { name: 'Fernanda Costa',          email: 'fercosta@rhpremium.com.br',         phone: '(51) 3033-6600', company: 'RH Premium',             notes: 'Consulta sobre integracao com sistemas de RH.' },
    { name: 'Grupo Salvo Varejo',      email: 'ti@gruposalvo.com.br',              phone: '(62) 3212-0099', company: 'Grupo Salvo',            notes: 'Rede de varejo com 15 lojas. Contato: Pedro Salvo.' },
    { name: 'InovaCode Software',      email: 'contato@inovacode.dev',             phone: '(19) 3307-8800', company: 'InovaCode',              notes: 'Software house. Interesse em white-label.' },
];

async function main() {
    // Seed users
    console.log('Seeding users...');
    for (const u of users) {
        const existing = await prisma.user.findUnique({ where: { email: u.email } });
        if (existing) { console.log('  Skipped: ' + u.email); continue; }
        const passwordHash = await bcrypt.hash(u.password, SALT_ROUNDS);
        await prisma.user.create({ data: { name: u.name, email: u.email, passwordHash, role: u.role } });
        console.log('  Created: ' + u.name + ' [' + u.role + ']');
    }

    // Seed customers, leads, deals, interactions
    const customerCount = await prisma.customer.count();
    if (customerCount > 0) {
        console.log('\nCustomers already exist - skipping CRM data.');
    } else {
        // Customers
        console.log('\nSeeding customers...');
        const customers = await Promise.all(customersData.map(c => prisma.customer.create({ data: c })));
        console.log('  Created ' + customers.length + ' customers.');

        // Leads
        console.log('\nSeeding leads...');
        const leadsData = [
            { title: 'Implantacao CRM Enterprise',          customerId: customers[0].id, status: LeadStatus.QUALIFIED,    source: 'LinkedIn',   notes: 'Orcamento solicitado. Reuniao marcada para proxima semana.' },
            { title: 'Migracao de dados legados',           customerId: customers[0].id, status: LeadStatus.CONTACTED,   source: 'Indicacao',  notes: 'Precisa de consultoria para migrar ERP antigo.' },
            { title: 'Sistema de gestao de obras',          customerId: customers[1].id, status: LeadStatus.NEW,          source: 'Website',    notes: 'Preencheu formulario de contato. Aguardando retorno.' },
            { title: 'Plataforma de revenda SaaS',          customerId: customers[2].id, status: LeadStatus.CONVERTED,   source: 'Evento',     notes: 'Convertido! Contrato assinado em marco.' },
            { title: 'Rastreamento de frota integrado',     customerId: customers[3].id, status: LeadStatus.QUALIFIED,    source: 'Cold Call',  notes: 'Interesse confirmado em integracao com GPS.' },
            { title: 'Modulo de ordens de servico',         customerId: customers[4].id, status: LeadStatus.CONTACTED,   source: 'Email',      notes: 'Enviamos proposta inicial. Aguardando aprovacao da diretoria.' },
            { title: 'Automacao de marketing digital',      customerId: customers[5].id, status: LeadStatus.NEW,          source: 'Instagram',  notes: 'Viu anuncio. Quer demonstracao da plataforma.' },
            { title: 'Dashboard de metricas em tempo real', customerId: customers[6].id, status: LeadStatus.QUALIFIED,    source: 'LinkedIn',   notes: 'Startup com budget aprovado de R$ 80k.' },
            { title: 'Integracao ATS + CRM',                customerId: customers[7].id, status: LeadStatus.UNQUALIFIED,  source: 'Email',      notes: 'Budget insuficiente para o modulo solicitado.' },
            { title: 'Gestao de estoque multifilial',       customerId: customers[8].id, status: LeadStatus.CONTACTED,   source: 'Indicacao',  notes: 'Indicado pelo cliente TechBridge. Segunda reuniao agendada.' },
            { title: 'Marketplace white-label',             customerId: customers[9].id, status: LeadStatus.QUALIFIED,    source: 'Website',    notes: 'Escopo definido. Aguardando NDA para enviar proposta tecnica.' },
            { title: 'Consultoria de processos comerciais', customerId: customers[2].id, status: LeadStatus.NEW,          source: 'Evento',     notes: 'Interesse de expansao para novos mercados.' },
        ];
        const leads = await Promise.all(leadsData.map(l => prisma.lead.create({ data: l })));
        console.log('  Created ' + leads.length + ' leads.');

        // Deals
        console.log('\nSeeding deals...');
        const dealsData = [
            { title: 'CRM Enterprise - Nexus Tecnologia',     customerId: customers[0].id, leadId: leads[0].id, stage: DealStage.NEGOTIATION,  value: 48000, expectedAt: new Date('2026-05-30') },
            { title: 'Consultoria Migracao de Dados',         customerId: customers[0].id, leadId: leads[1].id, stage: DealStage.PROPOSAL,      value: 12500, expectedAt: new Date('2026-04-20') },
            { title: 'Sistema de Gestao de Obras',            customerId: customers[1].id,                      stage: DealStage.PROSPECTING,   value: 22000, expectedAt: new Date('2026-06-15') },
            { title: 'Contrato Revenda SaaS - TechBridge',    customerId: customers[2].id, leadId: leads[3].id, stage: DealStage.CLOSED_WON,    value: 36000, closedAt: new Date('2026-03-10') },
            { title: 'Integracao Rastreamento Frota',         customerId: customers[3].id, leadId: leads[4].id, stage: DealStage.PROPOSAL,      value: 18500, expectedAt: new Date('2026-05-10') },
            { title: 'Modulo Ordens de Servico',              customerId: customers[4].id, leadId: leads[5].id, stage: DealStage.NEGOTIATION,   value: 9800,  expectedAt: new Date('2026-04-30') },
            { title: 'Automacao Marketing Digital',           customerId: customers[5].id, leadId: leads[6].id, stage: DealStage.PROSPECTING,   value: 7200,  expectedAt: new Date('2026-07-01') },
            { title: 'Dashboard Analytics - DataForce',       customerId: customers[6].id, leadId: leads[7].id, stage: DealStage.PROPOSAL,      value: 78000, expectedAt: new Date('2026-05-20') },
            { title: 'Gestao Estoque Multifilial',            customerId: customers[8].id, leadId: leads[9].id, stage: DealStage.NEGOTIATION,   value: 54000, expectedAt: new Date('2026-05-05') },
            { title: 'Marketplace White-label - InovaCode',   customerId: customers[9].id, leadId: leads[10].id, stage: DealStage.PROPOSAL,     value: 95000, expectedAt: new Date('2026-06-30') },
            { title: 'Suporte Anual - Nexus Tecnologia',      customerId: customers[0].id,                      stage: DealStage.CLOSED_WON,    value: 15600, closedAt: new Date('2026-02-01') },
            { title: 'Licencas adicionais - TechBridge',      customerId: customers[2].id,                      stage: DealStage.PROSPECTING,   value: 8400,  expectedAt: new Date('2026-08-01') },
            { title: 'Integracao ATS + CRM',                  customerId: customers[7].id, leadId: leads[8].id, stage: DealStage.CLOSED_LOST,                closedAt: new Date('2026-03-25') },
            { title: 'Modulo BI - Grupo Salvo',               customerId: customers[8].id,                      stage: DealStage.NEGOTIATION,   value: 31000, expectedAt: new Date('2026-04-25') },
            { title: 'Consultoria Processos Comerciais',      customerId: customers[2].id, leadId: leads[11].id, stage: DealStage.PROSPECTING,  value: 6500,  expectedAt: new Date('2026-09-01') },
        ];
        const deals = await Promise.all(dealsData.map(d => prisma.deal.create({ data: d })));
        console.log('  Created ' + deals.length + ' deals.');

        // Interactions
        console.log('\nSeeding interactions...');
        const interactionsData = [
            { type: InteractionType.CALL,     customerId: customers[0].id, leadId: leads[0].id,  dealId: deals[0].id,  content: 'Ligacao de 40 min. Cliente confirmou interesse e pediu proposta detalhada com SLA de 99.9%.' },
            { type: InteractionType.EMAIL,    customerId: customers[0].id, leadId: leads[0].id,  dealId: deals[0].id,  content: 'Enviada proposta tecnica e comercial. Valor: R$ 48.000/ano. Aguardando retorno em 5 dias uteis.' },
            { type: InteractionType.MEETING,  customerId: customers[0].id, leadId: leads[1].id,  dealId: deals[1].id,  content: 'Reuniao presencial na sede do cliente. Mapeamento dos sistemas legados. Identificados 3 bancos de dados.' },
            { type: InteractionType.WHATSAPP, customerId: customers[1].id, leadId: leads[2].id,                        content: 'Primeiro contato via WhatsApp. Explicamos os modulos disponiveis. Demo agendada para 14/04.' },
            { type: InteractionType.CALL,     customerId: customers[3].id, leadId: leads[4].id,  dealId: deals[4].id,  content: 'Follow-up da proposta. Cliente pediu 10% de desconto. Escalar para o gerente comercial.' },
            { type: InteractionType.NOTE,     customerId: customers[4].id, leadId: leads[5].id,  dealId: deals[5].id,  content: 'Diretoria da Smartfix aprovou a compra. Aguardando assinatura pelo departamento juridico.' },
            { type: InteractionType.EMAIL,    customerId: customers[5].id, leadId: leads[6].id,                        content: 'Enviado material sobre automacao de campanhas e cases de sucesso no setor de agencias.' },
            { type: InteractionType.MEETING,  customerId: customers[6].id, leadId: leads[7].id,  dealId: deals[7].id,  content: 'Demo tecnica realizada. Equipe de TI aprovou a arquitetura. Proximo passo: reuniao com o CFO.' },
            { type: InteractionType.CALL,     customerId: customers[8].id, leadId: leads[9].id,  dealId: deals[8].id,  content: 'Terceira reuniao de negociacao. Definido escopo final: 15 filiais, integracao ERP Totvs.' },
            { type: InteractionType.WHATSAPP, customerId: customers[9].id, leadId: leads[10].id, dealId: deals[9].id,  content: 'CEO confirmou interesse no white-label. NDA assinado. Proposta tecnica sera enviada esta semana.' },
            { type: InteractionType.NOTE,     customerId: customers[2].id,                       dealId: deals[3].id,  content: 'Contrato de revenda assinado! Vigencia: 12 meses. Comissao de 20% em novos contratos do parceiro.' },
            { type: InteractionType.EMAIL,    customerId: customers[8].id,                       dealId: deals[13].id, content: 'Enviada apresentacao do modulo de BI com integracao nativa ao Power BI e Tableau.' },
            { type: InteractionType.CALL,     customerId: customers[7].id, leadId: leads[8].id,  dealId: deals[12].id, content: 'Cliente informou que nao seguira com o projeto. Budget cortado para 2026. Reavaliacao em 2027.' },
        ];
        await Promise.all(interactionsData.map(i => prisma.interaction.create({ data: i })));
        console.log('  Created ' + interactionsData.length + ' interactions.');
    }

    console.log('\nSeed complete!');
    console.log('Credentials (all passwords: password123):');
    users.forEach(u => console.log('  ' + u.role.padEnd(5) + ' | ' + u.email));
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());