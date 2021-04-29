import * as React from 'react'
import { createRef, forwardRef, useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import SortItem from './SortItem'
import { generateId, handleMeasure } from './utils'

const defaultStyles = StyleSheet.create({
  styleDraggingOver: {
    backgroundColor: 'transparent',
  },
})

const getItemKeyDefault = ({ item, index }) =>
  `item-${item.id || generateId()}-${index}`

const SortArea = forwardRef(
  (
    {
      areaId = null,
      isDropZone = false,
      items = [],
      acceptedAreas = [],
      itemBeingDragged = false,
      onAreaRender = null,
      onItemRender = null,
      renderItem = null,
      index: areaIndex = null,
      sortEnabled = true,
      disabledItems = false,
      style = {},
      isAreaDraggingOver = false,
      styleDraggingOver = defaultStyles.styleDraggingOver,
      getItemKey = getItemKeyDefault,
      ...rest
    },
    ref,
  ) => {
    const refByItemId = useMemo(
      () =>
        items?.reduce(
          (acc, curr) => ({ ...acc, [curr.id]: acc[curr.id] || createRef() }),
          {},
        ),
      [items, rest, areaId, isDropZone, style, disabledItems, areaIndex],
    )

    const handleRenderArea = () => {
      ref?.current?.measure?.(
        handleMeasure(
          {
            areaId,
            index: areaIndex,
            acceptedAreas,
            isDropZone,
            sortEnabled,
            disabledItems,
            style,
            styleDraggingOver,
            ...rest,
          },
          args => {
            onAreaRender?.(args)
            items?.forEach((item) => {
              refByItemId?.[item.id]?.current?.measure(handleMeasure(item, onItemRender))
            })
          },
        ),
      )
    }

    return (
      <View
        ref={ref}
        onLayout={handleRenderArea}
        style={[style, isAreaDraggingOver ? styleDraggingOver : {}]}
      >
        {items?.map((item, index) => {
          const key = getItemKey?.({ item, index }) || index
          return (
            <SortItem
              ref={refByItemId[item.id]}
              isBeingDragged={
                itemBeingDragged?.id === item?.id &&
                itemBeingDragged?.areaId === item?.areaId
              }
              key={key}
              onItemRender={onItemRender}
              sortEnabled={sortEnabled}
              areaIndex={areaIndex}
              itemIndex={index}
              {...item}
            >
              {renderItem}
            </SortItem>
          )
        })}
      </View>
    )
  },
)

export default SortArea
