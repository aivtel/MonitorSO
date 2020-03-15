import React, { useEffect, useState, useCallback } from "react"
import { connect } from "react-redux"

import LoadingWrapper from "../HOC/LoadingWrapper"
import {
  ComponentContainer,
  Column,
  TabMenu
} from "../Layout/Styled Components"
import {
  fetchFloors,
  floorsSelector,
  cleanSelectMonitor
} from "../../modules/components/monitor"
import Floor from "./Floor"

function Monitor({ floors, dispatchFetchFloors, cleanSelectMonitor }) {
  const [currentFloor, setCurrentFloor] = useState()
  const [isFetching, setIsFetching] = useState(false)
  const [isFetchingFailed, setIsFetchingFailed] = useState(false)

  const handleFloorFetch = useCallback(async () => {
    setIsFetching(true)

    try {
      const response = await dispatchFetchFloors()
      const defaultFloor = response[0]
      setCurrentFloor(defaultFloor)
      setIsFetchingFailed(false)
    } catch (err) {
      console.error(err)
      setIsFetchingFailed(true)
    }

    setIsFetching(false)
  }, [dispatchFetchFloors, setCurrentFloor, setIsFetchingFailed, setIsFetching])

  useEffect(() => {
    handleFloorFetch()
  }, [handleFloorFetch])

  const handleFloorChange = floorNumber => {
    const selectedFloor = floors.find(floor => floor.floor === floorNumber)
    setCurrentFloor(selectedFloor)
    cleanSelectMonitor()
  }

  const Component = (
    <ComponentContainer>
      <Column>
        <TabMenu
          active={currentFloor && currentFloor.floor}
          onChange={handleFloorChange}
          items={floors}
          prefix="Этаж "
          selectionKey="floor"
        />
        <Floor floor={currentFloor} />
      </Column>
    </ComponentContainer>
  )

  return (
    <LoadingWrapper
      loading={isFetching}
      component={Component}
      error={isFetchingFailed}
    />
  )
}

export default connect(
  state => ({
    floors: floorsSelector(state)
  }),
  { dispatchFetchFloors: fetchFloors, cleanSelectMonitor }
)(Monitor)
