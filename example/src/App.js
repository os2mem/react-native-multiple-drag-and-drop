/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, forwardRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
} from 'react-native';
import DnD from 'react-native-module-template'

const styles = StyleSheet.create({
  sortAreaContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    minHeight: 50,
    height: 100,
    marginBottom: 16,
    backgroundColor: 'red',
    margin: 8,
    paddingVertical: 16,
    width: '70%'
  },
  sortItem: {
    backgroundColor: 'lightblue',
    padding: 8,
    marginLeft: 4,
  },
});

const App = () => {
  const options = {
    areaId: 'options',
    items: ['holaaaaaaaaaa', 'como', 'estas', 'hola', 'como', 'estaaaas', 'holaaaaaaa', 'como', 'estas'],
    isDropZone: true,
    acceptedAreas: ['userOptions'],
    style:[ styles.sortAreaContainer],
    sortEnabled: false,
    disabledItems: false,
  };

  const userOptions = {
    areaId: 'userOptions',
    items: [],
    isDropZone: true,
    acceptedAreas: ['options'],
    style: [styles.sortAreaContainer],
    sortEnabled: true,
    disabledItems: false,
  };

  const [sortAreas, setSortAreas] = useState([userOptions, options]);

  const handleItemPress = (item) => {
    if (item?.areaId === 'userOptions') {
      item?.addItem('options');
      item?.removeItem?.();
    }

    if (item?.areaId === 'options') {
      item?.addItem('userOptions');
      item?.removeItem?.();
    }
  };

  const handleAreasChange = (newAreas) => {
    setSortAreas(newAreas);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <View style={{marginTop: 300}}>
          <DnD
            sortAreas={sortAreas}
            onAreasChange={handleAreasChange}
            onPressItem={handleItemPress}
            renderItem={Item}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

const Item = ({
  id,
  isBeingDragged,
  itemIndex,
  areaId,
  item,
  areaIndex,
  isDragginItem,
  ...rest
}) => {
  return (
    <View
      style={[
        styles.sortItem,
        isBeingDragged ? {backgroundColor: 'blue'} : {},
      ]}>
      <Text>{item}</Text>
    </View>
  );
};

export default App;

