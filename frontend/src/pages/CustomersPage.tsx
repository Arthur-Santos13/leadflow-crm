import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { FormField, Textarea, Pagination } from '../components/ui/Form';
import {
    listCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
} from '../services/customers.service';
import type { Customer } from '../types';

const EMPTY: Partial<Customer> = { name: '', email: '', phone: '', company: '', notes: '' };

export default function CustomersPage() {
    const [data, setData] = useState<Customer[]>([]);
    const [meta, setMeta] = useState({ totalPages: 1, page: 1 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Customer | null>(null);
    const [form, setForm] = useState<Partial<Customer>>(EMPTY);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
    const [deleting, setDeleting] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await listCustomers({ page, perPage: 15, search: search || undefined });
            setData(res.data ?? []);
            setMeta({ totalPages: res.meta.totalPages, page: res.meta.page });
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => { setEditing(null); setForm(EMPTY); setErrors({}); setModalOpen(true); };
    const openEdit = (c: Customer) => { setEditing(c); setForm(c); setErrors({}); setModalOpen(true); };
    const closeModal = () => setModalOpen(false);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.name?.trim()) e.name = 'Name is required.';
        if (!form.email?.trim()) e.email = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            if (editing) {
                await updateCustomer(editing.id, { name: form.name, email: form.email, phone: form.phone ?? undefined, company: form.company ?? undefined, notes: form.notes ?? undefined });
            } else {
                await createCustomer({ name: form.name!, email: form.email!, phone: form.phone ?? undefined, company: form.company ?? undefined, notes: form.notes ?? undefined });
            }
            closeModal();
            load();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            if (msg?.toLowerCase().includes('email')) setErrors({ email: 'Email already in use.' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await deleteCustomer(deleteTarget.id);
            setDeleteTarget(null);
            load();
        } finally {
            setDeleting(false);
        }
    };

    const columns = [
        { key: 'name', header: 'Name' },
        { key: 'email', header: 'Email' },
        { key: 'phone', header: 'Phone', render: (r: Customer) => r.phone ?? '—' },
        { key: 'company', header: 'Company', render: (r: Customer) => r.company ?? '—' },
        {
            key: 'actions', header: '', className: 'w-24',
            render: (r: Customer) => (
                <div className="flex items-center gap-1">
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
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Customers</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your customer base.</p>
                </div>
                <Button onClick={openCreate}>
                    <Plus size={16} /> New customer
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search customers..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#141414] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-transparent"
                />
            </div>

            <Table columns={columns} data={data} loading={loading} emptyMessage="No customers found." />
            <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />

            {/* Create / Edit modal */}
            <Modal
                open={modalOpen}
                onClose={closeModal}
                title={editing ? 'Edit customer' : 'New customer'}
                footer={
                    <>
                        <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                        <Button onClick={handleSave} loading={saving}>
                            {editing ? 'Save changes' : 'Create'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Input label="Name" required value={form.name ?? ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} error={errors.name} placeholder="Acme Corp" />
                    <Input label="Email" required type="email" value={form.email ?? ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} error={errors.email} placeholder="contact@acme.com" />
                    <Input label="Phone" value={form.phone ?? ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+55 11 99999-9999" />
                    <Input label="Company" value={form.company ?? ''} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="Acme Inc." />
                    <FormField label="Notes">
                        <Textarea value={form.notes ?? ''} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any relevant notes..." />
                    </FormField>
                </div>
            </Modal>

            {/* Confirm delete modal */}
            <Modal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title="Delete customer"
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="primary" loading={deleting} onClick={handleDelete}>Delete</Button>
                    </>
                }
            >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{deleteTarget?.name}</strong>? This action cannot be undone.
                </p>
            </Modal>
        </div>
    );
}
