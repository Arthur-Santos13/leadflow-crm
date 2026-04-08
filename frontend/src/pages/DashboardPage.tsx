import { useEffect, useState } from 'react';
import { Users, Target, Kanban, TrendingUp, TrendingDown } from 'lucide-react';
import { listCustomers } from '../services/customers.service';
import { listLeads } from '../services/leads.service';
import { listDeals } from '../services/deals.service';
import type { Lead, Deal } from '../types';

interface KpiCardProps {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    sub?: string;
}

function KpiCard({ label, value, icon, sub }: KpiCardProps) {
    return (
        <div className="bg-white dark:bg-[#1F1F1F] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] p-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-[#2A0A0A] flex items-center justify-center text-[#E50914] shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
                {sub && <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

const LEAD_STATUS_LABEL: Record<Lead['status'], string> = {
    NEW: 'New', CONTACTED: 'Contacted', QUALIFIED: 'Qualified',
    UNQUALIFIED: 'Unqualified', CONVERTED: 'Converted',
};

const STAGE_LABEL: Record<Deal['stage'], string> = {
    PROSPECTING: 'Prospecting', PROPOSAL: 'Proposal', NEGOTIATION: 'Negotiation',
    CLOSED_WON: 'Closed Won', CLOSED_LOST: 'Closed Lost',
};

export default function DashboardPage() {
    const [stats, setStats] = useState({ customers: 0, leads: 0, openDeals: 0, revenue: 0 });
    const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
    const [recentDeals, setRecentDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [cRes, lRes, dRes] = await Promise.all([
                    listCustomers({ perPage: 1 }),
                    listLeads({ perPage: 5, order: 'desc', sortBy: 'createdAt' }),
                    listDeals({ perPage: 100, sortBy: 'updatedAt', order: 'desc' }),
                ]);

                const allDeals = dRes.data ?? [];
                const openDeals = allDeals.filter(d => d.stage !== 'CLOSED_LOST');
                const won = allDeals.filter(d => d.stage === 'CLOSED_WON').reduce((acc, d) => acc + (d.value ? Number(d.value) : 0), 0);
                const lost = allDeals.filter(d => d.stage === 'CLOSED_LOST').reduce((acc, d) => acc + (d.value ? Number(d.value) : 0), 0);
                const revenue = won - lost;

                setStats({
                    customers: cRes.meta.total,
                    leads: lRes.meta.total,
                    openDeals: openDeals.length,
                    revenue,
                });
                setRecentLeads(lRes.data?.slice(0, 5) ?? []);
                setRecentDeals(allDeals.slice(0, 5));
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <span className="w-6 h-6 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Overview of your CRM activity.</p>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard label="Customers" value={stats.customers} icon={<Users size={20} />} />
                <KpiCard label="Leads" value={stats.leads} icon={<Target size={20} />} />
                <KpiCard label="Open Deals" value={stats.openDeals} icon={<Kanban size={20} />} />
                <KpiCard
                    label="Revenue"
                    value={stats.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    icon={stats.revenue >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                />
            </div>

            {/* Recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent leads */}
                <div className="bg-white dark:bg-[#1F1F1F] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] p-5">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Recent Leads</h3>
                    {recentLeads.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-gray-600">No leads yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {recentLeads.map(lead => (
                                <li key={lead.id} className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{lead.title}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-600 truncate">{lead.customer?.name ?? lead.customerId}</p>
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">
                                        {LEAD_STATUS_LABEL[lead.status]}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Recent deals */}
                <div className="bg-white dark:bg-[#1F1F1F] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] p-5">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Recent Deals</h3>
                    {recentDeals.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-gray-600">No deals yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {recentDeals.map(deal => (
                                <li key={deal.id} className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className={`text-sm truncate ${deal.stage === 'CLOSED_WON'
                                                ? 'font-bold text-green-600 dark:text-green-400'
                                                : deal.stage === 'CLOSED_LOST'
                                                    ? 'font-medium text-gray-400 dark:text-gray-500 line-through'
                                                    : 'font-medium text-gray-800 dark:text-white'
                                            }`}>{deal.title}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-600 truncate">{deal.customer?.name ?? deal.customerId}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{STAGE_LABEL[deal.stage]}</p>
                                        {deal.value != null && (
                                            <p className="text-xs font-semibold text-[#E50914]">
                                                {Number(deal.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
