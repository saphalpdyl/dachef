import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';

interface CollapsableProps {
  text: string;
  numberOfLines?: number;
  style?: any;
}

const Collapsable: React.FC<CollapsableProps> = ({
  text,
  numberOfLines = 4,
  style = {},
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        <View style={[isCollapsed && { maxHeight: numberOfLines * 20, overflow: 'hidden' }]}>
          <Markdown style={{
            body: styles.text,
            paragraph: styles.text
          }}>
            {text.trimStart()}
          </Markdown>
        </View>
        
        {isCollapsed && (
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
            style={styles.gradient}
            pointerEvents="none"
          />
        )}
      </View>

      <TouchableOpacity
        onPress={() => setIsCollapsed(!isCollapsed)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          {isCollapsed ? 'Show More' : 'Show Less'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  textContainer: {
    position: 'relative',
  },
  text: {
    fontSize: 11,
    lineHeight: 12,
    color: '#333',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  button: {
    marginTop: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#339af0',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Collapsable;
