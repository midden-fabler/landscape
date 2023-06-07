import { useAppSearchStore } from './nav/Nav';
import { useRecentsStore } from './nav/search/Home';
import useDocketState from './state/docket';

declare global {
  interface Window {
    ship: string;
    desk: string;
    our: string;
    recents: typeof useRecentsStore.getState;
    docket: typeof useDocketState.getState;
    appSearch: typeof useAppSearchStore.getState;
  }
}

export {};
