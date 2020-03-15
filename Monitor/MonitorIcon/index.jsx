import React from "react"
import { connect } from "react-redux"

import CabinetIcon from "./CabinetIcon"
import InfoIcon from "./InfoIcon"
import TouchIcon from "./TouchIcon"

import { selectMonitor } from "../../../modules/components/monitor"

export default connect(
  null,
  { selectMonitor }
)(MonitorIcon)

function MonitorIcon({ monitor, selectMonitor }) {
  const {
    offset: { x, y },
    rpId,
    type
  } = monitor

  const handleClick = () => selectMonitor(rpId)

  return (
    <svg className="monitor" x={`${x}px`} y={`${y}px`} onClick={handleClick}>
      {getIcon(type)}
    </svg>
  )
}

function getIcon(type) {
  switch (type) {
    case "kabinet":
      return <CabinetIcon />
    case "info":
      return <InfoIcon />
    case "touch":
      return <TouchIcon />
    default:
      return null
  }
}
