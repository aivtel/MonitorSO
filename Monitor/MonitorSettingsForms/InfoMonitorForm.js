import React, { useState, useEffect, useCallback } from "react"
import { connect } from "react-redux"
import SockJS from "sockjs-client"
import styled from "styled-components"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import Loader from "../../Layout/Styled Components/Loader"
import {
  Button,
  Icon,
  Checkbox,
  Input
} from "../../Layout/Styled Antd Components"
import { Card } from "antd"
import {
  moduleName as monitorModuleName,
  fetchAllVideoFiles,
  allVideoFilesSelector,
  getMonitorPlaylistByRpId,
  getMonitorPlaylistByRpIdSelector,
  deleteFilesFromAllVideoList,
  savePlaylist,
  uploadFile,
  monitorErrorUploadSelector,
  savePlaylistForAllMonitors,
  fileUploadingSelector
} from "../../../modules/components/monitor"

const { NODE_ENV } = process.env
const IS_DEV_SERVER = NODE_ENV === "development"
const DEV_SERVER = "http://smartoffice.*****.local"

const RELATIVE_CURRENT_VIDEO_FILE_PLAYING = `/ws-monitor/v1/monitor/stream/videoPlay`
const URL_CURRENT_VIDEO_FILE = IS_DEV_SERVER
  ? DEV_SERVER + RELATIVE_CURRENT_VIDEO_FILE_PLAYING
  : RELATIVE_CURRENT_VIDEO_FILE_PLAYING

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
  justify-content: space-between;
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  border: 0.5px solid gray;
  border-radius: 4px;
  padding: 20px;
`

const Row = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 20px;
`
const FooterRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin: 20px 14px 20px 0px;
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

const ItemsListSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  max-height: 400px;
  overflow: auto;
`

const Item = styled.div`
  height: 42px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 2px;
  padding: 10px;
  border: 1px solid gray;
  margin: 6px 6px 0px;
  background-color: lightBlue;

  .filename {
    margin: 0px 10px;
  }
`

const StyledIcon = styled(Icon)`
  :hover {
    color: red;
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

function InfoMonitorForm({
  monitor,
  currentMonitorRpId,
  allVideoFilesList,
  fetchAllVideoFiles,
  getMonitorPlaylistByRpId,
  defaultPlaylist,
  deleteFilesFromAllVideoList,
  savePlaylist,
  uploadFile,
  errorUpload,
  savePlaylistForAllMonitors,
  hideModal,
  fileUploadingSelector
}) {
  const [allVideoFiles, setAllVideoFiles] = useState([])
  const [monitorPlaylist, setMonitorPlaylist] = useState([])
  const [selectedVideoFiles, setSelectedVideoFiles] = useState([])
  const [selectedPlaylistFiles, setSelectedPlaylistFiles] = useState([])
  const [playlistInputValue, setPlaylistInputValue] = useState("")
  const [
    monitorPlaylistFilteredInput,
    setMonitorPlaylistFilteredInput
  ] = useState([])
  const [allVideosInputValue, setAllVideosInputValue] = useState("")
  const [allVideoFilesFilteredInput, setAllVideoFilesFilteredInput] = useState(
    ""
  )
  const [currentVideoFile, setCurrentVideoFile] = useState("")

  const fetchAllVideoFilesHandler = useCallback(async () => {
    try {
      await fetchAllVideoFiles()
      await getMonitorPlaylistByRpId(currentMonitorRpId)
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchAllVideoFilesHandler()
  }, [])

  useEffect(() => {
    let currentVideoFileSocket = new SockJS(URL_CURRENT_VIDEO_FILE)
    const NORMAL_CLOSE_CODE = 1000

    currentVideoFileSocket.onopen = e => {
      console.info("WEBSOCKET VIDEOFILE CONNECTED")
      currentVideoFileSocket.send(
        JSON.stringify({
          type: "join",
          data: currentMonitorRpId
        })
      )
    }

    currentVideoFileSocket.onclose = e => {
      console.info("WEBSOCKET VIDEOFILE CLOSED")

      if (e.code !== NORMAL_CLOSE_CODE) {
        setTimeout(
          (currentVideoFileSocket = new SockJS(URL_CURRENT_VIDEO_FILE)),
          10000
        )
      }
    }

    currentVideoFileSocket.onmessage = message => {
      console.info("WEBSOCKET VIDEOFILE MESSAGE")
      const messageData = JSON.parse(message.data)
      setCurrentVideoFile(messageData.videoPlay)
    }

    currentVideoFileSocket.onerror = e => {
      console.warn("WEBSOCKET VIDEOFILE ERROR", e)
    }
    return () => currentVideoFileSocket.close(NORMAL_CLOSE_CODE)
  }, [])

  useEffect(() => setAllVideoFiles(allVideoFilesList), [allVideoFilesList])
  useEffect(() => setMonitorPlaylist(defaultPlaylist), [defaultPlaylist])

  const videoFileCheckboxHandler = name => {
    const setFromArray = new Set(selectedVideoFiles)
    setFromArray.has(name) ? setFromArray.delete(name) : setFromArray.add(name)
    const newArray = [...setFromArray]
    setSelectedVideoFiles(newArray)
  }

  const playlistFileCheckboxHandler = name => {
    const setFromArray = new Set(selectedPlaylistFiles)
    setFromArray.has(name) ? setFromArray.delete(name) : setFromArray.add(name)
    const newArray = [...setFromArray]
    setSelectedPlaylistFiles(newArray)
  }

  const deleteFilesFromAllVideosHandler = () => {
    deleteFilesFromAllVideoList(selectedVideoFiles)
    const newArray = allVideoFiles.filter(e => !selectedVideoFiles.includes(e))

    setAllVideoFiles(newArray)
    setAllVideosInputValue("")
  }

  const addFilesToPlaylistHandler = () => {
    const newArray = selectedVideoFiles.map((e, i) => ({
      name: e,
      position: monitorPlaylist.length + i + 1
    }))
    const newPlaylistArray = [...monitorPlaylist, ...newArray]
    setMonitorPlaylist(newPlaylistArray)
  }

  const deleteFilesFromPlaylistHandler = () => {
    const newArray = monitorPlaylist
      .filter(e => !selectedPlaylistFiles.includes(e))
      .map((e, i) => ({ name: e.name, position: i + 1 }))
    setMonitorPlaylist(newArray)
    setPlaylistInputValue("")
  }

  const cancelHandler = () => {
    setMonitorPlaylist(defaultPlaylist)
    setSelectedPlaylistFiles([])
  }

  const checkedValidationHandler = (file, selectedItems) => {
    const bool = selectedItems.includes(file)
    return bool
  }

  const moveItemUpHandler = index => {
    const copiedArray = [...monitorPlaylist]
    const copiedItem = copiedArray[index]
    copiedArray.splice(index, 1)
    copiedArray.splice(index - 1, 0, copiedItem)
    const playlistWithRightPositions = copiedArray.map((e, i) => ({
      name: e.name,
      position: i + 1
    }))
    setMonitorPlaylist(playlistWithRightPositions)
  }
  const moveItemDownHandler = index => {
    const copiedArray = [...monitorPlaylist]
    const copiedItem = copiedArray[index]
    copiedArray.splice(index, 1)
    copiedArray.splice(index + 1, 0, copiedItem)
    const playlistWithRightPositions = copiedArray.map((e, i) => ({
      name: e.name,
      position: i + 1
    }))
    setMonitorPlaylist(playlistWithRightPositions)
  }

  const playlistInputHandler = value => {
    setPlaylistInputValue(value)
    const copiedArray = [...monitorPlaylist]
    const newArray = copiedArray.filter(e => e.name.includes(value))
    setMonitorPlaylistFilteredInput(newArray)
  }

  const allVideoFilesInputHandler = value => {
    setAllVideosInputValue(value)
    const copiedArray = [...allVideoFiles]
    const newArray = copiedArray.filter(e => e.includes(value))
    setAllVideoFilesFilteredInput(newArray)
  }

  const getItemsPlaylist = items =>
    items &&
    items.length > 0 &&
    items.map((file, i) => {
      return (
        <Item key={file.name + file.position}>
          <div>
            <Checkbox
              checked={checkedValidationHandler(file, selectedPlaylistFiles)}
              onChange={() => playlistFileCheckboxHandler(file)}
            />
            {file.name === currentVideoFile ? (
              <span className="filename" style={{ fontWeight: "bold" }}>
                {file.name} Play
              </span>
            ) : (
              <span className="filename">{file.name}</span>
            )}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginRight: "10px"
            }}
          >
            {i !== 0 && (
              <StyledIcon
                type="caret-up"
                onClick={() => moveItemUpHandler(i)}
              />
            )}
            {i !== monitorPlaylist.length - 1 && (
              <StyledIcon
                type="caret-down"
                onClick={() => moveItemDownHandler(i)}
              />
            )}
          </div>
        </Item>
      )
    })
  const getDraggableItemsPlaylist = items =>
    items &&
    items.length > 0 &&
    items.map((file, i) => (
      <Draggable
        draggableId={file.name + i}
        index={i}
        key={file.name + file.position + i}
      >
        {provided => (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
          >
            <Item key={file.name + file.position}>
              <div>
                <Checkbox
                  checked={checkedValidationHandler(
                    file,
                    selectedPlaylistFiles
                  )}
                  onChange={() => playlistFileCheckboxHandler(file)}
                />
                {file.name === currentVideoFile ? (
                  <span className="filename" style={{ fontWeight: "bold" }}>
                    {file.name} Play
                  </span>
                ) : (
                  <span className="filename">{file.name}</span>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginRight: "10px"
                }}
              >
                {i !== 0 && (
                  <StyledIcon
                    type="caret-up"
                    onClick={() => moveItemUpHandler(i)}
                  />
                )}
                {i !== monitorPlaylist.length - 1 && (
                  <StyledIcon
                    type="caret-down"
                    onClick={() => moveItemDownHandler(i)}
                  />
                )}
              </div>
            </Item>
          </div>
        )}
      </Draggable>
    ))

  const getItemsAllVideos = items =>
    items &&
    items.length > 0 &&
    items.map(fileName => (
      <Item
        style={{
          backgroundColor: "white",
          paddingTop: "10px",
          paddingBottom: "10px"
        }}
        key={fileName}
      >
        <Checkbox
          checked={checkedValidationHandler(fileName, selectedVideoFiles)}
          onClick={() => videoFileCheckboxHandler(fileName)}
        />
        <span style={{ marginLeft: "10px" }}>{fileName}</span>
      </Item>
    ))

  const uploadFileHandler = e => {
    const uploadData = new FormData()
    uploadData.append("file", e)
    uploadFile(uploadData)
  }

  const onDragEnd = result => {
    const { destination, source } = result
    if (!destination) {
      return
    }
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }
    const copiedArray = [...monitorPlaylist]
    const copiedItem = copiedArray[source.index]
    copiedArray.splice(source.index, 1)
    copiedArray.splice(destination.index, 0, copiedItem)
    const playlistWithRightPositions = copiedArray.map((e, i) => ({
      name: e.name,
      position: i + 1
    }))
    setMonitorPlaylist(playlistWithRightPositions)
  }

  return allVideoFiles && allVideoFiles.length > 0 ? (
    <Container>
      <Header>
        <h2>{`Настройка информационного монитора ${monitor.title}`}</h2>
      </Header>

      <MainSection>
        <Card style={{ width: 500 }} title="Плейлист монитора">
          <Row>
            <Button
              type="primary"
              onClick={() => savePlaylistForAllMonitors(monitorPlaylist)}
            >
              Применить ко всем мониторам
            </Button>
          </Row>
          <Row>
            <Input.Search
              placeholder="Поиск"
              value={playlistInputValue}
              onChange={e => playlistInputHandler(e.target.value)}
            />
            <Button
              style={{ marginLeft: "4px" }}
              onClick={deleteFilesFromPlaylistHandler}
            >
              Удалить
            </Button>
          </Row>
          <DragDropContext onDragEnd={onDragEnd}>
            <ItemsListSection>
              <Droppable droppableId="droppableId">
                {provided => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {playlistInputValue
                      ? monitorPlaylistFilteredInput &&
                        getItemsPlaylist(monitorPlaylistFilteredInput)
                      : monitorPlaylist &&
                        getDraggableItemsPlaylist(monitorPlaylist)}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </ItemsListSection>
          </DragDropContext>
        </Card>
        <Column style={{ justifyContent: "center", border: "none" }}>
          <ArrowContainer onClick={addFilesToPlaylistHandler}>
            <Icon type="double-left" />
            <span style={{ marginLeft: "4px", fontWeight: "bold" }}>
              Перенести
            </span>
          </ArrowContainer>
        </Column>
        <Card style={{ width: 500 }} title="Файлы">
          <Row>
            <Button
              type="primary"
              disabled={fileUploadingSelector}
              style={{ padding: "0" }}
            >
              <LabelHiddenInput htmlFor="uploadVideo">
                {fileUploadingSelector ? <Icon type="sync" spin /> : "Добавить"}
              </LabelHiddenInput>
              <HiddenInput
                type="file"
                id="uploadVideo"
                name="uploadVideo"
                onChange={e => uploadFileHandler(e.target.files[0])}
              />
            </Button>
          </Row>
          <Row>
            <Input.Search
              placeholder="Поиск"
              value={allVideosInputValue}
              onChange={e => allVideoFilesInputHandler(e.target.value)}
            />
            <Button
              style={{ marginLeft: "4px" }}
              onClick={deleteFilesFromAllVideosHandler}
            >
              Удалить
            </Button>{" "}
          </Row>
          {errorUpload && (
            <p style={{ color: "red" }}>Загрузить файл не удалось</p>
          )}
          <ItemsListSection>
            {allVideosInputValue
              ? allVideoFilesFilteredInput &&
                getItemsAllVideos(allVideoFilesFilteredInput)
              : allVideoFiles && getItemsAllVideos(allVideoFiles)}
          </ItemsListSection>
        </Card>
      </MainSection>
      <FooterRow>
        <Button onClick={cancelHandler}>Отменить</Button>
        <Button
          type="primary"
          style={{ marginLeft: "4px" }}
          onClick={() => {
            savePlaylist(currentMonitorRpId, monitorPlaylist)
            hideModal()
          }}
        >
          Сохранить
        </Button>
      </FooterRow>
    </Container>
  ) : (
    <Loader />
  )
}

export default connect(
  state => {
    const { currentMonitorRpId } = state[monitorModuleName]
    return {
      allVideoFilesList: allVideoFilesSelector(state),
      defaultPlaylist: getMonitorPlaylistByRpIdSelector(currentMonitorRpId)(
        state
      ),
      errorUpload: monitorErrorUploadSelector(state),
      fileUploadingSelector: fileUploadingSelector(state)
    }
  },
  {
    fetchAllVideoFiles,
    getMonitorPlaylistByRpId,
    deleteFilesFromAllVideoList,
    savePlaylist,
    uploadFile,
    savePlaylistForAllMonitors
  }
)(InfoMonitorForm)
