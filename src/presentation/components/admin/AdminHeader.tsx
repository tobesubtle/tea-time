'use client';

import Header from '../Header';

interface AdminHeaderProps {
  userEmail?: string;
  userName?: string;
  userRole?: string;
}

export function AdminHeader({ userEmail, userName, userRole }: AdminHeaderProps) {
  return (
    <Header
      activeTab="admin"
      userRole={userRole || 'admin'}
      userEmail={userEmail}
      userName={userName}
    />
  );
}
