"use client";

import React, { ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';

export const IsAdminComponent = ({ fallback, children }: { fallback: ReactNode, children: ReactNode }) => {
    const { user, isLoaded } = useUser();

    if (!isLoaded) {
        return <>{fallback}</>;
    }

    const isAdmin = user?.organizationMemberships.some(membership => {
        return membership.role === 'org:admin' || membership.permissions.includes('org:admin');
    });

    return <>{isAdmin ? children : fallback}</>;
};