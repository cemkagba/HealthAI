import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmModal({ open, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmStyle = 'danger', loading = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4 p-2">
        <div className={`p-3 rounded-xl flex-shrink-0 ${confirmStyle === 'danger' ? 'bg-rose-500/20 text-rose-400' : 'bg-sky-500/20 text-sky-400'}`}>
          <AlertTriangle size={24} />
        </div>
        <div>
          <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="flex gap-3 pt-6 mt-4 border-t border-slate-700/50 justify-end">
        <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
        <button 
          type="button" 
          onClick={onConfirm} 
          className={confirmStyle === 'danger' ? 'btn-danger' : 'btn-primary'} 
          disabled={loading}
        >
          {loading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  )
}
