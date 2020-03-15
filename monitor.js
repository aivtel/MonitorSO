import { createSelector } from "reselect"
import { GENERAL_HOST, MONITOR_URL } from "../../config"
import request from "../../utils/request"

export const moduleName = "monitor"

//#region actions
const GET_FLOORS = `${moduleName}/GET_FLOORS`

const FETCH_MONITOR = `${moduleName}/FETCH_MONITOR`
const SELECT_MONITOR = `${moduleName}/SELECT_MONITOR`
const FETCH_ALL_VIDEO_FILES = `${moduleName}/FETCH_ALL_VIDEO_FILES`
const GET_MONITOR_PLAYLIST = `${moduleName}/GET_MONITOR_PLAYLIST`
const SET_ERROR_UPLOAD_TRUE = `${moduleName}/SET_ERROR_UPLOAD_TRUE`
const SET_ERROR_UPLOAD_FALSE = `${moduleName}/SET_ERROR_UPLOAD_FALSE`
const FETCH_WORKERS = `${moduleName}/FETCH_WORKERS`
const FETCH_WORKERS_FOR_VIEW = `${moduleName}/FETCH_WORKERS_FOR_VIEW`
const CLEAN_SELECT_MONITOR = `${moduleName}/CLEAN_SELECT_MONITOR`
const LOADING_FILE_START = `${moduleName}/LOADING_FILE_START`
const LOADING_FILE_FINISH = `${moduleName}/LOADING_FILE_FINISH`
//#endregion

//#region reducer
const initialState = {
  currentMonitorRpId: undefined,
  floors: [],
  monitors: {},
  allVideoFilesList: [],
  playlists: {},
  workers: {},
  workersForView: [],
  errorUpload: false,
  fileUploading: false
}

export default function reducer(state = initialState, action) {
  const { type, payload } = action

  switch (type) {
    case GET_FLOORS:
      return {
        ...state,
        floors: payload
      }

    case SELECT_MONITOR: {
      return {
        ...state,
        currentMonitorRpId: payload
      }
    }

    case CLEAN_SELECT_MONITOR: {
      return {
        ...state,
        currentMonitorRpId: null
      }
    }

    case FETCH_MONITOR:
      return {
        ...state,
        monitors: {
          ...state.monitors,
          [payload.rpId]: payload.monitor
        }
      }

    case FETCH_WORKERS:
      return {
        ...state,
        workers: {
          ...state.workers,
          [payload.rpId]: payload.workers
        }
      }
    case FETCH_WORKERS_FOR_VIEW:
      return {
        ...state,
        workersForView: payload
      }

    case FETCH_ALL_VIDEO_FILES:
      return {
        ...state,
        allVideoFilesList: payload
      }

    case GET_MONITOR_PLAYLIST:
      return {
        ...state,
        playlists: {
          ...state.playlists,
          [payload.rpId]: payload.playlist
        }
      }
    case SET_ERROR_UPLOAD_TRUE:
      return {
        ...state,
        errorUpload: true
      }
    case SET_ERROR_UPLOAD_FALSE:
      return {
        ...state,
        errorUpload: false
      }
    case LOADING_FILE_START:
      return {
        ...state,
        fileUploading: true
      }
    case LOADING_FILE_FINISH:
      return {
        ...state,
        fileUploading: false
      }

    default:
      return state
  }
}
//#endregion

//#region action creators
export const fetchFloors = () => async dispatch => {
  try {
    const floors = await request({ url: `${GENERAL_HOST}/rooms/detailed` })

    if (!Array.isArray(floors)) {
      throw new Error(
        `Неожиданный тип данных для этажей. Ожидался массив, получено: ${floors}`
      )
    }

    floors.sort((a, b) => a.floor - b.floor)
    dispatch({
      type: GET_FLOORS,
      payload: floors
    })
    return floors
  } catch (err) {
    console.error(err)
    throw new Error("Ошибка получения этажей")
  }
}

export const fetchMonitor = rpId => async dispatch => {
  try {
    const monitor = await request({
      url: `${MONITOR_URL}/monitor?rpId=${rpId}`
    })

    dispatch({
      type: FETCH_MONITOR,
      payload: {
        rpId,
        monitor
      }
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const selectMonitor = rpId => ({
  type: SELECT_MONITOR,
  payload: rpId
})

export const cleanSelectMonitor = () => ({
  type: CLEAN_SELECT_MONITOR
})

export const fetchAllVideoFiles = () => async dispatch => {
  try {
    const allVideoFiles = await request({
      url: `${MONITOR_URL}/file/allVideoFiles`
    })
    dispatch({
      type: FETCH_ALL_VIDEO_FILES,
      payload: allVideoFiles
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const getMonitorPlaylistByRpId = rpId => async dispatch => {
  try {
    const playlist = await request({
      url: `${MONITOR_URL}/playlist/getPlaylist?rpId=${rpId}`
    })
    dispatch({
      type: GET_MONITOR_PLAYLIST,
      payload: {
        rpId,
        playlist
      }
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const deleteFilesFromAllVideoList = arrayOfFiles => async dispatch => {
  try {
    await request({
      url: `${MONITOR_URL}/file/deleteFile`,
      options: {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(arrayOfFiles)
      }
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const savePlaylist = (rpId, playlist) => async dispatch => {
  try {
    await request({
      url: `${MONITOR_URL}/playlist?rpId=${rpId}`,
      options: {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(playlist)
      }
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}
export const savePlaylistForAllMonitors = playlist => async dispatch => {
  try {
    await request({
      url: `${MONITOR_URL}/playlist/forAll`,
      options: {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(playlist)
      }
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const uploadFile = file => async dispatch => {
  try {
    dispatch({
      type: LOADING_FILE_START
    })
    dispatch({
      type: SET_ERROR_UPLOAD_FALSE
    })
    const response = await request({
      url: `${MONITOR_URL}/file/upload`,
      options: {
        method: "POST",
        body: file
      }
    })

    dispatch({
      type: LOADING_FILE_FINISH
    })

    response.status === "success"
      ? fetchAllVideoFiles()(dispatch)
      : dispatch({
          type: SET_ERROR_UPLOAD_TRUE
        })
  } catch (err) {
    console.error(err)
    dispatch({
      type: LOADING_FILE_FINISH
    })
    throw err
  }
}

export const uploadBackgroundImage = (file, rpId) => async dispatch => {
  try {
    const response = await request({
      url: `${MONITOR_URL}/file/loadPictureFon`,
      options: {
        method: "POST",
        body: file
      }
    })
    if (response.status === "success") {
      dispatch(fetchMonitor(rpId))
    }
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const saveMonitor = (rpId, body) => async dispatch => {
  try {
    const monitor = await request({
      url: `${MONITOR_URL}/monitor/saveMonitor?rpId=${rpId}`,
      options: {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }
    })

    dispatch({
      type: FETCH_MONITOR,
      payload: {
        rpId,
        monitor
      }
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const setDefaultBackgroundImage = rpId => async dispatch => {
  try {
    await request({
      url: `${MONITOR_URL}/monitor/fonDefault?rpId=${rpId}`
    })
    dispatch(fetchMonitor(rpId))
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const setBackgroundImageToAllFloor = rpId => async dispatch => {
  try {
    await request({
      url: `${MONITOR_URL}/monitor/fonAllFloor?rpId=${rpId}`
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}
export const setBackgroundImageToAllKabinetMonitors = fileName => async dispatch => {
  try {
    await request({
      url: `${MONITOR_URL}/monitor/fonAll?fileName=${fileName}`
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const getWorkersForView = rpId => async dispatch => {
  try {
    const workersForView = await request({
      url: `${MONITOR_URL}/workers/getWorkersForView?rpId=${rpId}`
    })

    dispatch({
      type: FETCH_WORKERS_FOR_VIEW,
      payload: workersForView
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const getWorkers = rpId => async dispatch => {
  try {
    const workers = await request({
      url: `${MONITOR_URL}/workers/getWorkers?rpId=${rpId}`
    })
    dispatch({
      type: FETCH_WORKERS,
      payload: {
        rpId,
        workers
      }
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}

const updateWorkers = (rpId, dispatch) => {
  getWorkers(rpId)(dispatch)
  getWorkersForView(rpId)(dispatch)
}
export const addWorkers = (rpId, array) => async dispatch => {
  try {
    const response = await request({
      url: `${MONITOR_URL}/workers/addWorkers?rpId=${rpId}`,
      options: {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(array)
      }
    })

    response.status === "success"
      ? updateWorkers(rpId, dispatch)
      : console.log(response.status)
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const deleteWorker = (employeeId, rpId) => async dispatch => {
  try {
    const response = await request({
      url: `${MONITOR_URL}/workers/deleteWorker?id=${employeeId}`
    })
    response.status === "success"
      ? updateWorkers(rpId, dispatch)
      : console.log(response.status)
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const updateWorker = (
  employeeId,
  updateData,
  rpId
) => async dispatch => {
  try {
    const response = await request({
      url: `${MONITOR_URL}/workers/updateWorker?id=${employeeId}`,
      options: {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
      }
    })
    response.status === "success"
      ? updateWorkers(rpId, dispatch)
      : console.log(response.status)
  } catch (err) {
    console.error(err)
    throw err
  }
}
export const switchOnSwitchOffRebootRpId = (rpId, action) => async dispatch => {
  try {
    await request({
      url: `${MONITOR_URL}/ciscoControl?action=${action}&rpId=${rpId}`
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}
//#endregion

//#region selectors
const stateSelector = state => state[moduleName]

export const floorsSelector = createSelector(
  stateSelector,
  state => state.floors
)

const getMonitors = createSelector(stateSelector, state => state.monitors)

export const getMonitorByRpId = rpId =>
  createSelector(
    [getMonitors, getMonitorRoom(rpId)],
    (monitors, monitorRoom) => {
      const fallbackMonitor = {}
      const monitor = monitors[rpId]

      if (!monitor) return fallbackMonitor
      if (!monitorRoom) return fallbackMonitor

      const { title, svgMonitor } = monitorRoom

      monitor.title = title || "Неизвестно"
      monitor.type = getMonitorType(svgMonitor)

      return monitor
    }
  )

export const allVideoFilesSelector = createSelector(
  stateSelector,
  state => state.allVideoFilesList
)

export const getMonitorPlaylistByRpIdSelector = rpId =>
  createSelector(stateSelector, state => state.playlists[rpId])

export const monitorErrorUploadSelector = createSelector(
  stateSelector,
  state => state.errorUpload
)

export const getWorkersByRpIdSelector = rpId =>
  createSelector(stateSelector, state => state.workers[rpId])
export const getWorkersForViewSelector = createSelector(
  stateSelector,
  state => state.workersForView
)

export const fileUploadingSelector = createSelector(
  stateSelector,
  state => state.fileUploading
)

//#endregion

//#region utils
function getMonitorRoom(rpId) {
  return createSelector([floorsSelector, () => rpId], (floors, rpId) => {
    if (!floors) return

    const rooms = floors.reduce((acc, floor) => [...acc, ...floor.rooms], [])
    return rooms.find(it => it.rpId === rpId)
  })
}

function getMonitorType(svgMonitor) {
  const fallbackType = "Неизвестно"
  if (typeof svgMonitor !== "string") return fallbackType

  const typeCode = svgMonitor.split(", ").slice(-1)

  const typeCodeMapping = {
    kabinet: "Прикабинетный",
    info: "Информационный",
    touch: "Тач панель"
  }

  return typeCodeMapping[typeCode] || fallbackType
}
//#endregion
