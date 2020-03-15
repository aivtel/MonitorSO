import React from "react"
import MonitorIcon from "./MonitorIcon"

export function FloorMonitors({ floor }) {
  return getFloorMonitors(floor).map(monitor => (
    <MonitorIcon key={monitor.rpId} monitor={monitor} />
  ))
}

function getFloorMonitors(floor) {
  const rooms = floor.rooms
  return rooms
    .filter(room => typeof room.svgMonitor === "string")
    .reduce((monitors, room) => {
      const monitor = extractMonitor(room)

      if (isMonitorValid(monitor)) return [...monitors, monitor]
      return monitors
    }, [])
}

function extractMonitor(room) {
  const delimeter = ", "
  const [xCoord, yCoord, type] = room.svgMonitor.split(delimeter)

  return {
    rpId: room.rpId,
    offset: { x: Number(xCoord), y: Number(yCoord) },
    type
  }
}

function isMonitorValid(monitor) {
  const { offset, type } = monitor

  const checkCoord = coord => typeof coord === "number" && !Number.isNaN(coord)
  const areCoordsValid = () => checkCoord(offset.x) && checkCoord(offset.y)

  const allowedTypes = ["kabinet", "info", "touch"]
  const isTypeValid = () => allowedTypes.includes(type)

  return areCoordsValid() && isTypeValid()
}
