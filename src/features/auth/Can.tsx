import React from 'react';
import {usePermissionsStore} from './permissionsStore';
import type {PermissionKey} from '../../core/config/permissions';

interface CanProps {
  permission?: PermissionKey;
  anyOf?: PermissionKey[];
  allOf?: PermissionKey[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Can({permission, anyOf, allOf, children, fallback = null}: CanProps): React.JSX.Element | null {
  const can = usePermissionsStore(s => s.can);

  let allowed = true;

  if (permission) {
    allowed = can(permission);
  } else if (anyOf && anyOf.length > 0) {
    allowed = anyOf.some(k => can(k));
  } else if (allOf && allOf.length > 0) {
    allowed = allOf.every(k => can(k));
  }

  if (!allowed) {
    return fallback as React.JSX.Element | null;
  }

  return <>{children}</>;
}
