import React from "react"

import {
  FloorContainer,
  DragContainer,
  Map,
  MenuInfoContainer
} from "../Layout/Styled Components"

import { renderFloorImageSwitch } from "../../utils"
import Menu from "./Menu"
import { FloorMonitors } from "./FloorMonitors"

export default function Floor({ floor }) {
  if (!isFloorValid(floor)) return null

  return (
    <FloorContainer>
      <DragContainer>
        <Map {...getMapProps(floor)}>
          <svg {...getSVGProps(floor)}>
            <FloorMonitors floor={floor} />
          </svg>
        </Map>
      </DragContainer>
      <MenuInfoContainer>
        <Menu />
      </MenuInfoContainer>
    </FloorContainer>
  )
}

function getMapProps(floor) {
  const { width, height } = getMapSize(floor)
  return {
    id: "map",
    className: "map",
    img: getMapBackground(floor),
    module: "monitor",
    style: {
      width: width + "px",
      height: height + "px"
    }
  }
}

function getSVGProps(floor) {
  const { width, height } = getMapSize(floor)
  return {
    width: width,
    height: height,
    viewBox: `0 0 ${width} ${height}`
  }
}

//#region utils
function isFloorValid(floor) {
  const checkType = () => typeof floor === "object"

  const checkRooms = () => "rooms" in floor && Array.isArray(floor.rooms)
  const checkMap = () => "map" in floor && typeof floor.map === "object"
  const checkFields = () => checkRooms() && checkMap()

  return checkType() && checkFields()
}

function getMapSize(floor) {
  const floorMap = getFloorMap(floor)
  return {
    height: floorMap.height,
    width: floorMap.width
  }
}

function getMapBackground(floor) {
  const floorMap = getFloorMap(floor)
  return renderFloorImageSwitch(floorMap.background)
}

function getFloorMap(floor) {
  const fallbackFloorMap = {
    width: 0,
    height: 0,
    background: ""
  }

  if (isFloorValid(floor)) return floor.map
  return fallbackFloorMap
}

//#endregion
