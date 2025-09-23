'use client'

// Next-Auth Imports
import { useEffect, useState } from 'react'

import { useSession } from 'next-auth/react'

// React Imports

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import CardHeader from '@mui/material/CardHeader'
import TextField from '@mui/material/TextField'
import type { GridColDef } from '@mui/x-data-grid'
import { DataGrid } from '@mui/x-data-grid'
import Paper from '@mui/material/Paper'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Select from '@mui/material/Select'
import type { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Avatar from '@mui/material/Avatar'
import FormHelperText from '@mui/material/FormHelperText'
import Modal from '@mui/material/Modal'
import Box from '@mui/material/Box'
import LoadingButton from '@mui/lab/LoadingButton'

// Type Imports
import type { Category, Record, User } from '@prisma/client'

// Define a more specific type for the records we fetch, which include nested data
type FetchedRecord = Record & {
  user: { name: string | null; email: string | null }
  category: { name: string }
}

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 1,
  outline: 'none'
}

const getLocalDateTimeString = () => {
  const now = new Date()

  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())

  return now.toISOString().slice(0, 16)
}

const paginationModel = { page: 0, pageSize: 5 }

const generateRandomCode = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'

  const numCount = Math.floor(Math.random() * 3) // 0, 1, or 2
  const letterCount = 5 - numCount

  const codeChars = []

  for (let i = 0; i < letterCount; i++) {
    codeChars.push(letters.charAt(Math.floor(Math.random() * letters.length)))
  }

  for (let i = 0; i < numCount; i++) {
    codeChars.push(numbers.charAt(Math.floor(Math.random() * numbers.length)))
  }

  // Shuffle the array (Fisher-Yates shuffle)
  for (let i = codeChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))

    ;[codeChars[i], codeChars[j]] = [codeChars[j], codeChars[i]]
  }

  return codeChars.join('')
}

const Main = () => {
  const { data: session } = useSession()

  const [records, setRecords] = useState<FetchedRecord[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [users, setUsers] = useState<User[]>([])

  // Form state
  const [categoryId, setCategoryId] = useState('')
  const [dateRecord, setDateRecord] = useState(getLocalDateTimeString())
  const [comments, setComments] = useState('')
  const [image, setImage] = useState<string | null>(null) // Will hold base64 string
  const [code, setCode] = useState(generateRandomCode())

  // Form validation state
  const [formErrors, setFormErrors] = useState({
    categoryId: '',
    dateRecord: '',
    comments: '',
    image: '',
    userId: ''
  })

  // Modal state
  const [openImageModal, setOpenImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Create Record Modal state
  const [openCreateModal, setOpenCreateModal] = useState(false)

  // Edit Record Modal state
  const [openEditModal, setOpenEditModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState<FetchedRecord | null>(null)

  // Global search state
  const [searchText, setSearchText] = useState('')

  // Submission loading state
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recordsRes, categoriesRes, usersRes] = await Promise.all([
          fetch('/api/record'),
          fetch('/api/category'),
          fetch('/api/user') // Assuming this endpoint exists to fetch users
        ])

        const recordsData = await recordsRes.json()
        const categoriesData = await categoriesRes.json()
        const usersData = await usersRes.json()

        setRecords(recordsData)
        setCategories(categoriesData)
        setUsers(usersData)
      } catch (error) {
        console.error('Failed to fetch data', error)
      }
    }

    fetchData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (file) {
      const reader = new FileReader()

      reader.onloadend = () => {
        setImage(reader.result as string)
      }

      reader.readAsDataURL(file)
    }
  }

  const handleOpenImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setOpenImageModal(true)
  }

  const handleCloseImageModal = () => {
    setOpenImageModal(false)
    setSelectedImage(null)
  }

  const handleOpenCreateModal = () => {
    // Reset form for a fresh start each time
    setCategoryId('')
    setComments('')
    setImage(null)
    setCode(generateRandomCode())
    setDateRecord(getLocalDateTimeString())
    setFormErrors({ categoryId: '', dateRecord: '', comments: '', image: '', userId: '' })
    setOpenCreateModal(true)
  }

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false)
  }

  // Edit Modal Handlers
  const handleOpenEditModal = (record: FetchedRecord) => {
    // Format date for datetime-local input which expects 'YYYY-MM-DDTHH:mm'
    const localDate = new Date(record.dateRecord)

    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset())
    const formattedDate = localDate.toISOString().slice(0, 16)

    setEditingRecord({ ...record, dateRecord: formattedDate })
    setFormErrors({ categoryId: '', dateRecord: '', comments: '', image: '', userId: '' })
    setOpenEditModal(true)
  }

  const handleCloseEditModal = () => {
    setOpenEditModal(false)
    setEditingRecord(null)
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    if (editingRecord) {
      const { name, value } = e.target

      setEditingRecord({ ...editingRecord, [name as string]: value })
    }
  }

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (file && editingRecord) {
      const reader = new FileReader()

      reader.onloadend = () => {
        setEditingRecord({ ...editingRecord, image: reader.result as string })
      }

      reader.readAsDataURL(file)
    }
  }

  const fetchAllRecords = async () => {
    try {
      const recordsRes = await fetch('/api/record')
      const recordsData = await recordsRes.json()

      setRecords(recordsData)
    } catch (error) {
      console.error('Failed to refetch records', error)
    }
  }

  const validateCreateForm = () => {
    const newErrors = { categoryId: '', dateRecord: '', comments: '', image: '', userId: '' }
    let isValid = true

    if (!categoryId) {
      newErrors.categoryId = 'Category is required'
      isValid = false
    }

    if (!dateRecord) {
      newErrors.dateRecord = 'Date is required'
      isValid = false
    }

    if (!comments.trim()) {
      newErrors.comments = 'Comments are required'
      isValid = false
    }

    if (!image) {
      newErrors.image = 'Screenshot is required'
      isValid = false
    }

    setFormErrors(newErrors)

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateCreateForm()) {
      return
    }

    if (!session?.user?.id) {
      console.error('User not authenticated')

      return
    }

    setIsSubmitting(true)

    try {
      const body = {
        userId: session.user.id,
        categoryId,
        dateRecord: new Date(dateRecord).toISOString(),
        comments,
        image,
        code
      }

      const res = await fetch('/api/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        await fetchAllRecords()

        handleCloseCreateModal()
      } else {
        console.error('Failed to create record')
      }
    } catch (error) {
      console.error('Failed to create record', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const validateEditForm = () => {
    if (!editingRecord) return false

    const newErrors = {
      userId: '',
      categoryId: '',
      dateRecord: '',
      comments: '',
      image: ''
    }

    let isValid = true

    if (!editingRecord.userId) {
      newErrors.userId = 'User is required'
      isValid = false
    }

    if (!editingRecord.categoryId) {
      newErrors.categoryId = 'Category is required'
      isValid = false
    }

    if (!editingRecord.dateRecord) {
      newErrors.dateRecord = 'Date is required'
      isValid = false
    }

    if (!editingRecord.comments.trim()) {
      newErrors.comments = 'Comments are required'
      isValid = false
    }

    if (!editingRecord.image) {
      newErrors.image = 'Screenshot is required'
      isValid = false
    }

    setFormErrors(newErrors)

    return isValid
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingRecord || !validateEditForm()) return

    setIsSubmitting(true)

    try {
      const body = {
        ...editingRecord,
        dateRecord: new Date(editingRecord.dateRecord).toISOString()
      }

      const res = await fetch(`/api/record/${editingRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        await fetchAllRecords()
        handleCloseEditModal()
      } else {
        console.error('Failed to update record')
      }
    } catch (error) {
      console.error('Failed to update record', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) {
      return
    }

    try {
      const res = await fetch(`/api/record/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setRecords(prev => prev.filter(record => record.id !== id))
      } else {
        console.error('Failed to delete record')
      }
    } catch (error) {
      console.error('Failed to delete record', error)
    }
  }

  const columns: GridColDef<FetchedRecord>[] = [
    { field: 'code', headerName: 'Code', width: 100 },
    {
      field: 'user',
      headerName: 'Member',
      width: 200,
      valueGetter: params => params.name
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 200,
      valueGetter: params => params.name
    },

    { field: 'comments', headerName: 'Comments', flex: 1 },
    {
      field: 'dateRecord',
      headerName: 'Date',
      width: 180,
      valueFormatter: params => new Date(params).toLocaleString()
    },
    {
      field: 'image',
      headerName: 'Screenshot',
      width: 80,
      renderCell: params => (
        <Avatar
          src={params.value}
          onClick={() => params.value && handleOpenImageModal(params.value)}
          sx={{ cursor: params.value ? 'pointer' : 'default' }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: params => {
        // Only show actions if the logged-in user created the record
        if (session?.user?.id === params.row.userId) {
          return (
            <Box>
              <IconButton onClick={() => handleOpenEditModal(params.row)} size='small'>
                <i className='ri-pencil-line' />
              </IconButton>
              <IconButton onClick={() => handleDelete(params.row.id)} size='small'>
                <i className='ri-delete-bin-line' />
              </IconButton>
            </Box>
          )
        }

        return null // Render nothing if the user is not the owner
      }
    }
  ]

  const filteredRecords = records.filter(record => {
    const searchTerm = searchText.toLowerCase()

    // Check against multiple fields for a match
    return (
      record.code.toLowerCase().includes(searchTerm) ||
      (record.user.name || '').toLowerCase().includes(searchTerm) ||
      record.category.name.toLowerCase().includes(searchTerm) ||
      record.comments.toLowerCase().includes(searchTerm)
    )
  })

  return (
    <>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 12 }}>
          <Card>
            <CardHeader
              title='Records'
              action={
                <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <TextField
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    placeholder='Search Records...'
                    size='small'
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='ri-search-line' />
                        </InputAdornment>
                      )
                    }}
                  />
                  <Button variant='contained' onClick={handleOpenCreateModal}>
                    Create Record
                  </Button>
                </Box>
              }
            />
            <CardContent>
              <Paper sx={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={filteredRecords}
                  columns={columns}
                  initialState={{ pagination: { paginationModel } }}
                  pageSizeOptions={[5, 10]}
                  sx={{ border: 0 }}
                />
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Modal open={openCreateModal} onClose={handleCloseCreateModal}>
        <Card
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90vw', sm: 500 },
            maxHeight: '90vh',
            overflowY: 'auto',
            outline: 'none'
          }}
        >
          <CardHeader title='Create Record' />
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={5}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label='Code'
                    disabled
                    placeholder='Record Code'
                    value={code}
                    onChange={e => setCode(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth error={!!formErrors.categoryId}>
                    <InputLabel id='category-select-label'>Category</InputLabel>
                    <Select
                      labelId='category-select-label'
                      value={categoryId}
                      label='Category'
                      onChange={e => setCategoryId(e.target.value)}
                      error={!!formErrors.categoryId}
                    >
                      {categories.map(cat => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.categoryId && <FormHelperText>{formErrors.categoryId}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    type='datetime-local'
                    label='Record Date'
                    value={dateRecord}
                    onChange={e => setDateRecord(e.target.value)}
                    InputLabelProps={{
                      shrink: true
                    }}
                    error={!!formErrors.dateRecord}
                    helperText={formErrors.dateRecord}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    rows={4}
                    multiline
                    label='Comments'
                    placeholder='Add comments...'
                    sx={{ '& .MuiOutlinedInput-root': { alignItems: 'baseline' } }}
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                    error={!!formErrors.comments}
                    helperText={formErrors.comments}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position='start'>
                            <i className='ri-message-2-line' />
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button variant='outlined' component='label'>
                    Upload Screenshot
                    <input type='file' hidden accept='image/*' onChange={handleFileChange} />
                  </Button>
                  {image && (
                    <Avatar
                      src={image}
                      alt='Screenshot Preview'
                      sx={{ width: 56, height: 56, mt: 2 }}
                      variant='rounded'
                    />
                  )}
                  {formErrors.image && <FormHelperText error>{formErrors.image}</FormHelperText>}
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <LoadingButton loading={isSubmitting} variant='contained' type='submit'>
                    Save Record
                  </LoadingButton>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Modal>
      {/* Edit Record Modal */}
      <Modal open={openEditModal} onClose={handleCloseEditModal}>
        <Card
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90vw', sm: 500 },
            maxHeight: '90vh',
            overflowY: 'auto',
            outline: 'none'
          }}
        >
          <CardHeader title='Edit Record' />
          <CardContent>
            <form onSubmit={handleUpdate}>
              <Grid container spacing={5}>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label='Code' disabled value={editingRecord?.code || ''} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth error={!!formErrors.userId}>
                    <InputLabel id='user-select-label'>User</InputLabel>
                    <Select
                      labelId='user-select-label'
                      name='userId'
                      value={editingRecord?.userId || ''}
                      error={!!formErrors.userId}
                      label='User'
                      onChange={handleEditInputChange}
                    >
                      {users.map(user => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.userId && <FormHelperText>{formErrors.userId}</FormHelperText>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth error={!!formErrors.categoryId}>
                    <InputLabel id='category-select-label-edit'>Category</InputLabel>
                    <Select
                      labelId='category-select-label-edit'
                      name='categoryId'
                      value={editingRecord?.categoryId || ''}
                      error={!!formErrors.categoryId}
                      label='Category'
                      onChange={handleEditInputChange}
                    >
                      {categories.map(cat => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.categoryId && <FormHelperText>{formErrors.categoryId}</FormHelperText>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    type='datetime-local'
                    label='Record Date'
                    name='dateRecord'
                    value={editingRecord?.dateRecord || ''}
                    onChange={handleEditInputChange}
                    InputLabelProps={{ shrink: true }}
                    error={!!formErrors.dateRecord}
                    helperText={formErrors.dateRecord}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    rows={4}
                    multiline
                    label='Comments'
                    name='comments'
                    value={editingRecord?.comments || ''}
                    onChange={handleEditInputChange}
                    error={!!formErrors.comments}
                    helperText={formErrors.comments}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button variant='outlined' component='label'>
                    Upload Screenshot
                    <input type='file' hidden accept='image/*' onChange={handleEditFileChange} />
                  </Button>
                  {editingRecord?.image && (
                    <Avatar
                      src={editingRecord.image}
                      alt='Screenshot Preview'
                      sx={{ width: 56, height: 56, mt: 2 }}
                      variant='rounded'
                    />
                  )}
                  {formErrors.image && <FormHelperText error>{formErrors.image}</FormHelperText>}
                </Grid>
                <Grid size={{ xs: 12 }} display='flex' gap={4}>
                  <LoadingButton loading={isSubmitting} variant='contained' type='submit'>
                    Save Changes
                  </LoadingButton>
                  <Button variant='outlined' color='secondary' onClick={handleCloseEditModal}>
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Modal>
      <Modal open={openImageModal} onClose={handleCloseImageModal}>
        <Box sx={modalStyle}>
          <img
            src={selectedImage || ''}
            alt='Record Screenshot'
            style={{ maxHeight: '90vh', maxWidth: '90vw', display: 'block' }}
          />
        </Box>
      </Modal>
    </>
  )
}

export default Main
