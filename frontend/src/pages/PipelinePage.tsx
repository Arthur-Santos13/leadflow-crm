import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, MoveRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { Select } from '../components/ui/Form';
import { listDeals, createDeal, updateDealStage, deleteDeal } from '../services/deals.service';
import type { Deal } from '../types';

type Stage = Deal['stage'];

const STAGES: { key: Stage; label: string; color: string }[] = [
    { key: 'PROSPECTING', label: 'Prospecting', color: 'border-t-blue-400' },
    { key: 'PROPOSAL', label: 'Proposal', color: 'border-t-yellow-400' },
    { key: 'NEGOTIATION', label: 'Negotiation', color: 'border-t-orange-400' },
    { key: 'CLOSED_WON', label: 'Closed Won', color: 'border-t-green-500' },
    { key: 'CLOSED_LOST', label: 'Closed Lost', color: 'border-t-gray-400' },
];

const STAGE_OPTIONS = STAGES.map(s => ({ value: s.key, label: s.label }));

const NEXT_STAGE: Partial<Record<Stage, Stage>> = {
    PROSPECTING: 'PROPOSAL',
    PROPOSAL: 'NEGOTIATION',
    NEGOTIATION: 'CLOSED_WON',
};

const EMPTY_FORM = { title: '', customerId: '', stage: 'PROSPECTING' as Stage, value: '', expectedAt: '' };

export default function PipelinePage() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [deleteTarget, setDeleteTarget] = useState<Deal | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [movingId, setMovingId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await listDeals({ perPage: 100 });
            setDeals(res.data ?? []);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const byStage = (stage: Stage) => deals.filter(d => d.stage === stage);

    const handleMove = async (deal: Deal) => {
        const next = NEXT_STAGE[deal.stage];
        if (!next) return;
        setMovingId(deal.id);
        try {
            await updateDealStage(deal.id, next);
            load();
        } finally {
            setMovingId(null);
        }
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.title.trim()) e.title = 'Title is required.';
        if (!form.customerId.trim()) e.customerId = 'Customer ID is required.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleCreate = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            await createDeal({
                title: form.title,
                customerId: form.customerId,
                stage: form.stage,
                value: form.value ? parseFloat(form.value) : undefined,
                expectedAt: form.expectedAt || undefined,
            });
            setModalOpen(false);
            setForm(EMPTY_FORM);
            load();
        } catch {
            setErrors({ title: 'Failed to create deal.' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await deleteDeal(deleteTarget.id);
            setDeleteTarget(null);
            load();
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Pipeline</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Visualize deals across stages.</p>
                </div>
                <Button onClick={() => { setForm(EMPTY_FORM); setErrors({}); setModalOpen(true); }}>
                    <Plus size={16} /> New deal
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <span className="w-6 h-6 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
                    {STAGES.map(({ key, label, color }) => (
                        <div key={key} className={`rounded-2xl border-t-[3px] ${color} bg-white dark:bg-[#1F1F1F] border border-gray-100 dark:border-[#2A2A2A] flex flex-col`}>
                            {/* Column header */}
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-[#2A2A2A] flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#2A2A2A] px-2 py-0.5 rounded-full">
                                    {byStage(key).length}
                                </span>
                            </div>

                            {/* Cards */}
                            <div className="p-2 space-y-2 min-h-[120px]">
                                {byStage(key).map(deal => (
                                    <div key={deal.id} className="bg-gray-50 dark:bg-[#141414] rounded-xl p-3 space-y-2 border border-gray-100 dark:border-[#2A2A2A]">
                                        <p className="text-sm font-medium text-gray-800 dark:text-white leading-snug">{deal.title}</p>
                                        {deal.customer && (
                                            <p className="text-xs text-gray-400 dark:text-gray-600 truncate">{deal.customer.name}</p>
                                        )}
                                        {deal.value != null && (
                                            <p className="text-xs font-semibold text-[#E50914]">
                                                {Number(deal.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-1 pt-0.5">
                                            {NEXT_STAGE[key] && (
                                                <Button
                                                    variant="ghost" size="sm"
                                                    onClick={() => handleMove(deal)}
                                                    loading={movingId === deal.id}
                                                    title={`Move to ${NEXT_STAGE[key]}`}
                                                >
                                                    <MoveRight size={13} />
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(deal)} aria-label="Delete">
                                                <Trash2 size={13} className="text-[#E50914]" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {byStage(key).length === 0 && (
                                    <p className="text-xs text-gray-300 dark:text-gray-700 text-center py-4">Empty</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create deal */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="New deal"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} loading={saving}>Create</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Input label="Title" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} error={errors.title} placeholder="Enterprise contract" />
                    <Input label="Customer ID" required value={form.customerId} onChange={e => setForm(p => ({ ...p, customerId: e.target.value }))} error={errors.customerId} placeholder="UUID of the customer" />
                    <Select label="Stage" value={form.stage} onChange={e => setForm(p => ({ ...p, stage: e.target.value as Stage }))} options={STAGE_OPTIONS} />
                    <Input label="Value (R$)" type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder="0.00" />
                    <Input label="Expected close date" type="date" value={form.expectedAt} onChange={e => setForm(p => ({ ...p, expectedAt: e.target.value }))} />
                </div>
            </Modal>

            {/* Confirm delete */}
            <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete deal" size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button loading={deleting} onClick={handleDelete}>Delete</Button>
                    </>
                }
            >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Delete <strong className="text-gray-900 dark:text-white">{deleteTarget?.title}</strong>? This cannot be undone.
                </p>
            </Modal>
        </div>
    );
}
