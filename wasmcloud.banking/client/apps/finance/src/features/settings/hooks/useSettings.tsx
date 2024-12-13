import React from 'react';
import {useApi} from '@repo/common/services/backend/useApi';
import {AuthRequestBody} from '@repo/common/services/backend/types';
import {useSettingsStore} from '@/features/settings/state/store';

function useSettings() {
  const {dialog, hideDialog, showDialog, status, error, login, logout, handleError, loading} =
    useSettingsStore();
  const onOpenChange = (open: boolean) => (open ? showDialog() : hideDialog());
  const {auth} = useApi();

  const validateLogin = React.useCallback(
    async (authRequest: AuthRequestBody) => {
      try {
        loading();
        const response = await auth(authRequest);
        if (response.error) throw new Error(response.error);
        login();
      } catch (error) {
        handleError(error instanceof Error ? error : new Error('An error occurred'));
      }
    },
    [auth, handleError, login, loading],
  );

  return {
    auth: {
      login: validateLogin,
      logout,
      status,
      error,
    },
    dialog: {
      open: dialog.open,
      onOpenChange,
    },
  };
}

export {useSettings};
