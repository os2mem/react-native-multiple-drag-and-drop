import { PanResponder } from 'react-native'
import { useMemo } from 'react'

const usePanHandlers = ({ listener = null } = {}) => {
  const panResponder = useMemo(() => {
    return PanResponder.create({
      // Ask to be the responder:
      onMoveShouldSetPanResponder: (event, gestureState) => {
        //console.log('onMoveShouldSetPanResponder');
        return listener?.('onSetPanResponer')?.({ event, gestureState })
      },
      onPanResponderGrant: (event, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
        listener?.('onStart')?.({ event, gestureState })
      },
      onPanResponderMove: (event, gestureState) => {
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
        listener?.('onMove')?.({ event, gestureState })
      },
      onPanResponderTerminationRequest: (event, gestureState) => {
        return true
      },
      onPanResponderRelease: (event, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
        listener?.('onRelease')?.({ event, gestureState })
        //console.log('release', gestureState);
      },
      onPanResponderTerminate: (event, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
        listener?.('onTerminate')?.({ event, gestureState })
        //console.log('onPanResponderTerminate', gestureState);
      },
      onShouldBlockNativeResponder: (event, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        //console.log('onShouldBlockNativeResponder');
        listener?.('onShouldBlock')?.({ event, gestureState })
        return true
      },
    })
  }, [listener])

  return {
    panHandlers: panResponder.panHandlers,
  }
}

export default usePanHandlers
