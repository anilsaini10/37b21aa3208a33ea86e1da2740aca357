import React, {useState, useCallback} from 'react';
import {usePermissionsStore} from './permissionsStore';
import {ContactAdminModal} from './components/ContactAdminModal';
import type {PermissionKey} from '../../core/config/permissions';

export function usePermissionGate() {
  const [modalVisible, setModalVisible] = useState(false);
  const can = usePermissionsStore(s => s.can);

  const gate = useCallback(
    (permission: PermissionKey | undefined, callback: () => void) => {
      return () => {
        if (!permission || can(permission)) {
          callback();
        } else {
          setModalVisible(true);
        }
      };
    },
    [can],
  );

  const PermissionModal = useCallback(
    () => <ContactAdminModal visible={modalVisible} onClose={() => setModalVisible(false)} />,
    [modalVisible],
  );

  return {gate, PermissionModal};
}
