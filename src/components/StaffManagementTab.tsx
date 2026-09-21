import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Edit,
  Trash2,
  Lock,
  CheckCircle2,
  XCircle,
  Briefcase,
  DollarSign,
  Phone,
  Mail,
  Key,
  Award,
  Sparkles,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StaffMember, StaffPermissions, StaffRole, UserAccount } from '../types';

interface StaffManagementTabProps {
  staffMembers: StaffMember[];
  allUsers: UserAccount[];
  currentUser: UserAccount;
  onUpdateStaff: (staff: StaffMember[]) => void;
  onUpdateUsers: (users: UserAccount[]) => void;
  showToast: (msg: string) => void;
}

const DEFAULT_PERMISSIONS: StaffPermissions = {
  canManageOrders: true,
  canApprovePayments: false,
  canManageServices: false,
  canReplyTickets: true,
  canManageUsers: false,
  canConfigureApis: false,
  canManageStaff: false,
  canChangeSettings: false,
  canBroadcastAlerts: false,
};

export function StaffManagementTab({
  staffMembers,
  allUsers,
  currentUser,
  onUpdateStaff,
  onUpdateUsers,
  showToast,
}: StaffManagementTabProps) {
  // Only admin, manager, partner can access staff section
  const isAuthorized =
    currentUser.role === 'admin' ||
    currentUser.role === 'superadmin' ||
    currentUser.role === 'manager' ||
    currentUser.role === 'partner' ||
    currentUser.tier === 'Admin';

  if (!isAuthorized) {
    return (
      <div className="p-12 text-center bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg mx-auto my-12 space-y-4">
        <ShieldAlert className="w-14 h-14 text-red-400 mx-auto" />
        <h3 className="text-lg font-black text-white">Restricted Staff Section</h3>
        <p className="text-xs text-neutral-400">
          Only Administrators, Managers, and Partners are authorized to access the Staff Management console and team directory.
        </p>
      </div>
    );
  }

  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [isEditStaffModalOpen, setIsEditStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [passwordChangeStaff, setPasswordChangeStaff] = useState<StaffMember | null>(null);
  const [newPasswordData, setNewPasswordData] = useState({
    prevPassword: '',
    newPassword: '',
    confirmPassword: '',
    prevMasterKey: '',
    newMasterKey: '',
    confirmMasterKey: '',
  });

  const [staffForm, setStaffForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    masterKey: 'smm_master_key_99',
    department: 'Customer Support',
    role: 'support_agent' as StaffRole,
    salaryNpr: 25000,
    permissions: { ...DEFAULT_PERMISSIONS },
  });

  // Preset role applier
  const applyRolePreset = (preset: StaffRole) => {
    let p: StaffPermissions = {
      canManageOrders: false,
      canApprovePayments: false,
      canManageServices: false,
      canReplyTickets: false,
      canManageUsers: false,
      canConfigureApis: false,
      canManageStaff: false,
      canChangeSettings: false,
      canBroadcastAlerts: false,
    };

    if (preset === 'support_agent') {
      p.canReplyTickets = true;
      p.canManageOrders = true;
      p.canBroadcastAlerts = false;
    } else if (preset === 'order_manager') {
      p.canManageOrders = true;
      p.canConfigureApis = true;
      p.canReplyTickets = true;
    } else if (preset === 'finance_manager') {
      p.canApprovePayments = true;
      p.canManageUsers = true;
      p.canReplyTickets = true;
    } else if (preset === 'manager') {
      p.canManageOrders = true;
      p.canApprovePayments = true;
      p.canManageServices = true;
      p.canReplyTickets = true;
      p.canManageUsers = true;
      p.canConfigureApis = true;
      p.canBroadcastAlerts = true;
    } else if (preset === 'superadmin') {
      p = {
        canManageOrders: true,
        canApprovePayments: true,
        canManageServices: true,
        canReplyTickets: true,
        canManageUsers: true,
        canConfigureApis: true,
        canManageStaff: true,
        canChangeSettings: true,
        canBroadcastAlerts: true,
      };
    }

    setStaffForm((prev) => ({
      ...prev,
      role: preset,
      permissions: p,
    }));
  };

  // Handle Hire New Staff
  const handleHireStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.username || !staffForm.password) {
      alert('Please fill out Name, Username, and Password.');
      return;
    }

    const candidateUsername = staffForm.username.trim().toLowerCase();
    const candidateEmail = (staffForm.email.trim() || `${candidateUsername}@smmpanel.np`).toLowerCase();
    const candidateMasterKey = (staffForm.masterKey.trim() || `key_${Math.floor(1000 + Math.random() * 9000)}`).toLowerCase();
    const candidatePassword = staffForm.password.trim();

    // Check if username exists in allUsers or staff
    const usernameTaken = allUsers.some(
      (u) => u.username.toLowerCase() === candidateUsername
    );
    if (usernameTaken) {
      alert('This username is already taken. Please choose another username.');
      return;
    }

    // Check if email already used by any staff member
    const emailTaken = staffMembers.some(
      (s) => s.email.trim().toLowerCase() === candidateEmail
    );
    if (emailTaken) {
      alert('Duplicate Email: Every staff member must have a distinct, different email address.');
      return;
    }

    // Check if masterKey already used by any staff member
    const masterKeyTaken = staffMembers.some(
      (s) => s.masterKey && s.masterKey.trim().toLowerCase() === candidateMasterKey
    );
    if (masterKeyTaken) {
      alert('Duplicate Master Code: Every staff member must have a distinct, different Master Code.');
      return;
    }

    // Check if password already used by any staff member
    const passwordTaken = staffMembers.some(
      (s) => s.password && s.password.trim() === candidatePassword
    );
    if (passwordTaken) {
      alert('Duplicate Password: Every staff member must have a unique password. Please enter a different password.');
      return;
    }

    const newStaffId = `staff-${Date.now()}`;
    const newStaff: StaffMember = {
      id: newStaffId,
      name: staffForm.name.trim(),
      username: candidateUsername,
      email: candidateEmail,
      phone: staffForm.phone.trim() || '9841000000',
      password: candidatePassword,
      masterKey: candidateMasterKey,
      department: staffForm.department,
      role: staffForm.role,
      salaryNpr: Number(staffForm.salaryNpr) || 0,
      permissions: staffForm.permissions,
      status: 'active',
      hiredDate: new Date().toISOString().split('T')[0],
      lastActive: 'Just hired',
    };

    // Also register in allUsers so they can log in seamlessly
    const staffUserAccount: UserAccount = {
      id: `usr-${newStaffId}`,
      username: newStaff.username,
      email: newStaff.email,
      fullName: newStaff.name,
      phone: newStaff.phone,
      password: newStaff.password,
      balance: 1000,
      currency: 'NPR',
      tier: 'VIP',
      role: 'staff',
      status: 'active',
      apiKey: `smm_staff_${Math.random().toString(36).substring(2, 10)}`,
      totalSpent: 0,
      totalOrders: 0,
      createdAt: newStaff.hiredDate,
      department: newStaff.department,
      staffPermissions: newStaff.permissions,
    };

    const updatedStaff = [newStaff, ...staffMembers];
    const updatedUsers = [staffUserAccount, ...allUsers];

    onUpdateStaff(updatedStaff);
    onUpdateUsers(updatedUsers);

    try {
      localStorage.setItem('smm_nepal_staff_members', JSON.stringify(updatedStaff));
      localStorage.setItem('smm_nepal_users', JSON.stringify(updatedUsers));
    } catch (err) {}

    setIsHireModalOpen(false);
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    showToast(`Staff member "${newStaff.name}" hired & credentials activated.`);
  };

  // Handle Update Staff Permissions
  const handleUpdateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    const candidatePassword = staffForm.password ? staffForm.password.trim() : editingStaff.password;

    // Check unique password against other staff
    if (candidatePassword) {
      const passwordTaken = staffMembers.some(
        (s) => s.id !== editingStaff.id && s.password && s.password.trim() === candidatePassword
      );
      if (passwordTaken) {
        alert('Duplicate Password: Every staff member must have a different password.');
        return;
      }
    }

    const updatedStaff = staffMembers.map((s) =>
      s.id === editingStaff.id
        ? {
            ...s,
            name: staffForm.name,
            phone: staffForm.phone,
            password: candidatePassword,
            department: staffForm.department,
            role: staffForm.role,
            salaryNpr: staffForm.salaryNpr,
            permissions: staffForm.permissions,
          }
        : s
    );

    // Update in allUsers as well
    const updatedUsers = allUsers.map((u) => {
      if (u.username.toLowerCase() === editingStaff.username.toLowerCase()) {
        return {
          ...u,
          fullName: staffForm.name,
          phone: staffForm.phone,
          password: candidatePassword,
          department: staffForm.department,
          staffPermissions: staffForm.permissions,
        };
      }
      return u;
    });

    onUpdateStaff(updatedStaff);
    onUpdateUsers(updatedUsers);

    try {
      localStorage.setItem('smm_nepal_staff_members', JSON.stringify(updatedStaff));
      localStorage.setItem('smm_nepal_users', JSON.stringify(updatedUsers));
    } catch (err) {}

    setIsEditStaffModalOpen(false);
    setEditingStaff(null);
    showToast(`Staff member "${editingStaff.name}" permissions updated.`);
  };

  // Handle Save Staff Password Change
  const handleSavePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordChangeStaff) return;

    const prevPass = newPasswordData.prevPassword.trim();
    const newPass = newPasswordData.newPassword.trim();
    const confirmPass = newPasswordData.confirmPassword.trim();

    const prevMaster = newPasswordData.prevMasterKey.trim();
    const newMaster = newPasswordData.newMasterKey.trim();
    const confirmMaster = newPasswordData.confirmMasterKey.trim();

    // 1. Check previous password
    if (passwordChangeStaff.password) {
      if (!prevPass) {
        alert('Please enter current / previous staff password to confirm identity.');
        return;
      }
      if (prevPass !== passwordChangeStaff.password) {
        alert('Previous password does not match current staff records.');
        return;
      }
    }

    // 2. Check new password and 2x confirmation
    if (!newPass) {
      alert('Please enter a new password.');
      return;
    }
    if (newPass.length < 6) {
      alert('New password must be at least 6 characters long.');
      return;
    }
    if (!confirmPass) {
      alert('Please enter the new password twice to confirm.');
      return;
    }
    if (newPass !== confirmPass) {
      alert('Password Confirmation Mismatch: New password and confirm password do not match.');
      return;
    }

    // Check unique password across other staff
    const passwordTaken = staffMembers.some(
      (s) => s.id !== passwordChangeStaff.id && s.password && s.password.trim() === newPass
    );
    if (passwordTaken) {
      alert('Duplicate Password: Every staff member must have a distinct, different password.');
      return;
    }

    // 3. Check master key if changing
    if (newMaster || prevMaster || confirmMaster) {
      if (passwordChangeStaff.masterKey) {
        if (!prevMaster) {
          alert('Please enter the previous Master Key to update it.');
          return;
        }
        if (prevMaster.toLowerCase() !== passwordChangeStaff.masterKey.toLowerCase()) {
          alert('Previous Master Key does not match staff records.');
          return;
        }
      }
      if (!newMaster) {
        alert('Please enter the new Master Key.');
        return;
      }
      if (!confirmMaster) {
        alert('Please enter the new Master Key twice to confirm.');
        return;
      }
      if (newMaster !== confirmMaster) {
        alert('Master Key Confirmation Mismatch: New master key and confirm master key do not match.');
        return;
      }

      const masterTaken = staffMembers.some(
        (s) => s.id !== passwordChangeStaff.id && s.masterKey && s.masterKey.trim().toLowerCase() === newMaster.toLowerCase()
      );
      if (masterTaken) {
        alert('Duplicate Master Code: Every staff member must have a unique Master Code.');
        return;
      }
    }

    const updatedStaff = staffMembers.map((s) =>
      s.id === passwordChangeStaff.id
        ? {
            ...s,
            password: newPass,
            masterKey: newMaster || s.masterKey,
          }
        : s
    );

    const updatedUsers = allUsers.map((u) => {
      if (u.username.toLowerCase() === passwordChangeStaff.username.toLowerCase()) {
        return {
          ...u,
          password: newPass,
        };
      }
      return u;
    });

    onUpdateStaff(updatedStaff);
    onUpdateUsers(updatedUsers);

    try {
      localStorage.setItem('smm_nepal_staff_members', JSON.stringify(updatedStaff));
      localStorage.setItem('smm_nepal_users', JSON.stringify(updatedUsers));
    } catch (err) {}

    setPasswordChangeStaff(null);
    setNewPasswordData({
      prevPassword: '',
      newPassword: '',
      confirmPassword: '',
      prevMasterKey: '',
      newMasterKey: '',
      confirmMasterKey: '',
    });
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    showToast(`Credentials and password updated for ${passwordChangeStaff.name}.`);
  };

  // Handle Toggle Status (Active / Suspended)
  const handleToggleStatus = (staff: StaffMember) => {
    const nextStatus: 'active' | 'suspended' = staff.status === 'active' ? 'suspended' : 'active';
    const updatedStaff = staffMembers.map((s) =>
      s.id === staff.id ? { ...s, status: nextStatus } : s
    );
    const updatedUsers = allUsers.map((u) =>
      u.username.toLowerCase() === staff.username.toLowerCase()
        ? { ...u, status: nextStatus }
        : u
    );

    onUpdateStaff(updatedStaff);
    onUpdateUsers(updatedUsers);
    showToast(`Staff member "${staff.name}" status marked as ${nextStatus.toUpperCase()}.`);
  };

  // Handle Fire/Remove Staff
  const handleRemoveStaff = (staff: StaffMember) => {
    if (!confirm(`Are you sure you want to remove staff member "${staff.name}"? They will lose admin panel access.`)) {
      return;
    }

    const updatedStaff = staffMembers.filter((s) => s.id !== staff.id);
    const updatedUsers = allUsers.filter(
      (u) => u.username.toLowerCase() !== staff.username.toLowerCase()
    );

    onUpdateStaff(updatedStaff);
    onUpdateUsers(updatedUsers);

    try {
      localStorage.setItem('smm_nepal_staff_members', JSON.stringify(updatedStaff));
      localStorage.setItem('smm_nepal_users', JSON.stringify(updatedUsers));
    } catch (err) {}

    showToast(`Staff member "${staff.name}" removed from admin team.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>Admin Staff & Team Management</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                OWNER DIRECTORY
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Hire team members, assign departments, and grant granular permissions (Orders, QR Approvals, Tickets, APIs).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setStaffForm({
              name: '',
              username: '',
              email: '',
              phone: '',
              password: '',
              masterKey: '',
              department: 'Customer Support',
              role: 'support_agent',
              salaryNpr: 25000,
              permissions: { ...DEFAULT_PERMISSIONS },
            });
            setIsHireModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-neutral-950 font-bold text-xs transition shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Hire / Add Staff Member</span>
        </button>
      </div>

      {/* Staff Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-md">
          <span className="text-[11px] text-neutral-500 font-semibold block">Total Hired Staff</span>
          <span className="text-xl font-black text-white font-mono">{staffMembers.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-md">
          <span className="text-[11px] text-neutral-500 font-semibold block">Active Online</span>
          <span className="text-xl font-black text-emerald-400 font-mono">
            {staffMembers.filter((s) => s.status === 'active').length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-md">
          <span className="text-[11px] text-neutral-500 font-semibold block">Support Agents</span>
          <span className="text-xl font-black text-cyan-400 font-mono">
            {staffMembers.filter((s) => s.permissions.canReplyTickets).length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-md">
          <span className="text-[11px] text-neutral-500 font-semibold block">Finance Verifiers</span>
          <span className="text-xl font-black text-amber-400 font-mono">
            {staffMembers.filter((s) => s.permissions.canApprovePayments).length}
          </span>
        </div>
      </div>

      {/* Staff Roster Table */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            Staff Members Roster
          </h3>
          <span className="text-xs text-neutral-400 font-mono">
            Super Administrator: @{currentUser.username}
          </span>
        </div>

        {staffMembers.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-neutral-800 text-neutral-500 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">No staff members hired yet</h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Click "+ Hire / Add Staff Member" to add team members like Support Agents, Order Dispatchers, and Payment Verifiers.
            </p>
            <button
              type="button"
              onClick={() => setIsHireModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-500 text-neutral-950 font-bold text-xs cursor-pointer"
            >
              Hire First Member
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Staff Profile</th>
                  <th className="py-3 px-3">Department & Role</th>
                  <th className="py-3 px-3">Permissions Granted</th>
                  <th className="py-3 px-3">Monthly Salary</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-sans">
                {staffMembers.map((staff) => (
                  <tr key={staff.id} className="hover:bg-neutral-800/40">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
                          {staff.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{staff.name}</span>
                          <span className="text-[11px] text-neutral-400 font-mono">
                            @{staff.username} • {staff.phone}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-0.5 rounded-lg bg-neutral-800 text-white font-semibold text-[11px] block w-max">
                        {staff.department}
                      </span>
                      <span className="text-[10px] text-indigo-400 font-mono capitalize">
                        {staff.role.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {staff.permissions.canManageOrders && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800 text-[9px] font-bold">
                            Orders
                          </span>
                        )}
                        {staff.permissions.canApprovePayments && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800 text-[9px] font-bold">
                            QR Deposits
                          </span>
                        )}
                        {staff.permissions.canReplyTickets && (
                          <span className="px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800 text-[9px] font-bold">
                            Tickets
                          </span>
                        )}
                        {staff.permissions.canManageServices && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800 text-[9px] font-bold">
                            Services
                          </span>
                        )}
                        {staff.permissions.canConfigureApis && (
                          <span className="px-1.5 py-0.5 rounded bg-teal-950/60 text-teal-300 border border-teal-800 text-[9px] font-bold">
                            Wholesaler API
                          </span>
                        )}
                        {staff.permissions.canManageUsers && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800 text-[9px] font-bold">
                            Users & Balance
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold text-neutral-300">
                      Rs. {staff.salaryNpr ? staff.salaryNpr.toLocaleString() : '25,000'} NPR
                    </td>

                    <td className="py-3.5 px-3">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(staff)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border cursor-pointer transition ${
                          staff.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500/20'
                        }`}
                      >
                        {staff.status === 'active' ? '● ACTIVE' : '○ SUSPENDED'}
                      </button>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordChangeStaff(staff);
                            setNewPasswordData({
                              prevPassword: '',
                              newPassword: '',
                              confirmPassword: '',
                              prevMasterKey: '',
                              newMasterKey: '',
                              confirmMasterKey: '',
                            });
                          }}
                          className="p-1.5 rounded-lg bg-amber-950/50 hover:bg-amber-900/70 text-amber-300 hover:text-amber-100 transition cursor-pointer border border-amber-500/30"
                          title="Change Staff Password & Master Code"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingStaff(staff);
                            setStaffForm({
                              name: staff.name,
                              username: staff.username,
                              email: staff.email,
                              phone: staff.phone,
                              password: staff.password,
                              masterKey: staff.masterKey || 'smm_master_key_99',
                              department: staff.department,
                              role: staff.role,
                              salaryNpr: staff.salaryNpr || 25000,
                              permissions: { ...staff.permissions },
                            });
                            setIsEditStaffModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
                          title="Edit Permissions"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveStaff(staff)}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white transition cursor-pointer border border-red-500/30"
                          title="Remove Staff"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: HIRE STAFF MEMBER */}
      {isHireModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold text-white">Hire New Admin Staff Member</span>
              </div>
              <button
                type="button"
                onClick={() => setIsHireModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleHireStaff} className="space-y-4 text-xs">
              {/* Presets */}
              <div>
                <label className="text-neutral-400 block mb-1 font-semibold">Quick Role Preset</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'support_agent', label: 'Support Agent' },
                    { id: 'order_manager', label: 'Order Dispatcher' },
                    { id: 'finance_manager', label: 'Payment Verifier' },
                    { id: 'manager', label: 'General Manager' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyRolePreset(preset.id as any)}
                      className={`p-2 rounded-xl text-[11px] font-bold border transition text-center ${
                        staffForm.role === preset.id
                          ? 'bg-indigo-500 text-neutral-950 border-indigo-400'
                          : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal & Login Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    placeholder="e.g. Ramesh Adhikari"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Login Username *</label>
                  <input
                    type="text"
                    value={staffForm.username}
                    onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })}
                    placeholder="ramesh_support"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Login Password *</label>
                  <input
                    type="text"
                    value={staffForm.password}
                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                    placeholder="Set secure staff password"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1 text-emerald-400 font-bold">Staff Master Key *</label>
                  <input
                    type="text"
                    value={staffForm.masterKey}
                    onChange={(e) => setStaffForm({ ...staffForm, masterKey: e.target.value })}
                    placeholder="e.g. smm_master_key_99"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-emerald-500/40 text-emerald-300 font-mono"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    placeholder="9841000000"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Department</label>
                  <select
                    value={staffForm.department}
                    onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                  >
                    <option value="Customer Support">Customer Support</option>
                    <option value="Order Operations">Order Operations</option>
                    <option value="Finance & Deposits">Finance & Deposits</option>
                    <option value="Marketing & Growth">Marketing & Growth</option>
                    <option value="Executive Management">Executive Management</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Monthly Salary (NPR)</label>
                  <input
                    type="number"
                    value={staffForm.salaryNpr}
                    onChange={(e) => setStaffForm({ ...staffForm, salaryNpr: Number(e.target.value) })}
                    placeholder="25000"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>
              </div>

              {/* Granular Permissions Checkboxes */}
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <span className="font-bold text-neutral-300 block uppercase tracking-wider text-[10px]">
                  Granular Administrative Permissions
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: 'canManageOrders', label: 'Manage & Update Orders' },
                    { key: 'canApprovePayments', label: 'Verify & Approve QR Deposits' },
                    { key: 'canReplyTickets', label: 'Reply Support Tickets' },
                    { key: 'canManageServices', label: 'Edit Services Catalog & Pricing' },
                    { key: 'canConfigureApis', label: 'Manage Wholesaler Provider APIs' },
                    { key: 'canManageUsers', label: 'Adjust User Balances & Tiers' },
                    { key: 'canBroadcastAlerts', label: 'Publish Broadcast Notices' },
                    { key: 'canChangeSettings', label: 'Edit Platform & QR Settings' },
                  ].map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-900 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={(staffForm.permissions as any)[perm.key] || false}
                        onChange={(e) =>
                          setStaffForm({
                            ...staffForm,
                            permissions: {
                              ...staffForm.permissions,
                              [perm.key]: e.target.checked,
                            },
                          })
                        }
                        className="rounded bg-neutral-900 border-neutral-700 text-indigo-500"
                      />
                      <span className="text-neutral-300 text-xs">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsHireModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-neutral-950 font-bold text-xs shadow-md"
                >
                  Hire & Activate Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STAFF PERMISSIONS */}
      {isEditStaffModalOpen && editingStaff && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <span className="text-sm font-bold text-white">
                Edit Staff Permissions: {editingStaff.name} (@{editingStaff.username})
              </span>
              <button
                type="button"
                onClick={() => setIsEditStaffModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStaff} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Reset Password</label>
                  <input
                    type="text"
                    value={staffForm.password}
                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                    placeholder="Enter new password to reset"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Department</label>
                  <input
                    type="text"
                    value={staffForm.department}
                    onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Monthly Salary (NPR)</label>
                  <input
                    type="number"
                    value={staffForm.salaryNpr}
                    onChange={(e) => setStaffForm({ ...staffForm, salaryNpr: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>
              </div>

              {/* Permissions Checkboxes */}
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <span className="font-bold text-neutral-300 block uppercase tracking-wider text-[10px]">
                  Administrative Permissions
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: 'canManageOrders', label: 'Manage & Update Orders' },
                    { key: 'canApprovePayments', label: 'Verify & Approve QR Deposits' },
                    { key: 'canReplyTickets', label: 'Reply Support Tickets' },
                    { key: 'canManageServices', label: 'Edit Services Catalog & Pricing' },
                    { key: 'canConfigureApis', label: 'Manage Wholesaler Provider APIs' },
                    { key: 'canManageUsers', label: 'Adjust User Balances & Tiers' },
                    { key: 'canBroadcastAlerts', label: 'Publish Broadcast Notices' },
                    { key: 'canChangeSettings', label: 'Edit Platform & QR Settings' },
                  ].map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-900 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={(staffForm.permissions as any)[perm.key] || false}
                        onChange={(e) =>
                          setStaffForm({
                            ...staffForm,
                            permissions: {
                              ...staffForm.permissions,
                              [perm.key]: e.target.checked,
                            },
                          })
                        }
                        className="rounded bg-neutral-900 border-neutral-700 text-indigo-500"
                      />
                      <span className="text-neutral-300 text-xs">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEditStaffModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-neutral-950 font-bold text-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE STAFF PASSWORD & MASTER CODE */}
      {passwordChangeStaff && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Change Staff Password & Key</h3>
                  <p className="text-[11px] text-neutral-400 font-mono">
                    {passwordChangeStaff.name} (@{passwordChangeStaff.username})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPasswordChangeStaff(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePasswordChange} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <span className="text-[10px] text-neutral-500 block uppercase font-mono">Assigned Staff Email</span>
                <span className="font-mono text-neutral-200 block text-xs">{passwordChangeStaff.email}</span>
                <span className="text-[10px] text-amber-400 block">Staff security verification protocol active</span>
              </div>

              {/* 1. Previous Password */}
              <div>
                <label className="text-neutral-300 block mb-1 font-semibold flex items-center justify-between">
                  <span>Previous Password</span>
                  <span className="text-[10px] text-neutral-500 font-mono">Current verification</span>
                </label>
                <input
                  type="password"
                  value={newPasswordData.prevPassword}
                  onChange={(e) => setNewPasswordData({ ...newPasswordData, prevPassword: e.target.value })}
                  placeholder="Enter previous password"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* 2. New Password (1st Entry) */}
              <div>
                <label className="text-neutral-300 block mb-1 font-semibold flex items-center justify-between">
                  <span>New Password (Min 6 chars) <span className="text-red-400">*</span></span>
                  <span className="text-[10px] text-neutral-500 font-mono">1st Entry</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPasswordData.newPassword}
                  onChange={(e) => setNewPasswordData({ ...newPasswordData, newPassword: e.target.value })}
                  placeholder="Enter unique new password"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* 3. Confirm New Password (2nd Entry) */}
              <div>
                <label className="text-neutral-300 block mb-1 font-semibold flex items-center justify-between">
                  <span>Confirm New Password <span className="text-red-400">*</span></span>
                  <span className="text-[10px] text-neutral-500 font-mono">2nd Entry (Confirm)</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPasswordData.confirmPassword}
                  onChange={(e) => setNewPasswordData({ ...newPasswordData, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password to confirm"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-neutral-800 space-y-3">
                <span className="text-[11px] font-bold text-amber-400 block uppercase font-mono">
                  Master Security Key (Optional Override)
                </span>

                {/* Previous Master Key */}
                <div>
                  <label className="text-neutral-300 block mb-1 font-semibold flex items-center justify-between">
                    <span>Previous Master Key</span>
                    <span className="text-[10px] text-neutral-500 font-mono">Current verification</span>
                  </label>
                  <input
                    type="password"
                    value={newPasswordData.prevMasterKey}
                    onChange={(e) => setNewPasswordData({ ...newPasswordData, prevMasterKey: e.target.value })}
                    placeholder="Enter previous master key"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-amber-300 font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* New Master Key (1st Entry) */}
                <div>
                  <label className="text-neutral-300 block mb-1 font-semibold flex items-center justify-between">
                    <span>New Master Key</span>
                    <span className="text-[10px] text-neutral-500 font-mono">1st Entry</span>
                  </label>
                  <input
                    type="password"
                    value={newPasswordData.newMasterKey}
                    onChange={(e) => setNewPasswordData({ ...newPasswordData, newMasterKey: e.target.value })}
                    placeholder="e.g. smm_master_key_99"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-amber-300 font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Confirm New Master Key (2nd Entry) */}
                <div>
                  <label className="text-neutral-300 block mb-1 font-semibold flex items-center justify-between">
                    <span>Confirm New Master Key</span>
                    <span className="text-[10px] text-neutral-500 font-mono">2nd Entry (Confirm)</span>
                  </label>
                  <input
                    type="password"
                    value={newPasswordData.confirmMasterKey}
                    onChange={(e) => setNewPasswordData({ ...newPasswordData, confirmMasterKey: e.target.value })}
                    placeholder="Re-enter new master key to confirm"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-amber-300 font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setPasswordChangeStaff(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  Update Staff Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
