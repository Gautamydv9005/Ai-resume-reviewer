import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  History,
  FileText,
  Trash2,
  Edit2,
  GitCompare,
  Eye,
  Search,
  UploadCloud,
  CheckCircle,
  FileCheck2,
  Calendar
} from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/common/Sidebar';
import Modal from '../components/common/Modal';
import ScoreBadge from '../components/common/ScoreBadge';
import EmptyState from '../components/common/EmptyState';

export default function ResumeHistoryPage() {
  const navigate = useNavigate();
  const { history, deleteHistoryItem, renameHistoryItem, selectResume } = useResume();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  
  // Rename Modal State
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState(null);
  const [newNameInput, setNewNameInput] = useState('');

  // Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const filteredHistory = history.filter(item =>
    item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.targetJobTitle && item.targetJobTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.targetCompany && item.targetCompany.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Toggle selection for comparison
  const handleToggleCompareSelection = (id) => {
    setSelectedForCompare(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 2) {
        addToast({
          message: 'You can compare at most two resumes at a time. Replaced first selection.',
          type: 'info'
        });
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleTriggerCompare = () => {
    if (selectedForCompare.length === 2) {
      navigate(`/compare?v1=${selectedForCompare[0]}&v2=${selectedForCompare[1]}`);
    } else if (selectedForCompare.length === 1 && history.length >= 2) {
      // Find another resume to compare with
      const other = history.find(h => h.id !== selectedForCompare[0]);
      navigate(`/compare?v1=${selectedForCompare[0]}&v2=${other.id}`);
    } else if (history.length >= 2) {
      navigate(`/compare?v1=${history[1].id}&v2=${history[0].id}`);
    } else {
      addToast({
        message: 'Upload at least 2 resumes to run version comparisons.',
        type: 'warning'
      });
    }
  };

  // Open Rename Dialog
  const handleOpenRename = (item) => {
    setItemToRename(item);
    setNewNameInput(item.fileName);
    setIsRenameModalOpen(true);
  };

  const handleSaveRename = async (e) => {
    e.preventDefault();
    if (!newNameInput.trim() || !itemToRename) return;

    await renameHistoryItem(itemToRename.id, newNameInput.trim());
    addToast({
      message: `Renamed resume to "${newNameInput.trim()}"`,
      type: 'success'
    });
    setIsRenameModalOpen(false);
    setItemToRename(null);
  };

  // Open Delete Dialog
  const handleOpenDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    await deleteHistoryItem(itemToDelete.id);
    addToast({
      message: `Deleted "${itemToDelete.fileName}" from history.`,
      type: 'info'
    });
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-brand" style={{ marginBottom: '0.25rem' }}>
                <History size={13} /> Audit Archive
              </span>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Resume History</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Manage, review, compare, or organize your previously scanned resume versions.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={handleTriggerCompare}
                className="btn btn-secondary btn-sm"
                title="Compare selected resumes"
              >
                <GitCompare size={15} />
                Compare Selected ({selectedForCompare.length}/2)
              </button>
              <Link to="/upload" className="btn btn-primary btn-sm">
                <UploadCloud size={15} /> Upload New
              </Link>
            </div>
          </div>

          {/* Search bar & Filter */}
          <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search by file name or role..."
                style={{ paddingLeft: '2.25rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Showing <strong>{filteredHistory.length}</strong> of {history.length} resumes
            </div>
          </div>

          {/* History Data Table */}
          {filteredHistory.length > 0 ? (
            <div className="table-wrapper glass-panel">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <span title="Select for comparison">Compare</span>
                    </th>
                    <th>Resume File</th>
                    <th>Analysis Date</th>
                    <th>ATS Score</th>
                    <th>Job Match</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item) => {
                    const isSelected = selectedForCompare.includes(item.id);
                    return (
                      <tr key={item.id} style={{ background: isSelected ? 'var(--brand-primary-light)' : 'transparent' }}>
                        <td>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleCompareSelection(item.id)}
                            style={{ cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
                            title="Select for comparison"
                          />
                        </td>

                        {/* Resume File */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <FileCheck2 size={18} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                {item.fileName}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {item.targetJobTitle || 'Software Engineer'} {item.targetCompany ? `• ${item.targetCompany}` : ''}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Date */}
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Calendar size={13} color="var(--text-muted)" />
                            {item.date}
                          </div>
                        </td>

                        {/* ATS Score */}
                        <td>
                          <ScoreBadge score={item.atsScore || 85} />
                        </td>

                        {/* Job Match */}
                        <td>
                          {item.jobMatchScore ? (
                            <ScoreBadge score={item.jobMatchScore} />
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Resume Only</span>
                          )}
                        </td>

                        {/* Status */}
                        <td>
                          <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                            <CheckCircle size={11} /> {item.status || 'Completed'}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Link
                              to={`/analysis/${item.id}`}
                              onClick={() => selectResume(item.id)}
                              className="btn btn-secondary btn-sm"
                              title="View Analysis"
                              style={{ padding: '0.35rem 0.65rem' }}
                            >
                              <Eye size={14} /> View
                            </Link>

                            <button
                              onClick={() => handleOpenRename(item)}
                              className="btn-ghost"
                              title="Rename resume"
                              style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
                            >
                              <Edit2 size={14} />
                            </button>

                            <button
                              onClick={() => handleOpenDelete(item)}
                              className="btn-ghost"
                              title="Delete resume"
                              style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', color: 'var(--danger)' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No Resumes Found"
              description="No resume matches your search query. Upload or rename a resume to build your history."
              actionText="Upload Resume"
              actionLink="/upload"
            />
          )}

          {/* Rename Modal */}
          <Modal
            isOpen={isRenameModalOpen}
            onClose={() => setIsRenameModalOpen(false)}
            title="Rename Resume Document"
          >
            <form onSubmit={handleSaveRename}>
              <div className="form-group">
                <label className="form-label">New File Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={newNameInput}
                  onChange={(e) => setNewNameInput(e.target.value)}
                  placeholder="e.g. Senior_Engineer_Resume_Final.pdf"
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsRenameModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </Modal>

          {/* Delete Modal */}
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Delete Resume Record"
          >
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Are you sure you want to delete <strong>{itemToDelete?.fileName}</strong>? This action will remove its historical analysis metrics.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmDelete}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </main>
    </div>
  );
}
