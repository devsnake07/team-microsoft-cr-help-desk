import React, { useState, useEffect, useMemo } from 'react'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { format, parseISO, startOfDay, endOfDay } from 'date-fns'

// --- Data Types and Mock Data ---

/**
 * Represents a User from your API, based on `prisma.schema`.
 */
interface User {
  id: string
  name: string | null
  email: string | null
}

/**
 * Represents a Record from your API, based on `prisma.schema`.
 * This includes nested user and category information.
 */
interface Record {
  id: string
  userId: string
  dateRecord: string // ISO date string
  comments: string
  user: {
    name: string | null
  }
  category: {
    name: string
  }
}

/**
 * In a real app, this would be moved to a dedicated API service file.
 * Fetches records from the API.
 * NOTE: The API endpoint `/api/record` in the context does not support server-side filtering.
 * For this example, we fetch all records and filter on the client.
 * For production, it's highly recommended to implement filtering on the backend.
 */
const fetchRecords = async (): Promise<Record[]> => {
  console.log('Fetching all records from /api/record')
  const response = await fetch('/api/record')

  if (!response.ok) {
    throw new Error('Failed to fetch records')
  }

  return response.json()
}

const fetchUsers = async (): Promise<User[]> => {
  console.log('Fetching all users from /api/user')
  const response = await fetch('/api/user')

  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }

  return response.json()
}

// --- Chart Colors ---
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

// --- Main Component ---

const RecordReport: React.FC = () => {
  const [allRecords, setAllRecords] = useState<Record[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([])

  // Filters
  const thirtyDaysAgo = new Date()

  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const [startDate, setStartDate] = useState<string>(thirtyDaysAgo.toISOString().split('T')[0])
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [selectedUserId, setSelectedUserId] = useState<string>('all') // 'all' or a user ID

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        const [recordsData, usersData] = await Promise.all([fetchRecords(), fetchUsers()])

        setAllRecords(recordsData)
        setUsers(usersData)
      } catch (e) {
        setError('Failed to fetch initial data.')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Client-side filtering logic
  useEffect(() => {
    if (!allRecords.length) {
      setFilteredRecords([])

      return
    }

    let records = allRecords

    // Filter by user
    if (selectedUserId !== 'all') {
      records = records.filter(r => r.userId === selectedUserId)
    }

    // Filter by date
    if (startDate && endDate) {
      const start = startOfDay(parseISO(startDate))
      const end = endOfDay(parseISO(endDate))

      records = records.filter(r => {
        const recordDate = parseISO(r.dateRecord)

        return recordDate >= start && recordDate <= end
      })
    }

    setFilteredRecords(records)
  }, [allRecords, startDate, endDate, selectedUserId])

  // --- Data Processing for Charts (memoized for performance) ---

  const recordsByCategory = useMemo(() => {
    const grouped = filteredRecords.reduce(
      (acc, record) => {
        const categoryName = record.category.name

        acc[categoryName] = (acc[categoryName] || 0) + 1

        return acc
      },
      {} as Record<string, number>
    )

    return Object.entries(grouped)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [filteredRecords])

  const recordsByUser = useMemo(() => {
    const grouped = filteredRecords.reduce(
      (acc, record) => {
        const userName = record.user.name || 'Unknown User'

        acc[userName] = (acc[userName] || 0) + 1

        return acc
      },
      {} as Record<string, number>
    )

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredRecords])

  const dailyRecords = useMemo(() => {
    const groupedByDate = filteredRecords.reduce(
      (acc, record) => {
        const day = format(parseISO(record.dateRecord), 'yyyy-MM-dd')

        if (!acc[day]) {
          acc[day] = { date: day, count: 0 }
        }

        acc[day].count += 1

        return acc
      },
      {} as Record<string, { date: string; count: number }>
    )

    return Object.values(groupedByDate).sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredRecords])

  // --- Render Logic ---

  if (error) {
    return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Records Report</h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label htmlFor='start-date'>Start Date:</label>
        <input type='date' id='start-date' value={startDate} onChange={e => setStartDate(e.target.value)} />
        <label htmlFor='end-date'>End Date:</label>
        <input type='date' id='end-date' value={endDate} onChange={e => setEndDate(e.target.value)} />
        <label htmlFor='user-filter'>User:</label>
        <select id='user-filter' value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
          <option value='all'>All Users</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name || user.email}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div>Loading reports...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
          <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', background: '#fff' }}>
            <h2>Records by Category</h2>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={recordsByCategory} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey='count' fill='#8884d8' name='Number of Records' />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', background: '#fff' }}>
            <h2>Daily Record Count</h2>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={dailyRecords} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='date' tickFormatter={tick => format(parseISO(tick), 'MMM d')} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type='monotone' dataKey='count' stroke='#82ca9d' name='Records' strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', background: '#fff' }}>
            <h2>Records by User</h2>
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={recordsByUser}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  outerRadius={100}
                  fill='#8884d8'
                  dataKey='value'
                  nameKey='name'
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {recordsByUser.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value} records`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecordReport
