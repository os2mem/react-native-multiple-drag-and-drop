import * as React from 'react'
import { forwardRef, createElement } from 'react'
import { View } from 'react-native'
import { handleMeasure } from './utils'

const SortItem = forwardRef(
  (
    {
      areaId,
      itemIndex,
      id,
      onItemRender,
      isBeingDragged,
      children,
      randomId,
      ...rest
    },
    ref,
  ) => {
    // ISSUE: onLayout doesn't get called in some conditions (seemingly when an element is moved by a parent resizing)
    // This means that after the resizes happens the positions states won't update and the drag action will not find the current position of the item
    // https://github.com/facebook/react-native/issues/28775
    // https://github.com/facebook/react-native-website/issues/2056
    // https://github.com/facebook/react-native/issues/23443
    const handleRenderItem = () => {
      //ref?.current?.measure?.(handleMeasure)
      ref?.current?.measure?.(
        handleMeasure({ id, areaId, index: itemIndex, ...rest }, onItemRender),
      )
    }

    return (
      <View ref={ref} onLayout={handleRenderItem}>
        {createElement(children, {
          id,
          isBeingDragged,
          itemIndex,
          areaId,
          ...rest,
        })}
      </View>
    )
  },
)

export default SortItem
