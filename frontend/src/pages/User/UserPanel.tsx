import React from 'react';
import UserLayout from '../../components/Layout/UserLayout';
import UserDashboard from './UserDashboard';

const UserPanel: React.FC = () => {
  return (
    <UserLayout>
      <UserDashboard />
    </UserLayout>
  );
};

export default UserPanel;
