import type { NativeStackScreenProps } from '@react-navigation/native-stack';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}

export type RootStackParamList = {
  Home: undefined;
  Creation: { source?: string;[key: string]: any } | undefined;
  AddDoll: undefined;
  StoryMachinePanel: undefined;
  DollPanel: {
    dollId?: string;
    source?: string;
    dollData?: any;
    id?: number;
    [key: string]: any
  } | undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

declare module '@react-navigation/native' {
  export function useNavigation(): NavigationProp<RootStackParamList>;
} 