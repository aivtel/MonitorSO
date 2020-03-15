import React, { useEffect, useState, useCallback } from "react"
import { connect } from "react-redux"
import styled from "styled-components"

import { CardContainer, CornerIcon } from "../Layout/Styled Components"
import { Button } from "../Layout/Styled Antd Components"
import {
  fetchMonitor,
  getMonitorByRpId,
  moduleName as monitorModuleName,
  switchOnSwitchOffRebootRpId
} from "../../modules/components/monitor"
import { showModal } from "../../modules/ui"

import InfoMonitorForm from "./MonitorSettingsForms/InfoMonitorForm"
import KabinetMonitorForm from "./MonitorSettingsForms/KabinetMonitorForm"
import TouchMonitorForm from "./MonitorSettingsForms/TouchMonitorForm"

const Container = styled.div`
  width: 350px;
  height: 100%;
  overflow: hidden;
  flex-shrink: 0;
  text-align: center;
`

const ButtonsRow = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 20px;
`

const MonitorStatus = styled.span`
  position: absolute;

  right: 20px;
  bottom: 10px;

  &::after {
    content: "";

    position: absolute;
    top: 0.5rem;
    right: -15px;

    min-width: 10px;
    min-height: 10px;

    background: ${props => props.color};
    border-radius: 100%;

    box-shadow: 0 0 3px ${props => props.color};
  }
`

function Menu({
  monitor,
  currentMonitorRpId,
  fetchMonitor,
  showModal,
  switchOnSwitchOffRebootRpId
}) {
  if (!currentMonitorRpId) return null

  const [isFetching, setIsFetching] = useState(false)
  const [isFetchingFailed, setIsFetchingFailed] = useState(false)

  const handleMonitorFetch = useCallback(async () => {
    setIsFetching(true)

    try {
      await fetchMonitor(currentMonitorRpId)
      setIsFetchingFailed(false)
    } catch (err) {
      console.error(err)
      setIsFetchingFailed(true)
    }

    setIsFetching(false)
  }, [currentMonitorRpId])

  useEffect(() => {
    handleMonitorFetch()
  }, [handleMonitorFetch])

  return (
    <Container>
      <CardContainer style={{ minHeight: 180, fontSize: "1rem" }}>
        <CornerIcon
          type="setting"
          tooltip="Настройки"
          tooltipPlacement="leftBottom"
          onClick={() =>
            monitor &&
            monitor.type &&
            currentMonitorRpId &&
            showModal("ant", {
              component: getFormByMonitorType(monitor.type),
              componentProps: { currentMonitorRpId, monitor },
              width: getFormWidthByMonitorType(monitor.type),
              footer: null
            })
          }
        />
        <MenuContent
          monitor={monitor}
          loading={isFetching}
          error={isFetchingFailed}
          currentMonitorRpId={currentMonitorRpId}
          switchOnSwitchOffRebootRpId={switchOnSwitchOffRebootRpId}
        />
      </CardContainer>
    </Container>
  )
}

function MenuContent({
  monitor,
  loading,
  error,
  currentMonitorRpId,
  switchOnSwitchOffRebootRpId
}) {
  if (loading) return "Загрузка данных монитора..."
  if (error) return "Произошла ошибка при загрузке данных монитора"

  const { title, type, status } = monitor

  return (
    <>
      <h2>{title}</h2>
      <p>Тип монитора: {type}</p>
      <ButtonsRow>
        <Button
          onClick={() => switchOnSwitchOffRebootRpId(currentMonitorRpId, 1)}
        >
          Включить
        </Button>
        <Button
          onClick={() => switchOnSwitchOffRebootRpId(currentMonitorRpId, 2)}
          style={{ margin: "0px 6px" }}
        >
          Выключить
        </Button>
        <Button
          onClick={() => switchOnSwitchOffRebootRpId(currentMonitorRpId, 3)}
        >
          Перезагрузить
        </Button>
      </ButtonsRow>
      <MonitorStatus color={status ? "limegreen" : "crimson"}>
        {status ? "Работает" : "Не работает"}
      </MonitorStatus>
    </>
  )
}

export default connect(
  state => {
    const { currentMonitorRpId } = state[monitorModuleName]

    return {
      currentMonitorRpId,
      monitor: getMonitorByRpId(currentMonitorRpId)(state)
    }
  },
  { fetchMonitor, showModal, switchOnSwitchOffRebootRpId }
)(Menu)

const getFormByMonitorType = type => {
  switch (type) {
    case "Информационный":
      return InfoMonitorForm
    case "Прикабинетный":
      return KabinetMonitorForm
    case "Тач панель":
      return TouchMonitorForm
    default:
      return TouchMonitorForm
  }
}

const getFormWidthByMonitorType = type => {
  switch (type) {
    case "Информационный":
      return "1200px"
    case "Прикабинетный":
      return "1400px"
    case "Тач панель":
      return "1200px"
    default:
      return "1200px"
  }
}
