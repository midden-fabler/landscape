import _ from 'lodash';
import { HarkAction, Rope, Seam, Skein, Yarn } from '../types/hark';
import useReactQuerySubscription from '@/logic/useReactQuerySubscription';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsState } from './settings';
import {
  isNewNotificationSupported,
  makeBrowserNotification,
} from '@/logic/utils';
import api from '@/api';

function harkAction(action: HarkAction) {
  return {
    app: 'hark',
    mark: 'hark-action',
    json: action,
  };
}

export function useSkeins() {
  const queryClient = useQueryClient();
  const { data, ...rest } = useReactQuerySubscription<Skein[], HarkAction>({
    queryKey: ['skeins'],
    app: 'hark',
    path: '/ui',
    scry: '/all/skeins',
    options: {
      refetchOnMount: true,
      retry: 1,
    },
    onEvent: (event) => {
      if (!('add-yarn' in event)) {
        return;
      }

      const settings = queryClient.getQueryData<SettingsState>([
        'settings',
        window.desk,
      ]);
      const doNotDisturb = settings?.display?.doNotDisturb || false;
      if (!isNewNotificationSupported() || doNotDisturb) {
        return;
      }

      if (Notification.permission === 'granted') {
        makeBrowserNotification(event['add-yarn'].yarn);
      }
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    },
  });

  return {
    data: data as Skein[],
    ...rest,
  };
}

export function useSawRopeMutation() {
  const queryClient = useQueryClient();
  const mutationFn = async (variables: { rope: Rope; update?: boolean }) =>
    api.trackedPoke(
      harkAction({
        'saw-rope': variables.rope,
      }),
      { app: 'hark', path: '/ui' }
    );

  return useMutation(mutationFn, {
    onMutate: async () => {
      await queryClient.cancelQueries(['skeins']);
    },
    onSettled: async (_data, _error) => {
      await queryClient.invalidateQueries(['skeins']);
    },
  });
}

export function useSawSeamMutation() {
  const queryClient = useQueryClient();
  const mutationFn = async (variables: { seam: Seam }) =>
    api.poke({
      ...harkAction({
        'saw-seam': variables.seam,
      }),
    });

  return useMutation(mutationFn, {
    onMutate: async () => {
      await queryClient.cancelQueries(['skeins']);
    },
    onSettled: async (_data, _error) => {
      await queryClient.invalidateQueries(['skeins']);
    },
  });
}

export function useHasInviteToGroup(): Skein | undefined {
  const skeins = useSkeins();
  if (!skeins.data) {
    return undefined;
  }

  return skeins.data.find(
    (skein) =>
      skein.top?.rope?.desk === 'groups' &&
      skein.top.con.some((con) => con === ' sent you an invite to ') &&
      skein.unread
  );
}


export function useAddYarnMutation() {
  const queryClient = useQueryClient();
  const mutationFn = async (variables: { yarn: Yarn }) => {

    return api.poke({
      ...harkAction({
        'add-yarn': {
          all: true,
          desk: true,
          yarn: {
            id: null,
            time: null,
            rope: {
              desk: window.desk,
              group: null,
              channel: null,
              thread: '/apps',
            },
            ...variables.yarn,
          }
        },
      }),
    });
  };
  return useMutation(mutationFn, {
    onMutate: async () => {
      await queryClient.cancelQueries(['skeins']);
    },
    onSettled: async (_data, _error) => {
      await queryClient.invalidateQueries(['skeins']);
    },
  });
}
