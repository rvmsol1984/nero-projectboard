import { useState, useEffect } from 'react';
import { api } from '../api.js';

function today() {
  return new Date().toISOString().slice(0, 10);
}

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: 'var(--text-secondary)', textTransform: 'uppercase',
  letterSpacing: '0.06em', marginBottom: 5,
};

const inputStyle = {
  width: '100%', background: 'var(--bg-input)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 6, color: 'var(--text-primary)',
  padding: '8px 10px', fontSize: 13,
  transition: 'border-color .15s', boxSizing: 'border-box',
  fontFamily: 'inherit',
};

function focusBorder(e) { e.target.style.borderColor = 'var(--accent)'; }
function blurBorder(e)  { e.target.style.borderColor = 'var(--border-subtle)'; }

function SearchField({ label, searchValue, onSearchChange, selected, onSelect, results, placeholder }) {
  const [open, setOpen] = useState(false);

  const displayValue = selected ? selected.name : searchValue;

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          value={displayValue}
          onChange={e => {
            if (selected) onSelect(null);
            onSearchChange(e.target.value);
            setOpen(true);
          }}
          onFocus={e => { focusBorder(e); setOpen(true); }}
          onBlur={e => { blurBorder(e); setTimeout(() => setOpen(false), 150); }}
          placeholder={placeholder}
          style={{ ...inputStyle, color: selected ? 'var(--text-primary)' : undefined }}
          autoComplete="off"
        />
        {open && results.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: 6, marginTop: 2,
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            maxHeight: 180, overflowY: 'auto',
          }}>
            {results.map(r => (
              <button
                key={r.id}
                type="button"
                onMouseDown={() => { onSelect(r); onSearchChange(''); setOpen(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 12px', fontSize: 13, background: 'transparent',
                  border: 'none', borderBottom: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)', cursor: 'pointer',
                  transition: 'background .08s', fontFamily: 'inherit',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >{r.name}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewProjectModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [companyResults, setCompanyResults] = useState([]);
  const [companyID, setCompanyID] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceResults, setResourceResults] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (companySearch.length < 2) { setCompanyResults([]); return; }
    const t = setTimeout(async () => {
      try { setCompanyResults(await api.searchCompanies(companySearch)); } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [companySearch]);

  useEffect(() => {
    if (resourceSearch.length < 2) { setResourceResults([]); return; }
    const t = setTimeout(async () => {
      try { setResourceResults(await api.searchResources(resourceSearch)); } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [resourceSearch]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError('Project name is required'); return; }
    if (!companyID) { setError('Please select a client'); return; }
    setLoading(true); setError(null);
    try {
      const payload = {
        name: name.trim(),
        companyID: companyID,
        assigneeID: selectedResource?.id || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        description: description.trim(),
      };
      console.log('[NewProjectModal] creating project:', payload);
      await api.createProject(payload);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'backdropIn 150ms ease forwards',
      }}
    >
      <form
        onClick={e => e.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          width: 520, background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 10,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <h2 style={{
            margin: 0, fontSize: 18, fontWeight: 600,
            color: 'var(--text-primary)', letterSpacing: '-0.2px',
          }}>New Project</h2>
          <button
            type="button" onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'transparent', border: 'none',
              color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background .12s, color .12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Project name */}
          <div>
            <label style={labelStyle}>Project Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter project name"
              autoFocus
              style={inputStyle}
              onFocus={focusBorder}
              onBlur={blurBorder}
            />
          </div>

          {/* Client + Tech */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <SearchField
              label="Client *"
              searchValue={companySearch}
              onSearchChange={setCompanySearch}
              selected={companyID ? { id: companyID, name: companyName } : null}
              onSelect={c => {
                if (c) { setCompanyID(c.id); setCompanyName(c.name); }
                else   { setCompanyID(null); setCompanyName(''); }
              }}
              results={companyResults}
              placeholder="Search company…"
            />
            <SearchField
              label="Tech"
              searchValue={resourceSearch}
              onSearchChange={setResourceSearch}
              selected={selectedResource}
              onSelect={setSelectedResource}
              results={resourceResults}
              placeholder="Search resource…"
            />
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            <div>
              <label style={labelStyle}>Due Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional description…"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 72, lineHeight: 1.5 }}
              onFocus={focusBorder}
              onBlur={blurBorder}
            />
          </div>

          {error && (
            <div style={{ fontSize: 12, color: 'var(--red)' }}>{error}</div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '0 20px 18px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', background: 'var(--accent)',
              border: 'none', borderRadius: 7,
              color: '#fff', padding: '9px 0',
              fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'filter .15s, opacity .15s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
          >{loading ? 'Creating…' : 'Create Project'}</button>
        </div>
      </form>
    </div>
  );
}
