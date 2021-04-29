export const findElementAtCoordinates = ({ x, y, elements, execepElement }) => {
  const element = elements.find((element) => {
    const { tlX: areaTlX, tlY: areaTlY, brX: areaBrX, brY: areaBrY } = element
    return (
      isPointWithinArea({
        pointX: x,
        pointY: y,
        areaTlX,
        areaTlY,
        areaBrX,
        areaBrY,
      }) &&
      (execepElement === undefined || execepElement?.id !== element?.id)
    )
  })
  return element
}

export const findNearestElementAtCoordinates = ({
  x,
  y,
  elements,
  execepElement,
}) => {
  const element = elements.reduce((prev, curr) => {
    const { tlX: areaTlX, tlY: areaTlY, brX: areaBrX, brY: areaBrY } = curr
    const {
      tlX: prevAreaTlX,
      tlY: prevAreaTlY,
      brX: prevAreaBrX,
      brY: prevAreaBrY,
    } = prev
    return Math.abs(x - areaBrX) &&
      Math.abs(y - areaBrY) < Math.abs(x - prevAreaBrX) &&
      Math.abs(y - prevAreaBrY) &&
      Math.abs(x - areaTlX) &&
      Math.abs(y - areaTlY) < Math.abs(x, prevAreaTlX) &&
      Math.abs(y - prevAreaTlY) && (execepElement === undefined || execepElement?.id !== element?.id)
      ? curr
      : prev
  })
  return element
}

export const addItemInDropZone = ({
  itemBeingDragged,
  itemDraggingOver,
  areas,
  areaDraggingOver,
  callback = null,
}) => {
  if (itemBeingDragged === undefined) return

  const { areaId: areaDraggingOverId } = areaDraggingOver

  const areaDraggingOverIndex = areas?.findIndex(
    (area) => area?.areaId === areaDraggingOverId,
  )

  const areaFromItemBeingDraggedIndex = areas?.findIndex(
    (area) => area?.areaId === itemBeingDragged?.areaId,
  )

  const itemOverIndex = areas[areaDraggingOverIndex]?.items?.findIndex(
    (item) => item?.id === itemDraggingOver?.id,
  )

  const itemToAdd = {
    ...areas?.[areaFromItemBeingDraggedIndex]?.items?.find(
      (item) => item?.id === itemBeingDragged?.id,
    ),
    areaId: areaDraggingOverId,
  }

  let newAreas = areas
  const itemExistIndex = newAreas[areaDraggingOverIndex]?.items?.findIndex(
    (currentItem) => currentItem?.id === itemBeingDragged?.id,
  )

  //add or replace item
  if (itemExistIndex === -1) {
    if (itemOverIndex === -1) {
      newAreas[areaDraggingOverIndex]?.items?.push(itemToAdd)
    } else {
      newAreas[areaDraggingOverIndex]?.items?.splice(itemOverIndex, 0, itemToAdd)
    }
  } else {
    newAreas[areaDraggingOverIndex].items[itemExistIndex].disabled = false
  }

  const itemToRemoveIndex = newAreas[
    areaFromItemBeingDraggedIndex
  ]?.items?.findIndex((item) => item?.id === itemBeingDragged?.id)

  //Remove or disabled item
  if (
    newAreas[areaFromItemBeingDraggedIndex]?.disabledItems &&
    newAreas?.[areaFromItemBeingDraggedIndex]?.items?.[itemToRemoveIndex]
  ) {
    newAreas[areaFromItemBeingDraggedIndex].items[
      itemToRemoveIndex
    ].disabled = true
  } else {
    newAreas[areaFromItemBeingDraggedIndex]?.items.splice(itemToRemoveIndex, 1)
  }
  callback?.(newAreas)
  return newAreas
}

export const swapItemsFromEqualDropZone = ({
  itemDraggingOver,
  itemBeingDragged,
  areas,
  areaDraggingOver,
  callback = null,
}) => {
  if (
    itemDraggingOver?.areaId === itemBeingDragged?.areaId ||
    itemBeingDragged?.areaId === areaDraggingOver?.areaId
  ) {
    const areaIndex = areas?.findIndex(
      (area) => itemDraggingOver?.areaId === area.areaId,
    )
    const area = areas?.[areaIndex]
    const itemOverIndex = areas?.[areaIndex]?.items?.findIndex(
      (item) => item?.id === itemDraggingOver?.id,
    )
    const itemBeingDraggedIndex = area?.items?.findIndex(
      (item) => item?.id === itemBeingDragged?.id,
    )
    if (area?.items) {
      const newArrItems = moveArrayElementAt({
        arr: area?.items,
        from: itemBeingDraggedIndex,
        to: itemOverIndex,
      })
      const newAreas = areas?.map((currentArea) => {
        if (currentArea?.areaId === area?.areaId) {
          return {
            ...currentArea,
            items: newArrItems,
          }
        }

        return currentArea
      })
      callback?.(newAreas)
      return newAreas
    }
    callback?.(areas)
    return areas
  }
}

export const generateId = () =>
  `${Math.ceil(Math.random() * 1000)}_${new Date().getTime()}`

// Calculates whether a given point is within a given area
export const isPointWithinArea = ({
  pointX, // x coordinate
  pointY, // y coordinate
  areaTlX, // top left x coordinate
  areaTlY, // top left y coordinate
  areaBrX, // bottom right x coordinate
  areaBrY, // bottom right y coordinate
}) => {
  return (
    areaTlX <= pointX &&
    pointX <= areaBrX && // is within horizontal axis
    areaTlY <= pointY &&
    pointY <= areaBrY
  ) // is within vertical axis
}

function moveArrayElementAt({ arr, from, to }) {
  while (from < 0) {
    from += arr.length
  }
  while (to < 0) {
    to += arr.length
  }
  if (to >= arr.length) {
    var k = to - arr.length
    while (k-- + 1) {
      arr.push(undefined)
    }
  }
  arr.splice(to, 0, arr.splice(from, 1)[0])
  return arr
}

export const removeItem = ({ item, areas, callback }) => {
  const areaToRemoveIndex = areas?.findIndex(
    (area) => area?.areaId === item?.areaId,
  )
  const itemToRemoveIndex = areas?.[areaToRemoveIndex]?.items?.findIndex(
    (currentItem) => currentItem?.id === item?.id,
  )
  if (areas?.[areaToRemoveIndex]?.items) {
    if (!areas?.[areaToRemoveIndex]?.disabledItems) {
      areas[areaToRemoveIndex]?.items?.splice(itemToRemoveIndex, 1)
    } else {
      areas[areaToRemoveIndex].items[itemToRemoveIndex].disabled = true
    }
  }
  callback(areas)
  return areas
}

export const addItem = ({ item, areaId, areas, callback }) => {
  const areaToAddIndex = areas?.findIndex((area) => area?.areaId === areaId)
  if (areaToAddIndex > -1) {
    const itemExistInAreaIndex = areas?.[areaToAddIndex]?.items?.findIndex(
      (currentItem) => currentItem?.id === item?.id,
    )
    if (itemExistInAreaIndex > -1) {
      areas[areaToAddIndex].items[itemExistInAreaIndex].disabled = false
    } else {
      areas?.[areaToAddIndex]?.items?.push({
        areaId,
        item: item.item,
        id: item.id,
        disabled: item.disabled,
      })
    }
  }
  callback?.(areas)
  return areas
}

export const isPress = ({ dx, dy }) => {
  return dx >= -1 && dx <= 1 && dy >= -1 && dy <= 1
}

export const handleMeasure = (item, callback) => (
  x,
  y,
  width,
  height,
  screenX,
  screenY,
) => {
  callback?.({
    x,
    y,
    width,
    height,
    screenX,
    screenY,
    ...item,
  })
}
