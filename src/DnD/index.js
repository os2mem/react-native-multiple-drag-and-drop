import * as React from 'react'
import { useState, useEffect, useRef, createRef } from 'react'
import {
  View,
  LayoutAnimation,
  UIManager,
  Platform,
  Animated,
} from 'react-native'
import usePanHandlers from './usePanHandlers'
import {
  generateId,
  findElementAtCoordinates,
  swapItemsFromEqualDropZone,
  addItemInDropZone,
  removeItem,
  addItem,
  isPress,
  handleMeasure,
  findNearestElementAtCoordinates,
} from './utils'
import SortArea from './SortArea'
import SortItem from './SortItem'

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

const DnD = ({
  sortAreas = [],
  renderItem = null,
  onAreasChange,
  onPressItem,
  onDragStart,
  onDragEnd
}) => {
  const ref = useRef(null)
  const refByAreaId = sortAreas?.reduce(
    (acc, curr) => ({ ...acc, [curr.areaId]: acc[curr.areaId] || createRef() }),
    {},
  )
  const [containerMeasure, setContainerMeasure] = useState(null)
  const [pan] = useState(new Animated.ValueXY())
  const [opacity] = useState(new Animated.Value(0))
  const [areaDraggingOver, setAreaDraggingOver] = useState(false)
  const [areas, setAreas] = useState(() => {
    return sortAreas?.map((area, areaIndex) => {
      return {
        ...area,
        disabledItems: area?.disabledItems,
        index: areaIndex,
        items: area?.items?.map((item, index) => ({
          areaId: area?.areaId,
          item,
          id: generateId?.(),
          disabled: false,
        })),
      }
    })
  })
  const [areasState, setAreasState] = useState([])

  const [itemsState, setItemState] = useState([])
  const [itemBeingDragged, setItemBeingDragged] = useState()
  const shouldDraggedItemAppear =
    itemBeingDragged !== undefined && containerMeasure !== null

  const handleOnItemPress = (item) => {
    const newItem = {
      ...item,
      removeItem: () =>
        removeItem?.({ item, areas, callback: handleAreasChange }),
      addItem: (areaId) =>
        addItem?.({ item, areas, areaId, callback: handleAreasChange }),
    }
    onPressItem?.(newItem)
  }

  const animateLayout = () => {
    LayoutAnimation.configureNext({
      ...LayoutAnimation.Presets.easeInEaseOut,
      duration: 250,
    })
  }

  const calculateItemDragPos = ({
    moveX,
    moveY,
    containerMeasure,
    itemBeingDragged,
  }) => {
    const { x: containerScreenX = 0, y: containerScreenY = 0 } =
      containerMeasure || {}
    const { height: itemHeigth = 0, width: itemWidth = 0 } =
      itemBeingDragged || {}

    const calculateX = moveX - containerScreenX - itemWidth / 2
    const calculateY = moveY - containerScreenY - itemHeigth / 2

    return {
      x: calculateX,
      y: calculateY,
    }
  }

  const animateItemDrag = ({
    containerMeasure = false,
    gestureState = false,
    event = false,
  }) => {
    const { moveX = false, moveY = false, dx, dy } = gestureState || {}
    if (moveY && moveX && event) {
      Animated.event([null, { x: pan.x, y: pan.y }], {
        useNativeDriver: false,
      })(
        event,
        calculateItemDragPos({
          moveX,
          moveY,
          containerMeasure,
          itemBeingDragged,
        }),
      )
    }
  }

  const resetAnimatedItemDrag = ({
    containerMeasure = false,
    gestureState = false,
  }) => {
    const { moveX = false, moveY = false } = gestureState || {}

    if (moveY && moveX) {
      Animated.spring(pan, {
        toValue: calculateItemDragPos({
          moveX,
          moveY,
          containerMeasure,
          itemBeingDragged,
        }),
        useNativeDriver: false,
      }).start(() => opacity.setValue(0))
    }
  }

  const handlePanResponderListener = (listenerType) =>
    ({
      onSetPanResponer: ({ event, gestureState }) => {
        const { dx, dy, moveX, moveY, numberActiveTouches } = gestureState
        // Dont set with multitouch || dont set is not movement happened
        let shouldSetPanResPonder =
          numberActiveTouches === 1 || (dx > 0 && dy > 0)

        const item = findElementAtCoordinates({
          x: moveX,
          y: moveY,
          elements: itemsState,
        })

        const areaDraggingOver = findElementAtCoordinates({
          x: moveX,
          y: moveY,
          elements: areasState,
          execepElement: item,
        })

        if (item && !item?.disabled)
          setItemBeingDragged({ ...item, isBeingDragged: true })
        if (areaDraggingOver) setAreaDraggingOver(areaDraggingOver)

        return shouldSetPanResPonder
      },
      onStart: ({ event, gestureState }) => {
        animateItemDrag({ containerMeasure, gestureState, event })
        onDragStart?.()
      },
      onMove: ({ event, gestureState }) => {
        const { moveX, moveY } = gestureState
        animateItemDrag({ containerMeasure, gestureState, event })
        const areaDraggingOver = findElementAtCoordinates({
          x: moveX,
          y: moveY,
          elements: areasState,
        })
        if (areaDraggingOver) setAreaDraggingOver(areaDraggingOver)
      },
      onRelease: ({ event, gestureState }) => {
        const { dx, dy, moveX, moveY } = gestureState

        const itemDraggingOver = findNearestElementAtCoordinates({
          x: moveX,
          y: moveY,
          elements: itemsState,
          execepElement: itemBeingDragged,
        })

        const areaDraggingOver = findElementAtCoordinates({
          x: moveX,
          y: moveY,
          elements: areasState,
          execepElement: itemBeingDragged,
        })

        swapElements({
          itemDraggingOver,
          itemBeingDragged,
          areaDraggingOver,
        })

        if (isPress({ dx, dy }) && itemBeingDragged) {
          handleOnItemPress?.(itemBeingDragged)
        }
        setItemBeingDragged()
        resetAnimatedItemDrag({ containerMeasure, gestureState, event })
        onDragEnd?.()
      },
      onTerminate: ({ event, gestureState }) => {},
      onShouldBlock: ({ event, gestureState }) => {},
    }?.[listenerType])

  const { panHandlers } = usePanHandlers({
    listener: handlePanResponderListener,
  })

  const filterItemStates = (states) => {
    const newStates = states.filter((item) =>
      areas?.some((area) =>
        area?.items?.some(
          (currentItem) =>
            currentItem?.areaId === item?.areaId && currentItem?.id === item?.id,
        ),
      ),
    )
    return newStates
  }

  const updateItemState = (item) => {
    setItemState((prevItemState) => {
      const index = prevItemState?.findIndex(
        ({ id, areaId }) => id === item?.id && item?.areaId === areaId,
      )
      if (index > -1) {
        const newState = prevItemState
        newState[index] = {
          ...newState[index],
          ...item,
        }
        return filterItemStates(newState)
      }
      return filterItemStates([...prevItemState, item])
    })
  }

  const onItemRender = ({ x, y, height, width, screenX, screenY, ...rest }) => {
    updateItemState({
      x,
      y,
      height,
      width,
      tlX: screenX,
      tlY: screenY,
      brX: screenX + width,
      brY: screenY + height,
      screenY,
      screenX,
      ...rest,
    })
  }

  const updateAreaState = (area) => {
    setAreasState((prevAreaState) => {
      const index = prevAreaState?.findIndex(
        ({ areaId }) => areaId === area?.areaId,
      )
      if (index > -1) {
        const newState = prevAreaState
        newState[index] = area
        return newState
      }
      return [...prevAreaState, area]
    })
  }

  const onAreaRender = ({ x, y, width, height, screenX, screenY, ...rest }) => {
    updateAreaState({
      x,
      y,
      height,
      width,
      tlX: screenX,
      tlY: screenY,
      brX: screenX + width,
      brY: screenY + height,
      screenY,
      screenX,
      ...rest,
    })
  }

  const handleMeasureContainerInWindow = (x, y, width, height) =>
    setContainerMeasure({ x, y, width, height })

  const handleRenderContainer = () => {
    ref.current.measureInWindow(handleMeasureContainerInWindow)
    areas?.forEach((area) => {
      refByAreaId?.[area.areaId]?.current?.measure(
        handleMeasure(area, onAreaRender),
      )
    })
  }

  const swapElements = ({
    itemDraggingOver,
    itemBeingDragged,
    areaDraggingOver,
  }) => {
    const currentAreaToSort = areas?.find(
      (area) => area?.areaId === itemBeingDragged?.areaId,
    )

    if (
      itemBeingDragged?.areaId === areaDraggingOver?.areaId &&
      currentAreaToSort?.sortEnabled
    ) {
      swapItemsFromEqualDropZone({
        itemDraggingOver,
        itemBeingDragged,
        areas,
        areaDraggingOver,
        callback: handleAreasChange,
      })

      animateLayout()
      return
    }

    if (
      areaDraggingOver?.acceptedAreas?.includes(itemBeingDragged?.areaId) &&
      areaDraggingOver?.isDropZone
    ) {
      addItemInDropZone({
        itemBeingDragged,
        itemDraggingOver,
        areas,
        areaDraggingOver,
        callback: handleAreasChange,
      })
      animateLayout()
    }
  }

  const handleAreasChange = (newAreas) => {
    const newSortAreasFromProps = sortAreas.map((area) => {
      const { items = false } = newAreas?.find(
        ({ areaId }) => areaId === area?.areaId,
      )
      return {
        ...area,
        ...(items ? { items } : {}),
      }
    })
    setAreas(newAreas)
    newAreas?.flatMap((area) => area?.items).map(updateItemState)
    onAreasChange?.(newSortAreasFromProps)
    handleRenderContainer()
  }

  useEffect(() => {
    if (itemBeingDragged) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }).start()
    }
  }, [itemBeingDragged])

  return (
    <View {...panHandlers} ref={ref} onLayout={handleRenderContainer}>
      {areas?.map((area, index) => (
        <SortArea
          isAreaDraggingOver={areaDraggingOver?.areaId === area?.areaId}
          onAreaRender={onAreaRender}
          onItemRender={onItemRender}
          key={index}
          index={index}
          itemBeingDragged={itemBeingDragged}
          renderItem={renderItem}
          ref={refByAreaId[area.areaId]}
          {...area}
        />
      ))}
      {shouldDraggedItemAppear && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              ...pan.getLayout(),
              opacity,
            },
          ]}
        >
          <SortItem
            {...itemBeingDragged}
            isDraggingItem={true}
            isBeingDragged={false}
          >
            {renderItem}
          </SortItem>
        </Animated.View>
      )}
    </View>
  )
}

export default DnD
