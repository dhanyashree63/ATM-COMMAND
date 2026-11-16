import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  ShieldAlert, 
  Cpu, 
  Wifi, 
  Banknote, 
  Binary, 
  Shield,
  HelpCircle
} from 'lucide-react';

export function StatusBadge({ status }) {
  switch (status) {
    case 'Pending':
      return (
        <span className="badge badge-status-pending">
          <Clock size={12} /> Pending
        </span>
      );
    case 'Assigned':
      return (
        <span className="badge badge-status-assigned">
          <UserCheck size={12} /> Assigned
        </span>
      );
    case 'In Progress':
      return (
        <span className="badge badge-status-progress">
          <Clock size={12} /> In Progress
        </span>
      );
    case 'Resolved':
      return (
        <span className="badge badge-status-resolved">
          <CheckCircle2 size={12} /> Resolved
        </span>
      );
    case 'Pending Manual Correction':
      return (
        <span className="badge badge-status-correction">
          <HelpCircle size={12} /> Review Required
        </span>
      );
    default:
      return <span className="badge">{status || 'Unknown'}</span>;
  }
}

export function PriorityBadge({ priority }) {
  const prio = (priority || '').toUpperCase();
  if (prio.includes('P1') || prio.includes('CRITICAL') || prio.includes('EMERGENCY')) {
    return (
      <span className="badge badge-p1">
        <ShieldAlert size={12} /> P1 Critical
      </span>
    );
  }
  if (prio.includes('P2') || prio.includes('HIGH')) {
    return (
      <span className="badge badge-p2">
        <AlertTriangle size={12} /> P2 High
      </span>
    );
  }
  if (prio.includes('P3') || prio.includes('MEDIUM') || prio.includes('NORMAL')) {
    return (
      <span className="badge badge-p3">
        P3 Medium
      </span>
    );
  }
  return (
    <span className="badge badge-p4">
      P4 Low
    </span>
  );
}

export function CategoryBadge({ category }) {
  switch (category) {
    case 'Hardware':
      return (
        <span className="badge badge-cat-hardware">
          <Cpu size={12} /> Hardware
        </span>
      );
    case 'Network':
      return (
        <span className="badge badge-cat-network">
          <Wifi size={12} /> Network
        </span>
      );
    case 'Cash-Handling':
      return (
        <span className="badge badge-cat-cash">
          <Banknote size={12} /> Cash-Handling
        </span>
      );
    case 'Software':
      return (
        <span className="badge badge-cat-software">
          <Binary size={12} /> Software
        </span>
      );
    case 'Security':
      return (
        <span className="badge badge-cat-security">
          <Shield size={12} /> Security
        </span>
      );
    default:
      return (
        <span className="badge badge-p4">
          {category || 'Unmapped'}
        </span>
      );
  }
}
