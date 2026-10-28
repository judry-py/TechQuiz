import React from 'react';
import { getProfileDataAction } from '@/features/progression/actions';
import { ProfileClient } from '@/components/profile/ProfileClient';
import { PageTransition } from '@/components/animations/PageTransition';

export default async function ProfilPage() {
  const profileData = await getProfileDataAction();

  return (
    <PageTransition>
      <ProfileClient data={profileData} />
    </PageTransition>
  );
}
