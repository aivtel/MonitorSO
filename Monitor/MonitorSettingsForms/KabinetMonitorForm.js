import React, { useState, useEffect } from "react"
import { connect } from "react-redux"
import moment from "moment"
import styled from "styled-components"
import {
  Button,
  Select,
  Input,
  Checkbox,
  DatePicker,
  Icon
} from "../../Layout/Styled Antd Components"
import { Switch, Collapse, Card } from "antd"
import {
  fetchMonitor,
  getMonitorByRpId,
  moduleName as monitorModuleName,
  saveMonitor,
  uploadBackgroundImage,
  setDefaultBackgroundImage,
  setBackgroundImageToAllFloor,
  setBackgroundImageToAllKabinetMonitors,
  getWorkersByRpIdSelector,
  getWorkers,
  addWorkers,
  deleteWorker,
  updateWorker,
  getWorkersForView,
  getWorkersForViewSelector
} from "../../../modules/components/monitor"

import {
  getAllOSHSWorkers,
  synchOshsData,
  allOshsEmployeesSelector,
  synchOshsLoadingSelector
} from "../../../modules/components/helpdesk"

import ImageDefault from "../../../assets/img/default.jpg"
import ReplacementIcon from "../../../assets/img/replacement-icon-24px.svg"

const dateFormat = "DD/MM/YYYY"

const Container = styled.div`
  display: flex;
  flex-direction: column;
`

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-right: 20px;
  margin-bottom: 10px;
`
const MainSection = styled.div`
  display: flex;
  flex-direction: row;
`
const Column = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: #3a3a3a;
  margin: 10px;
  padding: 10px;
  border-radius: 4px;
`

const ButtonColumn = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  padding: 20px;
  justify-content: center;
`
const ArrowContainer = styled.div`
  margin: 0px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border: 1px solid gray;
  padding: 6px;
  border-radius: 4px;
  :hover {
    color: orange;
    border: 1px solid orange;
  }
`
const Row = styled.div`
  display: flex;
  flex-direction: row;
`

const StyledSwitch = styled(Switch)`
  &.ant-switch {
    background-color: gray;
  }
  &.ant-switch-checked {
    background-color: #2661fb;
  }
`

const HiddenInput = styled.input`
  visibility: hidden;
  width: 10px;
`
const LabelHiddenInput = styled.label`
  display: inline-block;
  line-height: 32px;
  width: 90px;
  cursor: pointer;
`

const Item = styled.div`
  height: 42px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  padding: 10px;
  border: 1px solid lightGray;
  margin: 6px 6px 0px;

  .filename {
    margin: 0px 10px;
  }
`

const ItemsListSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  max-height: 400px;
  overflow: auto;
`

const StyledCollapsePanel = styled(Collapse.Panel)`
  .ant-collapse-header {
    padding: 4px 8px !important;
  }
`

function KabinetMonitorForm({
  monitor,
  currentMonitorRpId,
  fetchMonitor,
  monitorInfo,
  saveMonitor,
  uploadBackgroundImage,
  setDefaultBackgroundImage,
  setBackgroundImageToAllFloor,
  setBackgroundImageToAllKabinetMonitors,
  getWorkers,
  workers,
  getAllOSHSWorkers,
  allOshsEmployees,
  addWorkers,
  deleteWorker,
  updateWorker,
  getWorkersForView,
  workersForView,
  synchOshsData,
  synchOshsSelectorLoading
}) {
  const [flagTime, setFlagTime] = useState(false)
  const [pictureBase64, setPictureBase64] = useState("")
  const [pictureName, setPictureName] = useState(undefined)
  const [roomNumber, setRoomNumber] = useState("")
  const [roomEmployees, setRoomEmployees] = useState([])
  const [oshsEmployees, setOshsEmployees] = useState([])
  const [oshsEmployeesInputValue, setOshsEmployeesInputValue] = useState("")
  const [oshsEmployeesFilteredInput, setOshsEmployeesFilteredInput] = useState(
    ""
  )
  const [selectedOshsEmployees, setSelectedOshsEmployees] = useState([])
  const [roomEmployeesInputValue, setRoomEmployeesInputValue] = useState("")
  const [roomEmployeesFilteredInput, setRoomEmployeesFilteredInput] = useState(
    ""
  )

  const [
    replacementEmployeeInputValue,
    setReplacementEmployeeInputValue
  ] = useState("")
  const [
    replacementEmployeeFilteredInput,
    setReplacementEmployeeFilteredInput
  ] = useState("")

  const [workersUpdateInfo, setWorkersUpdateInfo] = useState({})

  const [
    collapseReplacementActiveKey,
    setCollapseReplacementActiveKey
  ] = useState("")
  const [workersView, setWorkersView] = useState([])

  const selectHandler = value =>
    saveMonitor(currentMonitorRpId, { angleRotation: value })

  const switchHandler = bool => {
    saveMonitor(currentMonitorRpId, { flagTime: bool })
  }

  const addAndSortEmployees = array => {
    setRoomEmployees(array)
    array.forEach(e => {
      const newObj = {
        [e._id]: {
          vacationStart: e.vacationStart,
          vacationEnd: e.vacationEnd,
          replacement: e.replacement,
          chief: e.chief
        }
      }
      setWorkersUpdateInfo(prev => ({ ...prev, ...newObj }))
    })
  }

  useEffect(() => {
    fetchMonitor(currentMonitorRpId)
  }, [])

  useEffect(() => {
    getWorkers(currentMonitorRpId)
  }, [])
  useEffect(() => {
    getWorkersForView(currentMonitorRpId)
  }, [])
  useEffect(() => {
    getAllOSHSWorkers()
  }, [])

  useEffect(() => setFlagTime(monitorInfo.flagTime), [monitorInfo.flagTime])
  useEffect(() => {
    monitorInfo.pictureByteArray
      ? setPictureBase64(monitorInfo.pictureByteArray)
      : setPictureBase64("")
  }, [monitorInfo.pictureByteArray])
  useEffect(() => {
    setPictureName(monitorInfo.pictureFon)
  }, [monitorInfo.pictureFon])
  useEffect(() => {
    setRoomNumber(monitorInfo.roomNum)
  }, [monitorInfo.roomNum])
  useEffect(() => {
    workers && workers.length > 0
      ? addAndSortEmployees(workers)
      : addAndSortEmployees([])
  }, [workers])
  useEffect(() => {
    workersForView &&
      workersForView.length > 0 &&
      setWorkersView(workersForView)
  }, [workersForView])

  useEffect(() => {
    allOshsEmployees &&
      allOshsEmployees.length > 0 &&
      setOshsEmployees(allOshsEmployees)
  }, [allOshsEmployees])

  const uploadImageHandler = (e, rpId) => {
    const uploadData = new FormData()
    uploadData.append("file", e)
    uploadBackgroundImage(uploadData, rpId)
    saveMonitor(currentMonitorRpId, { pictureFon: e.name })
  }

  const oshsCheckboxHandler = item => {
    const setFromArray = new Set(selectedOshsEmployees)
    setFromArray.has(item) ? setFromArray.delete(item) : setFromArray.add(item)
    const newArray = [...setFromArray]
    setSelectedOshsEmployees(newArray)
  }

  const replacementCheckboxHandler = (item, employeeId) => {
    const newObj = {
      ...workersUpdateInfo,
      [employeeId]: {
        ...workersUpdateInfo[employeeId],
        replacement: workersUpdateInfo[employeeId].replacement
          ? ""
          : Number(item.kod)
      }
    }
    setWorkersUpdateInfo(newObj)
  }

  const checkedValidationHandler = (file, selectedItems) => {
    const bool = selectedItems.includes(file)
    return bool
  }

  const datePickerHandler = (date, dateString, id) => {
    const newObj = {
      ...workersUpdateInfo,
      [id]: {
        ...workersUpdateInfo[id],
        vacationStart: dateString[0],
        vacationEnd: dateString[1]
      }
    }
    setWorkersUpdateInfo(newObj)
  }

  const replacementEmployeeInputHandler = value => {
    setReplacementEmployeeInputValue(value)
    const copiedArray = [...oshsEmployees]
    const newArray = copiedArray.filter(e =>
      e.familiya
        .concat(` ${e.imya} ${e.otchestvo}`)
        .toLowerCase()
        .includes(value.toLowerCase())
    )
    setReplacementEmployeeFilteredInput(newArray)
  }

  const isChiefCheckboxHandler = id => {
    const newValue =
      workersUpdateInfo[id].chief && workersUpdateInfo[id].chief === 1 ? 0 : 1
    const newObj = {
      ...workersUpdateInfo,
      [id]: {
        ...workersUpdateInfo[id],
        chief: newValue
      }
    }
    setWorkersUpdateInfo(newObj)
  }

  const getOshsList = items =>
    items &&
    items.length > 0 &&
    items.map(item => (
      <Item
        style={{
          backgroundColor: "white",
          paddingTop: "10px",
          paddingBottom: "10px"
        }}
        key={item.kod + item.familiya}
      >
        <Checkbox
          checked={checkedValidationHandler(item, selectedOshsEmployees)}
          onClick={() => oshsCheckboxHandler(item)}
        />
        <span style={{ marginLeft: "10px" }}>
          {item.familiya.concat(` ${item.imya} ${item.otchestvo}`)}
        </span>
      </Item>
    ))

  const getReplacementList = (items, employeeId) =>
    items &&
    items.length > 0 &&
    items.map(item => (
      <Item
        style={{
          backgroundColor: "white",
          paddingTop: "10px",
          paddingBottom: "10px"
        }}
        key={item.kod + item.familiya}
      >
        <Checkbox
          checked={
            Number(workersUpdateInfo[employeeId].replacement) === item.kod
          }
          onClick={() => replacementCheckboxHandler(item, employeeId)}
        />
        <span style={{ marginLeft: "10px" }}>
          {item.familiya.concat(` ${item.imya} ${item.otchestvo}`)}
        </span>
      </Item>
    ))

  const getRoomEmplList = items => (
    <Collapse>
      {items &&
        items.length > 0 &&
        items.map(item => {
          const replacementEmployee =
            workersUpdateInfo[item._id] &&
            workersUpdateInfo[item._id].replacement
              ? oshsEmployees.find(
                  e => e.kod === Number(workersUpdateInfo[item._id].replacement)
                )
              : null
          return (
            <Collapse.Panel
              key={item._id}
              header={item.familiya.concat(` ${item.imya} ${item.otchestvo}`)}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Row>Должность: {item.dolzhnost}</Row>
                <Row>Подразделение: {item.podrazdelenie}</Row>
                <Row>Телефон: {item.telefon_rabota}</Row>
                <Row>
                  Статус: {item.status === 0 ? `Отсутствует` : `На месте`}
                </Row>
                <Row>
                  Начальник:{" "}
                  <Checkbox
                    checked={Boolean(workersUpdateInfo[item._id].chief)}
                    onClick={() => isChiefCheckboxHandler(item._id)}
                    style={{ marginLeft: "6px" }}
                  />
                </Row>
                <Row
                  style={{
                    margin: "16px 0px",
                    justifyContent: "space-between"
                  }}
                >
                  <span style={{ marginTop: "6px" }}>Отпуск:</span>
                  <DatePicker.RangePicker
                    style={{
                      marginLeft: "16px",
                      position: "relative",
                      top: "0px"
                    }}
                    defaultValue={
                      item.vacationStart && item.vacationEnd
                        ? [
                            moment(item.vacationStart, dateFormat),
                            moment(item.vacationEnd, dateFormat)
                          ]
                        : null
                    }
                    format={dateFormat}
                    onChange={(date, dateString) =>
                      datePickerHandler(date, dateString, item._id)
                    }
                  />
                </Row>
                <Row style={{ justifyContent: "space-between" }}>
                  <span style={{ marginTop: "6px" }}>Замена:</span>
                  <Collapse
                    style={{ marginLeft: "16px", width: "100%" }}
                    activeKey={collapseReplacementActiveKey}
                    onChange={e => setCollapseReplacementActiveKey(e)}
                  >
                    <StyledCollapsePanel
                      bordered={false}
                      showArrow={false}
                      key={item._id}
                      header={
                        replacementEmployee
                          ? `${replacementEmployee.familiya} ${replacementEmployee.imya} ${replacementEmployee.otchestvo}`
                          : "Выберите сотрудника"
                      }
                    >
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <Row>
                          <Input.Search
                            placeholder="Поиск"
                            value={replacementEmployeeInputValue}
                            onChange={e =>
                              replacementEmployeeInputHandler(e.target.value)
                            }
                          ></Input.Search>
                        </Row>
                        <ItemsListSection style={{ maxHeight: "200px" }}>
                          {/* Фильтрация идет для того, чтобы из списка сотрудников для замены исключить человека, которого мы заменяем */}
                          {replacementEmployeeInputValue
                            ? getReplacementList(
                                replacementEmployeeFilteredInput.filter(
                                  e =>
                                    e.familiya.concat(
                                      ` ${e.imya} ${e.otchestvo}`
                                    ) !==
                                    item.familiya.concat(
                                      ` ${item.imya} ${item.otchestvo}`
                                    )
                                ),
                                item._id
                              )
                            : getReplacementList(
                                oshsEmployees.filter(
                                  e =>
                                    e.familiya.concat(
                                      ` ${e.imya} ${e.otchestvo}`
                                    ) !==
                                    item.familiya.concat(
                                      ` ${item.imya} ${item.otchestvo}`
                                    )
                                ),
                                item._id
                              )}
                        </ItemsListSection>
                      </div>
                    </StyledCollapsePanel>
                  </Collapse>
                </Row>

                <Row
                  style={{
                    justifyContent: "space-between",
                    marginTop: "16px"
                  }}
                >
                  <Button onClick={() => deleteWorkerHandler(item._id)}>
                    Удалить
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      setCollapseReplacementActiveKey("")
                      updateWorker(
                        item._id,
                        workersUpdateInfo[item._id],
                        currentMonitorRpId
                      )
                    }}
                  >
                    Сохранить
                  </Button>
                </Row>
              </div>
            </Collapse.Panel>
          )
        })}
    </Collapse>
  )

  const oshsEmployeesInputHandler = value => {
    setOshsEmployeesInputValue(value)
    const copiedArray = [...oshsEmployees]
    const newArray = copiedArray.filter(e =>
      e.familiya
        .concat(` ${e.imya} ${e.otchestvo}`)
        .toLowerCase()
        .includes(value.toLowerCase())
    )
    setOshsEmployeesFilteredInput(newArray)
  }

  const roomEmployeesInputHandler = value => {
    setRoomEmployeesInputValue(value)
    const copiedArray = [...roomEmployees]
    const newArray = copiedArray.filter(e =>
      e.familiya
        .concat(` ${e.imya} ${e.otchestvo}`)
        .toLowerCase()
        .includes(value.toLowerCase())
    )
    setRoomEmployeesFilteredInput(newArray)
  }

  const addWorkerHandler = () => {
    if (selectedOshsEmployees.length < 1) return
    const listOfEmplCodes = selectedOshsEmployees.map(e => e.kod)
    addWorkers(currentMonitorRpId, listOfEmplCodes)
    setOshsEmployeesInputValue("")
    setSelectedOshsEmployees([])
  }

  const deleteWorkerHandler = id => {
    deleteWorker(id, currentMonitorRpId)
    setRoomEmployeesInputValue("")
  }

  return (
    <Container>
      <Header>
        <h2>{`Настройка прикабинетного монитора ${monitor.title}`}</h2>
      </Header>
      <MainSection>
        <Column>
          <Row>
            <Column
              style={{
                backgroundColor: "none"
              }}
            >
              <Row
                style={{
                  marginBottom: "20px"
                }}
              >
                <Select
                  defaultValue={
                    monitorInfo.angleRotation && monitorInfo.angleRotation
                  }
                  placeholder="Выберите угол поворота"
                  style={{ width: 220 }}
                  onChange={selectHandler}
                >
                  <Select.Option value={0}>Угол поворота 0</Select.Option>
                  <Select.Option value={90}>Угол поворота 90</Select.Option>
                  <Select.Option value={180}>Угол поворота 180</Select.Option>
                  <Select.Option value={270}>Угол поворота 270</Select.Option>
                </Select>
              </Row>
              <Row>
                <StyledSwitch checked={flagTime} onChange={switchHandler} />
                <span
                  style={{
                    marginLeft: "15px",
                    color: "white",
                    fontWeight: "bold"
                  }}
                >
                  Время
                </span>
              </Row>
            </Column>
            <Column
              style={{
                backgroundColor: "none",
                margin: "0px",
                padding: "0px",
                borderRadius: "none"
              }}
            >
              <div style={{ position: "relative" }}>
                {pictureBase64 ? (
                  <img
                    src={`data:image/jpeg;base64, ${pictureBase64}`}
                    alt="Фон"
                    width="100%"
                  />
                ) : (
                  <img src={ImageDefault} alt="Фон" width="50%" />
                )}
                <div
                  style={{
                    position: "absolute",
                    top: "110px",
                    width: "100%"
                  }}
                >
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      width: "100%",
                      display: "flex",
                      justifyContent: "center"
                    }}
                  >
                    {roomNumber}
                  </div>
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: "150px",
                    left: "40px",
                    overflow: "auto"
                  }}
                >
                  {workersView.length > 0 &&
                    workersView.map(e => {
                      return (
                        <div
                          style={{ marginBottom: "8px" }}
                          key={e.podrazdelenie}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center"
                            }}
                          >
                            <p
                              style={{
                                marginBottom: "4px",
                                fontWeight: "bold",
                                fontSize: "12px"
                              }}
                            >
                              {e.podrazdelenie}
                            </p>
                          </div>
                          {e.user.map((user, i) => {
                            const isUserChief = Boolean(user.chief)
                            const isUserInside = Boolean(user.status)
                            return (
                              <div
                                key={
                                  user.imya + user.familiya + user.otchestvo + i
                                }
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  marginBottom: isUserChief ? "25px" : "10px"
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex"
                                  }}
                                >
                                  <span
                                    style={{
                                      position: "relative",
                                      top: "5px",
                                      width: "12px",
                                      height: "12px",
                                      borderRadius: "2px",
                                      backgroundColor: isUserInside
                                        ? "green"
                                        : "red",
                                      marginRight: "6px"
                                    }}
                                  />
                                  <span>
                                    {user.familiya.concat(
                                      ` ${user.imya} ${user.otchestvo}`
                                    )}
                                  </span>
                                </div>
                                <span
                                  style={{
                                    marginLeft: "18px",
                                    fontSize: "x-small"
                                  }}
                                >
                                  {user.dolzhnost}
                                </span>
                                {user.replacementFIO && (
                                  <div
                                    style={{
                                      display: "flex",
                                      whiteSpace: "wrap",
                                      fontSize: "12px"
                                    }}
                                  >
                                    <img
                                      width={"16px"}
                                      src={ReplacementIcon}
                                      alt="replacement"
                                    />
                                    <div
                                      style={{
                                        whiteSpace: "wrap",
                                        marginLeft: "4px"
                                      }}
                                    >
                                      {user.replacementFIO}
                                      {user.replacementRoom && (
                                        <span
                                          style={{
                                            fontSize: "x-small",
                                            marginLeft: "6px"
                                          }}
                                        >
                                          {user.replacementRoom}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                </div>
              </div>
            </Column>
          </Row>
        </Column>
        <Column>
          <Row>
            <Column>
              <Button style={{ marginBottom: "10px" }} icon="picture">
                <LabelHiddenInput htmlFor="uploadBackgroundImage">
                  Изменить фон
                </LabelHiddenInput>
                <HiddenInput
                  type="file"
                  id="uploadBackgroundImage"
                  name="uploadBackgroundImage"
                  multiple={false}
                  accept="image/jpeg, image/png"
                  onChange={e =>
                    uploadImageHandler(e.target.files[0], currentMonitorRpId)
                  }
                />
              </Button>
              <Button
                style={{ marginBottom: "10px" }}
                icon="picture"
                onClick={() => setDefaultBackgroundImage(currentMonitorRpId)}
              >
                Установить фон по умолчанию
              </Button>
              <Button
                style={{ marginBottom: "10px" }}
                onClick={() => setBackgroundImageToAllFloor(currentMonitorRpId)}
              >
                Применить для этажа
              </Button>
              <Button
                onClick={() =>
                  setBackgroundImageToAllKabinetMonitors(pictureName)
                }
              >
                Применить для всех мониторов
              </Button>
            </Column>
            <Column
              style={{
                backgroundColor: "none",
                margin: "0px",
                padding: "0px",
                borderRadius: "none"
              }}
            >
              {pictureBase64 ? (
                <img
                  src={`data:image/jpeg;base64, ${pictureBase64}`}
                  alt="Фон"
                  width="100%"
                />
              ) : (
                <img src={ImageDefault} alt="Фон" width="100%" />
              )}
            </Column>
          </Row>
        </Column>
      </MainSection>
      <Collapse style={{ margin: "10px" }} bordered={false}>
        <Collapse.Panel header={"Настройка сотрудников"}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Card style={{ width: 500 }} title="Сотрудники на мониторе">
              <Row style={{ marginBottom: "20px" }}>
                <Input.Search
                  value={roomEmployeesInputValue}
                  onChange={e => roomEmployeesInputHandler(e.target.value)}
                  placeholder="Поиск"
                />
              </Row>
              <ItemsListSection>
                {roomEmployeesInputValue
                  ? getRoomEmplList(roomEmployeesFilteredInput)
                  : getRoomEmplList(roomEmployees)}
              </ItemsListSection>
            </Card>
            <ButtonColumn>
              <ArrowContainer onClick={addWorkerHandler}>
                <Icon type="double-left" />
                <span style={{ marginLeft: "4px", fontWeight: "bold" }}>
                  Перенести
                </span>
              </ArrowContainer>
            </ButtonColumn>
            <Card style={{ width: 500 }} title="Сотрудники ОШС">
              <Row style={{ marginBottom: "20px" }}>
                <Input.Search
                  style={{ width: "250px" }}
                  value={oshsEmployeesInputValue}
                  onChange={e => oshsEmployeesInputHandler(e.target.value)}
                  placeholder="Поиск"
                />
                <Button
                  type="primary"
                  style={{ marginLeft: "15px" }}
                  onClick={synchOshsData}
                >
                  {synchOshsSelectorLoading ? (
                    <Icon type="sync" spin />
                  ) : (
                    "Синхронизировать ОШС"
                  )}
                </Button>
              </Row>
              <ItemsListSection>
                {oshsEmployeesInputValue
                  ? getOshsList(oshsEmployeesFilteredInput)
                  : getOshsList(oshsEmployees)}
              </ItemsListSection>
            </Card>
          </div>
        </Collapse.Panel>
      </Collapse>
    </Container>
  )
}

export default connect(
  state => {
    const { currentMonitorRpId } = state[monitorModuleName]

    return {
      monitorInfo: getMonitorByRpId(currentMonitorRpId)(state),
      workers: getWorkersByRpIdSelector(currentMonitorRpId)(state),
      allOshsEmployees: allOshsEmployeesSelector(state),
      workersForView: getWorkersForViewSelector(state),
      synchOshsSelectorLoading: synchOshsLoadingSelector(state)
    }
  },
  {
    fetchMonitor,
    saveMonitor,
    uploadBackgroundImage,
    setDefaultBackgroundImage,
    setBackgroundImageToAllFloor,
    setBackgroundImageToAllKabinetMonitors,
    getWorkers,
    getAllOSHSWorkers,
    addWorkers,
    deleteWorker,
    updateWorker,
    getWorkersForView,
    synchOshsData
  }
)(KabinetMonitorForm)
