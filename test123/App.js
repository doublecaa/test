
import React from 'react';
import {Node, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { ImmediateCheckCodePush } from './dialog';
import HotUpdate from "./dialog"
import codePush from "react-native-code-push";

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [syncMessage, setSyncMessage] =React.useState('') 
  const [next, setNext] =React.useState(false) 

 

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text> CodePushExample123 </Text>
            <HotUpdate deploymentKey={'pxu1JlIYdLB2gAzlKt1Jp8i_qTiK_47meLKXo'} isActiveCheck={false}/>
            <TouchableOpacity onPress={()=>{
                ImmediateCheckCodePush();
            }}>
              <Text>asd</Text>
            </TouchableOpacity>
        </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default codePush(App);
