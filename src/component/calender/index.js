import react,{useEffect, useState} from 'react'
import FullCalendar, { formatDate } from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import './calender.css'
import axios from 'axios'
const URL = 'http://65.0.33.174:9000'
let todayStr = new Date().toISOString().replace(/T.*$/, '') // YYYY-MM-DD of today

export const INITIAL_EVENTS = [
    {
        id: 1,
        title: 'All-day event',
        start: todayStr
    },
    {
        id: 2,
        title: 'Timed event',
        start: todayStr + 'T12:00:00'
    }
]
function Calender(props) {
    const [events, setEvents] = useState([])
    const [selectedEvent, setSelectedEvent] = useState({})
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        getEvents()
    },[])

    const getEvents = () => {
        axios.get(`${URL}${'/scheduling/events/?user_id='}${props.userId}`)
        .then((res) => {
            let response = res.data?.data
            setEvents(response)
        })
        .catch((error) => {
            alert('Failed in fetched userId 1')
        })
        console.log('events', events)
    }
    const handleDateClick = (selectInfo) => {
        let eventId = selectInfo.event.id
        setLoading(true)
        axios.get(`${URL}${'/scheduling/events/'}${eventId}`)
        .then((res) => {
            let response = res.data
            setSelectedEvent(response)
            setLoading(false)
        })
        .catch((error) => {
            alert('Faileed Fetching selected event')
        })
    }
    const handleDateSelect = (selectInfo) => {
        let title = prompt('Please enter a new title for your event')
        let calendarApi = selectInfo.view.calendar
    
        calendarApi.unselect() 
        let headers = {
            'Cookie': 'django_language=en-us',
        }
        let postBody = {
            user_id: 1,
            title: title,
            start: selectInfo.startStr,
            end: selectInfo.endStr
        }
        axios.post(`${URL}${'/scheduling/events/'}${1}/`,{headers: headers},postBody)
        .then((res) => {
            let response = res.data
            calendarApi.addEvent({
                id: Math.random(),
                title: response.title,
                start: response.start,
                end: response.end,
                allDay: response.end
              })
        })
        .catch((error) => {
            alert('Failed to add , so adding manually')
            if (title) {
                calendarApi.addEvent({
                  id: Math.random(),
                  title,
                  start: selectInfo.startStr,
                  end: selectInfo.endStr,
                  allDay: selectInfo.allDay
                })
              }
        })
 
      }
    return (
        <div>
            <div className='demo-app'>
                <div className='demo-app-sidebar'>
                    <div className='demo-app-sidebar-section'>
                        <h2>All Events ({events.length})</h2>
                        <ul>
                            {events.map((each, index) => {
                                return (
                                    <li key={index}>{each.title} - {formatDate(each.start, {year: 'numeric', month: 'short', day: 'numeric'})}</li>
                                )
                            })}
                        </ul>
                    </div>
                    {
                        loading ? 'loading please wait ...' : <div className='demo-app-sidebar-section'>
                        <h2>Selected Events</h2>
                        <ul>
                            <li>{selectedEvent.title}{formatDate(selectedEvent.start, {year: 'numeric', month: 'short', day: 'numeric'})}</li>
                        </ul>
                    </div>
                    }
                    
                </div>
                <div className='demo-app-main'>
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        initialView='dayGridMonth'
                        editable={true}
                        selectable={true}
                        selectMirror={true}
                        dayMaxEvents={true}
                        events={events}
                        select={(arg) => handleDateSelect(arg)}
                        eventClick={(arg) => handleDateClick(arg)}
                    />
                </div>
            </div>
        </div>
    )
}

export default Calender;