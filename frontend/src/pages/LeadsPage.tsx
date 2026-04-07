import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { Select, FormField, Textarea, Pagination } from '../components/ui/Form';
import { listLeads, createLead, updateLead, updateLeadStatus, deleteLead } from '../services/leads.service';
import type { Lead } from '../types';

const STATUS_OPTIONS = [
    { value: 'NEW', label: 'New' },
    { value: 'CONTACTED', label: 'Contacted' },
    { value: 'QUALIFIED', label: 'Qualified' },
    { value: 'UNQUALIFIED', label: 'Unqualified' },
    { value: 'CONVERTED', label: 'Converted' },
];

const STATUS_COLORS: Record<Lead['status'], string> = {
    NEW: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    CONTACTED: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    QUALIFIED: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    UNQUALIFIED: 'bg-gray-100 dark:bg-[#2A2A2A] text-gray-500 dark:text-gray-400',
    CONVERTED: 'bg-red-50 dark:bg-[#2A0A0A] text-[#E50914]',
};

const EMPTY = { title: '', customerId: '', status: 'NEW' as Lead['status'], source: '', notes: '' };

export default function LeadsPage() {
    const [data, setData] = useState<Lead[]>([]);
    const [meta, setMeta] = useState({ totalPages: 1, page: 1 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<Lead['status'] | ''>('');
    const [page, setPage] = useState(1);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Lead | null>(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [statusModal, setStatusModal] = useState<{ lead: Lead; status: Lead['status'] } | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
    const [deleting, setDeleting] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await listLeads({
                page,
                perPage: 15,
                search: search || undefined,
                status: filterStatus || undefined,
            });
            setData(res.data ?? []);
            setMeta({ totalPages: res.meta.totalPages, page: res.meta.page });
        } finally {
            setLoading(false);
        }
    }, [page, search, filterStatus]);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => { setEditing(null); setForm(EMPTY); setErrors({}); setModalOpen(true); };
    const openEdit = (l: Lead) => {
        setEditing(l);
        setForm({ title: l.title, customerId: l.customerId, status: l.status, source: l.source ?? '', notes: l.notes ?? '' });
        setErrors({});
        setModalOpen(true);
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.title.trim()) e.title = 'Title is required.';
        if (!form.customerId.trim()) e.customerId = 'Customer ID is required.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            if (editing) {
                await updateLead(editing.id, { title: form.title, source: form.source || undefined, notes: form.notes || undefined });
            } else {
                await createLead({ title: form.title, customerId: form.customerId, status: form.status, source: form.source || undefined, notes: form.notes || undefined });
            }
            setModalOpen(false);
            load();
        } catch {
            setErrors({ title: 'Failed to save. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!statusModal) return;
        setUpdatingStatus(true);
        try {
            await updateLeadStatus(statusModal.lead.id, statusModal.status);
            setStatusModal(null);
            load();
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await deleteLead(deleteTarget.id);
            setDeleteTarget(null);
            load();
        } finally {
            setDeleting(false);
        }
    };

    const columns = [
        { key: 'title', header: 'Title' },
        {
            key: 'customer', header: 'Customer',
            render: (r: Lead) => r.customer?.name ?? '—',
        },
        { key: 'source', header: 'Source', render: (r: Lead) => r.source ?? '—' },
        {
            key: 'status', header: 'Status',
            render: (r: Lead) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status]}`}>
                    {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                </span>
            ),
        },
        {
            key: 'actions', header: '', className: 'w-32',
            render: (r: Lead) => (
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setStatusModal({ lead: r, status: r.status })} title="Update status">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Status</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(r)} aria-label="Edit">
                        <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(r)} aria-label="Delete">
                        <Trash2 size={14} className="text-[#E50914]" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Leads</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track and qualify your leads.</p>
                </div>
                <Button onClick={openCreate}><Plus size={16} /> New lead</Button>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search leads..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#141414] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-transparent"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={e => { setFilterStatus(e.target.value as Lead['status'] | ''); setPage(1); }}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#141414] text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-transparent"
                >
                    <option value="">All statuses</option>
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>

            <Table columns={columns} data={data} loading={loading} emptyMessage="No leads found." />
            <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />

            {/* Create / Edit */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? 'Edit lead' : 'New lead'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} loading={saving}>{editing ? 'Save changes' : 'Create'}</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Input label="Title" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} error={errors.title} placeholder="Enterprise deal" />
                    {!editing && (
                        <Input label="Customer ID" required value={form.customerId} onChange={e => setForm(p => ({ ...p, customerId: e.target.value }))} error={errors.customerId} placeholder="UUID of the customer" />
                    )}
                    <Input label="Source" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))} placeholder="LinkedIn, referral..." />
                    <FormField label="Notes">
                        <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any relevant notes..." />
                    </FormField>
                </div>
            </Modal>

            {/* Update status */}
            <Modal
                open={!!statusModal}
                onClose={() => setStatusModal(null)}
                title="Update lead status"
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setStatusModal(null)}>Cancel</Button>
                        <Button onClick={handleStatusUpdate} loading={updatingStatus}>Update</Button>
                    </>
                }
            >
                {statusModal && (
                    <Select
                        label="Status"
                        value={statusModal.status}
                        onChange={e => setStatusModal(p => p ? { ...p, status: e.target.value as Lead['status'] } : p)}
                        options={STATUS_OPTIONS}
                    />
                )}
            </Modal>

            {/* Confirm delete */}
            <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete lead" size="sm"
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
