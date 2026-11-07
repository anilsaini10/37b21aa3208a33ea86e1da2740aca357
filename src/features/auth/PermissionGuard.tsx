import React from 'react';
import {usePermissionsStore} from './permissionsStore';
import {NoAccessScreen} from './screens/NoAccessScreen';
import type {PermissionKey} from '../../core/config/permissions';

interface PermissionGuardProps {
  permission?: PermissionKey;
  anyOf?: PermissionKey[];
  children: React.ReactNode;
}

export function PermissionGuard({permission, anyOf, children}: PermissionGuardProps): React.JSX.Element {
  const can = usePermissionsStore(s => s.can);

  let allowed = true;

  if (permission) {
    allowed = can(permission);
  } else if (anyOf && anyOf.length > 0) {
    allowed = anyOf.some(k => can(k));
  }

  if (!allowed) {
    return <NoAccessScreen />;
  }

  return <>{children}</>;
}
